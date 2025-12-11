#!/usr/bin/env node
/**
 * Caregiver Role Test - Complete Workflow (same as patient)
 */

const API_BASE_URL = 'http://localhost:8000';
let token = null;
let userId = null;
let appointmentId = null;

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

async function testCaregiverWorkflow() {
  console.log('\n👨‍👩‍👧‍👦 CAREGIVER ROLE - COMPLETE WORKFLOW TEST\n');
  console.log('='.repeat(60));
  
  // 1. Login
  console.log('\n1️⃣  Login as Caregiver');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'caregiver@test.com',
    password: 'Test123!'
  });
  token = loginResult.access_token;
  userId = JSON.parse(atob(token.split('.')[1])).user_id;
  console.log('✅ Logged in successfully');
  
  // 2. Search for emergency doctors (for family member)
  console.log('\n2️⃣  Search for Emergency Doctors (for family member)');
  const doctorsResult = await makeRequest('POST', '/api/doctors/search', {
    symptom: 'fever and chills',
    latitude: -0.1807,
    longitude: -78.4678,
    radius_km: 50
  });
  console.log(`✅ Found ${doctorsResult.count} doctors`);
  
  // 3. Book appointment for family member
  console.log('\n3️⃣  Book Appointment for Family Member');
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 3); // 3 days from now for 24h cancellation rule
  const bookResult = await makeRequest('POST', '/api/appointments/book', {
    doctor_id: 1,
    appointment_type: 'scheduled',
    appointment_date: appointmentDate.toISOString(),
    symptom: 'Elderly parent needs checkup',
    notes: 'Booking on behalf of elderly parent'
  });
  appointmentId = bookResult.appointment.id;
  console.log(`✅ Appointment booked: ${appointmentId}`);
  
  // 4. View appointments (managing for family)
  console.log('\n4️⃣  View Family Appointments');
  const appointmentsResult = await makeRequest('GET', `/api/appointments/user/${userId}`);
  console.log(`✅ Retrieved ${appointmentsResult.count} appointments`);
  
  // 5. Send message to doctor
  console.log('\n5️⃣  Send Message to Doctor');
  await makeRequest('POST', '/api/chat/send', {
    appointment_id: appointmentId,
    message_text: 'Hello doctor, I am the caregiver for this patient. They have been experiencing symptoms for 2 days.',
    message_type: 'text'
  });
  console.log('✅ Message sent');
  
  // 6. View prescriptions (for family member)
  console.log('\n6️⃣  View Family Member Prescriptions');
  const prescriptionsResult = await makeRequest('GET', `/api/prescriptions/user/${userId}`);
  console.log(`✅ Retrieved ${prescriptionsResult.count} prescriptions`);
  
  // 7. View lab results (for family member)
  console.log('\n7️⃣  View Family Member Lab Results');
  const labResult = await makeRequest('GET', `/api/lab-results/user/${userId}`);
  console.log(`✅ Retrieved ${labResult.count} lab results`);
  
  // 8. Cancel appointment if needed
  console.log('\n8️⃣  Cancel Appointment');
  await makeRequest('POST', `/api/appointments/${appointmentId}/cancel`, {});
  console.log('✅ Appointment cancelled');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 CAREGIVER WORKFLOW COMPLETE - ALL TESTS PASSED!\n');
}

testCaregiverWorkflow().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});