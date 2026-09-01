import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SpecularButton from './SpecularButton';

const NAV_ITEMS = [
  /* { id: 'problem-statements', label: 'Problem Statements' }, */
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

const sponsorModules = import.meta.glob('/public/sponsors/*.{png,jpg,jpeg,svg,webp,PNG,JPG,JPEG,SVG,WEBP}', { eager: true });
const sponsorLogos = Object.keys(sponsorModules).map((path) => path.replace('/public', ''));

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 160], [76, 68]);
  const blurValue = useTransform(scrollY, [0, 120], [20, 28]);

  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    // Section active highlighting using IntersectionObserver
    const sectionElements = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0.1,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${targetId}`);
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      className="site-header"
      style={{ height: headerHeight, backdropFilter: `blur(${blurValue})`, WebkitBackdropFilter: `blur(${blurValue})` }}
    >
      <div className="container nav-shell">
        <Link to="/" className="brand" aria-label="Crucible home">
          <span className="brand-mark">C</span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
              MISSION <br /> CRUCIBLE
            </span>
          </div>
        </Link>

        {sponsorLogos.length > 0 && (
          <div className="nav-sponsors-container" aria-label="Sponsors Carousel">
            <div className="nav-sponsors-track">
              {[...sponsorLogos, ...sponsorLogos, ...sponsorLogos].map((src, idx) => (
                <img
                  key={`${src}-${idx}`}
                  src={src}
                  alt="Sponsor Logo"
                  className="nav-sponsor-logo"
                />
              ))}
            </div>
          </div>
        )}

        <nav className="main-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={isActive ? 'active' : ''}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="nav-actions">
          {auth ? (
            <>
              <SpecularButton
                size="sm"
                radius={12}
                lineColor="#71a7ff"
                baseColor="#142034"
                textColor="#ffffff"
                intensity={1}
                speed={0.35}
                onClick={() => navigate(`/dashboard/${auth.role}`)}
              >
                Dashboard
              </SpecularButton>
              <SpecularButton
                size="sm"
                radius={12}
                lineColor="#ff6b75"
                baseColor="#2a1215"
                textColor="#ff6b75"
                intensity={1}
                speed={0.35}
                onClick={logout}
              >
                Logout
              </SpecularButton>
            </>
          ) : (
            <>
              <SpecularButton
                size="sm"
                radius={12}
                lineColor="#71a7ff"
                baseColor="#142034"
                textColor="#ffffff"
                intensity={1}
                speed={0.35}
                onClick={() => navigate('/login')}
              >
                Login
              </SpecularButton>
              <span className="nav-register-btn">
                <SpecularButton
                  size="sm"
                  radius={12}
                  lineColor="#71a7ff"
                  baseColor="#3b74f6"
                  textColor="#ffffff"
                  intensity={1.2}
                  speed={0.4}
                  onClick={() => navigate('/register')}
                >
                  Register Now
                </SpecularButton>
              </span>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
