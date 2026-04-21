import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import './Auth.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/
const formatAadhaar = (value) => value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ')

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.66 21.66 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.17 4.53" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  )
}

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') || 'user')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    aadhaar: '',
    password: '',
    confirmPassword: '',
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'aadhaar' ? formatAadhaar(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!emailRegex.test(form.email)) {
      return toast.error('Please enter a valid email address')
    }
    if (form.aadhaar.replace(/\D/g, '').length !== 12) {
      return toast.error('Please enter a valid 12-digit Aadhaar number')
    }
    if (!passwordRegex.test(form.password)) {
      return toast.error('Password must include letters, numbers, and a special character')
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    setLoading(true)
    try {
      const { data } = await api.post(`/auth/${role}/forgot-password`, {
        email: form.email,
        aadhaar: form.aadhaar.replace(/\D/g, ''),
        password: form.password,
      })
      toast.success(data.message)
      navigate(`/login?role=${role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-container animate-scale">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">🗳️ Vote<span className="gradient-text">Chain</span></Link>
        </div>

        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Verify your account with email and Aadhaar number, then set a new password</p>

        <div className="role-switcher">
          <button
            type="button"
            className={`role-btn ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
          >
            🗳️ Voter
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            🛡️ Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="form-input"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Aadhaar Number</label>
            <input
              name="aadhaar"
              type="text"
              required
              placeholder="1234 5678 9012"
              className="form-input"
              value={form.aadhaar}
              onChange={handleChange}
              inputMode="numeric"
              maxLength="14"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                className="form-input"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="password-field">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password"
                className="form-input"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Resetting password...' : `Reset ${role === 'admin' ? 'Admin' : 'Voter'} Password`}
          </button>
        </form>

        <p className="auth-footer-text">
          Back to <Link to={`/login?role=${role}`} className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
