import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import './Auth.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/
const formatAadhaar = (value) => value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ')
const formatPhone = (value) => value.replace(/\D/g, '').slice(0, 10)

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

export default function Register() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || 'user'
  const [role, setRole] = useState(initialRole)
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', aadhaar: '', dob: '', gender: 'Male',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({
      ...p,
      [name]: name === 'aadhaar'
        ? formatAadhaar(value)
        : name === 'phone'
          ? formatPhone(value)
          : value,
    }))
  }

  const isUnder18 = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1
    }
    return age < 18
  }

  const handleNext = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return toast.error('Please fill in your account details')
    }
    if (!emailRegex.test(form.email)) {
      return toast.error('Please enter a valid email address')
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (!passwordRegex.test(form.password)) {
      return toast.error('Password must include letters, numbers, and a special character')
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailRegex.test(form.email)) {
      return toast.error('Please enter a valid email address')
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (!passwordRegex.test(form.password)) {
      return toast.error('Password must include letters, numbers, and a special character')
    }
    if (form.phone.length !== 10) {
      return toast.error('Phone number must be exactly 10 digits after +91')
    }
    if (form.aadhaar.replace(/\D/g, '').length !== 12) {
      return toast.error('Please enter a valid 12-digit Aadhaar number')
    }
    if (!form.dob || isUnder18(form.dob)) {
      return toast.error(`${role === 'admin' ? 'Admin' : 'User'} must be at least 18 years old to register`)
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, aadhaar: form.aadhaar.replace(/\D/g, ''), dob: form.dob,
      }
      payload.gender = form.gender

      const { data } = await api.post(`/auth/${role}/register`, payload)
      login(data.token, data.user, data.user.role || role)
      toast.success(`Account created! Welcome, ${data.user.name}!`)
      navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-container auth-container-wide animate-scale">
        <div className="auth-brand">
          <Link to="/" className="auth-logo"> Vote<span className="gradient-text">Chain</span></Link>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join VoteChain and participate in secure elections</p>

        {/* Role Switcher */}
        <div className="role-switcher">
          <button type="button" className={`role-btn ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>
            🗳️ Register as Voter
          </button>
          <button type="button" className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>
            🛡️ Register as Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input id="reg-name" name="name" type="text" required placeholder="John Doe" className="form-input" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input id="reg-email" name="email" type="email" required placeholder="john@example.com" className="form-input" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-field">
                    <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} required placeholder="Min 6 characters" className="form-input" value={form.password} onChange={handleChange} />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(p => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="password-field">
                    <input id="reg-confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required placeholder="Repeat password" className="form-input" value={form.confirmPassword} onChange={handleChange} />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <button id="reg-next" type="button" className="btn btn-primary btn-full btn-lg" onClick={handleNext}>
                Next
              </button>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="prefixed-input">
                    <span className="input-prefix">+91</span>
                    <input id="reg-phone" name="phone" type="tel" required placeholder="9876543210" className="form-input" value={form.phone} onChange={handleChange} inputMode="numeric" maxLength="10" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input id="reg-aadhaar" name="aadhaar" type="text" required placeholder="1234 5678 9012" className="form-input" value={form.aadhaar} onChange={handleChange} inputMode="numeric" maxLength="14" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input id="reg-dob" name="dob" type="date" required className="form-input" value={form.dob} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select id="reg-gender" name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary btn-full btn-lg" onClick={() => setStep(1)}>
                  Back
                </button>
                <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? <><span className="loader-ring" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : `Create ${role === 'admin' ? 'Admin' : 'Voter'} Account`}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
