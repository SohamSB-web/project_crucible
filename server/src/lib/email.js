const { Resend } = require('resend');

let _resend;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not set — emails will be logged to console only.');
      return null;
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM = process.env.EMAIL_FROM || 'Hackathon 2026 <noreply@example.com>';

/**
 * Send credential delivery email to the Team Lead.
 * Called immediately after a successful team registration.
 */
async function sendCredentialEmail({ to, teamName, teamId, joinCode, tempPassword }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're registered — Hackathon 2026</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0e17; font-family: 'Segoe UI', Arial, sans-serif; color: #e8eeff; }
    .container { max-width: 560px; margin: 40px auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0a0e17 0%, #142034 100%); padding: 40px 40px 32px; border-bottom: 1px solid rgba(45,91,255,0.3); }
    .logo { font-size: 11px; letter-spacing: 3px; color: #71a7ff; font-weight: 600; margin-bottom: 12px; }
    .title { font-size: 28px; font-weight: 700; color: #e8eeff; margin: 0; line-height: 1.2; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 16px; color: #a0b4d0; margin-bottom: 24px; }
    .card { background: rgba(45,91,255,0.08); border: 1px solid rgba(45,91,255,0.25); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .row:last-child { border-bottom: none; }
    .label { font-size: 12px; letter-spacing: 1px; color: #71a7ff; font-weight: 600; }
    .value { font-size: 16px; font-weight: 700; color: #e8eeff; font-family: 'Courier New', monospace; letter-spacing: 2px; }
    .warning { background: rgba(255,160,0,0.08); border: 1px solid rgba(255,160,0,0.25); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; color: #ffa000; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #506080; text-align: center; }
    .cta { display: inline-block; background: #2d5bff; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; margin: 4px 0 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CSI · XAVIER INSTITUTE OF ENGINEERING</div>
      <h1 class="title">You're in. ✦</h1>
    </div>
    <div class="body">
      <p class="greeting">Hi there, <strong>${teamName}</strong> — your team is officially registered for <strong>Hackathon 2026</strong>. Share the join code below with your teammates so they can join your team.</p>

      <div class="card">
        <div class="row">
          <span class="label">TEAM NAME</span>
          <span class="value">${teamName}</span>
        </div>
        <div class="row">
          <span class="label">TEAM ID</span>
          <span class="value">${teamId}</span>
        </div>
        <div class="row">
          <span class="label">JOIN CODE</span>
          <span class="value">${joinCode}</span>
        </div>
        <div class="row">
          <span class="label">TEMP PASSWORD</span>
          <span class="value">${tempPassword}</span>
        </div>
      </div>

      <div class="warning">
        ⚠️ This is your temporary password. Please change it after your first login. Do not share it — only share the <strong>Join Code</strong> with teammates.
      </div>

      <a class="cta" href="${process.env.FRONTEND_URL || '#'}/login">Login to your dashboard →</a>

      <p style="font-size:13px; color:#71a7ff; margin:0;">
        <strong>Round 1 Submission Window:</strong> Sept 22 – Sept 25, 2026<br/>
        Upload your PPT/PDF abstract from the dashboard before the deadline.
      </p>
    </div>
    <div class="footer">
      CSI Student Chapter · Xavier Institute of Engineering · Hackathon 2026<br/>
      You're receiving this because you registered at Mission Crucible.
    </div>
  </div>
</body>
</html>`;

  const resend = getResend();
  if (!resend) {
    console.log('[Email] Would send credential email to:', to, { teamId, joinCode, tempPassword });
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `✦ Hackathon 2026 — You're in! Team credentials inside`,
    html,
  });
}

/**
 * Send a welcome email to a new team member who joined via join code.
 */
async function sendMemberWelcomeEmail({ to, memberName, teamName, joinCode }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin:0; padding:0; background:#0a0e17; font-family:'Segoe UI',Arial,sans-serif; color:#e8eeff; }
    .container { max-width:560px; margin:40px auto; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#0a0e17 0%,#142034 100%); padding:40px 40px 32px; border-bottom:1px solid rgba(45,91,255,0.3); }
    .logo { font-size:11px; letter-spacing:3px; color:#71a7ff; font-weight:600; margin-bottom:12px; }
    .title { font-size:26px; font-weight:700; color:#e8eeff; margin:0; }
    .body { padding:36px 40px; }
    .card { background:rgba(45,91,255,0.08); border:1px solid rgba(45,91,255,0.25); border-radius:12px; padding:24px; margin-bottom:24px; }
    .row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .row:last-child { border-bottom:none; }
    .label { font-size:12px; letter-spacing:1px; color:#71a7ff; font-weight:600; }
    .value { font-size:16px; font-weight:700; color:#e8eeff; font-family:'Courier New',monospace; }
    .footer { padding:24px 40px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#506080; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CSI · XAVIER INSTITUTE OF ENGINEERING</div>
      <h1 class="title">Welcome to the team! ✦</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${memberName}</strong> — you've successfully joined <strong>${teamName}</strong> at Hackathon 2026.</p>
      <div class="card">
        <div class="row">
          <span class="label">TEAM</span>
          <span class="value">${teamName}</span>
        </div>
        <div class="row">
          <span class="label">JOIN CODE</span>
          <span class="value">${joinCode}</span>
        </div>
      </div>
      <p style="font-size:13px;color:#a0b4d0;">
        Your team lead will handle the submission. Stay in touch with your team for updates on the hackathon schedule.
      </p>
    </div>
    <div class="footer">
      CSI Student Chapter · Xavier Institute of Engineering · Hackathon 2026
    </div>
  </div>
</body>
</html>`;

  const resend = getResend();
  if (!resend) {
    console.log('[Email] Would send member welcome email to:', to, { teamName, joinCode });
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: [to],
    subject: `✦ You joined ${teamName} — Hackathon 2026`,
    html,
  });
}

module.exports = { sendCredentialEmail, sendMemberWelcomeEmail };
