// api/search.js — Recreation.gov RIDB campground search proxy
// GET /api/search?q=michigan      → searches RIDB campgrounds API
// GET /api/search?id=234756       → fetches a single campground by facility ID
//
// Required env var (set in Vercel dashboard):
//   RIDB_API_KEY — free key from https://ridb.recreation.gov/signup

const RIDB = 'https://ridb.recreation.gov/api/v1';

const STATES = {
  alabama:'AL',alaska:'AK',arizona:'AZ',arkansas:'AR',california:'CA',
  colorado:'CO',connecticut:'CT',delaware:'DE',florida:'FL',georgia:'GA',
  hawaii:'HI',idaho:'ID',illinois:'IL',indiana:'IN',iowa:'IA',kansas:'KS',
  kentucky:'KY',louisiana:'LA',maine:'ME',maryland:'MD',massachusetts:'MA',
  michigan:'MI',minnesota:'MN',mississippi:'MS',missouri:'MO',montana:'MT',
  nebraska:'NE',nevada:'NV','new hampshire':'NH','new jersey':'NJ',
  'new mexico':'NM','new york':'NY','north carolina':'NC','north dakota':'ND',
  ohio:'OH',oklahoma:'OK',oregon:'OR',pennsylvania:'PA','rhode island':'RI',
  'south carolina':'SC','south dakota':'SD',tennessee:'TN',texas:'TX',
  utah:'UT',vermont:'VT',virginia:'VA',washington:'WA','west virginia':'WV',
  wisconsin:'WI',wyoming:'WY',
};

function stripHTML(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
}

function titleCase(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bNp\b/g, 'NP').replace(/\bNf\b/g, 'NF')
    .replace(/\bRv\b/g, 'RV').replace(/\bBlm\b/g, 'BLM');
}

function parseFee(desc) {
  if (!desc) return null;
  const m = (desc || '').match(/\$\s*(\d+(?:\.\d+)?)/);
  return m ? Math.round(parseFloat(m[1])) : null;
}

function mapType(recAreaName, orgName) {
  const r = (recAreaName || '').toLowerCase();
  const o = (orgName || '').toLowerCase();
  if (r.includes('national park') || o.includes('national park service') || o.includes('nps')) return 'National Park';
  if (r.includes('national forest') || o.includes('forest service') || o.includes('usfs')) return 'National Forest';
  if (r.includes('state park') || r.includes('state forest') || o.includes('state')) return 'State Park';
  if (r.includes('national lakeshore') || r.includes('national seashore') || r.includes('national recreation') || r.includes('national monument')) return 'National Park';
  if (r.includes('bureau of land') || o.includes('bureau of land management') || o.includes('blm')) return 'BLM';
  if (r.includes('army corps') || o.includes('army corps')) return 'Army Corps';
  return 'Campground';
}

function mapActivities(activities) {
  if (!Array.isArray(activities)) return [];
  const MAP = {
    'fishing': 'Fishing',
    'swimming': 'Swimming',
    'boating': 'Kayaking',
    'kayaking': 'Kayaking',
    'canoeing': 'Kayaking',
    'horseback riding': 'Horseback Riding',
    'rock climbing': 'Rock Climbing',
    'cross-country skiing': 'Skiing',
    'snowshoeing': 'Snowshoeing',
    'stargazing': 'Stargazing',
    'scuba diving': 'Swimming',
    'snorkeling': 'Swimming',
  };
  const out = new Set();
  activities.forEach(a => {
    const n = (a.ActivityName || '').toLowerCase();
    if (MAP[n]) out.add(MAP[n]);
  });
  return [...out];
}

function normalize(f) {
  const addr    = (f.FACILITYADDRESS || [])[0] || {};
  const state   = addr.AddressStateCode || '';
  const city    = addr.City || '';
  const recArea = (f.RECAREA || [])[0]?.RecAreaName || '';
  const org     = (f.ORGANIZATION || [])[0]?.OrgName || '';

  const locParts = [];
  if (recArea) locParts.push(recArea);
  else if (city) locParts.push(city);
  if (state) locParts.push(state);

  const photo = (
    (f.MEDIA || []).find(m => m.IsPrimary && m.MediaType === 'Image') ||
    (f.MEDIA || []).find(m => m.MediaType === 'Image')
  )?.URL || null;

  const amenities = mapActivities(f.FACILITYACTIVITY || []);
  if (f.FacilityADAAccess === 'Y') amenities.push('Accessible');

  const sitesTotal = (f.NumberOfSitesReservable || 0) + (f.NumberOfSitesFirstComeFirstServe || 0);
  const desc = stripHTML(f.FacilityDescription);

  return {
    id:          parseInt(f.FacilityID, 10),
    ridb_id:     f.FacilityID,
    name:        titleCase(f.FacilityName),
    loc:         locParts.join(' · '),
    type:        mapType(recArea, org),
    price:       parseFee(f.FacilityUseFeeDescription),
    sites:       sitesTotal || null,
    avail:       null,
    rating:      null,
    reviews:     0,
    desc:        desc || `${titleCase(f.FacilityName)} is a campground in ${state || 'the United States'}.`,
    amenities,
    seasons:     [],
    lat:         f.FacilityLatitude  || null,
    lng:         f.FacilityLongitude || null,
    photo,
    reservationUrl: f.FacilityReservationURL || null,
    source:      'ridb',
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://campgrounder.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RIDB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RIDB_API_KEY not configured' });

  // ── Single campground lookup ──────────────────────────────────
  if (req.query.id) {
    const id = (req.query.id || '').replace(/\D/g, '').slice(0, 12);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    try {
      const r = await fetch(`${RIDB}/campgrounds/${id}?full=true&apikey=${apiKey}`);
      if (!r.ok) return res.status(404).json({ error: 'Not found' });
      const f = await r.json();
      if (!f.FacilityID) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(normalize(f));
    } catch (err) {
      return res.status(502).json({ error: 'RIDB fetch failed' });
    }
  }

  // ── Text / state search ───────────────────────────────────────
  const q = (req.query.q || '').trim().slice(0, 100);
  if (!q) return res.status(400).json({ error: 'q param required' });

  const stateCode = STATES[q.toLowerCase()];
  const params = new URLSearchParams({ query: q, limit: '50', full: 'true', apikey: apiKey });
  if (stateCode) params.set('state', stateCode);

  try {
    const r = await fetch(`${RIDB}/campgrounds?${params}`);
    if (!r.ok) return res.status(502).json({ error: `RIDB error ${r.status}` });
    const data = await r.json();

    const results = (data.RECDATA || [])
      .filter(f => f.FacilityLatitude && f.FacilityLongitude)
      .map(normalize);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      results,
      total: data.METADATA?.RESULTS?.TOTAL_COUNT || results.length,
    });
  } catch (err) {
    return res.status(502).json({ error: 'RIDB fetch failed' });
  }
};
