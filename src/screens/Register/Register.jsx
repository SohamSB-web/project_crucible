import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { getRegistrationStatus, getTracks, register as registerTeam } from '../../lib/mockApi';
import { registerSchema } from '../../lib/validators';
import Navbar from '../../components/ui/Navbar';
import SpecularButton from '../../components/ui/SpecularButton';
import styles from './Register.module.css';

const steps = ['Team', 'Lead', 'Members', 'Review'];

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.2 } }),
};

// Squircle SpecularButton wrapper for consistent styling
const SqBtn = ({ children, onClick, type = 'button', lineColor = '#71a7ff', baseColor = '#142034', textColor = '#ffffff', intensity = 1, fullWidth = false, danger = false }) => (
  <SpecularButton
    size="md"
    radius={16}
    lineColor={danger ? '#ff6b75' : lineColor}
    baseColor={danger ? '#2a1215' : baseColor}
    textColor={danger ? '#ff6b75' : textColor}
    intensity={intensity}
    speed={0.35}
    onClick={onClick}
    type={type}
    className={fullWidth ? styles.fullWidthBtn : ''}
  >
    {children}
  </SpecularButton>
);

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [tracks, setTracks] = useState([]);
  const [status, setStatus] = useState({ open: true });
  const [submitted, setSubmitted] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      teamName: '',
      problemStatementId: '',
      problemStatement: '',
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
      const [tracksRes, statusRes] = await Promise.all([getTracks(), getRegistrationStatus()]);
      setTracks(tracksRes.data || []);
      setStatus(statusRes.data || { open: true });
    }
    init();
  }, []);

  const goNext = async () => {
    let valid = false;
    if (step === 0) valid = await form.trigger(['teamName', 'problemStatementId', 'problemStatement', 'teamSize']);
    else if (step === 1) valid = await form.trigger(['leadName', 'leadEmail', 'leadPhone', 'college', 'year']);
    else if (step === 2) valid = await form.trigger('members');
    if (valid) { setDir(1); setStep((v) => Math.min(v + 1, steps.length - 1)); }
  };

  const goBack = () => { setDir(-1); setStep((v) => Math.max(v - 1, 0)); };

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
    if (step !== steps.length - 1) {
      goNext();
      return;
    }
    const response = await registerTeam(payload);
    setSuccessData(response.data);
    setSubmitted(true);
  });

  if (submitted && successData) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.shell}>
          <motion.div className={styles.card} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={styles.successIcon}>✦</div>
            <p className={styles.eyebrow}>REGISTRATION COMPLETE</p>
            <h1 className={styles.successTitle}>You're in.</h1>
            <p className={styles.successDesc}>{successData.message}</p>
            <div className={styles.teamIdBox}>
              <span>Team ID</span>
              <strong>{successData.teamId}</strong>
            </div>
            <div className={styles.actions}>
              <SqBtn onClick={() => navigate('/login')} lineColor="#71a7ff" baseColor="#142034" intensity={1.2}>Go to Login</SqBtn>
              <SqBtn onClick={() => navigate('/')} lineColor="#ffffff" baseColor="#0a0f1a">Back Home</SqBtn>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!status.open) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.shell}>
          <div className={styles.card}>
            <p className={styles.eyebrow}>REGISTRATIONS</p>
            <h1>Registrations are currently closed.</h1>
            <p className={styles.closedDesc}>Check back soon or follow us on social for the next intake window.</p>
            <SqBtn onClick={() => navigate('/')}>Return Home</SqBtn>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.shell}>
        {/* Back to home button */}
        <div className={styles.backRow}>
          <SqBtn onClick={() => navigate('/')} lineColor="#71a7ff" baseColor="#0d1625" textColor="#71a7ff">
            ← Back
          </SqBtn>
        </div>

        <motion.div className={styles.card} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>JOIN PROJECT CRUCIBLE</p>
            <h2 className={styles.cardTitle}>{steps[step]}</h2>
          </div>

          {/* Step indicators */}
          <div className={styles.stepper}>
            {steps.map((label, i) => (
              <div key={label} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${i < step ? styles.done : ''} ${i === step ? styles.active : ''}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={styles.stepLabel}>{label}</span>
                {i < steps.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.doneLine : ''}`} />}
              </div>
            ))}
          </div>

          {/* Form Steps */}
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.stepWrap}>
              <AnimatePresence custom={dir} mode="wait" initial={false}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={styles.stepPanel}
                >
                  {step === 0 && (
                    <>
                      <div className={styles.field}>
                        <label>Team Name</label>
                        <input {...form.register('teamName')} placeholder="The Builders" />
                        {form.formState.errors.teamName && <small>{form.formState.errors.teamName.message}</small>}
                      </div>
                      <div className={styles.field}>
                        <label>Problem Statement ID</label>
                        <input {...form.register('problemStatementId')} placeholder="e.g. PS-01" />
                        {form.formState.errors.problemStatementId && <small>{form.formState.errors.problemStatementId.message}</small>}
                      </div>
                      <div className={styles.field}>
                        <label>Problem Statement</label>
                        <textarea {...form.register('problemStatement')} placeholder="Enter your problem statement here..." rows={3} />
                        {form.formState.errors.problemStatement && <small>{form.formState.errors.problemStatement.message}</small>}
                      </div>
                      <div className={styles.field}>
                        <label>Team Size <span className={styles.hint}>(2–4 members)</span></label>
                        <input type="number" min="2" max="4" {...form.register('teamSize')} />
                        {form.formState.errors.teamSize && <small>{form.formState.errors.teamSize.message}</small>}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className={styles.field}>
                        <label>Full Name</label>
                        <input {...form.register('leadName')} placeholder="Jane Doe" />
                        {form.formState.errors.leadName && <small>{form.formState.errors.leadName.message}</small>}
                      </div>
                      <div className={styles.splitFields}>
                        <div className={styles.field}>
                          <label>Email</label>
                          <input {...form.register('leadEmail')} placeholder="jane@example.com" />
                          {form.formState.errors.leadEmail && <small>{form.formState.errors.leadEmail.message}</small>}
                        </div>
                        <div className={styles.field}>
                          <label>Phone</label>
                          <input {...form.register('leadPhone')} placeholder="+91 98765 43210" />
                          {form.formState.errors.leadPhone && <small>{form.formState.errors.leadPhone.message}</small>}
                        </div>
                      </div>
                      <div className={styles.splitFields}>
                        <div className={styles.field}>
                          <label>College</label>
                          <input {...form.register('college')} placeholder="MIT WPU" />
                          {form.formState.errors.college && <small>{form.formState.errors.college.message}</small>}
                        </div>
                        <div className={styles.field}>
                          <label>Year</label>
                          <select {...form.register('year')}>
                            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => <option key={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className={styles.membersHeader}>
                        <h3 className={styles.membersTitle}>Team Members</h3>
                        <SqBtn onClick={addMember} lineColor="#71a7ff" baseColor="#0d1625" textColor="#71a7ff">+ Add</SqBtn>
                      </div>
                      {(form.watch('members') || []).map((_, index) => (
                        <div key={index} className={styles.memberCard}>
                          <div className={styles.memberCardHeader}>
                            <span className={styles.memberNum}>Member {index + 1}</span>
                            {index > 0 && (
                              <SqBtn onClick={() => removeMember(index)} danger>Remove</SqBtn>
                            )}
                          </div>
                          <div className={styles.splitFields}>
                            <div className={styles.field}>
                              <label>Name</label>
                              <input {...form.register(`members.${index}.name`)} placeholder="Full name" />
                            </div>
                            <div className={styles.field}>
                              <label>Role</label>
                              <input {...form.register(`members.${index}.role`)} placeholder="e.g. Developer" />
                            </div>
                          </div>
                          <div className={styles.splitFields}>
                            <div className={styles.field}>
                              <label>Email</label>
                              <input {...form.register(`members.${index}.email`)} placeholder="email@example.com" />
                            </div>
                            <div className={styles.field}>
                              <label>Phone</label>
                              <input {...form.register(`members.${index}.phone`)} placeholder="+91 ..." />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h3 className={styles.reviewHeading}>Review your details</h3>
                      <div className={styles.reviewGrid}>
                        {[
                          { label: 'Team Name', value: form.watch('teamName') },
                          { label: 'PS ID', value: form.watch('problemStatementId') },
                          { label: 'Problem Statement', value: form.watch('problemStatement') },
                          { label: 'Lead', value: form.watch('leadName') },
                          { label: 'College', value: form.watch('college') },
                          { label: 'Email', value: form.watch('leadEmail') },
                          { label: 'Year', value: form.watch('year') },
                        ].map(({ label, value }) => (
                          <div key={label} className={styles.reviewCell}>
                            <span>{label}</span>
                            <strong>{value || '—'}</strong>
                          </div>
                        ))}
                      </div>
                      <div className={styles.reviewMembers}>
                        <p className={styles.reviewMembersLabel}>MEMBERS</p>
                        {(form.watch('members') || []).map((m, i) => (
                          <div key={i} className={styles.reviewMemberRow}>
                            <span>{m.name || `Member ${i + 1}`}</span>
                            <span>{m.role}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              {step > 0 ? (
                <SqBtn type="button" onClick={goBack} lineColor="#71a7ff" baseColor="#0d1625" textColor="#71a7ff">← Back</SqBtn>
              ) : <span />}

              {step < steps.length - 1 ? (
                <SqBtn type="button" onClick={goNext} lineColor="#ffffff" baseColor="#2d5bff" textColor="#ffffff" intensity={1.2}>Next →</SqBtn>
              ) : (
                <SqBtn type="submit" lineColor="#ffffff" baseColor="#2d5bff" textColor="#ffffff" intensity={1.5}>Submit Registration ✦</SqBtn>
              )}
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
