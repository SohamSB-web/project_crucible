import { mockAnnouncements } from '../data/mockAnnouncements';
import { mockTeams } from '../data/mockTeams';
import { mockTracks } from '../data/mockTracks';
import { mockUsers } from '../data/mockUsers';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const readTeams = () => readStorage('crucible-teams', mockTeams);
const writeTeams = (teams) => writeStorage('crucible-teams', teams);

const readTracks = () => readStorage('crucible-tracks', mockTracks);
const writeTracks = (tracks) => writeStorage('crucible-tracks', tracks);

const readAnnouncements = () => readStorage('crucible-announcements', mockAnnouncements);
const writeAnnouncements = (announcements) => writeStorage('crucible-announcements', announcements);

const getRegistrationFlag = () => readStorage('crucible-registration-open', true);
const setRegistrationFlag = (value) => writeStorage('crucible-registration-open', value);

const getShortlistFlag = () => readStorage('crucible-shortlist-released', false);
const setShortlistFlag = (value) => writeStorage('crucible-shortlist-released', value);

export async function login(email, password) {
  await delay(500);
  const user = mockUsers.find(
    (entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password,
  );

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  return {
    success: true,
    data: {
      token: `mock-token-${user.id}`,
      role: user.role,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  };
}

export async function register(payload) {
  await delay(800);
  const teams = readTeams();
  const teamId = `team-${Date.now()}`;
  const newTeam = {
    id: teamId,
    name: payload.teamName,
    trackId: payload.trackId,
    trackName: payload.trackName || 'Custom Track',
    status: 'registered',
    submissionStatus: 'pending',
    shortlisted: false,
    members: [
      {
        name: payload.leadName,
        email: payload.leadEmail,
        role: 'Team Lead',
      },
      ...payload.members.map((member) => ({
        name: member.name,
        email: member.email,
        role: member.role,
      })),
    ],
    contact: {
      college: payload.college,
      year: payload.year,
      phone: payload.leadPhone,
    },
  };

  teams.unshift(newTeam);
  writeTeams(teams);

  return {
    success: true,
    data: {
      teamId,
      message: 'Login credentials would be emailed to you here.',
    },
  };
}

export async function getRegistrationStatus() {
  await delay(200);
  return {
    success: true,
    data: { open: getRegistrationFlag() },
  };
}

export async function toggleRegistration(open) {
  await delay(250);
  setRegistrationFlag(open);
  return {
    success: true,
    data: { open },
  };
}

export async function getTracks() {
  await delay(250);
  return {
    success: true,
    data: readTracks(),
  };
}

export async function createTrack(track) {
  await delay(300);
  const tracks = readTracks();
  const newTrack = {
    id: `track-${Date.now()}`,
    title: track.title,
    category: track.category,
    shortDescription: track.shortDescription,
    description: track.description,
    difficulty: track.difficulty,
    reward: track.reward,
    teams: 0,
  };
  const updated = [newTrack, ...tracks];
  writeTracks(updated);
  return { success: true, data: newTrack };
}

export async function updateTrack(id, changes) {
  await delay(250);
  const tracks = readTracks();
  const updated = tracks.map((track) => (track.id === id ? { ...track, ...changes } : track));
  writeTracks(updated);
  return { success: true, data: updated.find((track) => track.id === id) };
}

export async function deleteTrack(id) {
  await delay(200);
  const tracks = readTracks().filter((track) => track.id !== id);
  writeTracks(tracks);
  return { success: true, data: { deletedId: id } };
}

export async function getAnnouncements() {
  await delay(200);
  return {
    success: true,
    data: readAnnouncements(),
  };
}

export async function postAnnouncement(announcement) {
  await delay(300);
  const items = readAnnouncements();
  const next = [
    {
      id: `ann-${Date.now()}`,
      title: announcement.title,
      detail: announcement.detail,
      createdAt: new Date().toISOString(),
      unread: true,
    },
    ...items,
  ];
  writeAnnouncements(next);
  return { success: true, data: next[0] };
}

export async function uploadSubmission(file) {
  await delay(700);
  return {
    success: true,
    data: {
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    },
  };
}

export async function getMySubmission() {
  await delay(200);
  return {
    success: true,
    data: {
      filename: 'signal-bloom-abstract.pdf',
      size: 2310000,
      uploadedAt: '2026-07-20T11:00:00.000Z',
    },
  };
}

export async function getAdminSubmissions() {
  await delay(250);
  return { success: true, data: readTeams() };
}

export async function stageShortlist(teamIds) {
  await delay(300);
  const teams = readTeams().map((team) => ({
    ...team,
    shortlisted: teamIds.includes(team.id) ? true : false,
  }));
  writeTeams(teams);
  return { success: true, data: teams.filter((team) => team.shortlisted) };
}

export async function releaseShortlist() {
  await delay(250);
  setShortlistFlag(true);
  return { success: true, data: { released: true } };
}

export async function getShortlistStatus() {
  await delay(200);
  return {
    success: true,
    data: { released: getShortlistFlag() },
  };
}

export async function changePassword(password) {
  await delay(350);
  return {
    success: true,
    data: { message: `Password updated to ${password}.` },
  };
}
