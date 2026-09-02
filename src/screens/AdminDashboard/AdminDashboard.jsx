import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLenis } from '../../context/LenisContext.jsx';
import {
  getHackathonSettings,
  saveHackathonSettings,
  getProblemStatements,
  addProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  getTeamsData,
  toggleTeamShortlist,
  getWinnerAssignments,
  assignWinner,
} from '../../lib/portalStorage';
import styles from './AdminDashboard.module.css';

/* ── SVG Nav Icons ── */
const NavIcons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
    </svg>
  ),
  problems: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  teams: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  submissions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
      <polyline points="13 2 13 9 20 9" />
      <line x1="12" y1="18" x2="12" y2="13" />
      <polyline points="9 15 12 12 15 15" />
    </svg>
  ),
  results: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z" />
      <path d="M4 22h16" />
      <path d="M10 22V10" />
      <path d="M14 22V10" />
      <path d="M6 9h12l-1.5 4a2 2 0 0 1-1.9 1.4H9.4a2 2 0 0 1-1.9-1.4L6 9z" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
    </svg>
  ),
  checkCircle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  trophy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z" />
      <path d="M4 22h16" />
      <path d="M10 22V10" />
      <path d="M14 22V10" />
      <path d="M6 9h12l-1.5 4a2 2 0 0 1-1.9 1.4H9.4a2 2 0 0 1-1.9-1.4L6 9z" />
    </svg>
  ),
  medal: (color = 'currentColor') => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="15" r="5" />
      <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      <path d="M15 9l-3-6-3 6" />
    </svg>
  ),
};

const SqBtn = ({ children, onClick, type = 'button', danger = false, success = false, lineColor, baseColor, textColor, size = 'sm', fullWidth = false, style = {} }) => {
  const customStyles = { ...style };
  if (lineColor) customStyles['--line-color'] = lineColor;
  if (baseColor) customStyles['--base-color'] = baseColor;
  if (textColor) customStyles['--text-color'] = textColor;

  return (
    <button
      type={type}
      onClick={onClick}
      style={customStyles}
      className={`${styles.sqBtn} ${danger ? styles.sqBtnDanger : ''} ${success ? styles.sqBtnSuccess : ''} ${fullWidth ? styles.sqBtnFull : ''}`}
    >
      {children}
    </button>
  );
};

const NAV_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: NavIcons.dashboard },
  { id: 'problems', label: 'Problem Statements', icon: NavIcons.problems },
  { id: 'teams', label: 'Teams', icon: NavIcons.teams },
  { id: 'submissions', label: 'Submissions', icon: NavIcons.submissions },
  { id: 'results', label: 'Results', icon: NavIcons.results },
  { id: 'settings', label: 'Settings', icon: NavIcons.settings },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(getHackathonSettings());
  const [problems, setProblems] = useState(getProblemStatements());
  const [teams, setTeams] = useState(getTeamsData());
  const [winners, setWinners] = useState(getWinnerAssignments());
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [viewProblem, setViewProblem] = useState(null);

  // Form states
  const [probForm, setProbForm] = useState({ id: '', title: '', domain: '', tags: '', description: '', difficulty: 'Intermediate' });

  const lenis = useLenis();
  const isAnyModalOpen = Boolean(showAddModal || viewProblem);

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

  // Sync state
  useEffect(() => {
    const handleSync = () => {
      setSettings(getHackathonSettings());
      setProblems(getProblemStatements());
      setTeams(getTeamsData());
      setWinners(getWinnerAssignments());
    };
    window.addEventListener('crucible_storage_update', handleSync);
    return () => window.removeEventListener('crucible_storage_update', handleSync);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Analytics
  const metrics = useMemo(() => {
    const totalTeams = teams.length;
    const submittedTeams = teams.filter((t) => t.submitted).length;
    const pendingReviews = teams.filter((t) => t.submitted && !t.shortlisted).length;
    const shortlistedCount = teams.filter((t) => t.shortlisted).length;
    return { totalTeams, submittedTeams, pendingReviews, shortlistedCount, problemsCount: problems.length };
  }, [teams, problems]);

  // Handlers
  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveHackathonSettings(settings);
    showToast('Settings saved successfully!');
  };

  const handleCreateProblem = (e) => {
    e.preventDefault();
    if (!probForm.title || !probForm.domain) {
      alert('Please fill title and domain');
      return;
    }
    if (editingProblem) {
      updateProblemStatement({
        ...editingProblem,
        ...probForm,
        tags: typeof probForm.tags === 'string' ? probForm.tags.split(',').map((t) => t.trim()) : probForm.tags,
      });
      showToast('Problem Statement updated!');
    } else {
      addProblemStatement(probForm);
      showToast('New Problem Statement added!');
    }
    setShowAddModal(false);
    setEditingProblem(null);
    setProbForm({ id: '', title: '', domain: '', tags: '', description: '', difficulty: 'Intermediate' });
  };

  const handleDeleteProblem = (id) => {
    if (window.confirm('Are you sure you want to delete this Problem Statement?')) {
      deleteProblemStatement(id);
      showToast('Problem Statement removed');
    }
  };

  const openEditModal = (prob) => {
    setEditingProblem(prob);
    setProbForm({
      id: prob.id,
      title: prob.title,
      domain: prob.domain,
      tags: Array.isArray(prob.tags) ? prob.tags.join(', ') : prob.tags,
      description: prob.description,
      difficulty: prob.difficulty,
    });
    setShowAddModal(true);
  };

  const handleToggleShortlist = (teamId) => {
    toggleTeamShortlist(teamId);
    showToast('Updated team shortlist status');
  };

  const handleAssignWinner = (position, teamId) => {
    assignWinner(position, teamId);
    showToast(`Assigned ${position} place winner`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filtered lists
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

  const filteredTeams = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return teams.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.leaderName.toLowerCase().includes(q) ||
        (t.problemTitle && t.problemTitle.toLowerCase().includes(q)),
    );
  }, [teams, searchQuery]);

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

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>C</div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>RepoForge</span>
            <span className={styles.brandSub}>ADMINISTRATION</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <span className={styles.navText}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile}>
            <div className={styles.adminAvatar}>AD</div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>Administrator</span>
              <span className={styles.adminId}>ADMIN001</span>
            </div>
          </div>
          <SqBtn onClick={handleLogout} danger lineColor="#ff6b75">
            Logout
          </SqBtn>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>{NAV_TABS.find((t) => t.id === activeTab)?.label}</h1>
            <p>{settings.name} — Control Center</p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.badge} ${settings.registrationStatus === 'Open' ? styles.badgeGreen : styles.badgeYellow}`}>
              Registration: {settings.registrationStatus}
            </span>
          </div>
        </div>

        {/* ── 1. DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Total Teams</span>
                <span className={styles.metricValue}>{metrics.totalTeams}</span>
                <span className={styles.metricBadge}>Registered Teams</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Pending Reviews</span>
                <span className={styles.metricValue}>{metrics.pendingReviews}</span>
                <span className={styles.metricBadge}>Submitted Teams</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Problem Statements</span>
                <span className={styles.metricValue}>{metrics.problemsCount}</span>
                <span className={styles.metricBadge}>PS001 – PS{String(metrics.problemsCount).padStart(3, '0')}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Shortlisted Teams</span>
                <span className={styles.metricValue}>{metrics.shortlistedCount}</span>
                <span className={styles.metricBadge}>Final Round</span>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Recent Team Registrations</h3>
                <SqBtn
                  onClick={() => {
                    setProbForm({ id: '', title: '', domain: '', tags: '', description: '', difficulty: 'Intermediate' });
                    setEditingProblem(null);
                    setShowAddModal(true);
                  }}
                >
                  + Add Problem Statement
                </SqBtn>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Team ID</th>
                      <th>Team Name</th>
                      <th>Leader</th>
                      <th>Problem Selected</th>
                      <th>Submission Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'JetBrains Mono', color: '#71a7ff', whiteSpace: 'nowrap' }}>{t.id}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <strong>{t.teamName}</strong>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{t.leaderName}</td>
                        <td style={{ minWidth: 180, maxWidth: 280, lineHeight: 1.4 }}>{t.problemTitle || 'Pending Selection'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className={`${styles.badge} ${t.submitted ? styles.badgeGreen : styles.badgeYellow}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {t.submitted ? <>{NavIcons.checkCircle} Submitted</> : <>{NavIcons.clock} Pending</>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. PROBLEM STATEMENTS TAB ── */}
        {activeTab === 'problems' && (
          <div>
            <div className={styles.sectionHeader} style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Search problems by ID, Title, Domain or Tag..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SqBtn
                onClick={() => {
                  setProbForm({ id: '', title: '', domain: '', tags: '', description: '', difficulty: 'Intermediate' });
                  setEditingProblem(null);
                  setShowAddModal(true);
                }}
              >
                + Add New Problem
              </SqBtn>
            </div>

            <div className={styles.problemsGrid}>
              {filteredProblems.map((prob) => (
                <div key={prob.id} className={styles.probCard}>
                  <div>
                    <div className={styles.probHeader}>
                      <span className={styles.probId}>{prob.id}</span>
                      <span className={`${styles.badge} ${styles.badgeBlue}`}>{prob.domain}</span>
                    </div>
                    <h3 className={styles.probTitle} style={{ marginTop: 12 }}>
                      {prob.title}
                    </h3>
                    <p className={styles.probDesc} style={{ marginTop: 8 }}>
                      {prob.description}
                    </p>
                  </div>
                  <div>
                    <div className={styles.tagGroup}>
                      {(Array.isArray(prob.tags) ? prob.tags : prob.tags.split(',')).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                    <div className={styles.probActions}>
                      <SqBtn onClick={() => setViewProblem(prob)} size="sm">
                        View
                      </SqBtn>
                      <SqBtn onClick={() => openEditModal(prob)} size="sm" lineColor="#eab308">
                        Edit
                      </SqBtn>
                      <SqBtn onClick={() => handleDeleteProblem(prob.id)} size="sm" danger>
                        Delete
                      </SqBtn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. TEAMS MANAGEMENT TAB ── */}
        {activeTab === 'teams' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Registered Teams ({filteredTeams.length})</h3>
              <input
                type="text"
                placeholder="Search team name, ID, leader..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Team ID</th>
                    <th>Team Name</th>
                    <th>Leader Email</th>
                    <th>Selected Problem</th>
                    <th>Submission Status</th>
                    <th>Shortlist Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'JetBrains Mono', color: '#71a7ff', whiteSpace: 'nowrap' }}>{t.id}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <strong>{t.teamName}</strong>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{t.leaderEmail}</td>
                      <td style={{ minWidth: 180, maxWidth: 300, lineHeight: 1.4 }}>{t.problemTitle || 'None Selected'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`${styles.badge} ${t.submitted ? styles.badgeGreen : styles.badgeYellow}`}>
                          {t.submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`${styles.badge} ${t.shortlisted ? styles.badgeGreen : styles.badgeYellow}`}>
                          {t.shortlisted ? 'Shortlisted' : 'Under Review'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <SqBtn
                          size="sm"
                          lineColor={t.shortlisted ? '#ff6b75' : '#22c55e'}
                          onClick={() => handleToggleShortlist(t.id)}
                        >
                          {t.shortlisted ? 'Remove Shortlist' : 'Shortlist'}
                        </SqBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 4. SUBMISSIONS REVIEW TAB ── */}
        {activeTab === 'submissions' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Team Presentation Submissions</h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Team Name & ID</th>
                    <th>File Name</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <strong>{t.teamName}</strong> <span style={{ fontFamily: 'JetBrains Mono', color: '#71a7ff' }}>({t.id})</span>
                      </td>
                      <td style={{ minWidth: 160 }}>{t.submissionFile || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{t.submissionDate || 'Not Submitted'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`${styles.badge} ${t.submitted ? styles.badgeGreen : styles.badgeYellow}`}>
                          {t.submitted ? 'File Ready' : 'Pending Submission'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 5. RESULTS & WINNERS TAB ── */}
        {activeTab === 'results' && (
          <div>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {NavIcons.trophy} Assign Hackathon Winners
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  Select shortlisted teams to place on the winner podium.
                </p>
              </div>

              <div className={styles.winnersRow}>
                {/* 1st Place */}
                <div className={`${styles.winnerBox} ${winners.first ? styles.assigned : ''}`}>
                  <span className={styles.medalIcon}>{NavIcons.medal('#eab308')}</span>
                  <strong>1st Place Winner</strong>
                  <span style={{ fontSize: '0.85rem', color: '#eab308' }}>
                    {teams.find((t) => t.id === winners.first)?.teamName || 'Unassigned'}
                  </span>
                  <select
                    style={{ background: '#0a0e17', color: '#fff', padding: '8px', borderRadius: '8px', width: '100%' }}
                    value={winners.first || ''}
                    onChange={(e) => handleAssignWinner('first', e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2nd Place */}
                <div className={`${styles.winnerBox} ${winners.second ? styles.assigned : ''}`}>
                  <span className={styles.medalIcon}>{NavIcons.medal('#94a3b8')}</span>
                  <strong>2nd Place Winner</strong>
                  <span style={{ fontSize: '0.85rem', color: '#71a7ff' }}>
                    {teams.find((t) => t.id === winners.second)?.teamName || 'Unassigned'}
                  </span>
                  <select
                    style={{ background: '#0a0e17', color: '#fff', padding: '8px', borderRadius: '8px', width: '100%' }}
                    value={winners.second || ''}
                    onChange={(e) => handleAssignWinner('second', e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3rd Place */}
                <div className={`${styles.winnerBox} ${winners.third ? styles.assigned : ''}`}>
                  <span className={styles.medalIcon}>{NavIcons.medal('#f97316')}</span>
                  <strong>3rd Place Winner</strong>
                  <span style={{ fontSize: '0.85rem', color: '#f97316' }}>
                    {teams.find((t) => t.id === winners.third)?.teamName || 'Unassigned'}
                  </span>
                  <select
                    style={{ background: '#0a0e17', color: '#fff', padding: '8px', borderRadius: '8px', width: '100%' }}
                    value={winners.third || ''}
                    onChange={(e) => handleAssignWinner('third', e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.teamName} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. SETTINGS MANAGEMENT TAB ── */}
        {activeTab === 'settings' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>⚙️ Hackathon Configuration</h3>
            </div>
            <form onSubmit={handleSaveSettings} className={styles.formGrid}>
              <div className={styles.field}>
                <label>Hackathon Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label>Hackathon Year</label>
                <input
                  type="number"
                  value={settings.year}
                  onChange={(e) => setSettings({ ...settings, year: Number(e.target.value) })}
                />
              </div>

              <div className={styles.field}>
                <label>Submission Deadline</label>
                <input
                  type="date"
                  value={settings.deadline}
                  onChange={(e) => setSettings({ ...settings, deadline: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label>Hackathon Status</label>
                <select
                  value={settings.hackathonStatus}
                  onChange={(e) => setSettings({ ...settings, hackathonStatus: e.target.value })}
                >
                  <option value="Live">Live</option>
                  <option value="Paused">Paused</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Registration Status</label>
                <select
                  value={settings.registrationStatus}
                  onChange={(e) => setSettings({ ...settings, registrationStatus: e.target.value })}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className={styles.field} style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                <SqBtn type="submit" lineColor="#22c55e" baseColor="#0a2a16">
                  Save All Settings
                </SqBtn>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Add / Edit Problem Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingProblem ? 'Edit Problem Statement' : 'Add Problem Statement'}</h2>
            <form onSubmit={handleCreateProblem} style={{ display: 'grid', gap: 16 }}>
              <div className={styles.field}>
                <label>Problem ID (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. PS011"
                  value={probForm.id}
                  onChange={(e) => setProbForm({ ...probForm, id: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Problem Title"
                  value={probForm.title}
                  onChange={(e) => setProbForm({ ...probForm, title: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Domain *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthcare, AI, Smart City"
                  value={probForm.domain}
                  onChange={(e) => setProbForm({ ...probForm, domain: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="AI, IoT, Cloud"
                  value={probForm.tags}
                  onChange={(e) => setProbForm({ ...probForm, tags: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea
                  rows={4}
                  placeholder="Detailed description of the challenge..."
                  value={probForm.description}
                  onChange={(e) => setProbForm({ ...probForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <SqBtn onClick={() => setShowAddModal(false)} danger>
                  Cancel
                </SqBtn>
                <SqBtn type="submit" lineColor="#22c55e">
                  {editingProblem ? 'Update Problem' : 'Create Problem'}
                </SqBtn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Problem Detail Modal */}
      {viewProblem && (
        <div className={styles.modalBackdrop} onClick={() => setViewProblem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.probHeader}>
              <span className={styles.probId}>{viewProblem.id}</span>
              <span className={`${styles.badge} ${styles.badgeBlue}`}>{viewProblem.domain}</span>
            </div>
            <h2>{viewProblem.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{viewProblem.description}</p>
            <div className={styles.tagGroup}>
              {(Array.isArray(viewProblem.tags) ? viewProblem.tags : viewProblem.tags.split(',')).map((t) => (
                <span key={t} className={styles.tag}>
                  #{t.trim()}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <SqBtn onClick={() => setViewProblem(null)}>Close</SqBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
