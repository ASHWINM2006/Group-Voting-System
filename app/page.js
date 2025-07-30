"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const [joinGroupId, setJoinGroupId] = useState("")
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = (e) => {
    e.preventDefault()
    if (joinGroupId.trim()) {
      router.push(`/vote/${joinGroupId.trim()}`)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Group Voting System</h1>
        <p>Create voting groups and share them with others</p>
      </header>

      <main className="main">
        <div className="card-grid">
          {user ? (
            user.role === "admin" ? (
              // Admin content - show create group option
              <div className="card">
                <h2>Admin Panel</h2>
                <p>Manage your voting groups</p>
                <Link href="/admin/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              // User content - show join group only
              <div className="card">
                <h2>Join Voting Group</h2>
                <p>Enter a group ID to participate in voting</p>
                <form onSubmit={handleJoinGroup} className="join-form">
                  <input
                    type="text"
                    placeholder="Enter Group ID"
                    value={joinGroupId}
                    onChange={(e) => setJoinGroupId(e.target.value)}
                    className="input"
                  />
                  <button type="submit" className="btn btn-secondary">
                    Join Group
                  </button>
                </form>
              </div>
            )
          ) : (
            // Not logged in - show login/register options
            <div className="card">
              <h2>Get Started</h2>
              <p>Login or register to participate in voting</p>
              <div className="auth-buttons">
                <Link href="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link href="/register" className="btn btn-secondary">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>✅ Create custom voting groups</li>
            <li>✅ Share groups with unique links</li>
            <li>✅ One vote per person</li>
            <li>✅ Live results with charts</li>
            <li>✅ Open/close voting control</li>
            <li>✅ Manage your groups</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
