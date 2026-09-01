/**
 * Real API client — replaces mockApi.js
 * All functions maintain the same signature as mockApi.js so screens need minimal changes.
 *
 * Auth token is read from localStorage under the same key the AuthContext uses.
 */

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

async function apiFetch(path, options = {}) {
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

// Multipart fetch (for file upload — no Content-Type header, browser sets it)
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

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Login for team leads (email + password).
 * Admin/judge login uses the same function — backend routes differ.
 */
export async function login(email, password) {
  // Try team login first, then admin
  try {
    return await apiFetch('/api/auth/team/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // Fall through to admin login
    return apiFetch('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

export async function register(payload) {
  return apiFetch('/api/team/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function joinTeam(payload) {
  return apiFetch('/api/team/join', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Registration status ──────────────────────────────────────────────────────

export async function getRegistrationStatus() {
  return apiFetch('/api/admin/registration-status');
}

export async function toggleRegistration() {
  return apiFetch('/api/admin/registration-toggle', { method: 'POST' });
}

// ─── Team data ────────────────────────────────────────────────────────────────

export async function getMyTeam() {
  return apiFetch('/api/team/me');
}

// ─── Tracks ───────────────────────────────────────────────────────────────────

export async function getTracks() {
  return apiFetch('/api/admin/tracks');
}

export async function createTrack(track) {
  return apiFetch('/api/admin/tracks', {
    method: 'POST',
    body: JSON.stringify(track),
  });
}

export async function updateTrack(id, changes) {
  return apiFetch(`/api/admin/tracks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export async function deleteTrack(id) {
  return apiFetch(`/api/admin/tracks/${id}`, { method: 'DELETE' });
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements() {
  return apiFetch('/api/admin/announcements');
}

export async function postAnnouncement(announcement) {
  return apiFetch('/api/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(announcement),
  });
}

// ─── Submission ───────────────────────────────────────────────────────────────

export async function uploadSubmission(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetchFormData('/api/submission/upload', formData);
}

export async function getMySubmission() {
  return apiFetch('/api/submission/me');
}

// ─── Admin / Judge ────────────────────────────────────────────────────────────

export async function getAdminSubmissions() {
  return apiFetch('/api/admin/submissions');
}

export async function getAdminTeams() {
  return apiFetch('/api/admin/teams');
}

export async function evaluateSubmission(submissionId, score, remarks) {
  return apiFetch('/api/admin/evaluate', {
    method: 'POST',
    body: JSON.stringify({ submissionId, score, remarks }),
  });
}

export async function getSignedUrl(submissionId) {
  return apiFetch(`/api/submission/signed-url/${submissionId}`);
}

export async function getResults() {
  return apiFetch('/api/admin/results');
}

export async function stageShortlist(teamIds) {
  return apiFetch('/api/admin/teams/shortlist', {
    method: 'POST',
    body: JSON.stringify({ teamIds }),
  });
}

export async function releaseShortlist() {
  // releaseShortlist in old mock set a flag; now publishing handles this
  // Keep signature for backward compatibility with AdminDashboard.jsx
  return { success: true, data: { released: true } };
}

export async function getShortlistStatus() {
  // For team users: check their own team's result status
  try {
    const res = await apiFetch('/api/team/me');
    const released = res.data?.result?.published ?? false;
    const shortlisted = res.data?.result?.shortlisted ?? false;
    return { success: true, data: { released: released || shortlisted } };
  } catch {
    return { success: true, data: { released: false } };
  }
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function changePassword(newPassword, currentPassword) {
  return apiFetch('/api/team/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
