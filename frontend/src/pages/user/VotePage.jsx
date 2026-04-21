import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api, { getAssetUrl } from '../../api/axios'
import toast from 'react-hot-toast'
import './User.css'

export default function VotePage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [myVote, setMyVote] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [elRes, candRes, voteRes] = await Promise.all([
          api.get(`/elections/${electionId}`),
          api.get(`/candidates/election/${electionId}`),
          api.get(`/votes/status/${electionId}`),
        ])
        setElection(elRes.data.election)
        setCandidates(candRes.data.candidates || [])
        setHasVoted(voteRes.data.hasVoted)
        setMyVote(voteRes.data.vote)
      } catch { navigate('/dashboard') } finally { setLoading(false) }
    }
    load()
  }, [electionId])

  const handleVote = async () => {
    if (!selectedId) return toast.error('Please select a candidate')
    if (!confirm('Are you sure? You cannot change your vote later.')) return
    setSubmitting(true)
    try {
      await api.post('/votes', { electionId, candidateId: selectedId })
      toast.success('Your vote has been cast successfully!')
      setHasVoted(true)
      setMyVote({ candidateId: selectedId })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="page-wrapper"><Navbar /><div className="loading-state"><div className="loader-ring" /></div></div>

  const now = new Date()
  const isActive = election && new Date(election.startTime) <= now && now <= new Date(election.endTime)
  const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        <div className="vote-page-header">
          <Link to="/dashboard" className="vote-back-btn">← Back to Dashboard</Link>
          <h1 className="vote-election-title">{election?.title}</h1>
          <div className="vote-election-meta">
            📅 {fmt(election?.startTime)} → {fmt(election?.endTime)}
          </div>
          {election?.description && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{election.description}</p>}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isActive ? <span className="badge badge-success">● Active</span> : <span className="badge badge-danger">Ended</span>}
            <span className="badge badge-info">{candidates.length} Candidates</span>
          </div>
        </div>

        {hasVoted && (
          <div className="vote-already-label">
            You have already voted in this election!
            {myVote?.candidateId && (
              <span style={{ marginLeft: 8 }}>
                Your vote: <strong>{candidates.find(c => c._id === (myVote.candidateId?._id || myVote.candidateId))?.name || 'Candidate'}</strong>
              </span>
            )}
          </div>
        )}

        {candidates.length < 2 && !hasVoted && (
          <div style={{ padding: '16px 20px', background: 'var(--color-warning-bg)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning)', marginBottom: 24 }}>
            ⚠️ This election needs at least 2 candidates before voting can begin.
          </div>
        )}

        <div className="candidates-vote-grid">
          {candidates.map((c, i) => {
            const isSelected = selectedId === c._id
            const isMyVoted = hasVoted && (myVote?.candidateId === c._id || myVote?.candidateId?._id === c._id)
            return (
              <div
                key={c._id}
                className={`candidate-vote-card glass-card animate-fade ${isSelected ? 'selected' : ''} ${isMyVoted ? 'voted-for' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => !hasVoted && isActive && setSelectedId(c._id)}
              >
                <div className="cvc-select-indicator">
                  {isMyVoted ? '✅' : isSelected ? '✓' : ''}
                </div>
                <div className="cvc-img">
                  {c.image ? <img src={getAssetUrl(c.image)} alt={c.name} /> : '👤'}
                </div>
                <div className="cvc-body">
                  <div className="cvc-name">{c.name}</div>
                  <div className="cvc-party">🏛 {c.party}</div>
                  {c.age && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Age {c.age}{c.qualification ? ` · ${c.qualification}` : ''}</div>}
                  {c.bio && <div className="cvc-bio">{c.bio}</div>}
                  {isMyVoted && <div style={{ marginTop: 8 }}><span className="badge badge-success">Your Choice</span></div>}
                </div>
              </div>
            )
          })}
        </div>

        {!hasVoted && isActive && candidates.length >= 2 && (
          <div className="vote-action-bar">
            {selectedId ? (
              <>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  Selected: <strong style={{ color: 'var(--text-primary)' }}>
                    {candidates.find(c => c._id === selectedId)?.name}
                  </strong>
                </div>
                <button
                  id="cast-vote-btn"
                  className="btn btn-primary btn-lg"
                  onClick={handleVote}
                  disabled={submitting}
                >
                  {submitting ? 'Casting Vote...' : '🗳️ Cast Vote Now'}
                </button>
              </>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                👆 Click on a candidate card to select them, then cast your vote
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
