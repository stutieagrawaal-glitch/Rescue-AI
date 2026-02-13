import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'rescue-ai';
const EMERGENCY_COLLECTION = 'emergency_profiles';

function generateEmergencyID() {
  return 'RID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
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

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const emergencyCollection = db.collection(EMERGENCY_COLLECTION);

    if (req.method === 'POST') {
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

      if (!fullName || !bloodType) {
        return res.status(400).json({ error: 'Name and blood type required' });
      }

      const emergencyProfile = {
        userId: userId ? ObjectId(userId) : null,
        fullName,
        age,
        bloodType,
        contactNo,
        alternateContactNo,
        permanentAddress,
        medicalHistory,
        allergies,
        medicines,
        emergencyID: generateEmergencyID(),
        createdAt: new Date()
      };

      const result = await emergencyCollection.insertOne(emergencyProfile);

      return res.status(201).json({
        success: true,
        emergencyID: emergencyProfile.emergencyID,
        profileId: result.insertedId.toString(),
        fullName,
        bloodType,
        message: 'Emergency profile created'
      });

    } else if (req.method === 'GET') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Emergency ID required' });
      }

      const profile = await emergencyCollection.findOne({
        emergencyID: id
      });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.status(200).json({
        success: true,
        id: profile.emergencyID,
        fullName: profile.fullName,
        age: profile.age,
        bloodType: profile.bloodType,
        contactNo: profile.contactNo,
        alternateContactNo: profile.alternateContactNo,
        permanentAddress: profile.permanentAddress,
        medicalHistory: profile.medicalHistory,
        allergies: profile.allergies,
        medicines: profile.medicines
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Emergency error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  } finally {
    await client.close();
  }
}
