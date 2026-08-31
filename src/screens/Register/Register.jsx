import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { getRegistrationStatus, getTracks, register as registerTeam } from '../../lib/mockApi';
import { registerSchema } from '../../lib/validators';
import Navbar from '../../components/ui/Navbar';
import MagneticButton from '../../components/ui/MagneticButton';
import styles from './Register.module.css';

const steps = ['Team', 'Lead', 'Team Members', 'Review'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState({ open: true });
  const [submitted, setSubmitted] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      teamName: '',
      trackId: '',
      teamSize: 2,
      leadName: '',
      leadEmail: '',
      leadPhone: '',
      college: '',
      year: '1st Year',
      members: [
        { name: '', email: '', phone: '', role: 'Developer' },
        { name: '', email: '', phone: '', role: 'Designer' },
      ],
    },
  });

  useEffect(() => {
    async function init() {
      const [tracksRes, statusRes] = await Promise.all([getTracks(), fetchRegistrationStatus()]);
      setTracks(tracksRes.data || []);
      setStatus(statusRes.data || { open: true });
    }
    init();
  }, []);

  const goNext = async () => {
    let valid = false;
    if (step === 0) {
      valid = await form.trigger(['teamName', 'trackId', 'teamSize']);
    } else if (step === 1) {
      valid = await form.trigger(['leadName', 'leadEmail', 'leadPhone', 'college', 'year']);
    } else if (step === 2) {
      valid = await form.trigger('members');
    }

    if (valid) setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const goBack = () => setStep((value) => Math.max(value - 1, 0));

  const addMember = () => {
    const members = form.getValues('members') || [];
    if (members.length >= 4) return;
    form.setValue('members', [...members, { name: '', email: '', phone: '', role: '' }]);
  };

  const removeMember = (index) => {
    const members = form.getValues('members');
    if (members.length <= 1) return;
    form.setValue('members', members.filter((_, i) => i !== index));
  };

  const onSubmit = form.handleSubmit(async (payload) => {
    const chosenTrack = tracks.find((track) => track.id === payload.trackId);
    const response = await registerTeam({ ...payload, trackName: chosenTrack?.title || 'General' });
    setSuccessData(response.data);
    setSubmitted(true);
  });

  if (submitted && successData) {
    return (
      <div className={`${styles.page} auth-page`}>
        <Navbar />
        <main className="container auth-shell">
          <motion.div className={styles.successCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="eyebrow">REGISTRATION SUCCESS</p>
            <h1>Team submitted.</h1>
            <p>{successData.message}</p>
            <div className={styles.metaBox}>Team ID: {successData.teamId}</div>
            <div className={styles.authActions}>
              <MagneticButton className="primary" onClick={() => navigate('/login')}>Go to Login</MagneticButton>
              <Link to="/" className="secondary-button">Back home</Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!status.open) {
    return (
      <div className={`${styles.page} auth-page`}>
        <Navbar />
        <main className="container auth-shell">
          <div className={styles.closedCard}>
            <p className="eyebrow">REGISTRATIONS</p>
            <h1>Registrations are currently closed.</h1>
            <p>Check back soon for new intake windows or follow us on social channels for the next round.</p>
            <Link to="/" className="secondary-button">Return to the homepage</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.page} auth-page`}>
      <Navbar />
      <main className="container auth-shell">
        <motion.div className={styles.formCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.progressHeader}>
            <p className="eyebrow">JOIN CRUCIBLE</p>
            <div className={styles.progressBar}>
              {steps.map((label, index) => (
                <div key={label} className={`${styles.progressDot} ${index <= step ? styles.active : ''}`}>
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className={styles.form}>
            {step === 0 && (
              <div className={styles.stepPanel}>
                <h2>Team basics</h2>
                <label>
                  Team name
                  <input {...form.register('teamName')} />
                  {form.formState.errors.teamName && <small>{form.formState.errors.teamName.message}</small>}
                </label>

                <label>
                  Track
                  <select {...form.register('trackId')}>
                    <option value="">Select a track</option>
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>{track.title}</option>
                    ))}
                  </select>
                  {form.formState.errors.trackId && <small>{form.formState.errors.trackId.message}</small>}
                </label>

                <label>
                  Team size
                  <input type="number" min="2" max="5" {...form.register('teamSize')} />
                  {form.formState.errors.teamSize && <small>{form.formState.errors.teamSize.message}</small>}
                </label>
              </div>
            )}

            {step === 1 && (
              <div className={styles.stepPanel}>
                <h2>Lead details</h2>
                <label>
                  Full name
                  <input {...form.register('leadName')} />
                  {form.formState.errors.leadName && <small>{form.formState.errors.leadName.message}</small>}
                </label>
                <label>
                  Email address
                  <input {...form.register('leadEmail')} />
                  {form.formState.errors.leadEmail && <small>{form.formState.errors.leadEmail.message}</small>}
                </label>
                <label>
                  Phone
                  <input {...form.register('leadPhone')} />
                  {form.formState.errors.leadPhone && <small>{form.formState.errors.leadPhone.message}</small>}
                </label>
                <div className={styles.splitFields}>
                  <label>
                    College
                    <input {...form.register('college')} />
                    {form.formState.errors.college && <small>{form.formState.errors.college.message}</small>}
                  </label>
                  <label>
                    Year
                    <select {...form.register('year')}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepPanel}>
                <div className={styles.stepHeaderRow}>
                  <h2>Team members</h2>
                  <button type="button" className="secondary-button small" onClick={addMember}>Add member</button>
                </div>

                {(form.watch('members') || []).map((member, index) => (
                  <div key={index} className={styles.memberRow}>
                    <div className={styles.splitFields}>
                      <label>
                        Name
                        <input {...form.register(`members.${index}.name`)} />
                      </label>
                      <label>
                        Role
                        <input {...form.register(`members.${index}.role`)} />
                      </label>
                    </div>
                    <div className={styles.splitFields}>
                      <label>
                        Email
                        <input {...form.register(`members.${index}.email`)} />
                      </label>
                      <label>
                        Phone
                        <input {...form.register(`members.${index}.phone`)} />
                      </label>
                    </div>
                    {index > 0 && (
                      <button type="button" className={styles.removeBtn} onClick={() => removeMember(index)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepPanel}>
                <h2>Review</h2>
                <div className={styles.reviewGrid}>
                  <div><span>Team</span><strong>{form.watch('teamName')}</strong></div>
                  <div><span>Track</span><strong>{tracks.find((track) => track.id === form.watch('trackId'))?.title}</strong></div>
                  <div><span>Lead</span><strong>{form.watch('leadName')}</strong></div>
                  <div><span>College</span><strong>{form.watch('college')}</strong></div>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              {step > 0 && (
                <button type="button" className="secondary-button" onClick={goBack}>Back</button>
              )}

              {step < steps.length - 1 ? (
                <button type="button" className="primary-button" onClick={goNext}>Next</button>
              ) : (
                <MagneticButton className="primary" type="submit">Submit Registration</MagneticButton>
              )}
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
