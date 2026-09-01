import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpecularButton from '../../components/ui/SpecularButton';
import { useAuth } from '../../context/AuthContext';
import { useLenis } from '../../context/LenisContext.jsx';
import {
  getHackathonSettings,
  getProblemStatements,
  getTeamsData,
  getSelectedProblem,
  setSelectedProblem,
  getUserSubmission,
  saveUserSubmission,
  getNotifications,
  markNotificationsRead,
} from '../../lib/portalStorage';
import styles from './UserDashboard.module.css';

/* ── SVG Icons ── */
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
    </svg>
  ),
  problems: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  submission: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
      <polyline points="13 2 13 9 20 9" />
      <line x1="12" y1="18" x2="12" y2="13" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  megaphone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  crown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    </svg>
  ),
  checkCircle: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  uploadCloud: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      <polyline points="16 16 12 12 8 16" />
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  code: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  palette: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.67 0-.42-.16-.81-.43-1.1-.26-.3-.42-.7-.42-1.14 0-.92.75-1.67 1.67-1.67H16c3.3 0 6-2.7 6-6 0-4.75-4.5-8.5-10-8.5z" />
    </svg>
  ),
  cpu: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  ),
  statusDot: (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ display: 'inline-block' }}>
      <circle cx="4" cy="4" r="3.5" fill="#22c55e" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const SqBtn = ({ children, onClick, type = 'button', lineColor = '#71a7ff', baseColor = '#142034', textColor = '#ffffff', danger = false, size = 'sm', fullWidth = false }) => (
  <SpecularButton
    size={size}
    radius={10}
    lineColor={danger ? '#ff6b75' : lineColor}
    baseColor={danger ? '#2a1215' : baseColor}
    textColor={danger ? '#ff6b75' : textColor}
    intensity={1}
    speed={0.35}
    onClick={onClick}
    type={type}
    className={fullWidth ? 'full-width' : ''}
  >
    {children}
  </SpecularButton>
);

const NAV_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'problems', label: 'Problem Statements', icon: Icons.problems },
  { id: 'team', label: 'My Team', icon: Icons.team },
  { id: 'submission', label: 'Submission', icon: Icons.submission },
];

export default function UserDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(getHackathonSettings());
  const [problems, setProblems] = useState(getProblemStatements());
  const [teams, setTeams] = useState(getTeamsData());
  const [notifications, setNotifications] = useState(getNotifications());

  // Current logged in team info
  const teamId = auth?.teamId || 'PHX024';
  const currentTeam = useMemo(() => teams.find((t) => t.id === teamId) || teams[0], [teams, teamId]);
  const isLeader = auth?.role === 'user' || auth?.role === 'leader' || true; // Leader access for demo

  // User selection & submission state
  const [selectedProb, setSelectedProbState] = useState(getSelectedProblem(teamId) || (currentTeam ? { id: currentTeam.problemId, title: currentTeam.problemTitle } : null));
  const [submission, setSubmissionState] = useState(getUserSubmission(teamId) || (currentTeam?.submitted ? { fileName: currentTeam.submissionFile, date: currentTeam.submissionDate, status: 'Submitted' } : null));

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewProblemModal, setViewProblemModal] = useState(null);
  const [confirmSelectModal, setConfirmSelectModal] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState('');

  // Sync state
  useEffect(() => {
    const handleSync = () => {
      setSettings(getHackathonSettings());
      setProblems(getProblemStatements());
      setTeams(getTeamsData());
      setNotifications(getNotifications());
      setSelectedProbState(getSelectedProblem(teamId));
      setSubmissionState(getUserSubmission(teamId));
    };
    window.addEventListener('crucible_storage_update', handleSync);
    return () => window.removeEventListener('crucible_storage_update', handleSync);
  }, [teamId]);

  const lenis = useLenis();

  // Lock background body scroll & pause Lenis smooth scroll when any modal is open
  const isAnyModalOpen = Boolean(showNotifModal || viewProblemModal || confirmSelectModal);
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [isAnyModalOpen, lenis]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Countdown timer calculation
  const daysRemaining = useMemo(() => {
    if (!settings.deadline) return 0;
    const diff = new Date(settings.deadline) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [settings.deadline]);

  // Handlers
  const handleSelectProblem = (prob) => {
    if (!isLeader) {
      alert('Access Restricted - Only the Team Leader can select a Problem Statement.');
      return;
    }
    setConfirmSelectModal(prob);
  };

  const confirmProblemSelection = () => {
    if (!confirmSelectModal) return;
    setSelectedProblem(teamId, confirmSelectModal);
    setSelectedProbState(confirmSelectModal);
    setConfirmSelectModal(null);
    showToast(`Selected Problem ${confirmSelectModal.id}!`);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.ppt', '.pptx'].includes(ext)) {
      alert('Invalid file format. Please upload a .pdf, .ppt, or .pptx file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit.');
      return;
    }

    const res = saveUserSubmission(teamId, file);
    setSubmissionState(res);
    showToast('Presentation submitted successfully!');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return problems.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [problems, searchQuery]);

  const hasUnreadNotifs = useMemo(() => notifications.some((n) => n.unread), [notifications]);

  const getRoleIcon = (role = '') => {
    const r = (role || '').toLowerCase();
    if (r.includes('lead')) return Icons.crown;
    if (r.includes('design') || r.includes('ux')) return Icons.palette;
    if (r.includes('ai') || r.includes('research') || r.includes('ml')) return Icons.cpu;
    if (r.includes('dev') || r.includes('full stack') || r.includes('backend') || r.includes('embedded') || r.includes('engineer')) return Icons.code;
    return Icons.user;
  };

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 2000,
              background: '#142034',
              border: '1px solid #71a7ff',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className={styles.topNav}>
        <div className={styles.brandGroup}>
          <div className={styles.brandLogo}>C</div>
          <div className={styles.brandInfo}>
            <span className={styles.brandTitle}>Mission Crucible</span>
            <span className={styles.brandSub}>{settings.name}</span>
          </div>
        </div>

        <nav className={styles.tabs}>
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.userActions}>
          <button
            className={styles.notifBtn}
            onClick={() => {
              setShowNotifModal(true);
              setNotifications(markNotificationsRead());
            }}
            aria-label="Notifications"
          >
            {Icons.bell}
            {hasUnreadNotifs && <span className={styles.notifDot} />}
          </button>

          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {Icons.user}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: '0.88rem' }}>{currentTeam?.teamName || 'Participant'}</strong>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono' }}>
                {teamId}
              </span>
            </div>
          </div>

          <SqBtn onClick={handleLogout} danger size="sm">
            Logout
          </SqBtn>
        </div>
      </header>

      {/* Main Body */}
      <main className={styles.shell}>
        {/* ── 1. DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            <div className={styles.welcomeCard}>
              <div className={styles.welcomeText}>
                <h1>Welcome back, {currentTeam?.teamName || 'Team'}!</h1>
                <p>Track your team progress, selected problem statement, and presentation deadline.</p>
              </div>
              <div className={styles.statusPill}>
                {Icons.statusDot} Hackathon Status: {settings.hackathonStatus}
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span className={styles.cardIcon}>{Icons.target}</span>
                <span className={styles.cardLabel}>Your Selected Problem</span>
                <span className={styles.cardValue}>
                  {selectedProb ? `${selectedProb.id || 'PS002'} — ${selectedProb.title || 'Selected'}` : 'None Selected Yet'}
                </span>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.cardIcon}>{Icons.star}</span>
                <span className={styles.cardLabel}>Shortlist Status</span>
                <span className={styles.cardValue}>
                  {currentTeam?.shortlisted ? 'Shortlisted' : 'Under Review'}
                </span>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.cardIcon}>{Icons.folder}</span>
                <span className={styles.cardLabel}>Submission Status</span>
                <span className={styles.cardValue}>
                  {submission ? 'Submitted' : 'Pending Upload'}
                </span>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.cardIcon}>{Icons.clock}</span>
                <span className={styles.cardLabel}>Submission Deadline</span>
                <span className={styles.cardValue}>
                  {daysRemaining > 0 ? `${daysRemaining} Days Remaining` : 'Deadline Passed'}
                </span>
              </div>
            </div>

            <div className={styles.panelsLayout}>
              {/* Left Column: Announcements & Selected Problem */}
              <div>
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {Icons.megaphone} Announcements
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 14,
                        }}
                      >
                        <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>{n.title}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{n.detail}</p>
                        <span style={{ fontSize: '0.7rem', color: '#71a7ff', fontFamily: 'JetBrains Mono' }}>{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Your Team Quick View */}
              <div>
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {Icons.team} Your Team ({currentTeam?.members?.length || 4})
                    </h3>
                    <SqBtn onClick={() => setActiveTab('team')}>View All</SqBtn>
                  </div>
                  <div className={styles.memberList}>
                    {currentTeam?.members?.map((m) => (
                      <div key={m.name} className={styles.memberItem}>
                        <div className={styles.memberAvatar}>
                          {getRoleIcon(m.role)}
                        </div>
                        <div>
                          <div className={styles.memberName}>{m.name}</div>
                          <div className={styles.memberRole} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {getRoleIcon(m.role)} {m.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. PROBLEM STATEMENTS TAB ── */}
        {activeTab === 'problems' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Explore Problem Statements</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Browse available hackathon challenges (PS001–PS010) and select your official track.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search by ID, title, domain, or tag..."
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  color: '#fff',
                  width: 300,
                  outline: 'none',
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredProblems.map((prob) => {
                const isSelected = selectedProb?.id === prob.id;
                return (
                  <div
                    key={prob.id}
                    style={{
                      background: 'rgba(16,23,38,0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: isSelected ? '1.5px solid #71a7ff' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 20,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      boxShadow: isSelected ? '0 0 20px rgba(113,167,255,0.25)' : '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#71a7ff', fontWeight: 700, fontSize: '0.82rem' }}>
                          {prob.id}
                        </span>
                        <span
                          style={{
                            background: 'rgba(113,167,255,0.15)',
                            color: '#71a7ff',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: '0.7rem',
                            fontFamily: 'JetBrains Mono',
                          }}
                        >
                          {prob.domain}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '12px 0 8px' }}>{prob.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{prob.description}</p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {(Array.isArray(prob.tags) ? prob.tags : prob.tags.split(',')).map((t) => (
                          <span
                            key={t}
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: 'rgba(255,255,255,0.75)',
                            }}
                          >
                            #{t.trim()}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <SqBtn onClick={() => setViewProblemModal(prob)} size="sm">
                          View Details
                        </SqBtn>
                        <SqBtn
                          onClick={() => handleSelectProblem(prob)}
                          size="sm"
                          lineColor={isSelected ? '#22c55e' : '#71a7ff'}
                          baseColor={isSelected ? '#0a2a16' : '#142034'}
                        >
                          {isSelected ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{Icons.check} Selected</span> : 'Select Problem'}
                        </SqBtn>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3. MY TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{currentTeam?.teamName}</h2>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#71a7ff', fontSize: '0.85rem' }}>Team ID: {currentTeam?.id}</span>
              </div>
              <span className={styles.statusPill}>{Icons.statusDot} Registered & Active</span>
            </div>

            <h3 style={{ marginTop: 24, fontSize: '1.1rem' }}>Team Members ({currentTeam?.members?.length})</h3>
            <div className={styles.memberList} style={{ marginTop: 16 }}>
              {currentTeam?.members?.map((m) => (
                <div key={m.name} className={styles.memberItem} style={{ padding: 16 }}>
                  <div className={styles.memberAvatar} style={{ width: 44, height: 44, fontSize: '1rem' }}>
                    {getRoleIcon(m.role)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem' }}>{m.name}</strong>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {getRoleIcon(m.role)} {m.role}
                    </div>
                  </div>
                  {m.role.includes('Leader') && (
                    <span style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontFamily: 'JetBrains Mono', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {Icons.crown} Team Lead
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. SUBMISSION TAB ── */}
        {activeTab === 'submission' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Final Presentation Submission</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  Upload your pitch deck (.pdf, .ppt, .pptx up to 10MB) for jury evaluation.
                </p>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: submission ? '#22c55e' : '#eab308' }}>
                {submission ? 'Submitted' : 'Pending'}
              </span>
            </div>

            {submission ? (
              <div style={{ padding: 24, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, marginTop: 20 }}>
                <h3 style={{ margin: 0, color: '#22c55e', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {Icons.checkCircle} Presentation Submitted!
                </h3>
                <p style={{ color: '#ffffff', marginTop: 12, fontSize: '0.95rem' }}>
                  File Name: <strong style={{ color: '#71a7ff' }}>{submission.fileName}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>({submission.fileSize || 'PDF/PPT'})</span>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                  Submitted on: {submission.date}
                </p>
                <div style={{ marginTop: 20 }}>
                  <SqBtn onClick={() => document.getElementById('resubmit-input').click()} size="sm">
                    Re-upload File
                  </SqBtn>
                  <input
                    id="resubmit-input"
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </div>
              </div>
            ) : (
              <div
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload-input').click()}
                style={{ marginTop: 24 }}
              >
                <span className={styles.dropIcon}>{Icons.uploadCloud}</span>
                <strong style={{ fontSize: '1.1rem' }}>Click or Drag & Drop to Upload Presentation</strong>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                  Supports PDF, PPT, PPTX up to 10 MB
                </span>
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Problem Selection */}
      {confirmSelectModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setConfirmSelectModal(null)}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <h2>Confirm Problem Selection</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              Are you sure you want to select <strong>{confirmSelectModal.id} — {confirmSelectModal.title}</strong> as your official hackathon problem statement?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <SqBtn onClick={() => setConfirmSelectModal(null)} danger>
                Cancel
              </SqBtn>
              <SqBtn onClick={confirmProblemSelection} lineColor="#22c55e">
                Confirm Selection
              </SqBtn>
            </div>
          </div>
        </div>
      )}

      {/* Problem View Modal */}
      {viewProblemModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setViewProblemModal(null)}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <span style={{ fontFamily: 'JetBrains Mono', color: '#71a7ff', fontWeight: 700 }}>{viewProblemModal.id}</span>
            <h2>{viewProblemModal.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{viewProblemModal.description}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <SqBtn onClick={() => setViewProblemModal(null)}>Close</SqBtn>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowNotifModal(false)}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div className={styles.modalHeader}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '1.4rem' }}>
                {Icons.bell} Notifications
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowNotifModal(false)}
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
            <div
              className={styles.modalScrollBody}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <strong style={{ fontSize: '0.96rem', color: '#ffffff' }}>{n.title}</strong>
                  <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>{n.detail}</p>
                  <span style={{ fontSize: '0.72rem', color: '#71a7ff', fontFamily: 'JetBrains Mono', marginTop: 8, display: 'inline-block' }}>{n.time}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <SqBtn onClick={() => setShowNotifModal(false)}>Close</SqBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
