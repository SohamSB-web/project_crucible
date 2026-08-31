import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../../components/ui/Footer';
import Navbar from '../../components/ui/Navbar';
import CountdownTimer from '../../components/ui/CountdownTimer';
import MagneticButton from '../../components/ui/MagneticButton';
import SpecularButton from '../../components/ui/SpecularButton';
import TrackModal from '../../components/ui/TrackModal';
import { mockTracks } from '../../data/mockTracks';
import { mockAnnouncements } from '../../data/mockAnnouncements';
import { mockTeams } from '../../data/mockTeams';
import { useParallax } from '../../hooks/useParallax';
import styles from './Landing.module.css';

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

const organizers = [
  { name: 'Aarav Mehta', role: 'Event Director', accent: 'AI systems' },
  { name: 'Sana Nambiar', role: 'Design Lead', accent: 'UX strategy' },
  { name: 'Kabir Iyer', role: 'Engineering Captain', accent: 'Platform ops' },
  { name: 'Leah Rao', role: 'Partnerships', accent: 'Sponsors' },
];

const sponsors = ['Airtel', 'Paytm', 'Microsoft', 'Google', 'Atlassian', 'NVIDIA', 'AWS', 'Notion'];

const stats = [
  { label: 'Registrations', value: '1800+' },
  { label: 'Colleges', value: '96' },
  { label: 'Tracks', value: '6' },
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
  const teamHeading   = useParallax(40);
  const faqHeading    = useParallax(30);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location]);

  const countStats = useMemo(() => ({
    teams: mockTeams.length,
    tracks: mockTracks.length,
    announcements: mockAnnouncements.length,
  }), []);

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
              {/* System Online Badge */}
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                <span>CRUCIBLE_01 • SYSTEM ONLINE</span>
              </div>

              {/* Massive Main Title */}
              <h1 className={styles.heroTitle}>
                PROJECT
                <span>CRUCIBLE</span>
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
                    const el = document.getElementById('tracks');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Tracks &rsaquo;
                </SpecularButton>
              </div>

              {/* Digital Countdown Timer */}
              <div className={styles.countdownContainer}>
                <CountdownTimer targetDate="2026-09-18T18:00:00Z" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TRACKS ────────────────────────────────────────────────────────── */}
        <motion.section
          id="tracks"
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
              <p className={styles.eyebrowBlue}>TRACKS</p>
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
                <motion.article
                  className={styles.trackCardRef}
                  key={track.id}
                  variants={cardReveal}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
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
                </motion.article>
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
                <motion.div
                  key={title}
                  className={styles.valueCard}
                  variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
                >
                  <div className={styles.valueBadge}>✦</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </motion.div>
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
                <motion.div
                  key={stat.label}
                  className={styles.statCard}
                  variants={cardReveal}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </motion.div>
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
                <motion.div
                  key={reward.title}
                  className={styles.rewardCard}
                  variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
                >
                  <span>0{index + 1}</span>
                  <h3>{reward.title}</h3>
                  <p>{reward.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ── TEAM ──────────────────────────────────────────────────────────── */}
        <motion.section
          id="team"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container">
            <motion.div
              ref={teamHeading.ref}
              className="section-heading"
              style={{ y: teamHeading.y }}
            >
              <p className="eyebrow">TEAM</p>
              <h2>The people making the sprint feel alive.</h2>
            </motion.div>

            <motion.div
              className={styles.teamGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {organizers.map((person) => (
                <motion.div
                  key={person.name}
                  className={styles.teamCard}
                  variants={cardReveal}
                  whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
                >
                  <div className={styles.avatar}>
                    {person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </div>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                  <small>{person.accent}</small>
                </motion.div>
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
                <motion.div
                  key={item.q}
                  className={`${styles.faqItem} ${openFaq === index ? styles.open : ''}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.5 }}
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
                </motion.div>
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
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container contact-grid">
            <div>
              <div className="section-heading left-align">
                <p className="eyebrow">CONTACT</p>
                <h2>Let's build the next big thing together.</h2>
              </div>
              <div className={styles.contactList}>
                <span>hello@crucible.dev</span>
                <span>+91 98212 44233</span>
                <span>Instagram / X / LinkedIn</span>
              </div>
            </div>

            <motion.form
              className={styles.contactCard}
              onSubmit={(e) => { e.preventDefault(); alert('Message queued.'); }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <label>
                Name
                <input type="text" placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" placeholder="you@example.com" />
              </label>
              <label>
                Message
                <textarea rows="4" placeholder="Tell us what kind of support or partnership you need." />
              </label>
              <SpecularButton
                type="submit"
                size="md"
                radius={14}
                lineColor="#71a7ff"
                baseColor="#2d5bff"
                textColor="#ffffff"
                intensity={1.2}
                speed={0.4}
              >
                Send Message
              </SpecularButton>
            </motion.form>
          </div>
        </motion.section>

        {/* ── SPONSORS ──────────────────────────────────────────────────────── */}
        <motion.section
          className="section sponsor-section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">SPONSORS</p>
              <h2>Backed by teams building the next era.</h2>
            </div>
            <motion.div
              className={styles.sponsorWall}
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {sponsors.map((sponsor) => (
                <motion.div
                  key={sponsor}
                  className={styles.sponsorPill}
                  variants={cardReveal}
                  whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
                >
                  {sponsor}
                </motion.div>
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
