// Vercel Serverless Function — Contact API
// Converts the Express /api/contact endpoint to a Vercel-compatible handler
// Environment variables: RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_TO_EMAIL
// Set these in Vercel Dashboard → Settings → Environment Variables

import { Resend } from 'resend';

// --- In-memory rate limiting for serverless ---
// Note: In serverless, each cold start resets this. For production-grade
// rate limiting, use Vercel's built-in middleware or an external store like Redis.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (entry.count >= MAX_REQUESTS) {
    return true;
  }
  
  entry.count++;
  return false;
}

// --- Validation Helpers ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitize = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- CORS Headers ---
const ALLOWED_ORIGINS = [
  'https://rakeshinfo.in',
  'https://www.rakeshinfo.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
];

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// --- Main Handler ---
export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const corsHeaders = getCorsHeaders(origin);
  
  // Set CORS headers on every response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               req.headers['x-real-ip'] || 
               'unknown';
    
    if (isRateLimited(ip)) {
      return res.status(429).json({ 
        error: 'RATE_LIMIT_EXCEEDED — max 3 messages per 5 minutes. Try again later.' 
      });
    }

    const { name, email, message, website } = req.body;

    // Honeypot — if filled, silently succeed (it's a bot)
    if (website) {
      return res.json({ success: true });
    }

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters.' });
    }
    if (name.length > 100 || email.length > 254 || message.length > 5000) {
      return res.status(400).json({ error: 'Input exceeds maximum length.' });
    }

    // Send via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_TO_EMAIL || 'kumarpatelrakesh222@gmail.com',
      subject: `Portfolio Contact — ${sanitize(name.trim())}`,
      html: `
        <div style="font-family: monospace; background: #0a0a0a; color: #e5e5e5; padding: 40px; border: 1px solid #1a1a1a;">
          <h2 style="color: #06b6d4; margin-bottom: 24px; letter-spacing: 0.1em;">NEW_TRANSMISSION</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #06b6d4; padding: 12px 0; border-bottom: 1px solid #1a1a1a; width: 140px; vertical-align: top;">IDENT_SIGNATURE</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">${sanitize(name.trim())}</td>
            </tr>
            <tr>
              <td style="color: #06b6d4; padding: 12px 0; border-bottom: 1px solid #1a1a1a; vertical-align: top;">COMM_PATH</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a;">${sanitize(email.trim())}</td>
            </tr>
            <tr>
              <td style="color: #06b6d4; padding: 12px 0; vertical-align: top;">DATA_PAYLOAD</td>
              <td style="padding: 12px 0; white-space: pre-wrap;">${sanitize(message.trim())}</td>
            </tr>
          </table>
          <p style="color: #555; font-size: 11px; margin-top: 32px; border-top: 1px solid #1a1a1a; padding-top: 16px;">
            Sent from Portfolio Contact Form · ${new Date().toISOString()}
          </p>
        </div>
      `,
      replyTo: email.trim(),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }

    console.log(`Email sent: ${data.id} from ${email}`);
    return res.json({ success: true, id: data.id });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
