import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import api, { getAssetUrl } from '../../api/axios'
import './User.css'

export default function UserDashboard() {
  const { user } = useAuth()
  const [elections, setElections] = useState([])
  const [myVotes, setMyVotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [elRes, voteRes] = await Promise.all([
          api.get('/elections'),
          api.get('/votes/my'),
        ])
        setElections(elRes.data.elections || [])
        setMyVotes(voteRes.data.votes || [])
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  const votedElectionIds = new Set(myVotes.map(v => v.electionId?._id))

  const now = new Date()
  const activeElections = elections.filter(e => new Date(e.startTime) <= now && now <= new Date(e.endTime))
  const upcomingElections = elections.filter(e => new Date(e.startTime) > now)
  const endedElections = elections.filter(e => new Date(e.endTime) < now)

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        {/* Welcome */}
        <div className="user-welcome glass-card animate-fade">
          <div className="welcome-left">
            <div className="avatar-placeholder" style={{ width: 56, height: 56, fontSize: 20 }}>{initials}</div>
            <div>
              <h1 className="welcome-title">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="welcome-sub">Your Voter ID: <span className="voter-id">{user?.userId}</span></p>
            </div>
          </div>
          <div className="welcome-right">
            <div className="welcome-stat">
              <span className="welcome-stat-val">{myVotes.length}</span>
              <span className="welcome-stat-label">Votes Cast</span>
            </div>
            <div className="welcome-stat">
              <span className="welcome-stat-val">{activeElections.length}</span>
              <span className="welcome-stat-label">Active Now</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="loader-ring" /></div>
        ) : (
          <>
            {/* Active Elections */}
            <section className="election-section">
              <div className="section-title-row">
                <h2 className="section-heading">🟢 Active Elections</h2>
                <span className="badge badge-success">{activeElections.length} open</span>
              </div>
              {activeElections.length === 0 ? (
                <div className="glass-card empty-state">
                  <div className="empty-state-icon">🗳️</div>
                  <h3>No active elections</h3>
                  <p>Check upcoming elections below</p>
                </div>
              ) : (
                <div className="elections-grid">
                  {activeElections.map((el, i) => {
                    const hasVoted = votedElectionIds.has(el._id)
                    return (
                      <div key={el._id} className="election-user-card glass-card animate-fade" style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className="euc-header">
                          <span className="badge badge-success">● Live</span>
                          {hasVoted && <span className="badge badge-primary">✓ Voted</span>}
                        </div>
                        <h3 className="euc-title">{el.title}</h3>
                        {el.description && <p className="euc-desc">{el.description}</p>}
                        <div className="euc-meta">
                          <span>🏁 Ends {fmtTime(el.endTime)}</span>
                          <span>👥 {el.candidateCount || 0} candidates</span>
                        </div>
                        <Link
                          to={`/vote/${el._id}`}
                          className={`btn ${hasVoted ? 'btn-secondary' : 'btn-primary'} btn-full`}
                          style={{ marginTop: 16 }}
                        >
                          {hasVoted ? '✓ View Election' : '🗳️ Cast Your Vote'}
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Upcoming */}
            {upcomingElections.length > 0 && (
              <section className="election-section">
                <div className="section-title-row">
                  <h2 className="section-heading">⏰ Upcoming Elections</h2>
                  <span className="badge badge-warning">{upcomingElections.length}</span>
                </div>
                <div className="elections-grid">
                  {upcomingElections.map((el, i) => (
                    <div key={el._id} className="election-user-card glass-card animate-fade" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="euc-header">
                        <span className="badge badge-warning">Upcoming</span>
                      </div>
                      <h3 className="euc-title">{el.title}</h3>
                      <div className="euc-meta">
                        <span>📅 Starts {fmtTime(el.startTime)}</span>
                        <span>🏁 Ends {fmt(el.endTime)}</span>
                      </div>
                      <button className="btn btn-secondary btn-full" style={{ marginTop: 16 }} disabled>
                        ⏳ Opens Soon
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Voting History */}
            {myVotes.length > 0 && (
              <section className="election-section">
                <div className="section-title-row">
                  <h2 className="section-heading">📜 My Voting History</h2>
                  <span className="badge badge-info">{myVotes.length} votes</span>
                </div>
                <div className="glass-card">
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Election</th>
                          <th>Voted For</th>
                          <th>Party</th>
                          <th>Voted At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myVotes.map(v => (
                          <tr key={v._id}>
                            <td style={{ fontWeight: 600 }}>{v.electionId?.title || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {v.candidateId?.image ? (
                                  <img src={getAssetUrl(v.candidateId.image)} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: 11 }}>{v.candidateId?.name?.[0]}</div>
                                )}
                                {v.candidateId?.name || '—'}
                              </div>
                            </td>
                            <td style={{ color: 'var(--color-primary-light)', fontSize: 13 }}>{v.candidateId?.party || '—'}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(v.votedAt).toLocaleString('en-IN')}</td>
                            <td>
                              {new Date(v.electionId?.endTime) < now
                                ? <span className="badge badge-danger">Ended</span>
                                : <span className="badge badge-success">Active</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
