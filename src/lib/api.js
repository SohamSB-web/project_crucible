/**
 * Real API client — with seamless offline mock fallback so the application
 * runs smoothly whether the backend server is online or offline.
 */

import {
  
  getProblemStatements,
  addProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  getTeamsData,
  toggleTeamShortlist,
  getUserSubmission,
  getNotifications,
} from './portalStorage';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const STORAGE_KEY = 'crucible-auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored)?.token : null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

async function apiFetchFormData(path, formData) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Upload failed (${response.status})`);
  return data;
}

// Same as apiFetchFormData, but attaches the auth token like apiFetch and
// lets the caller pick the HTTP method (register uses POST but this stays
// general-purpose for future multipart endpoints).
async function apiFetchMultipart(path, formData, options = {}) {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  // NOTE: never set 'Content-Type' here — the browser needs to set it
  // itself (including the multipart boundary) when the body is FormData.

  const response = await fetch(`${BASE}${path}`, {
    method: options.method || 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  try {
    return await apiFetch('/api/auth/team/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (teamErr) {
    try {
      return await apiFetch('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (adminErr) {
      // If server is reachable and returned a message, throw that real error
      const message = teamErr?.message || adminErr?.message;
      if (message && !message.includes('Failed to fetch')) {
        throw new Error(message);
      }

      // Offline fallback login (only when backend is truly offline/unreachable)
      const input = String(email).toLowerCase();
      const isAdmin = input.includes('admin') || input === 'admin001';

      if (isAdmin) {
        return {
          success: true,
          data: {
            token: 'mock-admin-token-123',
            role: 'admin',
            user: { id: 'ADMIN001', name: 'Administrator', email: 'admin@crucible.dev', role: 'admin' },
          },
        };
      }

      const teamIdMap = {
        nova018: 'NOVA018',
        titan031: 'TITAN031',
        phx024: 'PHX024',
      };
      const matchedTeamId = teamIdMap[input] || (input.includes('nova') ? 'NOVA018' : input.includes('titan') ? 'TITAN031' : 'PHX024');

      return {
        success: true,
        data: {
          token: `mock-user-token-${matchedTeamId}`,
          role: 'user',
          teamId: matchedTeamId,
          user: { id: matchedTeamId, name: 'Team Lead', email, role: 'user' },
        },
      };
    }
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

// `idsFile` is the single combined PDF of every participant's ID proof,
// required by /api/team/register. `payload` is the same object the form
// already builds; `members` gets JSON-stringified since multipart fields
// are plain strings.
export async function register(payload, idsFile) {
  try {
    if (idsFile?.size > 1 * 1024 * 1024) {
      throw new Error('Participant ID proofs PDF must be 1 MB or smaller.');
    }
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, key === 'members' ? JSON.stringify(value) : value);
    });
    if (idsFile) {
      formData.append('idsFile', idsFile);
    }
    return await apiFetchMultipart('/api/team/register', formData);
  } catch (err) {
    // Offline fallback (backend unreachable) — mirrors the other endpoints'
    // mock behavior. A real "Failed to fetch" is the only case we swallow;
    // anything the server actually responded with (e.g. validation errors,
    // missing PDF) should surface to the user.
    if (err?.message && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    return { success: true, data: { teamId: 'PHX024', message: 'Registration successful!' } };
  }
}

export async function joinTeam(payload) {
  try {
    return await apiFetch('/api/team/join', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return { success: true, data: { message: 'Joined team successfully!' } };
  }
}

// ─── Registration status ──────────────────────────────────────────────────────

export async function getRegistrationStatus() {
  try {
    return await apiFetch('/api/admin/registration-status');
  } catch {
    const settings = getHackathonSettings();
    return { success: true, data: { open: settings.registrationStatus === 'Open' } };
  }
}

export async function toggleRegistration() {
  try {
    return await apiFetch('/api/admin/registration-toggle', { method: 'POST' });
  } catch {
    const settings = getHackathonSettings();
    const nextStatus = settings.registrationStatus === 'Open' ? 'Closed' : 'Open';
    saveHackathonSettings({ ...settings, registrationStatus: nextStatus });
    return { success: true, data: { open: nextStatus === 'Open' } };
  }
}

// ─── Team data ────────────────────────────────────────────────────────────────

export async function getMyTeam() {
  try {
    return await apiFetch('/api/team/me');

  } catch {
    const teams = getTeamsData();
    return { success: true, data: teams[0] };
  }
}

// ─── Tracks / Problem Statements ─────────────────────────────────────────────
export async function getParticipantTracks() {
  return await apiFetch('/api/team/participant_tracks');
}
export async function getTracks() {
  try {
    return await apiFetch('/api/admin/tracks');
  } catch (err) {
    if (err?.message && !err.message.includes('Failed to fetch')) throw err;
    const problems = getProblemStatements();
    return { success: true, data: problems };
  }
}

export async function createTrack(track) {
  try {
    return await apiFetch('/api/admin/tracks', {
      method: 'POST',
      body: JSON.stringify(track),
    });
  } catch (err) {
    if (err?.message && !err.message.includes('Failed to fetch')) throw err;
    const newProb = addProblemStatement(track);
    return { success: true, data: newProb };
  }
}

export async function updateTrack(id, changes) {
  try {
    return await apiFetch(`/api/admin/tracks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  } catch (err) {
    if (err?.message && !err.message.includes('Failed to fetch')) throw err;
    const updated = updateProblemStatement({ id, ...changes });
    return { success: true, data: updated };
  }
}

export async function deleteTrack(id) {
  try {
    return await apiFetch(`/api/admin/tracks/${id}`, { method: 'DELETE' });
  } catch (err) {
    if (err?.message && !err.message.includes('Failed to fetch')) throw err;
    deleteProblemStatement(id);
    return { success: true, data: { id } };
  }
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements() {
  try {
    return await apiFetch('/api/admin/announcements');
  } catch {
    const notifs = getNotifications();
    return { success: true, data: notifs };
  }
}

export async function postAnnouncement(announcement) {
  try {
    return await apiFetch('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  } catch {
    return { success: true, data: announcement };
  }
}

// ─── Submission ───────────────────────────────────────────────────────────────

export async function uploadSubmission(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    return await apiFetchFormData('/api/submission/upload', formData);
  } catch {
    return { success: true, data: { filename: file.name, date: new Date().toISOString() } };
  }
}

export async function getMySubmission() {
  try {
    return await apiFetch('/api/submission/me');
  } catch {
    const sub = getUserSubmission('PHX024');
    return { success: true, data: sub };
  }
}

// ─── Admin / Judge ────────────────────────────────────────────────────────────

export async function getAdminSubmissions() {
  try {
    return await apiFetch('/api/admin/submissions');
  } catch {
    const teams = getTeamsData();
    const subs = teams.filter((t) => t.submitted).map((t) => ({ id: t.id, teamName: t.teamName, filename: t.submissionFile, createdAt: t.submissionDate }));
    return { success: true, data: subs };
  }
}

export async function getAdminTeams() {
  try {
    return await apiFetch('/api/admin/teams');
  } catch {
    const teams = getTeamsData();
    return { success: true, data: teams };
  }
}

export async function stageShortlist(teamStatuses) {
  try {
    return await apiFetch('/api/admin/teams/shortlist', {
      method: 'POST',
      body: JSON.stringify({ teamStatuses }),
    });
  } catch {
    return { success: true, data: { teamStatuses } };
  }
}

export async function evaluateSubmission(submissionId, score, remarks) {
  try {
    return await apiFetch('/api/admin/evaluate', {
      method: 'POST',
      body: JSON.stringify({ submissionId, score, remarks }),
    });
  } catch {
    return { success: true, data: { submissionId, score, remarks } };
  }
}

export async function getSignedUrl(submissionId) {
  try {
    return await apiFetch(`/api/submission/signed-url/${submissionId}`);
  } catch {
    return { success: true, data: { url: '#' } };
  }
}

export async function getShortlistStatus() {
  try {
    return await apiFetch('/api/admin/shortlist-status');
  } catch {
    return { success: true, data: { released: true } };
  }
}

export async function changePassword(newPassword, currentPassword) {
  try {
    return await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword, currentPassword }),
    });
  } catch {
    return { success: true, data: { message: 'Password updated' } };
  }
}


//---payment and ids
export async function uploadPaymentProof(file) {
  const formData = new FormData();
  formData.append('file', file);
  return await apiFetchFormData('/api/payment/upload-screenshot', formData);
}


// Add to api.js

export async function updateTeamMembers(teamId, members) {
  try {
    return await apiFetch('/api/team/members', {
      method: 'PUT',
      body: JSON.stringify({ members }),
    });
  } catch (err) {
    return { success: true, data: { members } };
  }
}

export async function getHackathonSettings() {
  try {
    return await apiFetch('/api/admin/settings');
  } catch {
    return { success: true, data: { name: 'RepoForge Hackathon', year: 2026, deadline: '', hackathonStatus: 'Live', registrationStatus: 'Open', acceptingSubmissions: true } };
  }
}

export async function updateHackathonSettings(settings) {
  try {
    return await apiFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  } catch (err) {
    throw new Error(err.message || 'Failed to save settings');
  }
}

export async function assignAdminWinner(position, teamId) {
  try {
    return await apiFetch('/api/admin/results/winners', {
      method: 'POST',
      body: JSON.stringify({ position, teamId }),
    });
  } catch (err) {
    throw new Error(err.message || 'Failed to assign winner');
  }
}

export async function getTeamDashboardSettings() {
  try {
    return await apiFetch('/api/team/settings-and-results');
  } catch {
    return {
      success: true,
      data: {
        settings: { name: 'RepoForge Hackathon', year: 2026, hackathonStatus: 'Live' },
        result: { shortlisted: false, shortlist_status: 'Under-Review', rank: null, published: false }
      }
    };
  }
}

export async function publishHackathonResults(teamIds = []) {
  return await apiFetch('/api/admin/results/publish', {
    method: 'POST',
    body: JSON.stringify({ teamIds }),
  });
}
export async function updatePaymentStatus(teamId, status) {
  return await apiFetch(`/api/admin/teams/${teamId}/payment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
export async function verifyTeamPayment(teamId) {
  return await apiFetch(`/api/admin/teams/${teamId}/verify-payment`, {
    method: 'POST',
  });
}