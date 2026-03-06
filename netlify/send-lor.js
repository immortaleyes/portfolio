// ══════════════════════════════════════════════════════════════════
//  Netlify Serverless Function: send-lor.js
//  Handles LOR Application submissions — credentials stay server-side
// ══════════════════════════════════════════════════════════════════

const https = require('https');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': 'https://ajaykushwaha.in',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Validate required fields
  const required = ['from_name','reply_to','phone','institution','programme','cgpa','association','target_university','deadline','lor_purpose','achievements'];
  for (const field of required) {
    if (!body[field]) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `Missing: ${field}` }) };
    }
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.reply_to)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  // Deadline: must be at least 30 days away (server-side enforcement)
  const deadline = new Date(body.deadline);
  const today    = new Date();
  const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 30) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Deadline must be at least 30 days from today' }) };
  }

  const sanitize = (str) => String(str || '').slice(0, 3000).replace(/<[^>]*>/g, '');

  const payload = JSON.stringify({
    service_id:  process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.LOR_TEMPLATE_ID,
    user_id:     process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      from_name:        sanitize(body.from_name),
      reply_to:         sanitize(body.reply_to),
      phone:            sanitize(body.phone),
      institution:      sanitize(body.institution),
      programme:        sanitize(body.programme),
      cgpa:             sanitize(body.cgpa),
      association:      sanitize(body.association),
      year_association: sanitize(body.year_association),
      target_university:sanitize(body.target_university),
      deadline:         sanitize(body.deadline),
      lor_purpose:      sanitize(body.lor_purpose),
      submission_mode:  sanitize(body.submission_mode),
      achievements:     sanitize(body.achievements),
      message:          sanitize(body.message),
      to_name:          'Prof. (Dr.) Ajay Shriram Kushwaha',
    },
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.emailjs.com',
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ statusCode: 200, headers, body: JSON.stringify({ success: true }) });
          } else {
            resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'Email delivery failed' }) });
          }
        });
      }
    );
    req.on('error', () =>
      resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'Network error' }) })
    );
    req.write(payload);
    req.end();
  });
};
