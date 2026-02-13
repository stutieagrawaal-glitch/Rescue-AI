// In-memory storage for demo purposes
const emergencyProfiles = {};

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
      const { 
        fullName, 
        age,
        bloodType, 
        contactNo,
        alternateContactNo,
        permanentAddress,
        medicalHistory,
        allergies, 
        medicines, 
        emergencyContact 
      } = req.body;

      if (!fullName || !bloodType) {
        return res.status(400).json({ error: 'Name and blood type required' });
      }

      // Generate unique emergency ID
      const emergencyID = `RID-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Store profile in memory
      emergencyProfiles[emergencyID] = {
        id: emergencyID,
        fullName,
        age: age || '--',
        bloodType,
        contactNo: contactNo || '--',
        alternateContactNo: alternateContactNo || '--',
        permanentAddress: permanentAddress || '--',
        medicalHistory: medicalHistory || 'None recorded',
        allergies: allergies || 'No known allergies',
        medicines: medicines || 'None',
        emergencyContact: emergencyContact || '--',
        createdAt: new Date()
      };

      return res.status(201).json({
        success: true,
        emergencyID: emergencyID,
        fullName,
        bloodType,
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

      // Retrieve profile from memory
      const profile = emergencyProfiles[id];

      if (!profile) {
        return res.status(404).json({ 
          success: false,
          error: 'Profile not found' 
        });
      }

      return res.status(200).json({
        success: true,
        ...profile
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
