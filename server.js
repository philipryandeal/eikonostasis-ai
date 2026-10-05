const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const CANONICAL_ORIGIN = 'https://eikonostasis.com';
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

app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', CSP);

  const host = (req.get('host') || '').toLowerCase();

  if (host.endsWith('.up.railway.app')) {
    return res.redirect(301, `${CANONICAL_ORIGIN}${req.originalUrl}`);
  }

  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {
  '/jinja': 'jinja.html',
  '/companionship': 'companionship.html',
  '/lantern': 'lantern.html',
  '/continuity': 'continuity.html',
  '/books': 'books.html',
  '/room': 'room.html',
  '/pocket': 'pocket.html',
  '/egbe': 'egbe.html',
  '/layers': 'layers.html'
};

Object.keys(rooms).forEach((route) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', rooms[route]));
  });
});

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log('The Digital Jinja is open on port ' + PORT);
});
