import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../../components/ui/Footer';
import Navbar from '../../components/ui/Navbar';
import GradientText from '../../components/ui/GradientText';
import CountdownTimer from '../../components/ui/CountdownTimer';
import MagneticButton from '../../components/ui/MagneticButton';
import SpecularButton from '../../components/ui/SpecularButton';
import GlareHover from '../../components/ui/GlareHover';
import TrackModal from '../../components/ui/TrackModal';
import { mockTracks } from '../../data/mockTracks';
import { mockAnnouncements } from '../../data/mockAnnouncements';
import { useParallax } from '../../hooks/useParallax';
import styles from './Landing.module.css';

const MotionGlareHover = motion.create ? motion.create(GlareHover) : motion(GlareHover);

const faqItems = [
  { q: 'Who can participate?', a: 'Any student or early career builder with a passion for shipping impactful ideas.' },
  { q: 'Do we need a fully working product?', a: 'No. Teams can submit a compelling prototype, workflow, or concept backed by a strong demo.' },
  { q: 'Is there a theme?', a: 'The event focuses on real-world impact with themes across AI, sustainable systems, health, and creator tech.' },
  { q: 'Are there mentorship sessions?', a: 'Yes. Selected teams get access to technical and product mentors throughout the event.' },
];

const rewards = [
  { title: '₹12 Lakh payouts', text: 'For the top teams across tracks and the grand prize.' },
  { title: 'Mentor access', text: 'Direct sessions with founders, operators, and product leaders.' },
  { title: 'Career network', text: 'Introductions to hiring partners and startup communities.' },
  { title: 'Funding opportunities', text: 'Open doors to incubation programs and prototype grants.' },
];

const sponsorData = [
  { name: 'HackerRank',    tier: 'TITLE SPONSOR',    tierClass: 'tierGreen',  bg: '#1a5c35', letters: 'H≡' },
  { name: 'CodeCrafters', tier: 'SPONSOR',           tierClass: 'tierOrange', bg: '#7a2d00', letters: '/\\' },
  { name: 'Devfolio',     tier: 'PLATFORM PARTNER',  tierClass: 'tierBlue',   bg: '#1a237e', letters: 'D▶' },
];

const stats = [
  { label: 'Registrations', value: '1800+' },
  { label: 'Colleges', value: '96' },
  { label: 'Problem Statements', value: '6' },
  { label: 'Prize pool', value: '₹12L' },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// Stagger child cards when a section enters the viewport
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing() {
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // ── Parallax refs ────────────────────────────────────────────────────────
  const hero          = useParallax(80);   // hero visual drifts up
  const orbit         = useParallax(50);   // decorative orbit ring – slower
  const tracksHeading = useParallax(40);
  const statsSection  = useParallax(50);
  const rewardsHeading = useParallax(40);
  const faqHeading    = useParallax(30);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location]);


  return (
    <div className={`${styles.page} landing-page`}>
      <Navbar />

      <main className={styles.main}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className={styles.heroSection}>
          <div className={styles.heroGlow} />
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={styles.heroCentered}
            >

              {/* Hero Title with Shuffle animation */}
              <h1 className={styles.heroTitle} aria-label="PROJECT CRUCIBLE">
                <GradientText
                  colors={["#3794f8ff", "#8bbaff", "#ffffff"]}
                  animationSpeed={6}
                  showBorder={false}
                  className={styles.shuffleHeroProject}
                >
                  PROJECT
                </GradientText>
                <GradientText
                  colors={["#ffffff", "#8bbaff", "#3794f8ff"]}
                  animationSpeed={6}
                  showBorder={false}
                  className={styles.shuffleHeroCrucible}
                >
                  CRUCIBLE
                </GradientText>
              </h1>

              {/* Subtitle & Description */}
              <h2 className={styles.heroSubtitle}>Forge what's next. Ship live.</h2>
              <p className={styles.heroDesc}>
                The premier high-intensity hackathon where software architects, AI engineers, and product builders collaborate to solve real-world industry challenges.
              </p>

              {/* Meta Line */}
              <div className={styles.heroMetaLine}>
                SEPTEMBER 18-20, 2026 &nbsp;•&nbsp; HYBRID &nbsp;•&nbsp; 2,000+ BUILDERS
              </div>

              {/* Action Buttons */}
              <div className={styles.heroActionsCenter}>
                <SpecularButton
                  size="md"
                  radius={14}
                  lineColor="#ffffff"
                  baseColor="#2d5bff"
                  textColor="#ffffff"
                  intensity={1.2}
                  speed={0.4}
                  onClick={() => window.location.assign('/register')}
                >
                  Register Now &rarr;
                </SpecularButton>
                <SpecularButton
                  size="md"
                  radius={14}
                  lineColor="#71a7ff"
                  baseColor="#142034"
                  textColor="#ffffff"
                  intensity={1}
                  speed={0.35}
                  onClick={() => {
                    const el = document.getElementById('problem-statements');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Problem Statements &rsaquo;
                </SpecularButton>
              </div>

              {/* Digital Countdown Timer */}
              <div className={styles.countdownContainer}>
                <CountdownTimer targetDate="2026-09-18T18:00:00Z" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── PROBLEM STATEMENTS ────────────────────────────────────────────── */}
        <motion.section
          id="problem-statements"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
        >
          <div className="container">
            <motion.div
              ref={tracksHeading.ref}
              className={styles.tracksHeaderCentered}
              style={{ y: tracksHeading.y }}
            >
              <p className={styles.eyebrowBlue}>PROBLEM STATEMENTS</p>
              <h2 className={styles.tracksTitle}>
                Build for <span>impact.</span>
              </h2>
              <p className={styles.tracksSubtitle}>
                Choose a problem space. Build an AI-first solution that can make a real difference.
              </p>
            </motion.div>

            <motion.div
              className={styles.tracksGridFiveCol}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {mockTracks.map((track) => (
                <MotionGlareHover
                  className={styles.trackCardRef}
                  key={track.id}
                  variants={cardReveal}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <div className={styles.trackCircleNumber}>{track.id}</div>
                  <div className={styles.trackCardContent}>
                    <h3>{track.title}</h3>
                    <p>{track.shortDescription}</p>
                    <SpecularButton
                      size="sm"
                      radius={12}
                      lineColor="#71a7ff"
                      baseColor="#080d14"
                      textColor="#71a7ff"
                      intensity={1}
                      speed={0.35}
                      onClick={() => setSelectedTrack(track)}
                    >
                      Explore &rarr;
                    </SpecularButton>
                  </div>
                </MotionGlareHover>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ── ROADMAP / EVENT FLOW ───────────────────────────────────────────── */}
        <motion.section
          id="roadmap"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
        >
          <div className="container">
            {/* Centered Heading */}
            <div className={styles.tracksHeaderCentered}>
              <p className={styles.eyebrowBlue}>ROAD TO PROJECT CRUCIBLE</p>
              <h2 className={styles.tracksTitle}>
                One challenge. <span>Nine milestones.</span>
              </h2>
            </div>

            {/* Top Row: Milestones 01 to 05 */}
            <div className={styles.milestoneRowTop}>
              {/* Connected Line and Badges */}
              <div className={styles.milestoneLineHeader}>
                <div className={styles.horizontalLine} />
                {[
                  { num: '01', active: true },
                  { num: '02', active: true },
                  { num: '03', active: true },
                  { num: '04', active: true },
                  { num: '05', active: false },
                ].map((b) => (
                  <div
                    key={b.num}
                    className={`${styles.milestoneBadgeCircle} ${b.active ? styles.badgeActive : ''}`}
                  >
                    {b.num}
                  </div>
                ))}
              </div>

              {/* Cards Grid Top */}
              <div className={styles.milestoneGridTop}>
                {/* 01: Registrations Ongoing */}
                <div className={`${styles.milestoneCard} ${styles.cardActive}`}>
                  <div className={styles.cardTopStatus}>
                    <span className={styles.statusMuted}>ONGOING</span>
                    <span className={styles.statusPillActive}>ACTIVE</span>
                  </div>
                  <h3>Registrations Ongoing</h3>
                  <p>Register via Devfolio to secure your spot in Infinity Hacks 2026.</p>
                </div>

                {/* 02: Registration Deadline */}
                <div className={`${styles.milestoneCard} ${styles.cardLightGreen}`}>
                  <div className={styles.dateLabelDark}>5 AUG</div>
                  <div className={styles.dateSubtextDark}>5 August (Wednesday)</div>
                  <h3>Registration Deadline</h3>
                  <p>Last date to register for Infinity Hacks 2026.</p>
                </div>

                {/* 03: Team Formation Deadline */}
                <div className={`${styles.milestoneCard} ${styles.cardLightGreen}`}>
                  <div className={styles.dateLabelDark}>6 AUG</div>
                  <div className={styles.dateSubtextDark}>6 August (Thursday)</div>
                  <h3>Team Formation Deadline</h3>
                  <p>Finalize your team of 3–5 members before this date.</p>
                </div>

                {/* 04: PPT & SOP Submission */}
                <div className={`${styles.milestoneCard} ${styles.cardLightGreen}`}>
                  <div className={styles.dateLabelDark}>11 AUG</div>
                  <div className={styles.dateSubtextDark}>11 August 2026 (11:59 PM)</div>
                  <h3>PPT & SOP Submission Deadline</h3>
                  <p>Submit your Project Presentation (PPT) and SOP for the qualifier round.</p>
                </div>

                {/* 05: Shortlisting */}
                <div className={`${styles.milestoneCard} ${styles.cardDark}`}>
                  <div className={styles.dateLabelGreen}>14 AUG</div>
                  <div className={styles.dateSubtextGreen}>By 14 August</div>
                  <h3>Shortlisting</h3>
                  <p>Shortlisted teams based on pitch deck will be released max by 14th.</p>
                </div>
              </div>
            </div>

            {/* Divider Label */}
            <div className={styles.dividerLabelContainer}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>HACKATHON DAY</span>
              <div className={styles.dividerLine} />
            </div>

            {/* Bottom Row: Milestones 06 to 09 */}
            <div className={styles.milestoneRowBottom}>
              {/* Badges Header */}
              <div className={styles.milestoneLineHeaderBottom}>
                {['06', '07', '08', '09'].map((num) => (
                  <div key={num} className={styles.milestoneBadgeCircle}>
                    {num}
                  </div>
                ))}
              </div>

              {/* Cards Grid Bottom */}
              <div className={styles.milestoneGridBottom}>
                {/* 06: Hackathon Begins */}
                <div className={`${styles.milestoneCard} ${styles.cardDark}`}>
                  <div className={styles.dateLabelGreen}>15 AUG</div>
                  <div className={styles.dateSubtextGreen}>15 August (Saturday)<br />10:00 AM IST</div>
                  <h3>Hackathon Begins 🚀</h3>
                  <p>Mentoring round in evening. 24 hours of building, innovation and collaboration.</p>
                </div>

                {/* 07: Project Judging */}
                <div className={`${styles.milestoneCard} ${styles.cardDark}`}>
                  <div className={styles.dateLabelGreen}>16 AUG</div>
                  <div className={styles.dateSubtextGreen}>16 August (Sunday)<br />10:00 AM - 12:00 PM</div>
                  <h3>Project Judging</h3>
                  <p>Top shortlisted teams will be reviewed before the final decision.</p>
                </div>

                {/* 08: Final Jury Deliberation */}
                <div className={`${styles.milestoneCard} ${styles.cardDark}`}>
                  <div className={styles.dateLabelGreen}>16 AUG</div>
                  <div className={styles.dateSubtextGreen}>16 August (Sunday)<br />1:00 PM</div>
                  <h3>Final Jury Deliberation</h3>
                  <p>Final discussion round between judges of top 5/8 shortlisted teams.</p>
                </div>

                {/* 09: Results Announcement */}
                <div className={`${styles.milestoneCard} ${styles.cardDark}`}>
                  <div className={styles.dateLabelGreen}>16 AUG</div>
                  <div className={styles.dateSubtextGreen}>16 August (Sunday)<br />EVENING</div>
                  <h3>Results Announcement</h3>
                  <p>One journey ends. Hundreds of impactful ideas begin.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── WHY US ────────────────────────────────────────────────────────── */}
        <motion.section
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">WHY US</p>
              <h2>Built for builders who love messy, meaningful work.</h2>
            </div>
            <motion.div
              className={styles.valueGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {[
                ['Rapid prototyping', 'Turn a thesis into a demo within 6 hours of intentional design and coding.'],
                ['Hands-on mentorship', 'Work directly with technologists, operators, and product builders.'],
                ['Real-world constraints', 'Solve issues tied to measurable impact rather than abstract novelty.'],
                ['Strong network', 'Meet investors, operators, and teams building serious products.'],
              ].map(([title, text]) => (
                <MotionGlareHover
                  key={title}
                  className={styles.valueCard}
                  variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <div className={styles.valueBadge}>✦</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </MotionGlareHover>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <motion.section
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container">
            <motion.div
              ref={statsSection.ref}
              className="section-heading"
              style={{ y: statsSection.y }}
            >
              <p className="eyebrow">BY THE NUMBERS</p>
              <h2>Momentum that compounds.</h2>
            </motion.div>

            <motion.div
              className={styles.statsStrip}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {stats.map((stat) => (
                <MotionGlareHover
                  key={stat.label}
                  className={styles.statCard}
                  variants={cardReveal}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </MotionGlareHover>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ── REWARDS ───────────────────────────────────────────────────────── */}
        <motion.section
          id="rewards"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container">
            <motion.div
              ref={rewardsHeading.ref}
              className="section-heading"
              style={{ y: rewardsHeading.y }}
            >
              <p className="eyebrow">REWARDS</p>
              <h2>Backing ideas that deserve momentum.</h2>
            </motion.div>

            <motion.div
              className={styles.rewardsGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {rewards.map((reward, index) => (
                <MotionGlareHover
                  key={reward.title}
                  className={styles.rewardCard}
                  variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <span>0{index + 1}</span>
                  <h3>{reward.title}</h3>
                  <p>{reward.text}</p>
                </MotionGlareHover>
              ))}
            </motion.div>
          </div>
        </motion.section>



        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <motion.section
          id="faq"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container faq-wrap">
            <motion.div
              ref={faqHeading.ref}
              className="section-heading left-align"
              style={{ y: faqHeading.y }}
            >
              <p className="eyebrow">FAQ</p>
              <h2>Common questions before the sprint.</h2>
            </motion.div>

            <div className={styles.faqList}>
              {faqItems.map((item, index) => (
                <MotionGlareHover
                  key={item.q}
                  className={`${styles.faqItem} ${openFaq === index ? styles.open : ''}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.5 }}
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                    <span>{item.q}</span>
                    <strong>{openFaq === index ? '−' : '+'}</strong>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.faqAnswer}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MotionGlareHover>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── CONTACT ───────────────────────────────────────────────────────── */}
        <motion.section
          id="contact"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={sectionVariants}
        >
          <div className="container">
            {/* Header */}
            <div className={styles.contactHeader}>
              <div className={styles.contactBadgePill}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
                GET IN TOUCH
              </div>
              <h2 className={styles.contactTitle}>
                Contact <span>Organising Team</span>
              </h2>
              <p className={styles.contactSubtitle}>
                Have questions about the hackathon? Need help with registration or finding a team?
                Reach out to us through any of the channels below.
              </p>
            </div>

            <div className={styles.contactLayout}>
              {/* Left – channel cards */}
              <div className={styles.contactChannels}>
                <MotionGlareHover className={styles.channelCard} whileHover={{ y: -4, transition: { duration: 0.2 } }} glareColor="#ffffff" glareOpacity={0.15}>
                  <div className={`${styles.channelIconWrap} ${styles.iconGreen}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.12 1.526 5.849L0 24l6.335-1.509A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                  </div>
                  <div className={styles.channelInfo}>
                    <h3>WhatsApp Channel</h3>
                    <p>Get instant updates, announcements, and important alerts directly on your phone.</p>
                    <a href="#" className={`${styles.channelLink} ${styles.linkGreen}`}>Join Channel →</a>
                  </div>
                </MotionGlareHover>

                <MotionGlareHover className={styles.channelCard} whileHover={{ y: -4, transition: { duration: 0.2 } }} glareColor="#ffffff" glareOpacity={0.15}>
                  <div className={`${styles.channelIconWrap} ${styles.iconPink}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className={styles.channelInfo}>
                    <h3>Instagram</h3>
                    <p>Get real-time updates, behind-the-scenes content, and announcements.</p>
                    <a href="#" className={`${styles.channelLink} ${styles.linkPink}`}>Follow on Instagram →</a>
                  </div>
                </MotionGlareHover>

                <MotionGlareHover className={styles.channelCard} whileHover={{ y: -4, transition: { duration: 0.2 } }} glareColor="#ffffff" glareOpacity={0.15}>
                  <div className={`${styles.channelIconWrap} ${styles.iconWhite}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7l-10 7L2 7" />
                    </svg>
                  </div>
                  <div className={styles.channelInfo}>
                    <h3>Email Us</h3>
                    <p>For formal queries, sponsorships, and partnership opportunities.</p>
                    <a href="mailto:hackerrankcampuscrew@gmail.com" className={`${styles.channelLink} ${styles.linkWhite}`}>
                      hackerrankcampuscrew@gmail.com →
                    </a>
                  </div>
                </MotionGlareHover>
              </div>

              {/* Right – send a message form */}
              <MotionGlareHover
                className={styles.contactFormCard}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                glareColor="#ffffff"
                glareOpacity={0.15}
              >
                <form onSubmit={(e) => { e.preventDefault(); alert('Message queued.'); }} style={{ display: 'contents' }}>
                  <h3 className={styles.formTitle}>Send a Message</h3>
                  <div className={styles.formField}>
                    <label>NAME</label>
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div className={styles.formField}>
                    <label>EMAIL</label>
                    <input type="email" placeholder="john@example.com" />
                  </div>
                  <div className={styles.formField}>
                    <label>MESSAGE</label>
                    <textarea rows="4" placeholder="How can we help you?" />
                  </div>
                  <button type="submit" className={styles.formSubmitBtn}>
                    Send Message →
                  </button>
                </form>
              </MotionGlareHover>
            </div>
          </div>
        </motion.section>

        {/* ── SPONSORS ──────────────────────────────────────────────────────── */}
        <motion.section
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container">
            <div className={styles.sponsorsHeader}>
              <p className={styles.sponsorsEyebrow}>BACKED BY THE BEST</p>
              <h2 className={styles.sponsorsTitle}>Our <span>Sponsors</span></h2>
            </div>
            <motion.div
              className={styles.sponsorCardsRow}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {sponsorData.map((sponsor) => (
                <MotionGlareHover
                  key={sponsor.name}
                  className={styles.sponsorCard}
                  variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
                  glareColor="#ffffff"
                  glareOpacity={0.15}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <div className={styles.sponsorLogoBox} style={{ background: sponsor.bg }}>
                    {sponsor.letters}
                  </div>
                  <h3 className={styles.sponsorName}>{sponsor.name}</h3>
                  <p className={`${styles.sponsorTier} ${styles[sponsor.tierClass]}`}>{sponsor.tier}</p>
                </MotionGlareHover>
              ))}
            </motion.div>
          </div>
        </motion.section>

      </main>

      <Footer />

      <AnimatePresence>
        {selectedTrack && (
          <TrackModal
            track={selectedTrack}
            onClose={() => setSelectedTrack(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
