// ===== GLOBAL UTILITIES =====

// Show/Hide alerts
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} show`;
  alertDiv.textContent = message;
  
  const container = document.body.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 5000);
}

// Get user from localStorage
function getUser() {
  return {
    userId: localStorage.getItem('userId'),
    userName: localStorage.getItem('userName')
  };
}

// Logout
function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  window.location.href = '/Sign-in.html';
}

// ===== FORM HELPERS =====

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate password strength
function validatePassword(password) {
  return password.length >= 6;
}

// ===== EMERGENCY PROFILE HANDLER =====

// Enhanced QR generation with backend integration
async function generateQRWithBackend(event) {
  if (event) event.preventDefault();

  // Get form values
  const fname = document.getElementById('fname')?.value;
  const bloodType = document.getElementById('gender')?.value;
  const bio = document.getElementById('bio')?.value;
  const facebook = document.getElementById('facebook')?.value;
  const number = document.getElementById('number')?.value;

  // Validation
  if (!fname) {
    alert('⚠️ Please enter your full name');
    return;
  }

  try {
    // Create emergency profile on backend
    const response = await fetch('/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fname,
        bloodType: bloodType || 'Not specified',
        allergies: bio || 'None',
        conditions: bio || 'None',
        emergencyContact: number || 'Not provided'
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

// ===== AUTH HANDLERS =====

// Sign Up Handler
async function handleSignUp(event) {
  event.preventDefault();

  const fullName = document.getElementById('full-name')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirm-password')?.value;

  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    alert('⚠️ All fields are required');
    return;
  }

  if (!validateEmail(email)) {
    alert('⚠️ Invalid email address');
    return;
  }

  if (!validatePassword(password)) {
    alert('⚠️ Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    alert('⚠️ Passwords do not match');
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, confirmPassword })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Account created successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/Sign-in.html';
      }, 1500);
    } else {
      alert('❌ ' + (data.error || 'Failed to create account'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error: ' + error.message);
  }
}

// Sign In Handler
async function handleSignIn(event) {
  event.preventDefault();

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  // Validation
  if (!email || !password) {
    alert('⚠️ Email and password are required');
    return;
  }

  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save user session
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.fullName);
      
      alert('✅ Login successful!');
      setTimeout(() => {
        window.location.href = '/form.html';
      }, 1500);
    } else {
      alert('❌ ' + (data.error || 'Invalid credentials'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error: ' + error.message);
  }
}

// ===== EMERGENCY PAGE LOADER =====

// Load emergency profile on emergency.html page
async function loadEmergencyProfile() {
  const params = new URLSearchParams(window.location.search);
  const emergencyID = params.get('id');

  if (!emergencyID) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('errorMessage').textContent = 'No emergency profile ID provided';
    return;
  }

  try {
    const response = await fetch(`/api/emergency/${emergencyID}`);

    if (!response.ok) {
      throw new Error('Profile not found');
    }

    const data = await response.json();

    // Populate profile
    document.getElementById('profileName').textContent = data.fullName;
    document.getElementById('profileBlood').textContent = data.bloodType;
    document.getElementById('profileAllergies').textContent = data.allergies;
    document.getElementById('profileConditions').textContent = data.conditions;

    // Format contact as phone link
    const contact = document.getElementById('profileContact');
    contact.textContent = data.emergencyContact;
    contact.href = `tel:${data.emergencyContact.replace(/\D/g, '')}`;

    document.getElementById('loading').style.display = 'none';
    document.getElementById('profile').style.display = 'block';

  } catch (error) {
    console.error('Error:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('errorMessage').textContent = 'Error: ' + error.message;
  }
}

// ===== PAGE INITIALIZATION =====

// Auto-attach form handlers on page load
document.addEventListener('DOMContentLoaded', function () {
  // Sign Up form
  const signUpForm = document.querySelector('form[action="#"]');
  if (signUpForm && window.location.pathname.includes('Sign-up')) {
    signUpForm.addEventListener('submit', handleSignUp);
  }

  // Sign In form
  if (window.location.pathname.includes('Sign-in')) {
    const signInForm = document.querySelector('form');
    if (signInForm) {
      signInForm.addEventListener('submit', handleSignIn);
    }
  }

  // Emergency profile form
  if (window.location.pathname.includes('form.html')) {
    const submitBtn = document.querySelector('button[onclick*="displayQR"]');
    if (submitBtn) {
      submitBtn.onclick = function (e) {
        generateQRWithBackend(e);
      };
    }
  }

  // Emergency page loader
  if (window.location.pathname.includes('emergency.html')) {
    loadEmergencyProfile();
  }
});

// ===== UTILITY FUNCTIONS =====

// Print function for emergency profile
function printProfile() {
  window.print();
}

// Navigate home
function goHome() {
  window.location.href = '/';
}