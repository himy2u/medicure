#!/usr/bin/env node

/**
 * Complete Emergency Flow Test
 * 
 * Tests the entire emergency request workflow:
 * 1. Patient logs in
 * 2. Patient requests emergency
 * 3. Doctor receives alert
 * 4. Doctor accepts
 * 5. Chat works
 * 
 * With comprehensive logging at every step
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.100.91:8000';

// Test credentials
const PATIENT_EMAIL = 'patient@test.com';
const DOCTOR_EMAIL = 'doctor@test.com';
const PASSWORD = 'Test123!';

// Logging utilities
const log = {
  info: (msg, data) => console.log(`ℹ️  ${msg}`, data || ''),
  success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
  error: (msg, data) => console.log(`❌ ${msg}`, data || ''),
  warning: (msg, data) => console.log(`⚠️  ${msg}`, data || ''),
  action: (msg, data) => console.log(`👆 ${msg}`, data || ''),
  api: (msg, data) => console.log(`🌐 ${msg}`, data || ''),
  step: (num, msg) => console.log(`\n📍 Step ${num}: ${msg}\n${'='.repeat(50)}`)
};

// API helper
async function apiCall(method, endpoint, body = null, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  log.api(`${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
    log.info('Request body:', body);
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    const data = await response.json();
    
    log.info(`Response (${duration}ms):`, {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      log.error(`API Error: ${response.status}`, data);
      return { success: false, error: data, status: response.status };
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    log.error('Network error:', error.message);
    return { success: false, error: error.message, status: 0 };
  }
}

// Test functions
async function loginUser(email, password) {
  log.action(`Logging in as ${email}`);
  
  const result = await apiCall('POST', '/auth/login', {
    email,
    password
  });

  if (result.success && result.data.access_token) {
    log.success(`Logged in successfully`);
    log.info('User data:', {
      role: result.data.role,
      name: result.data.name,
      user_id: result.data.user_id
    });
    return result.data;
  } else {
    log.error('Login failed', result.error);
    return null;
  }
}

async function createEmergencyRequest(token, patientId) {
  log.action('Creating emergency request');
  
  const requestData = {
    patient_id: patientId,
    symptom: 'chest pain',
    description: 'Severe chest pain, difficulty breathing',
    latitude: -0.1807,
    longitude: -78.4678,
    priority: 'high'
  };

  const result = await apiCall('POST', '/api/emergency/request', requestData, token);

  if (result.success) {
    log.success('Emergency request created');
    log.info('Request details:', result.data);
    return result.data;
  } else {
    log.error('Failed to create emergency request', result.error);
    return null;
  }
}

async function checkEmergencyStatus(token, requestId) {
  log.action(`Checking emergency request status: ${requestId}`);
  
  const result = await apiCall('GET', `/api/emergency/status/${requestId}`, null, token);

  if (result.success) {
    log.info('Request status:', result.data);
    return result.data;
  } else {
    log.error('Failed to check status', result.error);
    return null;
  }
}

async function acceptEmergencyRequest(token, requestId, doctorId) {
  log.action(`Doctor accepting emergency request: ${requestId}`);
  
  const result = await apiCall('POST', '/api/emergency/accept', {
    request_id: requestId,
    doctor_id: doctorId
  }, token);

  if (result.success) {
    log.success('Emergency request accepted');
    log.info('Acceptance details:', result.data);
    return result.data;
  } else {
    log.error('Failed to accept request', result.error);
    return null;
  }
}

async function sendChatMessage(token, appointmentId, senderId, message) {
  log.action(`Sending chat message: "${message}"`);
  
  const result = await apiCall('POST', '/api/chat/send', {
    appointment_id: appointmentId,
    sender_id: senderId,
    message: message
  }, token);

  if (result.success) {
    log.success('Message sent');
    return result.data;
  } else {
    log.error('Failed to send message', result.error);
    return null;
  }
}

async function getChatMessages(token, appointmentId) {
  log.action(`Getting chat messages for appointment: ${appointmentId}`);
  
  const result = await apiCall('GET', `/api/chat/messages/${appointmentId}`, null, token);

  if (result.success) {
    log.info(`Retrieved ${result.data.messages?.length || 0} messages`);
    return result.data;
  } else {
    log.error('Failed to get messages', result.error);
    return null;
  }
}

// Main test flow
async function runEmergencyFlowTest() {
  console.log('\n🧪 EMERGENCY FLOW TEST - COMPLETE WORKFLOW\n');
  console.log('='.repeat(60));
  
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Step 1: Patient Login
    log.step(1, 'Patient Login');
    const patientAuth = await loginUser(PATIENT_EMAIL, PASSWORD);
    if (!patientAuth) {
      log.error('TEST FAILED: Patient login failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 2: Doctor Login
    log.step(2, 'Doctor Login');
    const doctorAuth = await loginUser(DOCTOR_EMAIL, PASSWORD);
    if (!doctorAuth) {
      log.error('TEST FAILED: Doctor login failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 3: Patient Creates Emergency Request
    log.step(3, 'Patient Creates Emergency Request');
    const emergencyRequest = await createEmergencyRequest(
      patientAuth.access_token,
      patientAuth.user_id
    );
    if (!emergencyRequest) {
      log.error('TEST FAILED: Emergency request creation failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 4: Check Request Status
    log.step(4, 'Check Emergency Request Status');
    const status = await checkEmergencyStatus(
      patientAuth.access_token,
      emergencyRequest.request_id
    );
    if (!status) {
      log.error('TEST FAILED: Status check failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 5: Doctor Accepts Request
    log.step(5, 'Doctor Accepts Emergency Request');
    const acceptance = await acceptEmergencyRequest(
      doctorAuth.access_token,
      emergencyRequest.request_id,
      doctorAuth.user_id
    );
    if (!acceptance) {
      log.error('TEST FAILED: Doctor acceptance failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 6: Patient Sends Chat Message
    log.step(6, 'Patient Sends Chat Message');
    const patientMessage = await sendChatMessage(
      patientAuth.access_token,
      acceptance.appointment_id,
      patientAuth.user_id,
      'Hello doctor, I need help urgently!'
    );
    if (!patientMessage) {
      log.error('TEST FAILED: Patient message failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 7: Doctor Sends Chat Message
    log.step(7, 'Doctor Sends Chat Message');
    const doctorMessage = await sendChatMessage(
      doctorAuth.access_token,
      acceptance.appointment_id,
      doctorAuth.user_id,
      'I received your request. On my way!'
    );
    if (!doctorMessage) {
      log.error('TEST FAILED: Doctor message failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Step 8: Retrieve Chat History
    log.step(8, 'Retrieve Chat History');
    const chatHistory = await getChatMessages(
      patientAuth.access_token,
      acceptance.appointment_id
    );
    if (!chatHistory || !chatHistory.messages || chatHistory.messages.length < 2) {
      log.error('TEST FAILED: Chat history retrieval failed');
      testsFailed++;
      return;
    }
    testsPassed++;

    // Print chat messages
    log.info('Chat conversation:');
    chatHistory.messages.forEach((msg, idx) => {
      const sender = msg.sender_id === patientAuth.user_id ? 'Patient' : 'Doctor';
      console.log(`  ${idx + 1}. [${sender}]: ${msg.message}`);
    });

  } catch (error) {
    log.error('TEST EXCEPTION:', error);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (testsFailed === 0) {
    log.success('\n🎉 ALL TESTS PASSED! Emergency flow is working correctly.\n');
    process.exit(0);
  } else {
    log.error('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run the test
runEmergencyFlowTest().catch(error => {
  log.error('Fatal error:', error);
  process.exit(1);
});
