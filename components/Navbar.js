"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            Group Voting System
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          Group Voting System
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-user">
                Welcome, {user.username} ({user.role})
              </span>

              {user.role === "admin" && (
                <>
                  <Link href="/admin/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link href="/create" className="nav-link">
                    Create Group
                  </Link>
                </>
              )}

              <button onClick={handleLogout} className="nav-link nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
