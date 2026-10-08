const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CANONICAL_ROOT = 'https://eikonostasis.com/';
const CSP = [
  "default-src 'self'",
  "script-src 'none'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join('; ');

// Build the redirect target on the canonical host only. The request path and
// query are re-parsed and appended after the fixed host and slash, so a crafted
// request line can never send a visitor to another site.
function canonicalUrl(req) {
  try {
    const u = new URL(req.originalUrl, CANONICAL_ROOT);
    return CANONICAL_ROOT + (u.pathname + u.search).replace(/^\/+/, '');
  } catch {
    return CANONICAL_ROOT;
  }
}

// Security headers go on every response: pages, static files, redirects, 404s.
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Frame-Options', 'DENY');

  const host = (req.get('host') || '').toLowerCase();

  if (host.endsWith('.up.railway.app')) {
    return res.redirect(301, canonicalUrl(req));
  }

  next();
});

app.use(express.static(PUBLIC_DIR));

// Room pages and the 404 page are read once at startup and served from
// memory, so requests never touch the disk after the house opens.
const rooms = {
  '/jinja': 'jinja.html',
  '/companionship': 'companionship.html',
  '/lantern': 'lantern.html',
  '/continuity': 'continuity.html',
  '/books': 'books.html',
  '/room': 'room.html',
  '/pocket': 'pocket.html',
  '/egbe': 'egbe.html',
  '/layers': 'layers.html',
  '/threshold': 'threshold.html'
};

const sendPage = (res, status, body) => res.status(status)
  .set('Content-Type', 'text/html; charset=UTF-8')
  .set('Cache-Control', 'public, max-age=0')
  .send(body);

Object.entries(rooms).forEach(([route, file]) => {
  const page = fs.readFileSync(path.join(PUBLIC_DIR, file));
  app.get(route, (req, res) => sendPage(res, 200, page));
});

const NOT_FOUND_PAGE = fs.readFileSync(path.join(PUBLIC_DIR, '404.html'));
app.use((req, res) => sendPage(res, 404, NOT_FOUND_PAGE));

app.listen(PORT, () => {
  console.log('The Digital Jinja is open on port ' + PORT);
});
