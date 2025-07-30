"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function ManageGroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchGroup()
    }
  }, [user, groupId])

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
    }
  }

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Group not found")
      }

      if (!data.isCreator) {
        throw new Error("You are not authorized to manage this group")
      }

      setGroup(data.group)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleVoting = async () => {
    setUpdating(true)
    setError("")

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOpen: !group.isOpen,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update group")
      }

      setGroup(data.group)
      setMessage(`Voting ${data.group.isOpen ? "opened" : "closed"} successfully`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const deleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return
    }

    setUpdating(true)
    setError("")

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete group")
      }

      router.push("/admin/dashboard")
    } catch (err) {
      setError(err.message)
      setUpdating(false)
    }
  }

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/vote/${groupId}`
    navigator.clipboard.writeText(shareLink)
    setMessage("Share link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading group...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <Link href="/admin/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container">
        <div className="error">Group not found</div>
        <Link href="/admin/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/vote/${groupId}`
  const totalVotes = group.votes.length

  return (
    <div className="container">
      <header className="header">
        <Link href="/admin/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <h1>Manage Group</h1>
        <h2>{group.title}</h2>
        {user && (
          <p>
            Managing as: <strong>{user.username}</strong> (Admin)
          </p>
        )}
      </header>

      <main className="main">
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="manage-grid">
          <div className="card">
            <h3>Group Information</h3>
            <div className="group-info">
              <p>
                <strong>Title:</strong> {group.title}
              </p>
              <p>
                <strong>Description:</strong> {group.description}
              </p>
              <p>
                <strong>Total Votes:</strong> {totalVotes}
              </p>
              <p>
                <strong>Status:</strong>
                <span className={group.isOpen ? "status-open" : "status-closed"}>
                  {group.isOpen ? "Open" : "Closed"}
                </span>
              </p>
              <p>
                <strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="card">
            <h3>Share Group</h3>
            <div className="share-section">
              <p>Share this link with others to let them vote:</p>
              <div className="share-link">
                <input type="text" value={shareLink} readOnly className="input" onClick={(e) => e.target.select()} />
                <button onClick={copyShareLink} className="btn btn-secondary">
                  Copy Link
                </button>
              </div>
              <div className="group-id-display">
                <p>
                  <strong>Group ID:</strong> <code>{groupId}</code>
                </p>
                <p className="share-note">Users can join by entering the Group ID or using the full link above.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Voting Options</h3>
            <ul className="options-list">
              {group.options.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Actions</h3>
            <div className="action-buttons">
              <button
                onClick={toggleVoting}
                disabled={updating}
                className={`btn ${group.isOpen ? "btn-warning" : "btn-success"}`}
              >
                {updating ? "Updating..." : group.isOpen ? "Close Voting" : "Open Voting"}
              </button>

              <Link href={`/results/${groupId}`} className="btn btn-primary">
                View Results
              </Link>

              <Link href={`/vote/${groupId}`} className="btn btn-secondary">
                Vote Page
              </Link>

              <button onClick={deleteGroup} disabled={updating} className="btn btn-danger">
                {updating ? "Deleting..." : "Delete Group"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
