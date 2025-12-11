/**
 * Scroll Behavior Tests - Tests scroll configuration in source files
 * Uses file analysis since full component rendering requires complex Expo setup
 */

import * as fs from 'fs';
import * as path from 'path';

const SCREENS_DIR = path.join(__dirname, '../screens');

function readScreen(filename: string): string {
  return fs.readFileSync(path.join(SCREENS_DIR, filename), 'utf8');
}

describe('DoctorScheduleScreen Scroll Configuration', () => {
  const content = readScreen('DoctorScheduleScreen.tsx');

  it('has FlatList with scrollEnabled={true}', () => {
    expect(content).toContain('scrollEnabled={true}');
  });

  it('has FlatList with bounces={true}', () => {
    expect(content).toContain('bounces={true}');
  });

  it('has FlatList with nestedScrollEnabled={true}', () => {
    expect(content).toContain('nestedScrollEnabled={true}');
  });

  it('has showsVerticalScrollIndicator', () => {
    expect(content).toContain('showsVerticalScrollIndicator={true}');
  });

  it('has RefreshControl for pull-to-refresh', () => {
    expect(content).toContain('RefreshControl');
    expect(content).toContain('refreshing={loading}');
  });

  it('has at least 10 mock appointments for scroll testing', () => {
    const matches = content.match(/id:\s*['"][0-9]+['"]/g);
    expect(matches?.length).toBeGreaterThanOrEqual(10);
  });

  it('uses SafeAreaView not BaseScreen', () => {
    expect(content).toContain('SafeAreaView');
    expect(content).not.toMatch(/import.*BaseScreen/);
  });

  it('has container with flex: 1', () => {
    expect(content).toMatch(/container:\s*\{[\s\S]*?flex:\s*1/);
  });
});

describe('DoctorAvailabilityScreen Horizontal Scroll Configuration', () => {
  const content = readScreen('DoctorAvailabilityScreen.tsx');

  it('has horizontal ScrollView', () => {
    expect(content).toContain('horizontal');
  });

  it('has scrollEnabled={true}', () => {
    expect(content).toContain('scrollEnabled={true}');
  });

  it('has bounces={true}', () => {
    expect(content).toContain('bounces={true}');
  });

  it('has nestedScrollEnabled={true}', () => {
    expect(content).toContain('nestedScrollEnabled={true}');
  });

  it('has showsHorizontalScrollIndicator', () => {
    expect(content).toContain('showsHorizontalScrollIndicator={true}');
  });

  it('has 24 time slots (hours)', () => {
    expect(content).toContain('length: 24');
  });

  it('uses SafeAreaView not BaseScreen', () => {
    expect(content).toContain('SafeAreaView');
    expect(content).not.toMatch(/import.*BaseScreen/);
  });
});

describe('MyPatientsScreen Scroll Configuration', () => {
  const content = readScreen('MyPatientsScreen.tsx');

  it('has FlatList with scrollEnabled={true}', () => {
    expect(content).toContain('scrollEnabled={true}');
  });

  it('has FlatList with bounces={true}', () => {
    expect(content).toContain('bounces={true}');
  });

  it('has FlatList with nestedScrollEnabled={true}', () => {
    expect(content).toContain('nestedScrollEnabled={true}');
  });

  it('has showsVerticalScrollIndicator', () => {
    expect(content).toContain('showsVerticalScrollIndicator={true}');
  });

  it('has RefreshControl for pull-to-refresh', () => {
    expect(content).toContain('RefreshControl');
  });

  it('has at least 10 mock patients for scroll testing', () => {
    const matches = content.match(/id:\s*['"][0-9]+['"]/g);
    expect(matches?.length).toBeGreaterThanOrEqual(10);
  });

  it('has fixed footer with Back button', () => {
    expect(content).toContain('styles.footer');
    expect(content).toContain('footerButton');
  });

  it('uses SafeAreaView not BaseScreen', () => {
    expect(content).toContain('SafeAreaView');
    expect(content).not.toMatch(/import.*BaseScreen/);
  });
});

describe('EmergencyAlertsScreen Scroll Configuration', () => {
  const content = readScreen('EmergencyAlertsScreen.tsx');

  it('has FlatList with scrollEnabled={true}', () => {
    expect(content).toContain('scrollEnabled={true}');
  });

  it('has FlatList with bounces={true}', () => {
    expect(content).toContain('bounces={true}');
  });

  it('has FlatList with nestedScrollEnabled={true}', () => {
    expect(content).toContain('nestedScrollEnabled={true}');
  });

  it('has showsVerticalScrollIndicator', () => {
    expect(content).toContain('showsVerticalScrollIndicator={true}');
  });

  it('has fixed footer', () => {
    expect(content).toContain('styles.footer');
  });

  it('uses SafeAreaView not BaseScreen', () => {
    expect(content).toContain('SafeAreaView');
    expect(content).not.toMatch(/import.*BaseScreen/);
  });
});

describe('LandingScreen Configuration', () => {
  const content = readScreen('LandingScreen.tsx');

  it('has Medical Staff section', () => {
    expect(content).toContain('Medical Staff');
  });

  it('does NOT have labTestButton style', () => {
    expect(content).not.toContain('labTestButton');
  });

  it('does NOT have prescriptionButton style', () => {
    expect(content).not.toContain('prescriptionButton');
  });
});

describe('MedicalStaffSignupScreen Role Configuration', () => {
  const content = readScreen('MedicalStaffSignupScreen.tsx');

  it('has doctor role', () => {
    expect(content).toContain("key: 'doctor'");
  });

  it('has medical_staff role', () => {
    expect(content).toContain("key: 'medical_staff'");
  });

  it('does NOT have ambulance_staff role', () => {
    expect(content).not.toContain("key: 'ambulance_staff'");
  });

  it('does NOT have lab_staff role', () => {
    expect(content).not.toContain("key: 'lab_staff'");
  });

  it('does NOT have pharmacy_staff role', () => {
    expect(content).not.toContain("key: 'pharmacy_staff'");
  });
});
