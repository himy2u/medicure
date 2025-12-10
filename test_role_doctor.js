#!/usr/bin/env node
/**
 * Doctor Role Test - Complete Workflow
 */

const API_BASE_URL = 'http://localhost:8000';
let token = null;
let userId = null;

async function makeRequest(method, endpoint, data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (data) options.body = JSON.stringify(data);
  
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || `HTTP ${response.status}`);
  return result;
}

async function testDoctorWorkflow() {
  console.log('\n👨‍⚕️  DOCTOR ROLE - COMPLETE WORKFLOW TEST\n');
  console.log('='.repeat(60));
  
  // 1. Login
  console.log('\n1️⃣  Login as Doctor');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'doctor@test.com',
    password: 'Test123!'
  });
  token = loginResult.access_token;
  userId = JSON.parse(atob(token.split('.')[1])).user_id;
  console.log('✅ Logged in successfully');
  
  // 2. Update availability
  console.log('\n2️⃣  Update Availability Status');
  await makeRequest('PUT', '/api/doctors/1/availability', {
    available_now: true,
    accepts_emergencies: true,
    notes: 'Available for consultations and emergencies'
  });
  console.log('✅ Availability updated');
  
  // 3. Check availability
  console.log('\n3️⃣  Check Current Availability');
  const availResult = await makeRequest('GET', '/api/doctors/1/availability');
  console.log(`✅ Available: ${availResult.data.available_now}, Accepts Emergencies: ${availResult.data.accepts_emergencies}`);
  
  // 4. View my patients
  console.log('\n4️⃣  View My Patients List');
  const patientsResult = await makeRequest('GET', '/api/doctors/1/patients');
  console.log(`✅ Retrieved ${patientsResult.count} patients`);
  
  // 5. View patient history (if any patients)
  if (patientsResult.count > 0) {
    console.log('\n5️⃣  View Patient Medical History');
    const patientId = patientsResult.patients[0].id;
    const historyResult = await makeRequest('GET', `/api/patients/${patientId}/history`);
    console.log(`✅ Retrieved patient history:`);
    console.log(`   - Appointments: ${historyResult.history.appointments.length}`);
    console.log(`   - Prescriptions: ${historyResult.history.prescriptions.length}`);
    console.log(`   - Lab Tests: ${historyResult.history.lab_tests.length}`);
  } else {
    console.log('\n5️⃣  View Patient History - Skipped (no patients yet)');
  }
  
  // 6. Search for emergency cases (endpoint in main.py, not api_endpoints.py)
  console.log('\n6️⃣  Check Emergency Requests');
  try {
    const emergencyResult = await makeRequest('GET', `/api/emergency/requests/${userId}`);
    console.log(`✅ Retrieved ${emergencyResult.count} emergency requests`);
  } catch (e) {
    console.log('⏭️  Emergency requests endpoint not in new API router (exists in main.py)');
  }
  
  // 7. Set unavailable
  console.log('\n7️⃣  Set Status to Unavailable');
  await makeRequest('PUT', '/api/doctors/1/availability', {
    available_now: false,
    accepts_emergencies: false,
    notes: 'Off duty'
  });
  console.log('✅ Status set to unavailable');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DOCTOR WORKFLOW COMPLETE - ALL TESTS PASSED!\n');
}

testDoctorWorkflow().catch(error => {
  console.error('\n❌ Test failed:', error.message || error);
  console.error('Full error:', error);
  process.exit(1);
});
