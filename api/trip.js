// api/trip.js — Campgrounder shareable trip links
// POST /api/trip  → save trip data to Upstash Redis, returns { shortcode }
// GET  /api/trip?id=abc123 → retrieve trip by shortcode
//
// Required env vars (auto-injected when you add Upstash for Redis via Vercel Marketplace):
//   KV_REST_API_URL   — e.g. https://xxxx.upstash.io
//   KV_REST_API_TOKEN — Upstash REST token
//
// Trip data stored: { name, campIds: [42, 7, ...], createdAt }
// TTL: 180 days

const TTL_SECONDS = 180 * 24 * 60 * 60; // 180 days

function kvFetch(url, token, command) {
  return fetch(url, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(command),
  }).then(r => r.json());
}

function makeShortcode() {
  // 7-char alphanumeric (lowercase + digits), ~78 billion combinations
  return Math.random().toString(36).slice(2, 9);
}

module.exports = async function handler(req, res) {
  // CORS – campgrounder.io only
  res.setHeader('Access-Control-Allow-Origin', 'https://campgrounder.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const kvUrl   = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    console.error('KV env vars not set');
    return res.status(500).json({ error: 'Storage not configured' });
  }

  // ── POST: save a new trip ──────────────────────────────────
  if (req.method === 'POST') {
    const { name, campIds } = req.body || {};

    if (!Array.isArray(campIds) || campIds.length === 0) {
      return res.status(400).json({ error: 'campIds array required' });
    }
    if (campIds.length > 50) {
      return res.status(400).json({ error: 'Too many camps (max 50)' });
    }

    const shortcode = makeShortcode();
    const payload   = JSON.stringify({
      name:      (name || 'My Trip').slice(0, 80),
      campIds:   campIds.map(Number).filter(n => n > 0),
      createdAt: Date.now(),
    });

    // SET trip:<shortcode> <payload> EX <ttl>
    const result = await kvFetch(kvUrl, kvToken, ['SET', `trip:${shortcode}`, payload, 'EX', TTL_SECONDS]);
    if (result.error) {
      console.error('KV SET error:', result.error);
      return res.status(500).json({ error: 'Failed to save trip' });
    }

    return res.status(200).json({ shortcode });
  }

  // ── GET: retrieve a trip ───────────────────────────────────
  if (req.method === 'GET') {
    const id = (req.query.id || '').slice(0, 20).replace(/[^a-z0-9]/gi, '');
    if (!id) return res.status(400).json({ error: 'id param required' });

    const result = await kvFetch(kvUrl, kvToken, ['GET', `trip:${id}`]);
    if (!result.result) return res.status(404).json({ error: 'Trip not found or expired' });

    let trip;
    try { trip = JSON.parse(result.result); }
    catch { return res.status(500).json({ error: 'Corrupted trip data' }); }

    return res.status(200).json(trip);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
