import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements, getShortlistStatus, getMySubmission, changePassword, uploadSubmission } from '../../lib/mockApi';
import { mockTeams } from '../../data/mockTeams';
import styles from './UserDashboard.module.css';

const allowedExtensions = ['.pdf', '.ppt', '.pptx'];

export default function UserDashboard() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [shortlist, setShortlist] = useState({ released: false });
  const [submission, setSubmission] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState({ progress: 0, status: 'idle' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '' });
  const team = mockTeams.find((entry) => entry.id === auth?.user?.teamId) || mockTeams[0];

  useEffect(() => {
    if (!auth || auth.role !== 'user') {
      navigate('/login');
      return;
    }

    async function load() {
      const [annRes, shortlistRes, submissionRes] = await Promise.all([
        getAnnouncements(),
        getShortlistStatus(),
        getMySubmission(),
      ]);
      setAnnouncements(annRes.data || []);
      setShortlist(shortlistRes.data || { released: false });
      setSubmission(submissionRes.data || null);
    }

    load();
  }, [auth, navigate]);

  const unread = useMemo(() => announcements.filter((item) => item.unread).length, [announcements]);

  const onFileDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const maxSize = 10 * 1024 * 1024;

    if (!allowedExtensions.includes(extension)) {
      setUploadState({ progress: 0, status: 'error' });
      return;
    }

    if (file.size > maxSize) {
      setUploadState({ progress: 0, status: 'error' });
      return;
    }

    setUploadState({ progress: 10, status: 'uploading' });
    let progress = 10;
    const timer = setInterval(() => {
      progress += 18;
      setUploadState({ progress, status: progress >= 100 ? 'success' : 'uploading' });
      if (progress >= 100) {
        clearInterval(timer);
      }
    }, 200);

    const res = await uploadSubmission(file);
    setSubmission({ ...res.data, filename: file.name });
    setUploadState({ progress: 100, status: 'success' });
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    await changePassword(passwordForm.next);
    setPasswordForm({ current: '', next: '' });
  };

  return (
    <div className={`${styles.page} dashboard-page`}>
      <Navbar />
      <main className="container dashboard-shell">
        <div className={styles.headerRow}>
          <div>
            <p className="eyebrow">PARTICIPANT DASHBOARD</p>
            <h1>Welcome back, {auth?.user?.name}</h1>
          </div>
          <div className={styles.unreadBadge}>{unread} unread</div>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <h2>Announcements</h2>
            {announcements.map((item) => (
              <div key={item.id} className={styles.announcementItem}>
                <div className={styles.dot} data-unread={item.unread}></div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </section>

          <section className={styles.panel}>
            <h2>Deadline countdown</h2>
            <div className={styles.countdownBox}>18 Sep 2026 18:00</div>
            <p className={styles.muted}>Round 1 synopsis deadline</p>
          </section>

          <section className={styles.panel}>
            <h2>Shortlist status</h2>
            <div className={`${styles.statusPill} ${shortlist.released ? styles.success : ''}`}>
              {shortlist.released ? 'Shortlisted' : 'Pending review'}
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Team panel</h2>
            <div className={styles.teamList}>
              <div><span>Team</span><strong>{team.name}</strong></div>
              <div><span>Track</span><strong>{team.trackName}</strong></div>
              {team.members.map((member) => (
                <div key={member.email} className={styles.memberRow}><strong>{member.name}</strong><span>{member.role}</span></div>
              ))}
            </div>
          </section>

          <section className={styles.panelWide}>
            <h2>Submission upload</h2>
            <div
              className={`${styles.uploadDrop} ${isDragging ? styles.dragging : ''}`}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onFileDrop}
            >
              <p>Drag & drop your PPT or abstract here</p>
              <input type="file" accept=".pdf,.ppt,.pptx" onChange={(event) => handleUpload(event.target.files[0])} />
              <small>10MB max • PDF, PPT, PPTX only</small>
            </div>

            {uploadState.status !== 'idle' && (
              <div className={styles.progressBar} aria-live="polite">
                <div className={styles.progressFill} style={{ width: `${uploadState.progress}%` }} />
              </div>
            )}

            {uploadState.status === 'success' && submission && (
              <div className={styles.successMessage}>Uploaded {submission.filename} at {new Date(submission.uploadedAt).toLocaleString()}</div>
            )}

            {uploadState.status === 'error' && (
              <div className={styles.error}>Unsupported file type or size exceeds 10MB. // TODO: also enforce server-side</div>
            )}
          </section>

          <section className={styles.panel}>
            <h2>Profile / security</h2>
            <form onSubmit={submitPassword} className={styles.passwordForm}>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Current password" />
              <input type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} placeholder="New password" />
              <button type="submit" className="primary-button">Update</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
