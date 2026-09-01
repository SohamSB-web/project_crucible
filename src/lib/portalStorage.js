/**
 * portalStorage.js
 * Unified storage and state manager for Admin & Participant portals.
 * Integrates with localStorage for persistence and dispatches custom events
 * so multi-tab / real-time UI updates work automatically.
 */

const STORAGE_KEYS = {
  SETTINGS: 'crucible_hackathon_settings',
  PROBLEMS: 'crucible_problem_statements',
  TEAMS: 'crucible_teams',
  SUBMISSIONS: 'crucible_submissions',
  WINNERS: 'crucible_winners',
  USER_SELECTION: 'crucible_user_problem_selection',
  USER_SUBMISSION: 'crucible_user_submission_file',
  NOTIFICATIONS: 'crucible_notifications',
};

// ── Default Data ─────────────────────────────────────────────────────────────

export const DEFAULT_PROBLEMS = [
  {
    id: 'PS001',
    title: 'Smart Campus: IoT & Energy Optimization',
    domain: 'IoT & Smart City',
    tags: ['IoT', 'Smart City', 'Energy', 'Sensors'],
    description: 'Design an automated IoT sensor network to monitor and optimize energy consumption across university campus facilities in real-time.',
    difficulty: 'Intermediate',
  },
  {
    id: 'PS002',
    title: 'Healthcare Innovation: AI Diagnostic Companion',
    domain: 'Healthcare & AI',
    tags: ['Healthcare', 'AI', 'Machine Learning', 'Diagnostics'],
    description: 'Build an AI assistant that analyzes patient symptoms and medical imaging to assist rural clinics with early triage and risk assessment.',
    difficulty: 'Advanced',
  },
  {
    id: 'PS003',
    title: 'Green Technology: Carbon Footprint Tracker',
    domain: 'Sustainability',
    tags: ['Environment', 'Sustainability', 'GreenTech', 'Analytics'],
    description: 'Create an automated carbon accounting dashboard for SMBs to calculate, visualize, and offset supply chain carbon emissions.',
    difficulty: 'Beginner-friendly',
  },
  {
    id: 'PS004',
    title: 'AI Education Assistant: Adaptive Learning Tutor',
    domain: 'AI & EdTech',
    tags: ['AI', 'EdTech', 'Adaptive Learning', 'LLM'],
    description: 'Develop an intelligent tutoring system that tailors course materials, quizzes, and feedback to individual student learning speeds.',
    difficulty: 'Intermediate',
  },
  {
    id: 'PS005',
    title: 'Smart Traffic Management & Emergency Response',
    domain: 'IoT & Smart City',
    tags: ['IoT', 'Smart City', 'Computer Vision', 'Mobility'],
    description: 'Engineer a dynamic traffic signal control system using computer vision to give green light priority to approaching ambulances and fire trucks.',
    difficulty: 'Advanced',
  },
  {
    id: 'PS006',
    title: 'Cybersecurity Shield: Zero-Trust Anomaly Detection',
    domain: 'Security & AI',
    tags: ['Security', 'AI', 'Zero-Trust', 'Network'],
    description: 'Implement a real-time network anomaly detector using machine learning to identify unauthorized access attempts and data exfiltration.',
    difficulty: 'Advanced',
  },
  {
    id: 'PS007',
    title: 'AgriTech Innovation: Precision Crop Yield Monitor',
    domain: 'AgriTech & IoT',
    tags: ['AI', 'IoT', 'Agriculture', 'Drone Data'],
    description: 'Provide farmers with actionable soil moisture and pest risk predictions using satellite data and low-power IoT ground sensors.',
    difficulty: 'Intermediate',
  },
  {
    id: 'PS008',
    title: 'Disaster Management: Rapid Crisis Mapping',
    domain: 'AI & Data',
    tags: ['AI', 'Data', 'Disaster Recovery', 'GIS'],
    description: 'Build a crowdsourced mapping engine that aggregates social media and satellite imagery to route rescue teams during natural disasters.',
    difficulty: 'Intermediate',
  },
  {
    id: 'PS009',
    title: 'FinTech Innovation: Automated Fraud Guard',
    domain: 'FinTech & Blockchain',
    tags: ['FinTech', 'Blockchain', 'Fraud Detection', 'Security'],
    description: 'Construct a micro-transaction monitoring protocol that detects anomalous wallet behavior and blocks fraudulent transactions instantaneously.',
    difficulty: 'Advanced',
  },
  {
    id: 'PS10',
    title: 'Smart Waste Management & Recycling Rewards',
    domain: 'Sustainability & IoT',
    tags: ['IoT', 'Sustainability', 'Recycling', 'Gamification'],
    description: 'Deploy smart bin fill-level sensors coupled with a mobile app that rewards citizens for proper waste sorting and recycling.',
    difficulty: 'Beginner-friendly',
  },
];

export const DEFAULT_TEAMS = [
  {
    id: 'PHX024',
    teamName: 'Team Phoenix',
    leaderName: 'Rahul Sharma',
    leaderEmail: 'rahul.sharma@crucible.dev',
    problemId: 'PS002',
    problemTitle: 'Healthcare Innovation: AI Diagnostic Companion',
    submitted: true,
    submissionFile: 'Phoenix_AI_Diagnostic_Presentation.pdf',
    submissionDate: '2026-08-15 14:30',
    shortlisted: true,
    members: [
      { name: 'Rahul Sharma', role: 'Team Leader', avatar: 'RS' },
      { name: 'Priya Verma', role: 'AI Researcher', avatar: 'PV' },
      { name: 'Aman Gupta', role: 'Full Stack Dev', avatar: 'AG' },
      { name: 'Sneha Patel', role: 'UI/UX Designer', avatar: 'SP' },
    ],
  },
  {
    id: 'NOVA018',
    teamName: 'Team Nova',
    leaderName: 'Ananya Patel',
    leaderEmail: 'ananya.patel@crucible.dev',
    problemId: 'PS001',
    problemTitle: 'Smart Campus: IoT & Energy Optimization',
    submitted: true,
    submissionFile: 'Nova_SmartCampus_Pitch.pdf',
    submissionDate: '2026-08-15 16:10',
    shortlisted: true,
    members: [
      { name: 'Ananya Patel', role: 'Team Leader', avatar: 'AP' },
      { name: 'Rohan Mehta', role: 'Embedded Systems Engineer', avatar: 'RM' },
      { name: 'Kavya Singh', role: 'Backend Engineer', avatar: 'KS' },
    ],
  },
  {
    id: 'TITAN031',
    teamName: 'Team Titans',
    leaderName: 'Vikram Shah',
    leaderEmail: 'vikram.shah@crucible.dev',
    problemId: 'PS005',
    problemTitle: 'Smart Traffic Management & Emergency Response',
    submitted: false,
    submissionFile: null,
    submissionDate: null,
    shortlisted: false,
    members: [
      { name: 'Vikram Shah', role: 'Team Leader', avatar: 'VS' },
      { name: 'Devika Nair', role: 'Computer Vision Dev', avatar: 'DN' },
      { name: 'Arjun Reddy', role: 'Systems Architect', avatar: 'AR' },
      { name: 'Tara Joshi', role: 'Product Manager', avatar: 'TJ' },
    ],
  },
];

export const DEFAULT_SETTINGS = {
  name: 'InnovateX Hackathon 2026',
  year: 2026,
  deadline: '2026-08-30',
  hackathonStatus: 'Live', // 'Live' | 'Paused' | 'Closed'
  registrationStatus: 'Open', // 'Open' | 'Closed'
};

export const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: 'Problem Statements Released', time: '2 hours ago', unread: true, detail: 'All 10 official problem statements for InnovateX 2026 are now active.' },
  { id: 2, title: 'Final Presentation Deadline', time: '1 day ago', unread: true, detail: 'Ensure your PPT or PDF presentation is uploaded before 30 August 2026.' },
  { id: 3, title: 'Shortlist Announcement Date', time: '3 days ago', unread: false, detail: 'Shortlisted teams will be published immediately following jury evaluation.' },
];

// ── Storage Getters & Setters ─────────────────────────────────────────────────

function getItem(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('crucible_storage_update'));
  } catch (e) {
    console.error('Failed saving to localStorage', e);
  }
}

// ── Exported API Methods ──────────────────────────────────────────────────────

export function getHackathonSettings() {
  return getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveHackathonSettings(settings) {
  setItem(STORAGE_KEYS.SETTINGS, settings);
  return settings;
}

export function getProblemStatements() {
  return getItem(STORAGE_KEYS.PROBLEMS, DEFAULT_PROBLEMS);
}

export function saveProblemStatements(problems) {
  setItem(STORAGE_KEYS.PROBLEMS, problems);
  return problems;
}

export function addProblemStatement(problem) {
  const current = getProblemStatements();
  const nextId = `PS${String(current.length + 1).padStart(3, '0')}`;
  const newProblem = {
    id: problem.id || nextId,
    title: problem.title || 'New Challenge',
    domain: problem.domain || 'General',
    tags: Array.isArray(problem.tags) ? problem.tags : (problem.tags || 'Tech').split(',').map((t) => t.trim()),
    description: problem.description || 'Description pending.',
    difficulty: problem.difficulty || 'Intermediate',
  };
  const updated = [newProblem, ...current];
  saveProblemStatements(updated);
  return newProblem;
}

export function updateProblemStatement(updatedProb) {
  const current = getProblemStatements();
  const updated = current.map((p) => (p.id === updatedProb.id ? { ...p, ...updatedProb } : p));
  saveProblemStatements(updated);
  return updatedProb;
}

export function deleteProblemStatement(id) {
  const current = getProblemStatements();
  const updated = current.filter((p) => p.id !== id);
  saveProblemStatements(updated);
  return id;
}

export function getTeamsData() {
  return getItem(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS);
}

export function saveTeamsData(teams) {
  setItem(STORAGE_KEYS.TEAMS, teams);
  return teams;
}

export function toggleTeamShortlist(teamId) {
  const teams = getTeamsData();
  const updated = teams.map((t) => (t.id === teamId ? { ...t, shortlisted: !t.shortlisted } : t));
  saveTeamsData(updated);
  return updated;
}

export function getWinnerAssignments() {
  return getItem(STORAGE_KEYS.WINNERS, { first: 'PHX024', second: 'NOVA018', third: null });
}

export function assignWinner(position, teamId) {
  const winners = getWinnerAssignments();
  // Clear team from any other position if already placed
  Object.keys(winners).forEach((key) => {
    if (winners[key] === teamId) winners[key] = null;
  });

  // Toggle if clicked on same position
  winners[position] = winners[position] === teamId ? null : teamId;
  setItem(STORAGE_KEYS.WINNERS, winners);
  return winners;
}

export function getSelectedProblem(teamId) {
  const key = `${STORAGE_KEYS.USER_SELECTION}_${teamId || 'default'}`;
  return getItem(key, null);
}

export function setSelectedProblem(teamId, problem) {
  const key = `${STORAGE_KEYS.USER_SELECTION}_${teamId || 'default'}`;
  setItem(key, problem);

  // Sync back to team data
  if (teamId) {
    const teams = getTeamsData();
    const updated = teams.map((t) =>
      t.id === teamId ? { ...t, problemId: problem.id, problemTitle: problem.title } : t,
    );
    saveTeamsData(updated);
  }
}

export function getUserSubmission(teamId) {
  const key = `${STORAGE_KEYS.USER_SUBMISSION}_${teamId || 'default'}`;
  return getItem(key, null);
}

export function saveUserSubmission(teamId, fileInfo) {
  const key = `${STORAGE_KEYS.USER_SUBMISSION}_${teamId || 'default'}`;
  const submission = {
    fileName: fileInfo.name,
    fileSize: (fileInfo.size / (1024 * 1024)).toFixed(2) + ' MB',
    date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: 'Submitted',
  };
  setItem(key, submission);

  // Sync to teams array
  if (teamId) {
    const teams = getTeamsData();
    const updated = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            submitted: true,
            submissionFile: submission.fileName,
            submissionDate: submission.date,
          }
        : t,
    );
    saveTeamsData(updated);
  }
  return submission;
}

export function getNotifications() {
  return getItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
}

export function markNotificationsRead() {
  const notifs = getNotifications().map((n) => ({ ...n, unread: false }));
  setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  return notifs;
}
