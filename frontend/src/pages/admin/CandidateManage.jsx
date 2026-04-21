import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api, { getAssetUrl } from '../../api/axios'
import toast from 'react-hot-toast'
import './Admin.css'

const EMPTY = { name: '', party: '', bio: '', age: '', qualification: '', electionId: '' }

export default function CandidateManage() {
  const [elections, setElections] = useState([])
  const [candidates, setCandidates] = useState([])
  const [selectedElection, setSelectedElection] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/elections').then(r => setElections(r.data.elections || []))
  }, [])

  useEffect(() => {
    if (!selectedElection) { setCandidates([]); return }
    loadCandidates()
  }, [selectedElection])

  const loadCandidates = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/candidates/election/${selectedElection}`)
      setCandidates(data.candidates || [])
    } catch { } finally { setLoading(false) }
  }

  const openCreate = () => {
    if (!selectedElection) return toast.error('Select an election first')
    setEditing(null)
    setForm({ ...EMPTY, electionId: selectedElection })
    setImageFile(null); setImagePreview('')
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, party: c.party, bio: c.bio || '', age: c.age || '', qualification: c.qualification || '', electionId: c.electionId })
    setImageFile(null)
    setImagePreview(getAssetUrl(c.image))
    setShowModal(true)
  }

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (candidates.length >= 10 && !editing) return toast.error('Maximum 10 candidates per election')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        await api.put(`/candidates/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Candidate updated!')
      } else {
        await api.post('/candidates', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Candidate added!')
      }
      setShowModal(false)
      loadCandidates()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this candidate?')) return
    try {
      await api.delete(`/candidates/${id}`)
      toast.success('Candidate deleted')
      loadCandidates()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const selectedEl = elections.find(e => e._id === selectedElection)

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Candidate Management</h1>
            <p className="page-subtitle">Add up to 10 candidates per election (minimum 2 required to vote)</p>
          </div>
          <button id="add-candidate-btn" onClick={openCreate} className="btn btn-primary" disabled={!selectedElection}>+ Add Candidate</button>
        </div>

        {/* Election Selector */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Election</label>
            <select id="election-selector" className="form-input" value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
              <option value="">— Choose an election —</option>
              {elections.map(el => (
                <option key={el._id} value={el._id}>{el.title}</option>
              ))}
            </select>
          </div>
          {selectedElection && (
            <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-info">{candidates.length} / 10 candidates</span>
              {candidates.length < 2 && <span className="badge badge-warning">⚠ Need at least 2 candidates</span>}
              {candidates.length >= 10 && <span className="badge badge-danger">✗ Limit reached</span>}
            </div>
          )}
        </div>

        {!selectedElection ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">👆</div>
              <h3>Select an election above</h3>
              <p>Choose an election to view and manage its candidates</p>
            </div>
          </div>
        ) : loading ? (
          <div className="loading-state"><div className="loader-ring" /></div>
        ) : candidates.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <h3>No candidates yet</h3>
              <p>Add at least 2 candidates to this election</p>
              <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 16 }}>Add First Candidate</button>
            </div>
          </div>
        ) : (
          <div className="candidate-grid">
            {candidates.map((c, i) => (
              <div key={c._id} className="candidate-card glass-card animate-fade" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="candidate-img-wrap">
                  {c.image ? <img src={getAssetUrl(c.image)} alt={c.name} /> : '👤'}
                </div>
                <div className="candidate-info">
                  <div className="candidate-name">{c.name}</div>
                  <div className="candidate-party">🏛 {c.party}</div>
                  {c.bio && <div className="candidate-bio">{c.bio}</div>}
                  {c.age && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Age: {c.age}{c.qualification ? ` · ${c.qualification}` : ''}</div>}
                  <div style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600, marginBottom: 10 }}>🗳 {c.voteCount} votes</div>
                  <div className="candidate-actions">
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(c._id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Candidate' : 'Add Candidate'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">Candidate Photo</label>
                <div className="upload-area" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {imagePreview ? (
                    <img src={getAssetUrl(imagePreview)} alt="preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }} />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Click to upload photo</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPEG, PNG, WEBP · Max 5MB</div>
                  </div>
                  <input id="candidate-image" type="file" accept="image/*" onChange={handleImage} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input id="cand-name" name="name" required placeholder="Candidate name" className="form-input" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Party / Affiliation *</label>
                  <input id="cand-party" name="party" required placeholder="Party name" className="form-input" value={form.party} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input id="cand-age" name="age" type="number" min="18" max="120" placeholder="e.g. 45" className="form-input" value={form.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input id="cand-qual" name="qualification" placeholder="e.g. MBA" className="form-input" value={form.qualification} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea id="cand-bio" name="bio" rows={3} placeholder="Candidate biography..." className="form-input" value={form.bio} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-candidate-btn" type="submit" className="btn btn-primary btn-full" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
