#!/usr/bin/env node

/**
 * Test Doctor Redirect
 * 
 * This script tests that when a doctor logs in:
 * 1. They are authenticated successfully
 * 2. They are redirected to DoctorHome (not Landing)
 * 3. They see doctor-specific content (not patient buttons)
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.100.95:8000';

const log = {
  info: (msg, data) => console.log(`ℹ️  ${msg}`, data || ''),
  success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
  error: (msg, data) => console.log(`❌ ${msg}`, data || ''),
  test: (msg) => console.log(`\n🧪 TEST: ${msg}\n${'='.repeat(60)}`)
};

async function loginAsDoctor() {
  log.test('Login as Doctor');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@test.com',
        password: 'Test123!'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      log.success('Doctor logged in successfully');
      log.info('User ID:', data.user_id);
      log.info('Role:', data.role);
      log.info('Name:', data.name);
      
      // Verify role is doctor
      if (data.role === 'doctor') {
        log.success('✓ Role is correctly set to "doctor"');
      } else {
        log.error(`✗ Role is "${data.role}" but should be "doctor"`);
        return null;
      }
      
      return data;
    } else {
      log.error('Login failed:', data);
      return null;
    }
  } catch (error) {
    log.error('Login error:', error.message);
    return null;
  }
}

async function loginAsPatient() {
  log.test('Login as Patient (for comparison)');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@test.com',
        password: 'Test123!'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      log.success('Patient logged in successfully');
      log.info('Role:', data.role);
      
      if (data.role === 'patient') {
        log.success('✓ Role is correctly set to "patient"');
      } else {
        log.error(`✗ Role is "${data.role}" but should be "patient"`);
      }
      
      return data;
    } else {
      log.error('Login failed:', data);
      return null;
    }
  } catch (error) {
    log.error('Login error:', error.message);
    return null;
  }
}

async function main() {
  console.log('\n🧪 DOCTOR REDIRECT TEST\n');
  console.log('='.repeat(60));
  console.log('This test verifies that doctors are redirected correctly\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Doctor Login
  const doctorAuth = await loginAsDoctor();
  if (doctorAuth && doctorAuth.role === 'doctor') {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Patient Login (for comparison)
  const patientAuth = await loginAsPatient();
  if (patientAuth && patientAuth.role === 'patient') {
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log('='.repeat(60));

  console.log('\n📋 WHAT TO CHECK IN THE APP:');
  console.log('='.repeat(60));
  console.log('1. Login as doctor@test.com / Test123!');
  console.log('2. Watch Expo logs for:');
  console.log('   - "🔍 LandingScreen: User role: doctor"');
  console.log('   - "ℹ️ Redirecting doctor to their dashboard"');
  console.log('   - Should navigate to DoctorHome');
  console.log('');
  console.log('3. Verify doctor sees:');
  console.log('   - Doctor-specific dashboard');
  console.log('   - NOT patient buttons (Emergency, Find Doctor)');
  console.log('   - Doctor features (My Appointments, Availability, etc.)');
  console.log('');
  console.log('4. Login as patient@test.com / Test123!');
  console.log('5. Verify patient sees:');
  console.log('   - Landing page with patient buttons');
  console.log('   - Emergency, Find Doctor, Prescriptions, etc.');
  console.log('='.repeat(60));

  if (failed === 0) {
    log.success('\n✅ Backend authentication works correctly!');
    console.log('Now test the frontend redirect in the app.\n');
    process.exit(0);
  } else {
    log.error('\n❌ Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  log.error('Fatal error:', error);
  process.exit(1);
});
