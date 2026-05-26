// Vercel Serverless Function — Health Check
// GET /api/health

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  return res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
}
