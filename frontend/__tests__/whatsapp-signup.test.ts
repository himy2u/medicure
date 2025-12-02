/**
 * WhatsApp Signup Flow Test
 * Tests the logic without needing the actual React Native app
 */

// Mock the sendWhatsAppOTP function logic
async function testSendWhatsAppOTP(phoneNumber: string, currentRole: string | undefined) {
  console.log('=== TEST: sendWhatsAppOTP ===');
  console.log('Phone:', phoneNumber);
  console.log('Current role:', currentRole);
  
  if (!phoneNumber || phoneNumber.trim() === '') {
    console.log('ERROR: Empty phone number');
    return { success: false, error: 'Empty phone number' };
  }
  
  try {
    const apiBaseUrl = 'http://192.168.100.91:8000';
    const role = currentRole || 'patient';
    
    console.log('API URL:', apiBaseUrl);
    console.log('Role to send:', role);
    console.log('Making fetch request...');
    
    const response = await fetch(`${apiBaseUrl}/auth/whatsapp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone_number: phoneNumber, 
        role: role 
      })
    });
    
    console.log('Response received, status:', response.status);
    console.log('Parsing JSON...');
    
    const data = await response.json();
    console.log('Data parsed:', JSON.stringify(data));
    
    if (response.ok && data && data.success) {
      console.log('✅ Success!');
      return { success: true, data };
    } else {
      const errorMsg = (data && data.detail) ? data.detail : 'Failed to send OTP';
      console.error('❌ API Error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
async function runTest() {
  console.log('\n🧪 Testing WhatsApp Signup Flow\n');
  
  // Test 1: Valid phone number
  console.log('Test 1: Valid phone number with role');
  const result1 = await testSendWhatsAppOTP('+593998118039', 'patient');
  console.log('Result:', result1);
  console.log('');
  
  // Test 2: Valid phone number without role (should default to patient)
  console.log('Test 2: Valid phone number without role');
  const result2 = await testSendWhatsAppOTP('+593998118039', undefined);
  console.log('Result:', result2);
  console.log('');
  
  // Test 3: Empty phone number
  console.log('Test 3: Empty phone number');
  const result3 = await testSendWhatsAppOTP('', 'patient');
  console.log('Result:', result3);
  console.log('');
  
  console.log('=== ALL TESTS COMPLETE ===');
}

runTest().catch(console.error);
