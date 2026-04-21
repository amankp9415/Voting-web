import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import './Admin.css'

const EMPTY = { title: '', description: '', startTime: '', endTime: '' }

export default function ElectionManage() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/elections')
      setElections(data.elections || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (el) => {
    setEditing(el)
    setForm({
      title: el.title,
      description: el.description || '',
      startTime: el.startTime?.slice(0, 16) || '',
      endTime: el.endTime?.slice(0, 16) || '',
    })
    setShowModal(true)
  }

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/elections/${editing._id}`, form)
        toast.success('Election updated!')
      } else {
        await api.post('/elections', form)
        toast.success('Election created!')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving election')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this election and all its candidates/votes?')) return
    try {
      await api.delete(`/elections/${id}`)
      toast.success('Election deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const getStatus = (el) => {
    const now = new Date()
    if (new Date(el.startTime) > now) return { label: 'Upcoming', cls: 'badge-warning' }
    if (new Date(el.endTime) < now) return { label: 'Ended', cls: 'badge-danger' }
    return { label: 'Active', cls: 'badge-success' }
  }

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Election Management</h1>
            <p className="page-subtitle">Create and manage elections with candidate sessions</p>
          </div>
          <button id="create-election-btn" onClick={openCreate} className="btn btn-primary">+ New Election</button>
        </div>

        {loading ? (
          <div className="loading-state"><div className="loader-ring" /></div>
        ) : elections.length === 0 ? (
          <div className="glass-card">
            <div className="empty-state">
              <div className="empty-state-icon">🗳️</div>
              <h3>No elections yet</h3>
              <p>Create your first election to get started</p>
              <button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 16 }}>Create Election</button>
            </div>
          </div>
        ) : (
          <div className="election-list">
            {elections.map((el, i) => {
              const s = getStatus(el)
              return (
                <div key={el._id} className="election-item glass-card animate-fade" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="election-item-info">
                    <div className="election-item-title">{el.title}</div>
                    <div className="election-item-meta">
                      <span>📅 Start: {fmt(el.startTime)}</span>
                      <span>🏁 End: {fmt(el.endTime)}</span>
                      <span>👥 {el.candidateCount || 0} Candidates</span>
                      <span>📊 {el.totalVotes || 0} Votes</span>
                    </div>
                    {el.description && <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>{el.description}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                    <div className="election-item-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(el)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(el._id)}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Election' : 'Create Election'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Election Title *</label>
                <input id="election-title" name="title" required placeholder="e.g. General Election 2026" className="form-input" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="election-desc" name="description" rows={3} placeholder="Brief description..." className="form-input" value={form.description} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date & Time *</label>
                  <input id="election-start" name="startTime" type="datetime-local" required className="form-input" value={form.startTime} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date & Time *</label>
                  <input id="election-end" name="endTime" type="datetime-local" required className="form-input" value={form.endTime} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-election-btn" type="submit" className="btn btn-primary btn-full" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Election' : 'Create Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
