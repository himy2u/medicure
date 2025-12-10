#!/usr/bin/env node

/**
 * Test Role-Based Navigation
 * Verifies that each role navigates to the correct screen after authentication
 */

const API_BASE_URL = 'http://192.168.100.91:8000';

const ROLES = [
  { key: 'patient', expectedScreen: 'PatientDashboard' },
  { key: 'caregiver', expectedScreen: 'PatientDashboard' },
  { key: 'doctor', expectedScreen: 'DoctorHome' },
  { key: 'medical_staff', expectedScreen: 'MedicalStaffHome' },
  { key: 'ambulance_staff', expectedScreen: 'AmbulanceStaffHome' },
  { key: 'lab_staff', expectedScreen: 'LabStaffHome' },
  { key: 'pharmacy_staff', expectedScreen: 'PharmacyStaffHome' },
  { key: 'clinic_admin', expectedScreen: 'ClinicAdminHome' },
];

async function testRoleNavigation() {
  console.log('🧪 Testing Role-Based Navigation\n');
  
  // Read navigationHelper.ts
  const fs = require('fs');
  const path = require('path');
  const helperPath = path.join(__dirname, 'frontend/utils/navigationHelper.ts');
  const helperContent = fs.readFileSync(helperPath, 'utf8');
  
  console.log('📋 Checking navigationHelper.ts mappings:\n');
  
  let allCorrect = true;
  
  for (const role of ROLES) {
    // Check if role is mapped correctly
    const regex = new RegExp(`case '${role.key}'[\\s\\S]*?return '(\\w+)'`, 'm');
    const match = helperContent.match(regex);
    
    if (match) {
      const mappedScreen = match[1];
      const isCorrect = mappedScreen === role.expectedScreen;
      
      if (isCorrect) {
        console.log(`✅ ${role.key.padEnd(20)} → ${mappedScreen}`);
      } else {
        console.log(`❌ ${role.key.padEnd(20)} → ${mappedScreen} (expected: ${role.expectedScreen})`);
        allCorrect = false;
      }
    } else {
      console.log(`⚠️  ${role.key.padEnd(20)} → NOT FOUND IN MAPPING`);
      allCorrect = false;
    }
  }
  
  console.log('\n📋 Checking if all screens are registered in AppNavigator:\n');
  
  const navigatorPath = path.join(__dirname, 'frontend/navigation/AppNavigator.tsx');
  const navigatorContent = fs.readFileSync(navigatorPath, 'utf8');
  
  const uniqueScreens = [...new Set(ROLES.map(r => r.expectedScreen))];
  
  for (const screen of uniqueScreens) {
    const isRegistered = navigatorContent.includes(`name="${screen}"`);
    if (isRegistered) {
      console.log(`✅ ${screen} is registered`);
    } else {
      console.log(`❌ ${screen} is NOT registered`);
      allCorrect = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allCorrect) {
    console.log('✅ All role mappings are correct!');
    console.log('\nIf navigation still fails, check:');
    console.log('1. Backend returns correct role in response');
    console.log('2. Frontend stores role correctly');
    console.log('3. ProfileHeader doesn\'t clear auth data');
  } else {
    console.log('❌ Some role mappings are incorrect!');
    console.log('\nFix the issues above before testing authentication.');
  }
  console.log('='.repeat(50));
}

testRoleNavigation().catch(console.error);
