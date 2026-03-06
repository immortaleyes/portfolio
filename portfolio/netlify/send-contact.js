// ══════════════════════════════════════════════════════════════════
//  Netlify Serverless Function: send-contact.js
//  Handles Contact Form submissions — credentials stay server-side
//  Environment variables are set in Netlify Dashboard (never in HTML)
// ══════════════════════════════════════════════════════════════════

const https = require('https');

exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers
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

  // Validate required fields server-side too
  const { from_name, reply_to, subject, message } = body;
  if (!from_name || !reply_to || !subject || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply_to)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  // Sanitize inputs (prevent injection)
  const sanitize = (str) => String(str).slice(0, 2000).replace(/<[^>]*>/g, '');

  // Build EmailJS payload — keys come from Netlify env vars, NOT exposed to client
  const payload = JSON.stringify({
    service_id:  process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.CONTACT_TEMPLATE_ID,
    user_id:     process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      from_name:    sanitize(from_name),
      reply_to:     sanitize(reply_to),
      organisation: sanitize(body.organisation || 'Not provided'),
      subject:      sanitize(subject),
      message:      sanitize(message),
      to_name:      'Prof. (Dr.) Ajay Shriram Kushwaha',
    },
  });

  // Call EmailJS REST API from server (not client)
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
        res.on('data', (chunk) => (data += chunk));
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
