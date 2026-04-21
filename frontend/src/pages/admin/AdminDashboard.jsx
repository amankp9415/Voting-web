import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import './Admin.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0, ended: 0, totalVotes: 0 })
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const electionsRes = await api.get('/elections')
        const data = electionsRes.data
        const els = data.elections || []
        setElections(els.slice(0, 5))
        setStats({
          total: els.length,
          active: els.filter(e => {
            const now = new Date()
            return new Date(e.startTime) <= now && now <= new Date(e.endTime)
          }).length,
          upcoming: els.filter(e => new Date(e.startTime) > new Date()).length,
          ended: els.filter(e => new Date(e.endTime) < new Date()).length,
          totalVotes: els.reduce((a, e) => a + (e.totalVotes || 0), 0),
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const getStatus = (el) => {
    const now = new Date()
    if (new Date(el.startTime) > now) return { label: 'Upcoming', cls: 'badge-warning' }
    if (new Date(el.endTime) < now) return { label: 'Ended', cls: 'badge-danger' }
    return { label: 'Active', cls: 'badge-success' }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Overview of all elections and voting activity</p>
          </div>
          <Link to="/admin/elections" className="btn btn-primary">+ Create Election</Link>
        </div>

        {loading ? (
          <div className="loading-state"><div className="loader-ring" /></div>
        ) : (
          <>
            <div className="stats-grid">
              {[
                { label: 'Total Elections', value: stats.total, cls: 'stat-icon-purple', icon: '🗳️' },
                { label: 'Active Now', value: stats.active, cls: 'stat-icon-green', icon: '✅' },
                { label: 'Upcoming', value: stats.upcoming, cls: 'stat-icon-blue', icon: '⏰' },
                { label: 'Total Votes Cast', value: stats.totalVotes, cls: 'stat-icon-orange', icon: '📊' },
              ].map((s, i) => (
                <div key={i} className="stat-card glass-card animate-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title">Recent Elections</h2>
                <Link to="/admin/elections" className="btn btn-secondary btn-sm">View All</Link>
              </div>

              {elections.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🗳️</div>
                  <h3>No elections yet</h3>
                  <p>Create your first election to get started</p>
                  <Link to="/admin/elections" className="btn btn-primary" style={{ marginTop: 16 }}>Create Election</Link>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Candidates</th>
                        <th>Votes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elections.map(el => {
                        const s = getStatus(el)
                        return (
                          <tr key={el._id}>
                            <td><span className="el-title">{el.title}</span></td>
                            <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                            <td className="text-muted">{formatDate(el.startTime)}</td>
                            <td className="text-muted">{formatDate(el.endTime)}</td>
                            <td>{el.candidateCount || 0}</td>
                            <td>{el.totalVotes || 0}</td>
                            <td>
                              <Link to={`/admin/results?id=${el._id}`} className="btn btn-secondary btn-sm">Results</Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
