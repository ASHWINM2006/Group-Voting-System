"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function ResultsPage() {
  const params = useParams()
  const groupId = params.groupId
  const [group, setGroup] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [groupId])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results/${groupId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch results")
      }

      setGroup(data.group)
      setResults(data.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0)

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading results...</div>
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

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Results: {group.title}</h1>
        <p>{group.description}</p>
        <div className="results-info">
          <span>Total Votes: {totalVotes}</span>
          <span className={group.isOpen ? "status-open" : "status-closed"}>
            {group.isOpen ? "Live Results" : "Final Results"}
          </span>
        </div>
      </header>

      <main className="main">
        <div className="results-container">
          {totalVotes === 0 ? (
            <div className="no-votes">
              <h3>No votes yet</h3>
              <p>Be the first to vote!</p>
              <Link href={`/vote/${groupId}`} className="btn btn-primary">
                Cast Your Vote
              </Link>
            </div>
          ) : (
            <>
              <div className="results-chart">
                {results.map((result, index) => {
                  const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
                  return (
                    <div key={index} className="result-bar">
                      <div className="result-label">
                        <span className="option-name">{result.option}</span>
                        <span className="vote-count">
                          {result.votes} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="results-table">
                <h3>Detailed Results</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Votes</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => {
                      const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
                      return (
                        <tr key={index}>
                          <td>{result.option}</td>
                          <td>{result.votes}</td>
                          <td>{percentage.toFixed(1)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="results-actions">
          {group.isOpen && (
            <Link href={`/vote/${groupId}`} className="btn btn-primary">
              Cast Your Vote
            </Link>
          )}
          <button onClick={fetchResults} className="btn btn-secondary">
            Refresh Results
          </button>
        </div>
      </main>
    </div>
  )
}
