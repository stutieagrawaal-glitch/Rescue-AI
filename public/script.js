// Enhanced QR generation with backend integration
async function generateQRWithBackend(event) {
  if (event) event.preventDefault();

  // Get form values
  const fname = document.getElementById('fname')?.value;
  const age = document.getElementById('age')?.value;
  const bloodType = document.getElementById('gender')?.value;
  const contactNo = document.getElementById('number')?.value;
  const alternateContactNo = document.getElementById('alternate')?.value;
  const permanentAddress = document.getElementById('address')?.value;
  const medicalHistory = document.getElementById('medical')?.value;
  const bio = document.getElementById('bio')?.value;
  const medicines = document.getElementById('medicines')?.value;

  // Validation
  if (!fname) {
    alert('⚠️ Please enter your full name');
    return;
  }

  if (!bloodType) {
    alert('⚠️ Please select your blood type');
    return;
  }

  try {
    // Create emergency profile on backend
    const response = await fetch('/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fname,
        age: age || '--',
        bloodType: bloodType || 'Not specified',
        contactNo: contactNo || '--',
        alternateContactNo: alternateContactNo || '--',
        permanentAddress: permanentAddress || '--',
        medicalHistory: medicalHistory || 'None recorded',
        allergies: bio || 'No known allergies',
        medicines: medicines || 'None',
        emergencyContact: contactNo || '--'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert('❌ Error: ' + (data.error || 'Failed to create profile'));
      return;
    }

    // Generate QR code
    const emergencyID = data.emergencyID;
    const qrUrl = `${window.location.origin}/emergency.html?id=${emergencyID}`;
    
    const size = '300x300';
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const qrImageUrl = `${baseUrl}?size=${size}&data=${encodeURIComponent(qrUrl)}`;

    // Display QR
    const qrImage = document.getElementById('qrImage');
    const qrContainer = document.getElementById('qr-container');

    if (qrImage && qrContainer) {
      qrImage.src = qrImageUrl;
      qrContainer.style.display = 'block';

      qrImage.onload = function () {
        qrImage.style.display = 'inline-block';
        console.log('✅ QR Code generated successfully!');
        alert('✅ QR Code generated! Emergency ID: ' + emergencyID);
      };

      qrImage.onerror = function () {
        alert('❌ Failed to generate QR code. Check internet connection.');
        console.error('QR generation failed');
      };
    }

  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error: ' + error.message);
  }
}
