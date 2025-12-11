/**
 * Detox E2E Tests for Scroll and Swipe Functionality
 * These tests run on actual iOS simulator with real gestures
 */

describe('Scroll and Swipe Tests', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Landing Screen', () => {
    it('should display the landing screen', async () => {
      await expect(element(by.text('Medicure'))).toBeVisible();
    });

    it('should show Medical Staff section', async () => {
      await expect(element(by.text('Medical Staff'))).toBeVisible();
    });

    it('should NOT show Lab Tests button', async () => {
      await expect(element(by.text('Lab Tests'))).not.toBeVisible();
    });

    it('should NOT show Prescriptions button on landing', async () => {
      // The prescriptions button was removed from landing
      await expect(element(by.text('💊 Prescriptions'))).not.toBeVisible();
    });
  });

  describe('Doctor Schedule Screen - Vertical Scroll', () => {
    beforeEach(async () => {
      // Navigate to doctor login first
      await element(by.text('Medical Staff')).tap();
      await element(by.text('Login')).tap();
      // Login as doctor (mock or test account)
      await element(by.id('email-input')).typeText('doctor@test.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.text('Login')).tap();
      // Navigate to schedule
      await element(by.text('My Schedule')).tap();
    });

    it('should scroll down through appointments list', async () => {
      // Scroll down 300 pixels
      await element(by.id('appointments-list')).scroll(300, 'down');
      
      // Verify we can see items that were below the fold
      await expect(element(by.text('Luis Fernandez'))).toBeVisible();
    });

    it('should scroll up through appointments list', async () => {
      // First scroll down
      await element(by.id('appointments-list')).scroll(300, 'down');
      
      // Then scroll back up
      await element(by.id('appointments-list')).scroll(300, 'up');
      
      // First item should be visible again
      await expect(element(by.text('John Smith'))).toBeVisible();
    });

    it('should swipe up fast (momentum scroll)', async () => {
      await element(by.id('appointments-list')).swipe('up', 'fast');
      
      // Should have scrolled significantly
      await expect(element(by.text('Roberto Flores'))).toBeVisible();
    });

    it('should swipe down fast (momentum scroll)', async () => {
      // First swipe up
      await element(by.id('appointments-list')).swipe('up', 'fast');
      
      // Then swipe down
      await element(by.id('appointments-list')).swipe('down', 'fast');
      
      // Should be back at top
      await expect(element(by.text('John Smith'))).toBeVisible();
    });

    it('should pull to refresh', async () => {
      // Pull down from top to trigger refresh
      await element(by.id('appointments-list')).swipe('down', 'slow', 0.9);
      
      // Wait for refresh to complete
      await waitFor(element(by.text('John Smith'))).toBeVisible().withTimeout(5000);
    });
  });

  describe('Doctor Availability Screen - Horizontal Scroll', () => {
    beforeEach(async () => {
      // Navigate to availability screen
      await element(by.text('Availability Settings')).tap();
    });

    it('should scroll horizontally through time slots', async () => {
      // Find Monday's time slot row and scroll right
      await element(by.id('time-slots-monday')).scroll(300, 'right');
      
      // Evening hours should now be visible
      await expect(element(by.text('6p'))).toBeVisible();
    });

    it('should scroll left through time slots', async () => {
      // First scroll right
      await element(by.id('time-slots-monday')).scroll(300, 'right');
      
      // Then scroll back left
      await element(by.id('time-slots-monday')).scroll(300, 'left');
      
      // Morning hours should be visible
      await expect(element(by.text('9a'))).toBeVisible();
    });

    it('should swipe left fast on time slots', async () => {
      await element(by.id('time-slots-monday')).swipe('left', 'fast');
      
      // Should show evening/night hours
      await expect(element(by.text('11p'))).toBeVisible();
    });

    it('should swipe right fast on time slots', async () => {
      // First swipe left
      await element(by.id('time-slots-monday')).swipe('left', 'fast');
      
      // Then swipe right
      await element(by.id('time-slots-monday')).swipe('right', 'fast');
      
      // Should show morning hours
      await expect(element(by.text('12a'))).toBeVisible();
    });
  });

  describe('My Patients Screen - Vertical Scroll', () => {
    beforeEach(async () => {
      await element(by.text('My Patients')).tap();
    });

    it('should scroll down through patient list', async () => {
      await element(by.id('patients-list')).scroll(400, 'down');
      
      // Patients at bottom should be visible
      await expect(element(by.text('Isabella Flores'))).toBeVisible();
    });

    it('should scroll up through patient list', async () => {
      // Scroll down first
      await element(by.id('patients-list')).scroll(400, 'down');
      
      // Scroll back up
      await element(by.id('patients-list')).scroll(400, 'up');
      
      // First patient should be visible
      await expect(element(by.text('John Doe'))).toBeVisible();
    });

    it('should swipe up fast through patients', async () => {
      await element(by.id('patients-list')).swipe('up', 'fast');
      
      // Should see patients further down
      await expect(element(by.text('Carmen Diaz'))).toBeVisible();
    });

    it('should pull to refresh patient list', async () => {
      await element(by.id('patients-list')).swipe('down', 'slow', 0.9);
      
      // Wait for refresh
      await waitFor(element(by.text('John Doe'))).toBeVisible().withTimeout(5000);
    });
  });

  describe('Emergency Alerts Screen - Vertical Scroll', () => {
    beforeEach(async () => {
      await element(by.text('Emergency Alerts')).tap();
    });

    it('should scroll through emergency alerts', async () => {
      await element(by.id('alerts-list')).scroll(200, 'down');
      
      // Should see more alerts
      await expect(element(by.text('Ana Martinez'))).toBeVisible();
    });

    it('should swipe through alerts', async () => {
      await element(by.id('alerts-list')).swipe('up', 'fast');
      await element(by.id('alerts-list')).swipe('down', 'fast');
      
      // First alert should be visible
      await expect(element(by.text('Maria Garcia'))).toBeVisible();
    });
  });
});
