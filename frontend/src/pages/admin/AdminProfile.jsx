import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import api, { getAssetUrl } from '../../api/axios'
import toast from 'react-hot-toast'
import './Admin.css'

export default function AdminProfile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    api.get('/admin/profile').then(r => {
      setProfile(r.data.admin)
      setForm({
        name: r.data.admin.name,
        phone: r.data.admin.phone,
        gender: r.data.admin.gender,
      })
      setImagePreview(getAssetUrl(r.data.admin.profilePhoto))
    })
  }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePwChange = e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('profilePhoto', imageFile)
      const { data } = await api.put('/admin/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(data.admin)
      updateUser(data.admin)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally { setSaving(false) }
  }

  const handlePwSave = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmNewPassword) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      await api.put('/admin/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally { setSavingPw(false) }
  }

  if (!profile) return <div className="page-wrapper"><Navbar /><div className="loading-state"><div className="loader-ring" /></div></div>

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <Navbar />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Profile</h1>
            <p className="page-subtitle">Your account details and settings</p>
          </div>
          <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        <div className="profile-layout">
          {/* Left Card */}
          <div className="glass-card profile-card-left">
            <div className="profile-avatar-wrap">
              {(imagePreview && !editing) || (editing && imagePreview) ? (
                <img src={getAssetUrl(imagePreview)} alt="profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">{initials}</div>
              )}
              {editing && (
                <label htmlFor="admin-photo-upload" style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--color-primary)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, border: '2px solid var(--bg-primary)' }}>
                  📷
                  <input id="admin-photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </label>
              )}
            </div>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-id">{profile.empId}</div>
            <span className="badge badge-primary" style={{ marginBottom: 20 }}>Admin</span>

            <div style={{ width: '100%', textAlign: 'left' }}>
              {[
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
                { label: 'Gender', value: profile.gender },
                { label: 'Date of Birth', value: formatDate(profile.dob) },
                { label: 'Member Since', value: formatDate(profile.createdAt) },
              ].map((d, i) => (
                <div key={i} className="profile-detail-item">
                  <span className="profile-detail-label">{d.label}</span>
                  <span className="profile-detail-value">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card */}
          <div className="glass-card profile-card-right">
            {editing ? (
              <>
                <div className="profile-section-title">Edit Profile Information</div>
                <form onSubmit={handleSave}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input id="admin-name" name="name" className="form-input" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input id="admin-phone" name="phone" className="form-input" value={form.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select id="admin-gender" name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <button id="save-profile-btn" type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="profile-section-title">Profile Overview</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Full Name', value: profile.name },
                    { label: 'Employee ID', value: profile.empId },
                    { label: 'Email', value: profile.email },
                    { label: 'Phone', value: profile.phone },
                    { label: 'Gender', value: profile.gender },
                    { label: 'Date of Birth', value: formatDate(profile.dob) },
                    { label: 'Role', value: 'Admin' },
                  ].map((d, i) => (
                    <div key={i} className="profile-detail-item">
                      <span className="profile-detail-label">{d.label}</span>
                      <span className="profile-detail-value">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="section-separator" />

            {/* Change Password */}
            <div className="profile-section-title">Change Password</div>
            <form onSubmit={handlePwSave}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input id="admin-curr-pw" name="currentPassword" type="password" required className="form-input" placeholder="••••••••" value={pwForm.currentPassword} onChange={handlePwChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input id="admin-new-pw" name="newPassword" type="password" required className="form-input" placeholder="Min 6 chars" value={pwForm.newPassword} onChange={handlePwChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input id="admin-confirm-pw" name="confirmNewPassword" type="password" required className="form-input" placeholder="Repeat" value={pwForm.confirmNewPassword} onChange={handlePwChange} />
                </div>
              </div>
              <button id="change-pw-btn" type="submit" className="btn btn-secondary" disabled={savingPw}>
                {savingPw ? 'Changing...' : '🔑 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
