const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const CANONICAL_ORIGIN = 'https://eikonostasis.com';

app.use((req, res, next) => {
  const host = (req.get('host') || '').toLowerCase();

  if (host.endsWith('.up.railway.app')) {
    return res.redirect(301, `${CANONICAL_ORIGIN}${req.originalUrl}`);
  }

  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/jinja', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'jinja.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('The Digital Jinja is open on port ' + PORT);
});
