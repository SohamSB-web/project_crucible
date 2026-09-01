import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAdminTeams, getTracks, getRegistrationStatus, toggleRegistration, postAnnouncement, createTrack, updateTrack, deleteTrack, stageShortlist, getAdminSubmissions, evaluateSubmission, getSignedUrl } from '../../lib/api';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: '', detail: '' });
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [evalState, setEvalState] = useState({}); // { [submissionId]: { score, remarks } }

  useEffect(() => {
    if (!auth || !['admin', 'judge'].includes(auth.role)) {
      navigate('/login');
      return;
    }

    async function load() {
      const [tracksRes, statusRes, teamsRes, submissionsRes] = await Promise.all([
        getTracks(),
        getRegistrationStatus(),
        getAdminTeams(),
        getAdminSubmissions(),
      ]);
      setTracks(tracksRes.data || []);
      setRegistrationOpen(statusRes.data?.open ?? true);
      setTeams(teamsRes.data || []);
      setSubmissions(submissionsRes.data || []);
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
    const res = await toggleRegistration();
    setRegistrationOpen(res.data?.open ?? !registrationOpen);
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
    setTeams((current) => current.map((team) => ({ ...team, shortlisted: selectedTeamIds.includes(team.id) })));
  };

  const handleDownload = async (submissionId, filename) => {
    try {
      const res = await getSignedUrl(submissionId);
      const a = document.createElement('a');
      a.href = res.data.url;
      a.download = filename || 'submission';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } catch (err) {
      alert('Could not generate download link: ' + err.message);
    }
  };

  const handleEvalChange = (submissionId, field, value) => {
    setEvalState((prev) => ({
      ...prev,
      [submissionId]: { ...(prev[submissionId] || { score: 0, remarks: '' }), [field]: value },
    }));
  };

  const handleEvalSubmit = async (submissionId) => {
    const ev = evalState[submissionId] || {};
    try {
      await evaluateSubmission(submissionId, Number(ev.score || 0), ev.remarks || '');
      alert('Score saved!');
    } catch (err) {
      alert('Failed to save score: ' + err.message);
    }
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

  const isAdmin = auth?.role === 'admin';
  const isJudge = auth?.role === 'judge';

  return (
    <div className={`${styles.page} dashboard-page`}>
      <Navbar />
      <main className="container dashboard-shell">
        <div className={styles.headerRow}>
          <div>
            <p className="eyebrow">{isJudge ? 'JUDGE EVALUATION DASHBOARD' : 'ADMIN DASHBOARD'}</p>
            <h1>{isJudge ? 'Evaluation & scoring' : 'Operations control'}</h1>
          </div>
          {isAdmin && (
            <button className="primary-button" onClick={handleToggleRegistration}>
              {registrationOpen ? 'Close registrations' : 'Open registrations'}
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {isAdmin && (
            <section className={styles.panel}>
              <h2>Registration control</h2>
              <div className={`${styles.statusPill} ${registrationOpen ? styles.success : ''}`}>
                {registrationOpen ? 'OPEN' : 'CLOSED'}
              </div>
            </section>
          )}

          <section className={styles.panel}>
            <h2>Analytics</h2>
            <div className={styles.statList}>
              <div><span>Registered</span><strong>{analytics.registered}</strong></div>
              <div><span>Waitlisted</span><strong>{analytics.waitlisted}</strong></div>
              <div><span>Shortlisted</span><strong>{analytics.shortlisted}</strong></div>
            </div>
          </section>

          {isAdmin && (
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
          )}

          {isAdmin && (
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
          )}

          <section className={styles.panelWide}>
            <h2>Submissions table</h2>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Track</th>
                    <th>Status</th>
                    <th>File</th>
                    <th>Avg Score</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>{sub.teamName}</td>
                      <td>{sub.trackName}</td>
                      <td>{sub.locked ? 'Locked' : 'Open'}</td>
                      <td>{sub.filename}</td>
                      <td>{sub.averageScore ?? '—'}</td>
                      <td><button type="button" className="secondary-button small" onClick={() => handleDownload(sub.id, sub.filename)}>Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="secondary-button" onClick={exportCsv}>Export CSV</button>
          </section>

          <section className={styles.panelWide}>
            <h2>Judge evaluations</h2>
            <p style={{ fontSize: '13px', color: '#71a7ff', marginBottom: '16px' }}>Score each submission (0–100) and add remarks. Scores are saved per judge.</p>
            {submissions.filter((s) => s.filename).map((sub) => (
              <div key={sub.id} style={{ background: 'rgba(45,91,255,0.05)', border: '1px solid rgba(45,91,255,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#e8eeff' }}>{sub.teamName}</strong>
                    <span style={{ color: '#71a7ff', fontSize: '12px', marginLeft: '12px' }}>{sub.trackName}</span>
                  </div>
                  <span style={{ color: '#506080', fontSize: '12px' }}>Current avg: {sub.averageScore ?? 'No scores yet'}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#71a7ff', display: 'block', marginBottom: '4px' }}>SCORE (0–100)</label>
                    <input
                      type="number" min="0" max="100"
                      value={evalState[sub.id]?.score ?? ''}
                      onChange={(e) => handleEvalChange(sub.id, 'score', e.target.value)}
                      style={{ width: '80px', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eeff' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#71a7ff', display: 'block', marginBottom: '4px' }}>REMARKS</label>
                    <input
                      type="text"
                      placeholder="Feedback for this team..."
                      value={evalState[sub.id]?.remarks ?? ''}
                      onChange={(e) => handleEvalChange(sub.id, 'remarks', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eeff' }}
                    />
                  </div>
                  <button type="button" className="primary-button" onClick={() => handleEvalSubmit(sub.id)} style={{ whiteSpace: 'nowrap' }}>Save Score</button>
                </div>
              </div>
            ))}
          </section>

          {isAdmin && (
            <section className={styles.panelWide}>
              <h2>Announcement composer</h2>
              <div className={styles.announcementComposer}>
                <input value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} placeholder="Announcement title" />
                <textarea value={announcement.detail} onChange={(e) => setAnnouncement({ ...announcement, detail: e.target.value })} placeholder="Announcement details" rows="4" />
                <button type="button" className="primary-button" onClick={handleAnnouncementPublish}>Publish</button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
