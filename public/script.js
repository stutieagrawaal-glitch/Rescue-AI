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

// ===== AUTH HANDLERS =====

// Sign Up Handler
async function handleSignUp(event) {
  event.preventDefault();

  const fullName = document.getElementById('fullName')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    alert('⚠️ All fields are required');
    return;
  }

  if (!validateEmail(email)) {
    alert('⚠️ Please enter a valid email');
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
      body: JSON.stringify({
        fullName,
        email,
        password,
        confirmPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert('❌ ' + (data.error || 'Signup failed'));
      return;
    }

    // Store user info
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.fullName);
    localStorage.setItem('userEmail', data.email);

    alert('✅ ' + (data.message || 'Account created successfully!'));
    window.location.href = '/dashboard.html';

  } catch (error) {
    console.error('Signup error:', error);
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

  if (!validateEmail(email)) {
    alert('⚠️ Please enter a valid email');
    return;
  }

  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert('❌ ' + (data.error || 'Login failed'));
      return;
    }

    // Store user info
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.fullName);
    localStorage.setItem('userEmail', data.email);

    alert('✅ ' + (data.message || 'Login successful!'));
    window.location.href = '/dashboard.html';

  } catch (error) {
    console.error('Signin error:', error);
    alert('❌ Error: ' + error.message);
  }
}

// ===== DASHBOARD HELPERS =====

// Load dashboard on page load
function loadDashboard() {
  const user = getUser();
  
  if (!user.userId) {
    window.location.href = '/Sign-in.html';
    return;
  }

  // Display user name
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = user.userName || 'User';
  }
}

// ===== PAGE INITIALIZATION =====

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  // Check current page and load appropriate content
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('dashboard')) {
    loadDashboard();
  }
});
