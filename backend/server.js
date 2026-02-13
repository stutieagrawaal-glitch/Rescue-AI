const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Database path
const dbPath = path.join(__dirname, 'database.json');

// ===== DATABASE HELPERS =====
function readDB() {
  if (!fs.existsSync(dbPath)) {
    return { users: [], emergencies: [] };
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data || '{"users":[],"emergencies":[]}');
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateEmergencyID() {
  return 'RID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// ===== AUTH ROUTES =====

// Sign Up
app.post('/api/signup', (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  // Validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const db = readDB();

  // Check if email already exists
  if (db.users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Create user
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
});

// Sign In
app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === hashPassword(password));

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Log the login
  const loginRecord = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    loginTime: new Date().toISOString()
  };

  res.json({
    success: true,
    userId: user.id,
    fullName: user.fullName,
    email: user.email
  });
});

// ===== EMERGENCY PROFILE ROUTES =====

// Create Complete Emergency Profile
app.post('/api/emergency', (req, res) => {
  const {
    userId,
    fullName,
    age,
    bloodType,
    contactNo,
    alternateContactNo,
    permanentAddress,
    medicalHistory,
    allergies,
    medicines
  } = req.body;

  if (!fullName || !age || !bloodType) {
    return res.status(400).json({ error: 'Name, age, and blood type are required' });
  }

  const db = readDB();

  const emergencyProfile = {
    id: generateEmergencyID(),
    userId: userId || 'anonymous',
    fullName,
    age,
    bloodType,
    contactNo: contactNo || 'Not provided',
    alternateContactNo: alternateContactNo || 'Not provided',
    permanentAddress: permanentAddress || 'Not provided',
    medicalHistory: medicalHistory || 'None',
    allergies: allergies || 'None',
    medicines: medicines || 'None',
    createdAt: new Date().toISOString()
  };

  db.emergencies.push(emergencyProfile);
  writeDB(db);

  res.status(201).json({
    success: true,
    emergencyID: emergencyProfile.id,
    message: 'Emergency profile created successfully'
  });
});

// Get Emergency Profile by ID (No Auth Required)
app.get('/api/emergency/:id', (req, res) => {
  const db = readDB();
  const profile = db.emergencies.find(e => e.id === req.params.id);

  if (!profile) {
    return res.status(404).json({ error: 'Emergency profile not found' });
  }

  res.json(profile);
});

// ===== QR CODE GENERATION =====

// Generate QR (returns the Emergency ID to be used in QR)
app.post('/api/generate-qr', (req, res) => {
  const { emergencyID } = req.body;

  if (!emergencyID) {
    return res.status(400).json({ error: 'Emergency ID required' });
  }

  const db = readDB();
  const profile = db.emergencies.find(e => e.id === emergencyID);

  if (!profile) {
    return res.status(404).json({ error: 'Emergency profile not found' });
  }

  // Return QR data - the actual QR image is generated on frontend using qrserver
  const qrUrl = `${req.protocol}://${req.get('host')}/emergency.html?id=${emergencyID}`;

  res.json({
    success: true,
    emergencyID: emergencyID,
    qrUrl: qrUrl,
    qrApiUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`
  });
});

// ===== SERVE STATIC FILES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});