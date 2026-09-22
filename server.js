const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3005;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(PUBLIC_DIR, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LIBRARY_FILE = path.join(DATA_DIR, 'library.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const TYPES_FILE = path.join(DATA_DIR, 'datatypes.json');
const DELETED_FILE = path.join(DATA_DIR, 'deleted.json');

const SUPABASE_CONFIG = {
  url: 'https://quaggsbpiewmxcxceoyg.supabase.co',
  key: 'sb_publishable_4SXazBJJ4GlEWrDsq7yt4A_XT67YuoW'
};

// Initial Seed Data
const DEFAULT_CATEGORIES = [
  'Tours',
  'Tickets & Booking',
  'Passenger Wi-Fi',
  'VIP Lounges',
  'Social & Marketing'
];

const DEFAULT_DATA_TYPES = [
  { id: 'url', name: 'Website / Link (URL)', prefix: '', placeholder: 'https://sunseekers.co.za/book', hint: 'Validates destination website address automatically', isBuiltin: true },
  { id: 'wifi', name: 'Bus Wi-Fi Connect', prefix: 'WIFI:', placeholder: '', hint: 'Instant connect to coach onboard Wi-Fi hotspot', isBuiltin: true },
  { id: 'whatsapp', name: 'WhatsApp Booking Line', prefix: 'https://wa.me/', placeholder: '+27821234567', hint: 'Direct WhatsApp chat with customer dispatch', isBuiltin: true },
  { id: 'vcard', name: 'Business Contact (vCard)', prefix: 'BEGIN:VCARD', placeholder: '', hint: 'Instant contact save to passenger phone address book', isBuiltin: true },
  { id: 'text', name: 'Plain Text / Note', prefix: '', placeholder: 'Custom text or code', hint: 'Displays plain text or reference code when scanned', isBuiltin: true },
  { id: 'phone', name: 'Direct Phone Call', prefix: 'tel:', placeholder: '+27 11 555 0199', hint: 'Prompts phone dialer to call dispatch desk directly', isBuiltin: false },
  { id: 'email', name: 'Email Dispatch', prefix: 'mailto:', placeholder: 'info@sunseekers.co.za', hint: 'Opens email client with pre-addressed email', isBuiltin: false },
  { id: 'sms', name: 'SMS Text Message', prefix: 'SMSTO:', placeholder: '+27821234567', hint: 'Opens SMS messenger with pre-filled number', isBuiltin: false },
  { id: 'maps', name: 'Google Maps Location', prefix: 'https://maps.google.com/?q=', placeholder: 'Sunseekers Terminal, Cape Town', hint: 'Opens Google Maps navigation directly to terminal', isBuiltin: false }
];

const DEFAULT_LIBRARY = [];

// Helper to read JSON file safely
function readJson(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON file safely
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Durable tombstone registry across all entities: codes, categories, dataTypes
function getInitialDeleted() {
  return {
    codes: ['sun_1790089511605_8ahmz'],
    categories: ['Fleet & Buses', 'Customer Feedback', 'Operations', 'tour'],
    dataTypes: []
  };
}

function readDeleted() {
  const data = readJson(DELETED_FILE, getInitialDeleted());
  if (Array.isArray(data)) {
    return {
      codes: data,
      categories: ['Fleet & Buses', 'Customer Feedback', 'Operations', 'tour'],
      dataTypes: []
    };
  }
  return {
    codes: Array.isArray(data?.codes) ? data.codes : [],
    categories: Array.isArray(data?.categories) ? data.categories : [],
    dataTypes: Array.isArray(data?.dataTypes) ? data.dataTypes : []
  };
}

function upsertDeleted(kind, id) {
  if (!id) return;
  const deleted = readDeleted();
  if (!deleted[kind]) deleted[kind] = [];
  if (!deleted[kind].includes(id)) {
    deleted[kind].push(id);
    writeJson(DELETED_FILE, deleted);
  }
}

function removeTombstone(kind, id) {
  if (!id) return;
  const deleted = readDeleted();
  if (deleted[kind] && deleted[kind].includes(id)) {
    deleted[kind] = deleted[kind].filter(x => x !== id);
    writeJson(DELETED_FILE, deleted);
  }
}

function isDeleted(kind, id) {
  if (!id) return false;
  const deleted = readDeleted();
  return Array.isArray(deleted[kind]) && deleted[kind].includes(id);
}

// Initialize files if not existing
if (!fs.existsSync(LIBRARY_FILE)) writeJson(LIBRARY_FILE, DEFAULT_LIBRARY);
if (!fs.existsSync(CATEGORIES_FILE)) writeJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
if (!fs.existsSync(TYPES_FILE)) writeJson(TYPES_FILE, DEFAULT_DATA_TYPES);
if (!fs.existsSync(DELETED_FILE)) writeJson(DELETED_FILE, getInitialDeleted());

// Supabase Async Background Synchronizer
async function mirrorToSupabase(endpoint, method, payload = null) {
  try {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_CONFIG.key,
      'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
      'Content-Type': 'application/json'
    };
    if (method === 'POST') {
      headers['Prefer'] = 'resolution=merge-duplicates';
    }

    const opts = { method, headers };
    if (payload) opts.body = JSON.stringify(payload);

    const res = await fetch(url, opts);
    return res.status;
  } catch (e) {
    return null;
  }
}

// Supabase Pull / Cloud Mirror to ensure single source of truth
async function pullFromSupabase() {
  try {
    const headers = {
      'apikey': SUPABASE_CONFIG.key,
      'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
    };

    // 1. Categories
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/qr_categories?select=*&order=id.asc`, { headers });
      if (res.ok) {
        const cloudCats = await res.json();
        if (Array.isArray(cloudCats) && cloudCats.length > 0) {
          const deleted = readDeleted();
          const names = cloudCats
            .map(c => (c.name || '').trim())
            .filter(name => Boolean(name) && !deleted.categories.includes(name));
          if (names.length > 0) {
            writeJson(CATEGORIES_FILE, names);
          }
        }
      }
    } catch (e) {}

    // 2. Data Types
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/qr_data_types?select=*&order=created_at.asc`, { headers });
      if (res.ok) {
        const cloudTypes = await res.json();
        if (Array.isArray(cloudTypes) && cloudTypes.length > 0) {
          const deleted = readDeleted();
          const types = cloudTypes
            .filter(ct => !deleted.dataTypes.includes(ct.id))
            .map(ct => ({
              id: ct.id,
              name: ct.name,
              prefix: ct.prefix || '',
              placeholder: ct.placeholder || '',
              hint: ct.hint || '',
              isBuiltin: !!ct.is_builtin
            }));
          if (types.length > 0) {
            writeJson(TYPES_FILE, types);
          }
        }
      }
    } catch (e) {}

    // 3. QR Codes
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/qr_codes?select=*&order=created_at.desc`, { headers });
      if (res.ok) {
        const cloudCodes = await res.json();
        if (Array.isArray(cloudCodes)) {
          const deleted = readDeleted();
          const activeCodes = cloudCodes
            .filter(c => !deleted.codes.includes(c.id))
            .map(c => ({
              id: c.id,
              name: c.name,
              category: c.category || 'Tours',
              url: c.url,
              subtitle: c.subtitle || '',
              createdAt: c.created_at,
              updatedAt: c.updated_at || c.created_at,
              configSnapshot: c.config_snapshot || {},
              _synced: true
            }));
          writeJson(LIBRARY_FILE, activeCodes);
        }
      }
    } catch (e) {}
  } catch (err) {}
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.sql': 'text/plain; charset=utf-8'
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = req.url.split('?');
  const reqPath = decodeURIComponent(parsedUrl[0]);
  const reqMethod = req.method.toUpperCase();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization');

  if (reqMethod === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTING ---

  // 1. GET /api/library (Global items, categories, types)
  if (reqPath === '/api/library' && reqMethod === 'GET') {
    const library = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
    const categories = readJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
    const dataTypes = readJson(TYPES_FILE, DEFAULT_DATA_TYPES);
    const deleted = readDeleted();

    const safeLibrary = (library || []).filter(item => !deleted.codes.includes(item.id));
    const safeCategories = (categories || []).filter(cat => !deleted.categories.includes(cat));
    const safeTypes = (dataTypes || []).filter(dt => !deleted.dataTypes.includes(dt.id));

    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({
      library: safeLibrary,
      categories: safeCategories,
      dataTypes: safeTypes,
      deleted
    }));
    return;
  }

  // 2. POST /api/library/save (Upsert QR Code globally)
  if (reqPath === '/api/library/save' && reqMethod === 'POST') {
    const body = await readBody(req);
    const item = body.item;
    if (!item || !item.id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing item or item.id' }));
      return;
    }

    // A globally-deleted item must stay deleted. Suppress any re-save so it
    // can never be resurrected by a stale client or a fresh browser.
    if (isDeleted('codes', item.id)) {
      let library = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
      library = library.filter(i => i.id !== item.id);
      writeJson(LIBRARY_FILE, library);
      mirrorToSupabase(`qr_codes?id=eq.${encodeURIComponent(item.id)}`, 'DELETE');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, tombstoned: true, item }));
      return;
    }

    // Explicitly un-tombstone if user created a brand-new item reusing this ID
    removeTombstone('codes', item.id);

    const library = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
    const index = library.findIndex(i => i.id === item.id);
    item.updatedAt = new Date().toISOString();

    if (index >= 0) {
      library[index] = { ...library[index], ...item };
    } else {
      library.unshift(item);
    }
    writeJson(LIBRARY_FILE, library);

    // Asynchronously mirror to Supabase
    mirrorToSupabase('qr_codes', 'POST', {
      id: item.id,
      name: item.name,
      category: item.category || 'Tours',
      url: item.url,
      subtitle: item.subtitle || '',
      config_snapshot: item.configSnapshot || {},
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: item.updatedAt
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, item }));
    return;
  }

  // 3. POST /api/library/delete (Delete QR Code globally)
  if (reqPath === '/api/library/delete' && reqMethod === 'POST') {
    const body = await readBody(req);
    const id = body.id;
    if (!id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing id' }));
      return;
    }

    let library = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
    library = library.filter(i => i.id !== id);
    writeJson(LIBRARY_FILE, library);

    // Record durable tombstone so every client keeps it deleted forever
    upsertDeleted('codes', id);

    // Asynchronously mirror delete to Supabase
    mirrorToSupabase(`qr_codes?id=eq.${encodeURIComponent(id)}`, 'DELETE');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, id }));
    return;
  }

  // 4. POST /api/categories/save
  if (reqPath === '/api/categories/save' && reqMethod === 'POST') {
    const body = await readBody(req);
    const name = (body.name || '').trim();
    if (name) {
      removeTombstone('categories', name);
      const categories = readJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
      if (!categories.includes(name)) {
        categories.push(name);
        writeJson(CATEGORIES_FILE, categories);
        mirrorToSupabase('qr_categories', 'POST', { name });
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 5. POST /api/categories/delete
  if (reqPath === '/api/categories/delete' && reqMethod === 'POST') {
    const body = await readBody(req);
    const name = (body.name || '').trim();
    if (name) {
      upsertDeleted('categories', name);
      let categories = readJson(CATEGORIES_FILE, DEFAULT_CATEGORIES);
      categories = categories.filter(c => c !== name);
      writeJson(CATEGORIES_FILE, categories);
      mirrorToSupabase(`qr_categories?name=eq.${encodeURIComponent(name)}`, 'DELETE');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 6. POST /api/datatypes/save
  if (reqPath === '/api/datatypes/save' && reqMethod === 'POST') {
    const body = await readBody(req);
    const typeObj = body.type;
    if (typeObj && typeObj.id) {
      removeTombstone('dataTypes', typeObj.id);
      const types = readJson(TYPES_FILE, DEFAULT_DATA_TYPES);
      const idx = types.findIndex(t => t.id === typeObj.id);
      if (idx >= 0) types[idx] = typeObj;
      else types.push(typeObj);
      writeJson(TYPES_FILE, types);

      mirrorToSupabase('qr_data_types', 'POST', {
        id: typeObj.id,
        name: typeObj.name,
        prefix: typeObj.prefix || '',
        placeholder: typeObj.placeholder || '',
        hint: typeObj.hint || '',
        is_builtin: !!typeObj.isBuiltin
      });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 7. POST /api/datatypes/delete
  if (reqPath === '/api/datatypes/delete' && reqMethod === 'POST') {
    const body = await readBody(req);
    const id = body.id;
    if (id) {
      upsertDeleted('dataTypes', id);
      let types = readJson(TYPES_FILE, DEFAULT_DATA_TYPES);
      types = types.filter(t => t.id !== id);
      writeJson(TYPES_FILE, types);
      mirrorToSupabase(`qr_data_types?id=eq.${encodeURIComponent(id)}`, 'DELETE');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 8. GET /api/schema
  if (reqPath === '/api/schema') {
    const schemaPath = path.join(PUBLIC_DIR, 'supabase_schema.sql');
    fs.readFile(schemaPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not read schema file' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
    return;
  }

  // 9. GET /api/health
  if (reqPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', serverTime: new Date().toISOString() }));
    return;
  }

  // --- STATIC ASSET SERVING ---
  let filePath = path.join(PUBLIC_DIR, reqPath === '/' ? '/index.html' : reqPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  let candidate = null;
  for (const ifaceName of Object.keys(interfaces)) {
    // Skip virtual, WSL, and loopback adapters
    const isVirtual = /vEthernet|WSL|Virtual|Hyper-V|Loopback/i.test(ifaceName);
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!isVirtual) {
          return iface.address; // Preferred physical LAN/Wi-Fi
        }
        if (!candidate) candidate = iface.address;
      }
    }
  }
  return candidate || '127.0.0.1';
}

server.listen(PORT, '0.0.0.0', () => {
  const ip = getNetworkIp();
  console.log(`\n======================================================`);
  console.log(`  Sunseekers QR Engine - Multi-Device Global Sync`);
  console.log(`  💻 Laptop (Local):   http://localhost:${PORT}`);
  console.log(`  📱 Phone (Network):  http://${ip}:${PORT}`);
  console.log(`======================================================\n`);

  // Initial pull and periodic sync with Supabase cloud database
  pullFromSupabase();
  setInterval(pullFromSupabase, 15000);
});
