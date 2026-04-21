import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api, { getAssetUrl } from '../../api/axios'
import './Admin.css'

export default function Results() {
  const [searchParams] = useSearchParams()
  const initialId = searchParams.get('id') || ''
  const [elections, setElections] = useState([])
  const [selectedId, setSelectedId] = useState(initialId)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/elections').then(r => setElections(r.data.elections || []))
  }, [])

  useEffect(() => {
    if (initialId) loadResults(initialId)
  }, [initialId])

  const loadResults = async (id) => {
    if (!id) return
    setLoading(true)
    setResults(null)
    try {
      const { data } = await api.get(`/elections/${id}/results`)
      setResults(data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleSelect = (e) => {
    setSelectedId(e.target.value)
    loadResults(e.target.value)
  }

  const maxVotes = results?.results?.[0]?.voteCount || 1

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Election Results</h1>
            <p className="page-subtitle">View real-time voting results — admin only access</p>
          </div>
          <span className="badge badge-primary">🔒 Admin Only</span>
        </div>

        <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Election</label>
            <select id="results-election-select" className="form-input" value={selectedId} onChange={handleSelect}>
              <option value="">— Choose an election to view results —</option>
              {elections.map(el => (
                <option key={el._id} value={el._id}>{el.title}</option>
              ))}
            </select>
          </div>
        </div>

        {!selectedId && (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>Select an election</h3>
              <p>Choose an election above to view detailed results</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state"><div className="loader-ring" /></div>
        )}

        {results && !loading && (
          <>
            {/* Summary */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {[
                { label: 'Total Votes', value: results.totalVotes, icon: '🗳️', cls: 'stat-icon-purple' },
                { label: 'Candidates', value: results.results?.length || 0, icon: '👥', cls: 'stat-icon-blue' },
                { label: 'Winner', value: results.winner?.name || '—', icon: '🏆', cls: 'stat-icon-green' },
                { label: 'Win %', value: results.winner ? `${results.winner.percentage}%` : '—', icon: '📈', cls: 'stat-icon-orange' },
              ].map((s, i) => (
                <div key={i} className="stat-card glass-card">
                  <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: typeof s.value === 'string' && s.value.length > 8 ? 18 : 28 }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Election Info */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{results.election?.title}</h2>
              {results.election?.description && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{results.election.description}</p>}
            </div>

            {/* Candidates Results */}
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title">Vote Breakdown</h2>
                <span className="badge badge-info">{results.totalVotes} total votes</span>
              </div>
              <div style={{ padding: 24 }}>
                {results.results?.length === 0 ? (
                  <div className="empty-state">
                    <h3>No votes cast yet</h3>
                    <p>Results will appear here once voting begins</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {results.results?.map((c, i) => (
                      <div key={c._id} className={`glass-card ${i === 0 && results.totalVotes > 0 ? 'winner-card' : ''}`} style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                          <div style={{ fontSize: 24, fontWeight: 800, minWidth: 36 }}>
                            {i === 0 && results.totalVotes > 0 ? '🏆' : `#${c.rank}`}
                          </div>
                          {c.image ? (
                            <img src={getAssetUrl(c.image)} alt={c.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }} />
                          ) : (
                            <div className="avatar-placeholder" style={{ width: 52, height: 52, fontSize: 18 }}>
                              {c.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name} {i === 0 && results.totalVotes > 0 && <span className="badge badge-success" style={{ marginLeft: 8 }}>Winner</span>}</div>
                            <div style={{ fontSize: 13, color: 'var(--color-primary-light)' }}>🏛 {c.party}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>{c.voteCount}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>votes ({c.percentage}%)</div>
                          </div>
                        </div>
                        <div className="results-bar-track">
                          <div
                            className="results-bar-fill"
                            style={{ width: `${results.totalVotes > 0 ? c.percentage : 0}%`, background: i === 0 ? 'linear-gradient(90deg, #10b981, #059669)' : undefined }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
