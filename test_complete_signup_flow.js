#!/usr/bin/env node

/**
 * Complete Signup Flow Test - Simulates user actions
 */

const API_URL = 'http://192.168.100.91:8000';

// Simulate state management
let appState = {
  loading: false,
  showWhatsAppFlow: false,
  phoneNumber: '',
  otp: '',
  otpSent: false,
  currentRole: 'patient',
  authToken: null,
  userId: null,
  userRole: null
};

// Mock navigation
const navigation = {
  currentScreen: 'Signup',
  navigate: function(screen) {
    console.log(`📱 NAVIGATION: ${this.currentScreen} → ${screen}`);
    this.currentScreen = screen;
    return true;
  }
};

// Mock SecureStore
const SecureStore = {
  storage: {},
  setItemAsync: async function(key, value) {
    this.storage[key] = value;
    console.log(`💾 STORED: ${key} = ${value.substring(0, 50)}...`);
  },
  getItemAsync: async function(key) {
    return this.storage[key];
  }
};

// Simulate getRoleBasedHomeScreen
function getRoleBasedHomeScreen(role) {
  const mapping = {
    'patient': 'Landing',
    'caregiver': 'Landing',
    'doctor': 'DoctorHome',
    'medical_staff': 'MedicalStaffHome',
    'ambulance_staff': 'AmbulanceStaffHome',
    'lab_staff': 'LabStaffHome',
    'pharmacy_staff': 'PharmacyStaffHome',
    'clinic_admin': 'ClinicAdminHome'
  };
  return mapping[role] || 'Landing';
}

// Simulate sendWhatsAppOTP function
async function sendWhatsAppOTP() {
  console.log('\n🔵 USER ACTION: Click "Send OTP" button');
  console.log(`   Phone: ${appState.phoneNumber}`);
  console.log(`   Role: ${appState.currentRole}`);
  
  if (!appState.phoneNumber || appState.phoneNumber.trim() === '') {
    console.log('❌ ERROR: Empty phone number');
    return false;
  }
  
  appState.loading = true;
  console.log('⏳ Loading: true');
  
  try {
    const role = appState.currentRole || 'patient';
    
    console.log(`📡 API CALL: POST ${API_URL}/auth/whatsapp/send-otp`);
    const response = await fetch(`${API_URL}/auth/whatsapp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone_number: appState.phoneNumber, 
        role: role 
      })
    });
    
    const data = await response.json();
    console.log(`📥 API RESPONSE: ${response.status}`, data);
    
    if (response.ok && data && data.success) {
      console.log('✅ SUCCESS');
      appState.otpSent = true;
      console.log('🔄 STATE UPDATE: otpSent = true');
      console.log('📱 UI CHANGE: Show OTP input screen');
      return true;
    } else {
      console.log('❌ FAILED:', data.detail || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    return false;
  } finally {
    appState.loading = false;
    console.log('⏳ Loading: false');
  }
}

// Simulate verifyWhatsAppOTP function
async function verifyWhatsAppOTP() {
  console.log('\n🔵 USER ACTION: Click "Verify Code" button');
  console.log(`   OTP: ${appState.otp}`);
  
  if (!appState.otp || appState.otp.trim() === '') {
    console.log('❌ ERROR: Empty OTP');
    return false;
  }
  
  appState.loading = true;
  
  try {
    const role = appState.currentRole || 'patient';
    const userName = appState.phoneNumber;
    
    console.log(`📡 API CALL: POST ${API_URL}/auth/whatsapp/verify-otp`);
    const response = await fetch(`${API_URL}/auth/whatsapp/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: appState.phoneNumber,
        otp: appState.otp,
        role: role,
        name: userName
      })
    });
    
    const verifyData = await response.json();
    console.log(`📥 API RESPONSE: ${response.status}`, verifyData);
    
    if (response.ok && verifyData) {
      console.log('✅ VERIFICATION SUCCESS');
      
      // Store auth data
      if (verifyData.access_token) await SecureStore.setItemAsync('auth_token', verifyData.access_token);
      if (verifyData.role) await SecureStore.setItemAsync('user_role', verifyData.role);
      if (verifyData.user_id) await SecureStore.setItemAsync('user_id', verifyData.user_id);
      await SecureStore.setItemAsync('user_name', userName);
      await SecureStore.setItemAsync('user_email', appState.phoneNumber);
      
      appState.authToken = verifyData.access_token;
      appState.userId = verifyData.user_id;
      appState.userRole = verifyData.role;
      
      // Navigate
      if (verifyData.profile_complete) {
        const homeScreen = getRoleBasedHomeScreen(verifyData.role || 'patient');
        console.log(`✅ Profile complete, navigating to ${homeScreen}`);
        navigation.navigate(homeScreen);
      } else {
        console.log('📝 Profile incomplete, showing profile form');
        navigation.navigate('ProfileCompletion');
      }
      return true;
    } else {
      console.log('❌ VERIFICATION FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    return false;
  } finally {
    appState.loading = false;
  }
}

// Test complete flow for a role
async function testRoleSignup(role, phone) {
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 TESTING ROLE: ${role.toUpperCase()}`);
  console.log('='.repeat(60));
  
  // Reset state
  appState = {
    loading: false,
    showWhatsAppFlow: true,
    phoneNumber: phone,
    otp: '',
    otpSent: false,
    currentRole: role,
    authToken: null,
    userId: null,
    userRole: null
  };
  navigation.currentScreen = 'WhatsAppSignup';
  
  console.log('\n📱 SCREEN: WhatsApp Signup');
  console.log(`   User enters phone: ${phone}`);
  console.log(`   Selected role: ${role}`);
  
  // Step 1: Send OTP
  const sendSuccess = await sendWhatsAppOTP();
  if (!sendSuccess) {
    console.log('\n❌ TEST FAILED: Could not send OTP');
    return false;
  }
  
  // Get OTP from backend logs
  await new Promise(resolve => setTimeout(resolve, 1000));
  const { execSync } = require('child_process');
  try {
    const logOutput = execSync(`tail -20 backend/backend.log | grep "✓ OTP sent to ${phone}" | tail -1`).toString();
    const otpMatch = logOutput.match(/: (\d{6})/);
    if (otpMatch) {
      appState.otp = otpMatch[1];
      console.log(`\n📱 USER ACTION: Enter OTP from WhatsApp`);
      console.log(`   OTP entered: ${appState.otp}`);
    } else {
      console.log('\n⚠️  Could not extract OTP from logs');
      return false;
    }
  } catch (e) {
    console.log('\n⚠️  Could not read backend logs');
    return false;
  }
  
  // Step 2: Verify OTP
  const verifySuccess = await verifyWhatsAppOTP();
  if (!verifySuccess) {
    console.log('\n❌ TEST FAILED: Could not verify OTP');
    return false;
  }
  
  // Check final state
  console.log('\n📊 FINAL STATE:');
  console.log(`   Current Screen: ${navigation.currentScreen}`);
  console.log(`   Auth Token: ${appState.authToken ? '✅ Present' : '❌ Missing'}`);
  console.log(`   User ID: ${appState.userId || '❌ Missing'}`);
  console.log(`   User Role: ${appState.userRole || '❌ Missing'}`);
  
  const expectedScreen = getRoleBasedHomeScreen(role);
  const success = navigation.currentScreen === expectedScreen || navigation.currentScreen === 'ProfileCompletion';
  
  console.log(`\n${success ? '✅' : '❌'} TEST ${success ? 'PASSED' : 'FAILED'}`);
  console.log(`   Expected: ${expectedScreen} or ProfileCompletion`);
  console.log(`   Got: ${navigation.currentScreen}`);
  
  return success;
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 COMPLETE SIGNUP FLOW TESTS');
  console.log('Testing all roles with WhatsApp signup\n');
  
  const roles = [
    { role: 'patient', phone: '+593998118001' },
    { role: 'caregiver', phone: '+593998118002' },
    { role: 'doctor', phone: '+593998118003' },
    { role: 'medical_staff', phone: '+593998118004' },
    { role: 'ambulance_staff', phone: '+593998118005' }
  ];
  
  const results = [];
  
  for (const { role, phone } of roles) {
    const success = await testRoleSignup(role, phone);
    results.push({ role, success });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  results.forEach(({ role, success }) => {
    console.log(`${success ? '✅' : '❌'} ${role.padEnd(20)} ${success ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = results.every(r => r.success);
  console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

runAllTests().catch(console.error);
