import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';

const app = express();
const PORT = process.env.API_PORT || 3001;

// --- Middleware ---
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  methods: ['POST'],
}));

// --- Rate Limiting ---
// Global: max 100 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// Contact-specific: max 3 emails per 5 min per IP
const contactLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED — max 3 messages per 5 minutes. Try again later.' },
});

// --- Resend Client ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Validation Helpers ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitize = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Contact Endpoint ---
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
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
    res.json({ success: true, id: data.id });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`Contact API running on http://localhost:${PORT}`);
});
