// api/notify.js — Campgrounder reservation reminder signup
// Uses CommonJS (no package.json required) and native fetch (Node 18+, Vercel default)
// Required env vars in Vercel dashboard:
//   RESEND_API_KEY  — from resend.com
//   NOTIFY_EMAIL    — where to forward signups (e.g. benvanderveen@gmail.com)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, campName, campLoc, date } = req.body || {};

  if (!email || !email.includes('@') || !campName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey   = process.env.RESEND_API_KEY;
  const notifyTo = process.env.NOTIFY_EMAIL || 'benvanderveen@gmail.com';
  const fromAddr = 'Campgrounder <hello@campgrounder.io>';

  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const dateNote = date ? `<br>Expected opening window: <strong>${date}</strong>` : '';

  const send = (payload) => fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(payload)
  });

  try {
    await Promise.all([
      // Confirmation to the user
      send({
        from:    fromAddr,
        to:      [email],
        subject: `You're on the list for ${campName}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#0C1F15;padding:24px;border-radius:12px 12px 0 0;">
              <span style="color:#E8481C;font-size:20px;font-weight:800;letter-spacing:-0.02em;">Campgrounder</span>
            </div>
            <div style="background:#f9f9f9;padding:28px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:none;">
              <h2 style="margin:0 0 12px;font-size:20px;">You're on the list 🏕️</h2>
              <p style="margin:0 0 16px;color:#444;line-height:1.6;">
                We'll email you before <strong>${campName}</strong> (${campLoc}) opens reservations for the season.
                ${dateNote}
              </p>
              <p style="margin:0 0 16px;color:#444;line-height:1.6;">
                Reservation windows for top parks fill within hours — sometimes minutes. We'll give you enough notice to be ready.
              </p>
              <p style="margin:0;color:#999;font-size:12px;">
                You signed up at <a href="https://campgrounder.io" style="color:#E8481C;">campgrounder.io</a>. Reply to unsubscribe.
              </p>
            </div>
          </div>
        `
      }),
      // Notification to Ben
      send({
        from:    fromAddr,
        to:      [notifyTo],
        subject: `New reminder signup: ${campName}`,
        html: `<p><strong>${email}</strong> signed up for reservation reminders for <strong>${campName}</strong> (${campLoc}).</p>${date ? `<p>Known opening window: ${date}</p>` : ''}`
      })
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
