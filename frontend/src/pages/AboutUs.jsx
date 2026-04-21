import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './Landing.css'

export default function AboutUs() {
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
          <span className="badge badge-info">About Us</span>
          <h1 className="page-title">We built VoteChain for moments when trust matters most</h1>
          <p className="page-subtitle">
            Elections should feel calm, credible, and easy to follow. VoteChain brings that feeling to digital voting with a cleaner process for both organizers and voters.
          </p>
        </div>
      </section>

      <section className="info-section">
        <div className="info-grid">
          <div className="info-copy">
            <h2 className="section-title">Why VoteChain feels different</h2>
            <p className="info-text">
              We started with a simple idea: voting platforms should not feel stressful. Admins should be able to launch elections confidently, and voters should understand exactly where they are in the process from the first click to the final confirmation.
            </p>
            <p className="info-text">
              That is why VoteChain focuses on clarity first, then security, then speed. The result is a platform that works well for schools, offices, associations, clubs, and communities that want a dependable digital voting workflow without unnecessary friction.
            </p>
          </div>
          <div className="info-highlights glass-card">
            <div className="info-highlight">
              <strong>Less confusion</strong>
              <span>Simple flows help people understand what to do next without training or guesswork.</span>
            </div>
            <div className="info-highlight">
              <strong>More confidence</strong>
              <span>Admins can manage elections and review results in one place with a stronger sense of control.</span>
            </div>
            <div className="info-highlight">
              <strong>Faster outcomes</strong>
              <span>Live visibility helps teams move quickly from voting to decisions once elections close.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="page-shell">
          <div className="section-header section-header-left">
            <h2 className="section-title">How we think about digital elections</h2>
            <p className="section-subtitle">A good voting experience should feel steady from start to finish.</p>
          </div>
          <div className="story-grid">
            <div className="story-card glass-card">
              <span className="story-step">01</span>
              <h3 className="feature-title">Set the ground clearly</h3>
              <p className="feature-desc">Election details, candidate information, and timing should be visible and understandable before anyone votes.</p>
            </div>
            <div className="story-card glass-card">
              <span className="story-step">02</span>
              <h3 className="feature-title">Keep the flow focused</h3>
              <p className="feature-desc">Registration, authentication, and voting should guide people forward without distractions or confusing choices.</p>
            </div>
            <div className="story-card glass-card">
              <span className="story-step">03</span>
              <h3 className="feature-title">Make results easy to trust</h3>
              <p className="feature-desc">Once votes are cast, the result view should feel transparent, immediate, and simple to interpret.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
