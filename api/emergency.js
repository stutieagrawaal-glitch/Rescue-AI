module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { fullName, bloodType, allergies, conditions, emergencyContact } = req.body;

      if (!fullName || !bloodType) {
        return res.status(400).json({ error: 'Name and blood type required' });
      }

      const emergencyID = `RID-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      return res.status(201).json({
        success: true,
        emergencyID: emergencyID,
        fullName,
        bloodType,
        allergies: allergies || 'None',
        conditions: conditions || 'None',
        emergencyContact: emergencyContact || 'Not provided',
        message: 'Emergency profile created'
      });
    } catch (error) {
      console.error('Emergency POST error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.toString()
      });
    }
  } 
  else if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Emergency ID required' });
      }

      return res.status(200).json({
        id: id,
        fullName: 'Test User',
        bloodType: 'O+',
        allergies: 'None',
        conditions: 'None',
        emergencyContact: '+1234567890'
      });
    } catch (error) {
      console.error('Emergency GET error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.toString()
      });
    }
  }
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};
