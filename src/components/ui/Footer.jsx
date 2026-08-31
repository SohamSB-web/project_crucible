import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div>
          <div className="brand brand-footer">
            <span className="brand-mark">C</span>
            <span>CRUCIBLE</span>
          </div>
          <p className="muted small">
            A two-round innovation sprint for bold builders blending design, code, and climate-first thinking.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/#tracks">Tracks</Link>
          <Link to="/#faq">FAQ</Link>
          <Link to="/#contact">Contact</Link>
        </div>

        <div className="footer-meta">
          <div>socials / X / LinkedIn / Discord</div>
          <div>© 2026 Crucible</div>
        </div>
      </div>
    </footer>
  );
}
