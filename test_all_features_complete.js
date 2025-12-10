#!/usr/bin/env node

/**
 * Comprehensive test suite for all Medicure features
 * Tests all roles and all workflows
 */

const API_BASE_URL = 'http://localhost:8000';

// Test users
const TEST_USERS = {
  patient: { email: 'patient@test.com', password: 'Test123!', role: 'patient' },
  doctor: { email: 'doctor@test.com', password: 'Test123!', role: 'doctor' },
  medical_staff: { email: 'nurse@test.com', password: 'Test123!', role: 'medical_staff' },
  caregiver: { email: 'caregiver@test.com', password: 'Test123!', role: 'caregiver' }
};

// Test state
let tokens = {};
let testData = {
  appointmentId: null,
  prescriptionId: null,
  labTestId: null
};

// Utility functions
function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || `HTTP ${response.status}`);
    }
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testLogin(role) {
  log('🔐', `Testing login for ${role}...`);
  
  const user = TEST_USERS[role];
  const result = await makeRequest('POST', '/auth/login', {
    email: user.email,
    password: user.password
  });

  if (result.success) {
    tokens[role] = result.data.access_token;
    log('✅', `${role} logged in successfully`);
    return true;
  } else {
    log('❌', `${role} login failed: ${result.error}`);
    return false;
  }
}

async function testBookAppointment() {
  log('📅', 'Testing appointment booking...');
  
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 1); // Tomorrow
  
  const result = await makeRequest('POST', '/api/appointments/book', {
    doctor_id: 1,
    appointment_type: 'scheduled',
    appointment_date: appointmentDate.toISOString(),
    symptom: 'Regular checkup',
    notes: 'Annual physical examination'
  }, tokens.patient);

  if (result.success) {
    testData.appointmentId = result.data.appointment.id;
    log('✅', `Appointment booked: ${testData.appointmentId}`);
    return true;
  } else {
    log('❌', `Appointment booking failed: ${result.error}`);
    return false;
  }
}

async function testGetAppointments() {
  log('📋', 'Testing get appointments...');
  
  // Get patient ID from token
  const patientId = JSON.parse(atob(tokens.patient.split('.')[1])).sub;
  
  const result = await makeRequest('GET', `/api/appointments/user/${patientId}`, null, tokens.patient);

  if (result.success) {
    log('✅', `Retrieved ${result.data.count} appointments`);
    return true;
  } else {
    log('❌', `Get appointments failed: ${result.error}`);
    return false;
  }
}

async function testGetAppointmentDetails() {
  if (!testData.appointmentId) {
    log('⏭️', 'Skipping appointment details test (no appointment ID)');
    return true;
  }

  log('🔍', 'Testing get appointment details...');
  
  const result = await makeRequest('GET', `/api/appointments/${testData.appointmentId}`, null, tokens.patient);

  if (result.success) {
    log('✅', `Retrieved appointment details`);
    return true;
  } else {
    log('❌', `Get appointment details failed: ${result.error}`);
    return false;
  }
}

async function testSendChatMessage() {
  if (!testData.appointmentId) {
    log('⏭️', 'Skipping chat test (no appointment ID)');
    return true;
  }

  log('💬', 'Testing send chat message...');
  
  const result = await makeRequest('POST', '/api/chat/send', {
    appointment_id: testData.appointmentId,
    message_text: 'Hello doctor, I have a question about my appointment.',
    message_type: 'text'
  }, tokens.patient);

  if (result.success) {
    log('✅', 'Chat message sent successfully');
    return true;
  } else {
    log('❌', `Send chat message failed: ${result.error}`);
    return false;
  }
}

async function testGetChatMessages() {
  if (!testData.appointmentId) {
    log('⏭️', 'Skipping get chat messages test (no appointment ID)');
    return true;
  }

  log('📨', 'Testing get chat messages...');
  
  const result = await makeRequest('GET', `/api/chat/messages/${testData.appointmentId}`, null, tokens.patient);

  if (result.success) {
    log('✅', `Retrieved ${result.data.count} chat messages`);
    return true;
  } else {
    log('❌', `Get chat messages failed: ${result.error}`);
    return false;
  }
}

async function testGetPrescriptions() {
  log('💊', 'Testing get prescriptions...');
  
  const patientId = JSON.parse(atob(tokens.patient.split('.')[1])).sub;
  
  const result = await makeRequest('GET', `/api/prescriptions/user/${patientId}`, null, tokens.patient);

  if (result.success) {
    log('✅', `Retrieved ${result.data.count} prescriptions`);
    return true;
  } else {
    log('❌', `Get prescriptions failed: ${result.error}`);
    return false;
  }
}

async function testGetLabResults() {
  log('🧪', 'Testing get lab results...');
  
  const patientId = JSON.parse(atob(tokens.patient.split('.')[1])).sub;
  
  const result = await makeRequest('GET', `/api/lab-results/user/${patientId}`, null, tokens.patient);

  if (result.success) {
    log('✅', `Retrieved ${result.data.count} lab results`);
    return true;
  } else {
    log('❌', `Get lab results failed: ${result.error}`);
    return false;
  }
}

async function testDoctorAvailability() {
  log('🏥', 'Testing doctor availability...');
  
  // Update availability
  const updateResult = await makeRequest('PUT', '/api/doctors/1/availability', {
    available_now: true,
    accepts_emergencies: true,
    notes: 'Available for consultations'
  }, tokens.doctor);

  if (!updateResult.success) {
    log('❌', `Update availability failed: ${updateResult.error}`);
    return false;
  }

  log('✅', 'Doctor availability updated');

  // Get availability
  const getResult = await makeRequest('GET', '/api/doctors/1/availability', null, tokens.doctor);

  if (getResult.success) {
    log('✅', 'Doctor availability retrieved');
    return true;
  } else {
    log('❌', `Get availability failed: ${getResult.error}`);
    return false;
  }
}

async function testDoctorPatients() {
  log('👥', 'Testing get doctor patients...');
  
  const result = await makeRequest('GET', '/api/doctors/1/patients', null, tokens.doctor);

  if (result.success) {
    log('✅', `Retrieved ${result.data.count} patients`);
    return true;
  } else {
    log('❌', `Get doctor patients failed: ${result.error}`);
    return false;
  }
}

async function testCancelAppointment() {
  if (!testData.appointmentId) {
    log('⏭️', 'Skipping cancel appointment test (no appointment ID)');
    return true;
  }

  log('🚫', 'Testing cancel appointment...');
  
  const result = await makeRequest('POST', `/api/appointments/${testData.appointmentId}/cancel`, {}, tokens.patient);

  if (result.success) {
    log('✅', 'Appointment cancelled successfully');
    return true;
  } else {
    log('❌', `Cancel appointment failed: ${result.error}`);
    return false;
  }
}

async function testEmergencyDoctorSearch() {
  log('🚨', 'Testing emergency doctor search...');
  
  const result = await makeRequest('POST', '/api/doctors/search', {
    symptom: 'chest pain',
    latitude: -0.1807,
    longitude: -78.4678,
    radius_km: 50
  });

  if (result.success) {
    log('✅', `Found ${result.data.count} doctors`);
    return true;
  } else {
    log('❌', `Emergency doctor search failed: ${result.error}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 MEDICURE COMPREHENSIVE TEST SUITE\n');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Authentication Tests
  logSection('AUTHENTICATION TESTS');
  if (await testLogin('patient')) results.passed++; else results.failed++;
  if (await testLogin('doctor')) results.passed++; else results.failed++;
  if (await testLogin('medical_staff')) results.passed++; else results.failed++;

  // Appointment Tests
  logSection('APPOINTMENT TESTS');
  if (await testBookAppointment()) results.passed++; else results.failed++;
  if (await testGetAppointments()) results.passed++; else results.failed++;
  if (await testGetAppointmentDetails()) results.passed++; else results.failed++;

  // Chat Tests
  logSection('CHAT TESTS');
  if (await testSendChatMessage()) results.passed++; else results.failed++;
  if (await testGetChatMessages()) results.passed++; else results.failed++;

  // Prescription Tests
  logSection('PRESCRIPTION TESTS');
  if (await testGetPrescriptions()) results.passed++; else results.failed++;

  // Lab Tests
  logSection('LAB RESULT TESTS');
  if (await testGetLabResults()) results.passed++; else results.failed++;

  // Doctor Tests
  logSection('DOCTOR TESTS');
  if (await testDoctorAvailability()) results.passed++; else results.failed++;
  if (await testDoctorPatients()) results.passed++; else results.failed++;

  // Emergency Tests
  logSection('EMERGENCY TESTS');
  if (await testEmergencyDoctorSearch()) results.passed++; else results.failed++;

  // Cleanup Tests
  logSection('CLEANUP TESTS');
  if (await testCancelAppointment()) results.passed++; else results.failed++;

  // Summary
  logSection('TEST SUMMARY');
  log('✅', `Tests Passed: ${results.passed}`);
  log('❌', `Tests Failed: ${results.failed}`);
  log('⏭️', `Tests Skipped: ${results.skipped}`);
  
  const total = results.passed + results.failed;
  const percentage = ((results.passed / total) * 100).toFixed(1);
  log('📊', `Success Rate: ${percentage}%`);

  if (results.failed === 0) {
    log('🎉', 'ALL TESTS PASSED!');
    process.exit(0);
  } else {
    log('⚠️', 'SOME TESTS FAILED');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
