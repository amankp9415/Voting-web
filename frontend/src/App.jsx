import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import DownloadPage from './pages/DownloadPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ElectionManage from './pages/admin/ElectionManage'
import CandidateManage from './pages/admin/CandidateManage'
import Results from './pages/admin/Results'
import AdminProfile from './pages/admin/AdminProfile'

// User pages
import UserDashboard from './pages/user/UserDashboard'
import VotePage from './pages/user/VotePage'
import UserProfile from './pages/user/UserProfile'

export default function App() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-ring"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/elections" element={<ProtectedRoute role="admin"><ElectionManage /></ProtectedRoute>} />
      <Route path="/admin/candidates" element={<ProtectedRoute role="admin"><CandidateManage /></ProtectedRoute>} />
      <Route path="/admin/results" element={<ProtectedRoute role="admin"><Results /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/vote/:electionId" element={<ProtectedRoute role="user"><VotePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="user"><UserProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
