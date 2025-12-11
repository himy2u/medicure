#!/usr/bin/env node
/**
 * Patient Role Test - Complete Workflow
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

async function testPatientWorkflow() {
  console.log('\n👤 PATIENT ROLE - COMPLETE WORKFLOW TEST\n');
  console.log('='.repeat(60));
  
  // 1. Login
  console.log('\n1️⃣  Login as Patient');
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'patient@test.com',
    password: 'Test123!'
  });
  token = loginResult.access_token;
  userId = JSON.parse(atob(token.split('.')[1])).user_id;
  console.log('✅ Logged in successfully');
  
  // 2. Search for emergency doctors
  console.log('\n2️⃣  Search for Emergency Doctors');
  const doctorsResult = await makeRequest('POST', '/api/doctors/search', {
    symptom: 'chest pain',
    latitude: -0.1807,
    longitude: -78.4678,
    radius_km: 50
  });
  console.log(`✅ Found ${doctorsResult.count} doctors`);
  
  // 3. Book appointment
  console.log('\n3️⃣  Book Scheduled Appointment');
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 3); // 3 days from now for 24h cancellation rule
  const bookResult = await makeRequest('POST', '/api/appointments/book', {
    doctor_id: 1,
    appointment_type: 'scheduled',
    appointment_date: appointmentDate.toISOString(),
    symptom: 'Regular checkup',
    notes: 'Annual physical'
  });
  appointmentId = bookResult.appointment.id;
  console.log(`✅ Appointment booked: ${appointmentId}`);
  
  // 4. View my appointments
  console.log('\n4️⃣  View My Appointments');
  const appointmentsResult = await makeRequest('GET', `/api/appointments/user/${userId}`);
  console.log(`✅ Retrieved ${appointmentsResult.count} appointments`);
  
  // 5. Send chat message
  console.log('\n5️⃣  Send Chat Message to Doctor');
  await makeRequest('POST', '/api/chat/send', {
    appointment_id: appointmentId,
    message_text: 'Hello doctor, looking forward to my appointment!',
    message_type: 'text'
  });
  console.log('✅ Message sent');
  
  // 6. View chat messages
  console.log('\n6️⃣  View Chat Messages');
  const chatResult = await makeRequest('GET', `/api/chat/messages/${appointmentId}`);
  console.log(`✅ Retrieved ${chatResult.count} messages`);
  
  // 7. View prescriptions
  console.log('\n7️⃣  View My Prescriptions');
  const prescriptionsResult = await makeRequest('GET', `/api/prescriptions/user/${userId}`);
  console.log(`✅ Retrieved ${prescriptionsResult.count} prescriptions`);
  
  // 8. View lab results
  console.log('\n8️⃣  View My Lab Results');
  const labResult = await makeRequest('GET', `/api/lab-results/user/${userId}`);
  console.log(`✅ Retrieved ${labResult.count} lab results`);
  
  // 9. Cancel appointment
  console.log('\n9️⃣  Cancel Appointment');
  await makeRequest('POST', `/api/appointments/${appointmentId}/cancel`, {});
  console.log('✅ Appointment cancelled');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 PATIENT WORKFLOW COMPLETE - ALL TESTS PASSED!\n');
}

testPatientWorkflow().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
