import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'rescue-ai';
const USERS_COLLECTION = 'users';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  // CORS headers
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

  const client = new MongoClient(MONGODB_URI);

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    // Find user and verify password
    const user = await usersCollection.findOne({ 
      email: email,
      password: hashPassword(password)
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log the login
    const loginCollection = db.collection('logins');
    await loginCollection.insertOne({
      userId: user._id,
      email: user.email,
      loginTime: new Date()
    });

    return res.status(200).json({
      success: true,
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  } finally {
    await client.close();
  }
}
