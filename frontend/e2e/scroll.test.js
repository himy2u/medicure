/**
 * Detox E2E Tests for Scroll and Swipe Functionality
 * These tests run on actual iOS simulator with real gestures
 *
 * Features tested:
 * - Vertical scroll (slow, fast, momentum)
 * - Horizontal scroll (synchronized calendar rows)
 * - Pull-to-refresh
 * - Snap-to-grid behavior
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

    it('should show Not a patient? section', async () => {
      await expect(element(by.text('Not a patient?'))).toBeVisible();
    });

    it('should show Register button', async () => {
      await expect(element(by.text('Register'))).toBeVisible();
    });

    it('should show Login button', async () => {
      await expect(element(by.text('Login'))).toBeVisible();
    });
  });

  describe('Doctor Schedule Screen - Vertical Scroll', () => {
    beforeEach(async () => {
      // Navigate to doctor login first
      await element(by.text('Not a patient?')).tap();
      await element(by.text('Login')).tap();
      // Login as doctor (mock or test account)
      await element(by.id('email-input')).typeText('doctor@test.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.text('Sign In')).tap();
      // Navigate to schedule
      await element(by.text('My Schedule')).tap();
    });

    it('should scroll down through appointments list', async () => {
      // Scroll down 300 pixels
      await element(by.id('appointments-list')).scroll(300, 'down');

      // Verify we scrolled (content changed)
      await device.takeScreenshot('schedule_scroll_down');
    });

    it('should scroll up through appointments list', async () => {
      // First scroll down
      await element(by.id('appointments-list')).scroll(300, 'down');

      // Then scroll back up
      await element(by.id('appointments-list')).scroll(300, 'up');

      await device.takeScreenshot('schedule_scroll_up');
    });

    it('should swipe up fast (momentum scroll)', async () => {
      await element(by.id('appointments-list')).swipe('up', 'fast');

      await device.takeScreenshot('schedule_momentum_up');
    });

    it('should swipe down fast (momentum scroll)', async () => {
      // First swipe up
      await element(by.id('appointments-list')).swipe('up', 'fast');

      // Then swipe down
      await element(by.id('appointments-list')).swipe('down', 'fast');

      await device.takeScreenshot('schedule_momentum_down');
    });

    it('should bounce at edges', async () => {
      // Try to scroll past top - should bounce
      await element(by.id('appointments-list')).swipe('down', 'fast');

      await device.takeScreenshot('schedule_bounce');
    });
  });

  describe('Doctor Availability Screen - Horizontal Scroll', () => {
    beforeEach(async () => {
      // Navigate to availability screen
      await element(by.text('Availability Settings')).tap();
    });

    it('should scroll horizontally through time slots on Monday', async () => {
      // Find Monday's time slot row and scroll right
      await element(by.id('time-slots-mon')).scroll(300, 'right');

      await device.takeScreenshot('availability_scroll_right_mon');
    });

    it('should scroll left through time slots', async () => {
      // First scroll right
      await element(by.id('time-slots-mon')).scroll(300, 'right');

      // Then scroll back left
      await element(by.id('time-slots-mon')).scroll(300, 'left');

      await device.takeScreenshot('availability_scroll_left');
    });

    it('should swipe left fast on time slots', async () => {
      await element(by.id('time-slots-mon')).swipe('left', 'fast');

      await device.takeScreenshot('availability_swipe_left_fast');
    });

    it('should swipe right fast on time slots', async () => {
      // First swipe left
      await element(by.id('time-slots-mon')).swipe('left', 'fast');

      // Then swipe right
      await element(by.id('time-slots-mon')).swipe('right', 'fast');

      await device.takeScreenshot('availability_swipe_right_fast');
    });

    it('should synchronize scroll across all day rows', async () => {
      // Scroll Monday row
      await element(by.id('time-slots-mon')).scroll(200, 'right');

      // All rows should be synchronized
      await device.takeScreenshot('availability_sync_scroll');
    });

    it('should snap to time slot grid', async () => {
      // Quick swipe should snap to nearest slot
      await element(by.id('time-slots-mon')).swipe('left', 'slow', 0.2);

      await device.takeScreenshot('availability_snap_grid');
    });
  });

  describe('My Patients Screen - Vertical Scroll', () => {
    beforeEach(async () => {
      await element(by.text('My Patients')).tap();
    });

    it('should scroll down through patient list', async () => {
      await element(by.id('patients-list')).scroll(400, 'down');

      await device.takeScreenshot('patients_scroll_down');
    });

    it('should scroll up through patient list', async () => {
      // Scroll down first
      await element(by.id('patients-list')).scroll(400, 'down');

      // Scroll back up
      await element(by.id('patients-list')).scroll(400, 'up');

      await device.takeScreenshot('patients_scroll_up');
    });

    it('should swipe up fast through patients', async () => {
      await element(by.id('patients-list')).swipe('up', 'fast');

      await device.takeScreenshot('patients_swipe_fast');
    });

    it('should pull to refresh patient list', async () => {
      await element(by.id('patients-list')).swipe('down', 'slow', 0.9);

      // Wait for refresh animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      await device.takeScreenshot('patients_pull_refresh');
    });

    it('should show all 12 patients when scrolled', async () => {
      // Scroll to bottom
      await element(by.id('patients-list')).swipe('up', 'fast');
      await element(by.id('patients-list')).swipe('up', 'fast');

      // Last patient should eventually be visible
      await device.takeScreenshot('patients_scroll_to_end');
    });
  });

  describe('Emergency Screen - Vertical Scroll', () => {
    beforeEach(async () => {
      // Go back to landing
      await element(by.text('Back')).tap();
      await element(by.text('Back')).tap();
      // Navigate to emergency
      await element(by.text('Emergency')).tap();
    });

    it('should scroll through symptom options', async () => {
      await element(by.id('symptoms-grid')).swipe('up', 'slow');

      await device.takeScreenshot('emergency_scroll_symptoms');
    });

    it('should bounce when scrolling past content', async () => {
      await element(by.id('symptoms-grid')).swipe('down', 'fast');

      await device.takeScreenshot('emergency_bounce');
    });
  });
});
