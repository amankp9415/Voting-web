import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './Landing.css'

export default function DownloadPage() {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/Voting-platform-complete.zip'
    link.download = 'Voting-platform-complete.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="landing">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <nav className="landing-nav-shell">
        <div className="landing-nav">
          <Link to="/" className="landing-brand">
            <span className="brand-icon-lg">🗳️</span>
            <span className="brand-text">Vote<span className="gradient-text">Chain</span></span>
          </Link>
          <ThemeToggle />
          <div className="landing-nav-links">
            <Link to="/" className="landing-nav-link">Home</Link>
            <Link to="/about" className="landing-nav-link">About Us</Link>
            <Link to="/contact" className="landing-nav-link">Contact Us</Link>
          </div>
          <div className="landing-nav-btns">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="page-hero">
        <div className="page-shell">
          <span className="badge badge-primary">Project Download</span>
          <h1 className="page-title">Download the complete VoteChain project as a zip file</h1>
          <p className="page-subtitle">
            If the browser opens the zip instead of downloading it, use the button below. It starts a direct download request.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'flex-start', marginTop: 28 }}>
            <button type="button" className="btn btn-primary btn-lg" onClick={handleDownload}>
              Download Zip
            </button>
            <a href="/Voting-platform-complete.zip" download="Voting-platform-complete.zip" className="btn btn-secondary btn-lg">
              Direct Link
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
