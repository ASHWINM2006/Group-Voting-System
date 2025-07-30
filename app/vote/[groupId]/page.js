"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function VotePage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId
  const [group, setGroup] = useState(null)
  const [selectedOption, setSelectedOption] = useState("")
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [message, setMessage] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user !== null) {
      fetchGroup()
    }
  }, [user, groupId])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Not authenticated, redirect to login
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

      setGroup(data.group)
      setHasVoted(data.hasVoted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (e) => {
    e.preventDefault()
    if (!selectedOption) return

    setVoting(true)
    setError("")

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          option: selectedOption,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote")
      }

      setHasVoted(true)
      setMessage("Your vote has been recorded!")
      fetchGroup() // Refresh group data
    } catch (err) {
      setError(err.message)
    } finally {
      setVoting(false)
    }
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
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container">
        <div className="error">Group not found</div>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>{group.title}</h1>
        <p>{group.description}</p>
        <div className="group-status">
          Status:{" "}
          <span className={group.isOpen ? "status-open" : "status-closed"}>{group.isOpen ? "Open" : "Closed"}</span>
        </div>
        {user && (
          <div className="user-info">
            Voting as: <strong>{user.username}</strong>
          </div>
        )}
      </header>

      <main className="main">
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {!group.isOpen ? (
          <div className="voting-closed">
            <h3>Voting is Closed</h3>
            <p>This voting group is no longer accepting votes.</p>
            <Link href={`/results/${groupId}`} className="btn btn-primary">
              View Results
            </Link>
          </div>
        ) : hasVoted ? (
          <div className="already-voted">
            <h3>Thank You for Voting!</h3>
            <p>You have already cast your vote for this group.</p>
            <Link href={`/results/${groupId}`} className="btn btn-primary">
              View Results
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVote} className="vote-form">
            <h3>Cast Your Vote</h3>
            <div className="options">
              {group.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name="vote"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="option-radio"
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={!selectedOption || voting} className="btn btn-primary">
                {voting ? "Submitting..." : "Submit Vote"}
              </button>
            </div>
          </form>
        )}

        <div className="group-actions">
          <Link href={`/results/${groupId}`} className="btn btn-secondary">
            View Results
          </Link>
        </div>
      </main>
    </div>
  )
}
