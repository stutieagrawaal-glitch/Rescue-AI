const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateRescueId() {
  return `RESCUE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

module.exports = (req, res) => {
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

  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Generate Rescue ID
    const rescueId = generateRescueId();

    // Return success with Rescue ID
    return res.status(201).json({
      success: true,
      userId: `user_${Date.now()}`,
      rescueId: rescueId,
      fullName,
      email,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
