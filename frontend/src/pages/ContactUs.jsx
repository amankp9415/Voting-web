import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './Landing.css'

export default function ContactUs() {
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
            <a href="/#features" className="landing-nav-link">Features</a>
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
          <span className="badge badge-success">Contact Us</span>
          <h1 className="page-title">Tell us what problem you are facing and we will help by email</h1>
          <p className="page-subtitle">
            Share the issue, question, or setup challenge you are dealing with. The more clearly you describe it, the faster we can help.
          </p>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-card glass-card">
          <div className="contact-intro">
            <h2 className="section-title">How to ask for help</h2>
            <p className="info-text">
              Send us an email with your role, the page where the issue happened, and a short note about what you expected versus what actually happened.
            </p>
          </div>
          <div className="story-grid">
            <div className="story-card glass-card">
              <span className="story-step">01</span>
              <h3 className="feature-title">Describe the problem</h3>
              <p className="feature-desc">Tell us what went wrong, when it happened, and whether you were using the admin or voter side.</p>
            </div>
            <div className="story-card glass-card">
              <span className="story-step">02</span>
              <h3 className="feature-title">Add useful details</h3>
              <p className="feature-desc">Include the page name, error message, and the steps you took before the issue showed up.</p>
            </div>
            <div className="story-card glass-card">
              <span className="story-step">03</span>
              <h3 className="feature-title">Mail the support team</h3>
              <p className="feature-desc">Send everything to our support inbox and we will continue the conversation there.</p>
            </div>
          </div>
          <div className="support-mail-box">
            <span className="contact-label">Support Mail</span>
            <a href="mailto:support@votechain.app?subject=VoteChain%20Support%20Request" className="support-mail-link">support@votechain.app</a>
            <p className="feature-desc">Use this email for platform questions, bugs, onboarding help, or election setup issues.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
