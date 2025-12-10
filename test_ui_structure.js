#!/usr/bin/env node
/**
 * UI Structure Tests - Validates React Native screen structure
 * Checks for VirtualizedList nesting issues and proper scroll configurations
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend/screens');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function readScreen(filename) {
  const filePath = path.join(FRONTEND_DIR, filename);
  return fs.readFileSync(filePath, 'utf8');
}

function assertContains(content, text, message) {
  if (!content.includes(text)) {
    throw new Error(message || `Expected to contain: ${text}`);
  }
}

function assertNotContains(content, text, message) {
  if (content.includes(text)) {
    throw new Error(message || `Expected NOT to contain: ${text}`);
  }
}

console.log('\n🧪 UI STRUCTURE TESTS\n');
console.log('='.repeat(50));

// ============================================================================
// DoctorScheduleScreen Tests
// ============================================================================
console.log('\n📱 DoctorScheduleScreen');

test('Uses SafeAreaView instead of BaseScreen', () => {
  const content = readScreen('DoctorScheduleScreen.tsx');
  assertContains(content, 'SafeAreaView', 'Should use SafeAreaView');
  assertNotContains(content, "import BaseScreen from", 'Should NOT import BaseScreen');
});

test('Has FlatList for appointments', () => {
  const content = readScreen('DoctorScheduleScreen.tsx');
  assertContains(content, 'FlatList', 'Should have FlatList');
  assertContains(content, 'renderAppointment', 'Should have renderAppointment function');
});

test('Has container with flex: 1', () => {
  const content = readScreen('DoctorScheduleScreen.tsx');
  if (!content.match(/container:\s*\{[\s\S]*?flex:\s*1/)) {
    throw new Error('Container should have flex: 1');
  }
});

test('Has vertical scroll indicator', () => {
  const content = readScreen('DoctorScheduleScreen.tsx');
  assertContains(content, 'showsVerticalScrollIndicator', 'Should show vertical scroll indicator');
});

// ============================================================================
// DoctorAvailabilityScreen Tests
// ============================================================================
console.log('\n📱 DoctorAvailabilityScreen');

test('Uses SafeAreaView instead of BaseScreen', () => {
  const content = readScreen('DoctorAvailabilityScreen.tsx');
  assertContains(content, 'SafeAreaView', 'Should use SafeAreaView');
  assertNotContains(content, "import BaseScreen from", 'Should NOT import BaseScreen');
});

test('Has horizontal ScrollView for time slots', () => {
  const content = readScreen('DoctorAvailabilityScreen.tsx');
  assertContains(content, 'horizontal', 'Should have horizontal scroll');
  assertContains(content, 'showsHorizontalScrollIndicator', 'Should show horizontal scroll indicator');
});

test('Has time header row', () => {
  const content = readScreen('DoctorAvailabilityScreen.tsx');
  assertContains(content, 'timeHeaderRow', 'Should have time header row');
  assertContains(content, 'timeHeaderText', 'Should have time header text style');
});

test('Has container with flex: 1', () => {
  const content = readScreen('DoctorAvailabilityScreen.tsx');
  if (!content.match(/container:\s*\{[\s\S]*?flex:\s*1/)) {
    throw new Error('Container should have flex: 1');
  }
});

// ============================================================================
// MyPatientsScreen Tests
// ============================================================================
console.log('\n📱 MyPatientsScreen');

test('Uses SafeAreaView instead of BaseScreen', () => {
  const content = readScreen('MyPatientsScreen.tsx');
  assertContains(content, 'SafeAreaView', 'Should use SafeAreaView');
  assertNotContains(content, "import BaseScreen from", 'Should NOT import BaseScreen');
});

test('Has FlatList for patients', () => {
  const content = readScreen('MyPatientsScreen.tsx');
  assertContains(content, 'FlatList', 'Should have FlatList');
  assertContains(content, 'renderPatient', 'Should have renderPatient function');
});

test('Has enough mock patients for scroll testing (6+)', () => {
  const content = readScreen('MyPatientsScreen.tsx');
  const patientMatches = content.match(/id:\s*['"][0-9]+['"]/g);
  if (!patientMatches || patientMatches.length < 6) {
    throw new Error(`Expected at least 6 patients, found ${patientMatches?.length || 0}`);
  }
});

test('Has vertical scroll indicator', () => {
  const content = readScreen('MyPatientsScreen.tsx');
  assertContains(content, 'showsVerticalScrollIndicator', 'Should show vertical scroll indicator');
});

// ============================================================================
// EmergencyAlertsScreen Tests
// ============================================================================
console.log('\n📱 EmergencyAlertsScreen');

test('Uses SafeAreaView instead of BaseScreen', () => {
  const content = readScreen('EmergencyAlertsScreen.tsx');
  assertContains(content, 'SafeAreaView', 'Should use SafeAreaView');
  assertNotContains(content, "import BaseScreen from", 'Should NOT import BaseScreen');
});

test('Has FlatList for alerts', () => {
  const content = readScreen('EmergencyAlertsScreen.tsx');
  assertContains(content, 'FlatList', 'Should have FlatList');
  assertContains(content, 'renderAlert', 'Should have renderAlert function');
});

test('Has container with flex: 1', () => {
  const content = readScreen('EmergencyAlertsScreen.tsx');
  if (!content.match(/container:\s*\{[\s\S]*?flex:\s*1/)) {
    throw new Error('Container should have flex: 1');
  }
});

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '='.repeat(50));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ SOME TESTS FAILED - Fix the issues above\n');
  process.exit(1);
} else {
  console.log('✅ ALL UI STRUCTURE TESTS PASSED\n');
  process.exit(0);
}
