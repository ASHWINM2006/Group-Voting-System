"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/groups")
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error(data.error || "Failed to fetch groups")
      }

      setGroups(data.groups)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setGroups(groups.filter((group) => group._id !== groupId))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete group")
      }
    } catch (error) {
      alert("Error deleting group")
    }
  }

  const toggleGroupStatus = async (groupId, currentStatus) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOpen: !currentStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGroups(groups.map((group) => (group._id === groupId ? { ...group, isOpen: data.group.isOpen } : group)))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update group")
      }
    } catch (error) {
      alert("Error updating group")
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <p>Manage all voting groups</p>
      </header>

      <main className="main">
        <div className="dashboard-actions">
          <Link href="/create" className="btn btn-primary">
            Create New Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="no-groups">
            <h3>No groups created yet</h3>
            <p>Create your first voting group to get started.</p>
            <Link href="/create" className="btn btn-primary">
              Create Group
            </Link>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <div key={group._id} className="group-card">
                <div className="group-header">
                  <h3>{group.title}</h3>
                  <span className={`status-badge ${group.isOpen ? "status-open" : "status-closed"}`}>
                    {group.isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                <p className="group-description">{group.description}</p>

                <div className="group-stats">
                  <span>Options: {group.options.length}</span>
                  <span>Votes: {group.votes.length}</span>
                  <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="group-share">
                  <div className="share-info">
                    <label>Group ID:</label>
                    <span className="group-id">{group._id}</span>
                  </div>
                  <div className="share-info">
                    <label>Join Link:</label>
                    <div className="share-link-container">
                      <input
                        type="text"
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/vote/${group._id}`}
                        readOnly
                        className="share-input"
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/vote/${group._id}`
                          navigator.clipboard.writeText(link)
                          alert("Link copied to clipboard!")
                        }}
                        className="btn btn-secondary btn-small copy-btn"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group-actions">
                  <Link href={`/results/${group._id}`} className="btn btn-secondary btn-small">
                    View Results
                  </Link>

                  <Link href={`/manage/${group._id}`} className="btn btn-primary btn-small">
                    Manage
                  </Link>

                  <button
                    onClick={() => toggleGroupStatus(group._id, group.isOpen)}
                    className={`btn btn-small ${group.isOpen ? "btn-warning" : "btn-success"}`}
                  >
                    {group.isOpen ? "Close" : "Open"}
                  </button>

                  <button onClick={() => deleteGroup(group._id)} className="btn btn-danger btn-small">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
