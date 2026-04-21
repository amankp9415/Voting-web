import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import './Landing.css'

const features = [
  { icon: '🔒', title: 'Secure Voting', desc: 'Military-grade JWT authentication ensures every vote is protected and tamper-proof.' },
  { icon: '⚡', title: 'Real-time Results', desc: 'Admin can view live election results with instant vote count updates.' },
  { icon: '🎯', title: 'One Vote Rule', desc: 'Smart duplicate prevention — each voter can cast exactly one vote per election.' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Separate admin and voter portals with purpose-built features for each role.' },
  { icon: '📊', title: 'Visual Analytics', desc: 'Beautiful result dashboards with percentage breakdowns and winner highlights.' },
  { icon: '🕐', title: 'Timed Elections', desc: 'Set precise start and end times — elections open and close automatically.' },
]

export default function Landing() {
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
            <a href="#features" className="landing-nav-link">Features</a>
            <Link to="/about" className="landing-nav-link">About Us</Link>
            <Link to="/contact" className="landing-nav-link">Contact Us</Link>
          </div>
          <div className="landing-nav-btns">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge animate-fade">
            <span className="badge badge-primary">Next-Gen Voting</span>
          </div>
          <h1 className="hero-title animate-fade">
            Democracy in the
            <br />
            <span className="gradient-text">Digital Age</span>
          </h1>
          <p className="hero-subtitle animate-fade">
            A secure, transparent, and modern digital voting platform. 
            Conduct fair elections with real-time results, role-based access, 
            and enterprise-grade security.
          </p>
          <div className="hero-cta animate-fade">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Voting Free →
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">100%</span>
              <span className="hero-stat-label">Secure</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">Real-time</span>
              <span className="hero-stat-label">Results</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">Zero</span>
              <span className="hero-stat-label">Duplicates</span>
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="hero-visual">
          <div className="floating-card card-1 glass-card">
            <div className="fc-label">Active Election</div>
            <div className="fc-title">General Election 2026</div>
            <div className="fc-bar">
              <div className="fc-bar-fill" style={{ width: '68%' }} />
            </div>
            <div className="fc-meta">68% votes cast · 2 days left</div>
          </div>
          <div className="floating-card card-2 glass-card">
            <div className="fc-label">Leading Candidate</div>
            <div className="fc-candidate">
              
              <div>
                
                <div className="fc-party">Progressive Party</div>
              </div>
            </div>
            <div className="fc-votes">4,821 votes · 61.2%</div>
          </div>
          <div className="floating-card card-3 glass-card">
            <span className="badge badge-success">✓ Vote Recorded</span>
            <p className="fc-confirm">Your vote has been securely cast!</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything you need for <span className="gradient-text">fair elections</span></h2>
          <p className="section-subtitle">Powerful features for administrators, transparent experience for voters</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card glass-card">
          <h2 className="cta-title">Ready to run your first election?</h2>
          <p className="cta-subtitle">Join thousands of organizations using VoteChain for fair, secure digital voting.</p>
          <div className="cta-buttons">
            <Link to="/register?role=admin" className="btn btn-primary btn-lg">Register as Admin</Link>
            <Link to="/register?role=user" className="btn btn-secondary btn-lg">Register as Voter</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand-icon-lg">🗳️</div>
        <span className="gradient-text brand-text">VoteChain</span>
        <p>© 2026 VoteChain. Built for fair elections.</p>
      </footer>
    </div>
  )
}
