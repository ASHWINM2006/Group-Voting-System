"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateGroupPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "admin") {
          router.push("/")
          return
        }
        setUser(data.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/login")
    } finally {
      setAuthLoading(false)
    }
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          options: options.filter((opt) => opt.trim().length > 0),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group")
      }

      router.push(`/manage/${data.groupId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">Checking permissions...</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container">
        <div className="error">Access denied. Admin privileges required.</div>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <Link href="/admin/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <h1>Create Voting Group</h1>
        <p>
          Creating as: <strong>{user.username}</strong> (Admin)
        </p>
      </header>

      <main className="main">
        <form onSubmit={handleSubmit} className="create-form">
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Group Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter group title"
              className="input"
              maxLength="200"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're voting on"
              className="textarea"
              maxLength="1000"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Voting Options *</label>
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="input"
                  maxLength="100"
                  required
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} className="btn btn-danger btn-small">
                    Remove
                  </button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <button type="button" onClick={addOption} className="btn btn-secondary btn-small">
                Add Option
              </button>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
