#!/usr/bin/env node
/**
 * Scroll Configuration Tests
 * Tests that all scrollable screens have proper scroll properties
 * This is a runtime test that verifies scroll configuration
 */

const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, 'frontend/screens');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    failed++;
  }
}

function readScreen(filename) {
  return fs.readFileSync(path.join(SCREENS_DIR, filename), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('\n🧪 SCROLL CONFIGURATION TESTS\n');
console.log('='.repeat(60));

// ============================================================================
// DoctorScheduleScreen
// ============================================================================
console.log('\n📱 DoctorScheduleScreen (Vertical Scroll)');
const scheduleContent = readScreen('DoctorScheduleScreen.tsx');

test('scrollEnabled={true}', () => {
  assert(scheduleContent.includes('scrollEnabled={true}'), 'Missing scrollEnabled={true}');
});

test('bounces={true}', () => {
  assert(scheduleContent.includes('bounces={true}'), 'Missing bounces={true}');
});

test('nestedScrollEnabled={true}', () => {
  assert(scheduleContent.includes('nestedScrollEnabled={true}'), 'Missing nestedScrollEnabled={true}');
});

test('showsVerticalScrollIndicator={true}', () => {
  assert(scheduleContent.includes('showsVerticalScrollIndicator={true}'), 'Missing showsVerticalScrollIndicator');
});

test('RefreshControl for pull-to-refresh', () => {
  assert(scheduleContent.includes('RefreshControl'), 'Missing RefreshControl');
  assert(scheduleContent.includes('refreshing={loading}'), 'Missing refreshing prop');
});

test('At least 10 mock appointments', () => {
  const matches = scheduleContent.match(/id:\s*['"][0-9]+['"]/g);
  assert(matches && matches.length >= 10, `Only ${matches?.length || 0} appointments, need 10+`);
});

test('Uses SafeAreaView (not BaseScreen)', () => {
  assert(scheduleContent.includes('SafeAreaView'), 'Missing SafeAreaView');
  assert(!scheduleContent.match(/import.*BaseScreen/), 'Should not import BaseScreen');
});

test('Container has flex: 1', () => {
  assert(scheduleContent.match(/container:\s*\{[\s\S]*?flex:\s*1/), 'Container missing flex: 1');
});

// ============================================================================
// DoctorAvailabilityScreen
// ============================================================================
console.log('\n📱 DoctorAvailabilityScreen (Horizontal Scroll)');
const availContent = readScreen('DoctorAvailabilityScreen.tsx');

test('horizontal={true} ScrollView', () => {
  assert(availContent.includes('horizontal'), 'Missing horizontal prop');
});

test('scrollEnabled={true}', () => {
  assert(availContent.includes('scrollEnabled={true}'), 'Missing scrollEnabled={true}');
});

test('bounces={true}', () => {
  assert(availContent.includes('bounces={true}'), 'Missing bounces={true}');
});

test('nestedScrollEnabled={true}', () => {
  assert(availContent.includes('nestedScrollEnabled={true}'), 'Missing nestedScrollEnabled={true}');
});

test('showsHorizontalScrollIndicator={true}', () => {
  assert(availContent.includes('showsHorizontalScrollIndicator={true}'), 'Missing showsHorizontalScrollIndicator');
});

test('24 time slots (hours)', () => {
  assert(availContent.includes('length: 24'), 'Missing 24 time slots');
});

test('Uses SafeAreaView (not BaseScreen)', () => {
  assert(availContent.includes('SafeAreaView'), 'Missing SafeAreaView');
  assert(!availContent.match(/import.*BaseScreen/), 'Should not import BaseScreen');
});

// ============================================================================
// MyPatientsScreen
// ============================================================================
console.log('\n📱 MyPatientsScreen (Vertical Scroll)');
const patientsContent = readScreen('MyPatientsScreen.tsx');

test('scrollEnabled={true}', () => {
  assert(patientsContent.includes('scrollEnabled={true}'), 'Missing scrollEnabled={true}');
});

test('bounces={true}', () => {
  assert(patientsContent.includes('bounces={true}'), 'Missing bounces={true}');
});

test('nestedScrollEnabled={true}', () => {
  assert(patientsContent.includes('nestedScrollEnabled={true}'), 'Missing nestedScrollEnabled={true}');
});

test('showsVerticalScrollIndicator={true}', () => {
  assert(patientsContent.includes('showsVerticalScrollIndicator={true}'), 'Missing showsVerticalScrollIndicator');
});

test('RefreshControl for pull-to-refresh', () => {
  assert(patientsContent.includes('RefreshControl'), 'Missing RefreshControl');
});

test('At least 10 mock patients', () => {
  const matches = patientsContent.match(/id:\s*['"][0-9]+['"]/g);
  assert(matches && matches.length >= 10, `Only ${matches?.length || 0} patients, need 10+`);
});

test('Fixed footer with Back button', () => {
  assert(patientsContent.includes('styles.footer'), 'Missing footer');
  assert(patientsContent.includes('footerButton'), 'Missing footer buttons');
});

test('Uses SafeAreaView (not BaseScreen)', () => {
  assert(patientsContent.includes('SafeAreaView'), 'Missing SafeAreaView');
  assert(!patientsContent.match(/import.*BaseScreen/), 'Should not import BaseScreen');
});

// ============================================================================
// EmergencyAlertsScreen
// ============================================================================
console.log('\n📱 EmergencyAlertsScreen (Vertical Scroll)');
const alertsContent = readScreen('EmergencyAlertsScreen.tsx');

test('scrollEnabled={true}', () => {
  assert(alertsContent.includes('scrollEnabled={true}'), 'Missing scrollEnabled={true}');
});

test('bounces={true}', () => {
  assert(alertsContent.includes('bounces={true}'), 'Missing bounces={true}');
});

test('nestedScrollEnabled={true}', () => {
  assert(alertsContent.includes('nestedScrollEnabled={true}'), 'Missing nestedScrollEnabled={true}');
});

test('showsVerticalScrollIndicator={true}', () => {
  assert(alertsContent.includes('showsVerticalScrollIndicator={true}'), 'Missing showsVerticalScrollIndicator');
});

test('Fixed footer', () => {
  assert(alertsContent.includes('styles.footer'), 'Missing footer');
});

test('Uses SafeAreaView (not BaseScreen)', () => {
  assert(alertsContent.includes('SafeAreaView'), 'Missing SafeAreaView');
  assert(!alertsContent.match(/import.*BaseScreen/), 'Should not import BaseScreen');
});

// ============================================================================
// LandingScreen
// ============================================================================
console.log('\n📱 LandingScreen');
const landingContent = readScreen('LandingScreen.tsx');

test('Has Medical Staff section', () => {
  assert(landingContent.includes('Medical Staff'), 'Missing Medical Staff section');
});

test('No labTestButton style (removed)', () => {
  assert(!landingContent.includes('labTestButton'), 'labTestButton should be removed');
});

test('No prescriptionButton style (removed)', () => {
  assert(!landingContent.includes('prescriptionButton'), 'prescriptionButton should be removed');
});

// ============================================================================
// MedicalStaffSignupScreen
// ============================================================================
console.log('\n📱 MedicalStaffSignupScreen');
const signupContent = readScreen('MedicalStaffSignupScreen.tsx');

test('Has doctor role', () => {
  assert(signupContent.includes("key: 'doctor'"), 'Missing doctor role');
});

test('Has medical_staff role', () => {
  assert(signupContent.includes("key: 'medical_staff'"), 'Missing medical_staff role');
});

test('No ambulance_staff role (hidden)', () => {
  assert(!signupContent.includes("key: 'ambulance_staff'"), 'ambulance_staff should be hidden');
});

test('No lab_staff role (hidden)', () => {
  assert(!signupContent.includes("key: 'lab_staff'"), 'lab_staff should be hidden');
});

test('No pharmacy_staff role (hidden)', () => {
  assert(!signupContent.includes("key: 'pharmacy_staff'"), 'pharmacy_staff should be hidden');
});

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ SOME TESTS FAILED\n');
  process.exit(1);
} else {
  console.log('✅ ALL SCROLL CONFIGURATION TESTS PASSED\n');
  console.log('📝 These tests verify scroll properties are correctly configured.');
  console.log('   To test actual scroll behavior, run the app and manually verify.\n');
  process.exit(0);
}
