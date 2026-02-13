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

function generateEmergencyID() {
  return 'RID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
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

  if (req.method === 'POST') {
    const { fullName, bloodType, allergies, conditions, emergencyContact } = req.body;

    if (!fullName || !bloodType) {
      return res.status(400).json({ error: 'Name and blood type required' });
    }

    try {
      const db = readDB();
      const emergencyProfile = {
        id: generateEmergencyID(),
        fullName,
        bloodType,
        allergies: allergies || 'None',
        conditions: conditions || 'None',
        emergencyContact: emergencyContact || 'Not provided',
        createdAt: new Date().toISOString()
      };

      db.emergencies.push(emergencyProfile);
      writeDB(db);

      res.status(201).json({
        success: true,
        emergencyID: emergencyProfile.id,
        message: 'Emergency profile created'
      });
    } catch (error) {
      console.error('Emergency create error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    const { id } = req.query;
    
    try {
      const db = readDB();
      const profile = db.emergencies.find(e => e.id === id);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Emergency get error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
