import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../context/AuthContext';
import { mockTracks } from '../../data/mockTracks';
import { mockTeams } from '../../data/mockTeams';
import { getAdminSubmissions, getRegistrationStatus, getTracks, toggleRegistration, postAnnouncement, createTrack, updateTrack, deleteTrack, releaseShortlist, stageShortlist } from '../../lib/mockApi';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState(mockTracks);
  const [teams, setTeams] = useState(mockTeams);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: '', detail: '' });
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);

  useEffect(() => {
    if (!auth || auth.role !== 'admin') {
      navigate('/login');
      return;
    }

    async function load() {
      const [tracksRes, statusRes, submissionsRes] = await Promise.all([
        getTracks(),
        getRegistrationStatus(),
        getAdminSubmissions(),
      ]);
      setTracks(tracksRes.data || mockTracks);
      setRegistrationOpen(statusRes.data?.open ?? true);
      setTeams(submissionsRes.data || mockTeams);
    }

    load();
  }, [auth, navigate]);

  const analytics = useMemo(() => ({
    registered: teams.filter((team) => team.status === 'registered').length,
    waitlisted: teams.filter((team) => team.status === 'waitlisted').length,
    shortlisted: teams.filter((team) => team.shortlisted).length,
  }), [teams]);

  const handleTrackAdd = async () => {
    const name = window.prompt('Track title');
    if (!name) return;
    const response = await createTrack({
      title: name,
      category: 'Custom',
      shortDescription: 'New track created from admin panel.',
      description: 'Admin-created challenge concept.',
      difficulty: 'Beginner-friendly',
      reward: 'Prize available',
    });
    setTracks((current) => [response.data, ...current]);
  };

  const handleTrackDelete = async (id) => {
    await deleteTrack(id);
    setTracks((current) => current.filter((track) => track.id !== id));
  };

  const handleToggleRegistration = async () => {
    const next = !registrationOpen;
    await toggleRegistration(next);
    setRegistrationOpen(next);
  };

  const handleAnnouncementPublish = async () => {
    if (!announcement.title || !announcement.detail) return;
    const res = await postAnnouncement(announcement);
    console.log('Added announcement', res.data);
    setAnnouncement({ title: '', detail: '' });
  };

  const handleShortlistToggle = (teamId) => {
    setSelectedTeamIds((current) =>
      current.includes(teamId) ? current.filter((id) => id !== teamId) : [...current, teamId],
    );
  };

  const handleReleaseShortlist = async () => {
    await stageShortlist(selectedTeamIds);
    await releaseShortlist();
    setTeams((current) => current.map((team) => ({ ...team, shortlisted: selectedTeamIds.includes(team.id) })));
  };

  const exportCsv = () => {
    const headers = ['Team', 'Track', 'Status', 'Submission', 'Shortlisted'];
    const rows = teams.map((team) => [team.name, team.trackName, team.status, team.submissionStatus, team.shortlisted ? 'Yes' : 'No']);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crucible-submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${styles.page} dashboard-page`}>
      <Navbar />
      <main className="container dashboard-shell">
        <div className={styles.headerRow}>
          <div>
            <p className="eyebrow">ADMIN DASHBOARD</p>
            <h1>Operations control</h1>
          </div>
          <button className="primary-button" onClick={handleToggleRegistration}>
            {registrationOpen ? 'Close registrations' : 'Open registrations'}
          </button>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <h2>Registration control</h2>
            <div className={`${styles.statusPill} ${registrationOpen ? styles.success : ''}`}>
              {registrationOpen ? 'OPEN' : 'CLOSED'}
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Analytics</h2>
            <div className={styles.statList}>
              <div><span>Registered</span><strong>{analytics.registered}</strong></div>
              <div><span>Waitlisted</span><strong>{analytics.waitlisted}</strong></div>
              <div><span>Shortlisted</span><strong>{analytics.shortlisted}</strong></div>
            </div>
          </section>

          <section className={styles.panelWide}>
            <h2>Problem statement manager</h2>
            <div className={styles.trackList}>
              {tracks.map((track) => (
                <div key={track.id} className={styles.trackItem}>
                  <div>
                    <strong>{track.title}</strong>
                    <span>{track.category}</span>
                  </div>
                  <div className={styles.trackActions}>
                    <button type="button" className="secondary-button small" onClick={() => updateTrack(track.id, { title: `${track.title} (updated)` })}>Edit</button>
                    <button type="button" className="secondary-button small" onClick={() => handleTrackDelete(track.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="primary-button" onClick={handleTrackAdd}>Add track</button>
          </section>

          <section className={styles.panelWide}>
            <h2>Shortlist manager</h2>
            <div className={styles.shortlistTable}>
              {teams.map((team) => (
                <label key={team.id} className={styles.shortlistRow}>
                  <input type="checkbox" checked={selectedTeamIds.includes(team.id) || team.shortlisted} onChange={() => handleShortlistToggle(team.id)} />
                  <span>{team.name}</span>
                  <small>{team.trackName}</small>
                  <strong>{team.shortlisted ? 'Shortlisted' : 'Not shortlisted'}</strong>
                </label>
              ))}
            </div>
            <button type="button" className="primary-button" onClick={handleReleaseShortlist}>Release shortlist</button>
          </section>

          <section className={styles.panelWide}>
            <h2>Submissions table</h2>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Track</th>
                    <th>Status</th>
                    <th>Submission</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td>{team.name}</td>
                      <td>{team.trackName}</td>
                      <td>{team.status}</td>
                      <td>{team.submissionStatus}</td>
                      <td><button type="button" className="secondary-button small" disabled>Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="secondary-button" onClick={exportCsv}>Export CSV</button>
          </section>

          <section className={styles.panelWide}>
            <h2>Announcement composer</h2>
            <div className={styles.announcementComposer}>
              <input value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} placeholder="Announcement title" />
              <textarea value={announcement.detail} onChange={(e) => setAnnouncement({ ...announcement, detail: e.target.value })} placeholder="Announcement details" rows="4" />
              <button type="button" className="primary-button" onClick={handleAnnouncementPublish}>Publish</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
