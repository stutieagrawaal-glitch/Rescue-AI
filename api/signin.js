const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = async (req, res) => {
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

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Temporary hardcoded users for testing
    const testUsers = [
      {
        id: 'user_1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: hashPassword('123456')
      },
      {
        id: 'user_2',
        fullName: 'Stutie Agrawaal',
        email: 'stutieagrawaal@gmail.com',
        password: hashPassword('123456')
      }
    ];

    // Find user and verify password
    const user = testUsers.find(u => 
      u.email === email && u.password === hashPassword(password)
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      success: true,
      userId: user.id,
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
  }
};
