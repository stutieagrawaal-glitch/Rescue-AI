const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'database.json');

function readDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { users: [], emergencies: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data || '{"users":[],"emergencies":[]}');
  } catch (error) {
    return { users: [], emergencies: [] };
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === hashPassword(password));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      userId: user.id,
      fullName: user.fullName,
      email: user.email
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}