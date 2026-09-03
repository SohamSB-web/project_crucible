import { Link, useLocation, useNavigate } from 'react-router-dom';
import { smoothScrollTo } from '../../utils/smoothScroll';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${targetId}`);
      return;
    }
    smoothScrollTo(targetId, { offset: 80, duration: 850 });
    if (window.history.pushState) {
      window.history.pushState(null, '', targetId === 'home' ? '/' : `#${targetId}`);
    }
  };
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        {/* Brand & Mission Info */}
        <div className="footer-brand-block">
          <Link to="/" className="brand brand-footer" aria-label="RepoForge">
            <span className="brand-mark">C</span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
                MISSION <br /> CRUCIBLE
              </span>
            </div>
          </Link>
          <p className="footer-desc">
            The high-intensity hybrid hackathon where student architects, engineers, and product creators forge solutions for real-world impact.
          </p>
          <div className="footer-org-badge">
            <span><a href="https://maps.app.goo.gl/hBsNKTayssCXzg6a8">Xavier Institute of Engineering, Mahim, Mumbai</a></span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Navigation</h4>
          <div className="footer-links-list">
            <a href="/" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
            <a href="/#roadmap" onClick={(e) => handleNavClick(e, 'roadmap')}>Roadmap & Milestones</a>
            <a href="/#rewards" onClick={(e) => handleNavClick(e, 'rewards')}>Rewards & Perks</a>
            <a href="/#faq" onClick={(e) => handleNavClick(e, 'faq')}>Frequently Asked Questions</a>
            <a href="/#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact & Help</a>
          </div>
        </div>

        {/* Registration & Portals */}
        <div className="footer-col">
          <h4 className="footer-col-title">Portals</h4>
          <div className="footer-links-list">
            <Link to="/register">Register Team</Link>
            <Link to="/login">Team Login</Link>
            <Link to="/login">Judge & Admin Access</Link>
          </div>
        </div>

        {/* Connect & Socials */}
        <div className="footer-col">
          <h4 className="footer-col-title">Connect</h4>
          <div className="footer-links-list">
            <a href="mailto:crucible@xavier.ac.in" target="_blank" rel="noopener noreferrer">
              ✉ crucible@xavier.ac.in
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p>© 2026 RepoForge • XIE-CSI. All rights reserved.</p>
          <p className="footer-credit">Crafted for passionate builders</p>
        </div>
      </div>
    </footer>
  );
}
