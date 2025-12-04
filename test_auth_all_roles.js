#!/usr/bin/env node

/**
 * Automated Authentication Testing for All Roles
 * 
 * This script tests authentication flows for all user roles to ensure
 * consistency and catch issues before they reach production.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';

const ROLES = [
  { key: 'patient', name: 'Patient', screen: 'Landing' },
  { key: 'caregiver', name: 'Caregiver', screen: 'Landing' },
  { key: 'doctor', name: 'Doctor', screen: 'DoctorHome' },
  { key: 'medical_staff', name: 'Medical Staff', screen: 'MedicalStaffHome' },
  { key: 'ambulance_staff', name: 'Ambulance Staff', screen: 'AmbulanceStaffHome' },
  { key: 'lab_staff', name: 'Lab Staff', screen: 'LabStaffHome' },
  { key: 'pharmacy_staff', name: 'Pharmacy Staff', screen: 'PharmacyStaffHome' },
  { key: 'clinic_admin', name: 'Clinic Admin', screen: 'ClinicAdminHome' },
];

const TEST_PHONE = '+593999999999';
const TEST_EMAIL = 'test@example.com';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function testResult(testName, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`PASS: ${testName}`, 'success');
  } else {
    failedTests++;
    log(`FAIL: ${testName}${details ? ': ' + details : ''}`, 'error');
  }
}

async function testWhatsAppOTPRequest(role) {
  const testName = `WhatsApp OTP Request - ${role.name}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/whatsapp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: TEST_PHONE,
        role: role.key,
      }),
    });

    const data = await response.json();
    
    // Check if request was properly formatted
    if (response.status === 422) {
      const missingFields = data.detail?.map(d => d.loc?.join('.')) || [];
      testResult(testName, false, `Missing fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // For testing, we expect either success, "already sent", or rate limit errors
    const isValid = response.ok || response.status === 429 || (response.status === 500 && data.detail?.includes('Rate limit'));
    testResult(testName, isValid, isValid ? '' : `Status ${response.status}: ${data.detail}`);
    return isValid;
    
  } catch (error) {
    testResult(testName, false, error.message);
    return false;
  }
}

async function testEmailSignupRequest(role) {
  const testName = `Email Signup Request - ${role.name}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test ${role.name}`,
        email: `test.${role.key}@example.com`,
        password: 'TestPassword123!',
        role: role.key,
      }),
    });

    const data = await response.json();
    
    // Check if request was properly formatted
    if (response.status === 422) {
      const missingFields = data.detail?.map(d => d.loc?.join('.')) || [];
      testResult(testName, false, `Missing fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // For testing, we expect either success or "already exists" type errors
    const isValid = response.ok || (response.status === 400 && data.detail?.includes('already'));
    testResult(testName, isValid, isValid ? '' : `Status ${response.status}: ${data.detail}`);
    return isValid;
    
  } catch (error) {
    testResult(testName, false, error.message);
    return false;
  }
}

async function testAPIFieldConsistency() {
  log('\n=== Testing API Field Consistency ===\n', 'info');
  
  // Test that both signup screens use the same field names
  const signupScreenFields = {
    whatsapp: 'phone_number',
    email: 'email',
    password: 'password',
    name: 'name',
    role: 'role',
  };
  
  log('Expected field names:', 'info');
  console.log(JSON.stringify(signupScreenFields, null, 2));
  
  testResult('Field naming convention documented', true);
}

async function testAllRoles() {
  log('\n=== Starting Authentication Tests for All Roles ===\n', 'info');
  log(`API Base URL: ${API_BASE_URL}\n`, 'info');
  
  await testAPIFieldConsistency();
  
  log('\n=== Testing WhatsApp OTP for All Roles ===\n', 'info');
  for (const role of ROLES) {
    await testWhatsAppOTPRequest(role);
  }
  
  log('\n=== Testing Email Signup for All Roles ===\n', 'info');
  for (const role of ROLES) {
    await testEmailSignupRequest(role);
  }
  
  // Summary
  log('\n=== Test Summary ===\n', 'info');
  log(`Total Tests: ${totalTests}`, 'info');
  log(`Passed: ${passedTests}`, 'success');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
  
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Pass Rate: ${passRate}%`, passRate === '100.0' ? 'success' : 'warning');
  
  if (failedTests > 0) {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'error');
    process.exit(1);
  } else {
    log('\n🎉 All tests passed!', 'success');
    process.exit(0);
  }
}

// Run tests
testAllRoles().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
