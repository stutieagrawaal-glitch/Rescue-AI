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

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
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

  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const db = readDB();

    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
      id: crypto.randomUUID(),
      fullName,
      email,
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({ 
      success: true, 
      userId: newUser.id,
      message: 'Account created successfully' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
