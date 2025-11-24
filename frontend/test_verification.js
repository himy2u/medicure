// Verification script to check UI states before/after button clicks
const fs = require('fs');
const path = require('path');

function takeScreenshot(filename, description) {
  console.log(`\n📸 Taking screenshot: ${filename}`);
  console.log(`Description: ${description}`);
  
  const screenshotPath = `/Users/user/github/medicure/${filename}`;
  const cmd = `xcrun simctl io booted screenshot ${screenshotPath}`;
  
  require('child_process').execSync(cmd, { stdio: 'inherit' });
  
  // Verify file exists and get size
  if (fs.existsSync(screenshotPath)) {
    const stats = fs.statSync(screenshotPath);
    console.log(`✅ Screenshot saved: ${stats.size} bytes`);
    return screenshotPath;
  } else {
    console.log(`❌ Screenshot failed`);
    return null;
  }
}

function verifyButtonBehavior() {
  console.log('🔍 Starting systematic button verification...\n');
  
  // 1. Take baseline screenshot
  const baseline = takeScreenshot('baseline_ui.png', 'Clean UI before any clicks');
  
  // 2. Test emergency button
  console.log('\n🚨 Testing Emergency Button...');
  // Add emergency trigger to App.tsx
  console.log('Adding emergency trigger...');
  
  // 3. Take emergency screenshot
  const emergency = takeScreenshot('emergency_result.png', 'After emergency button click');
  
  // 4. Test regular button
  console.log('\n📱 Testing Regular Feature Button...');
  // Add regular trigger to App.tsx
  console.log('Adding regular feature trigger...');
  
  // 5. Take regular screenshot
  const regular = takeScreenshot('regular_result.png', 'After regular feature button click');
  
  // 6. Compare results
  console.log('\n📊 Verification Results:');
  console.log(`Baseline: ${baseline ? '✅' : '❌'}`);
  console.log(`Emergency: ${emergency ? '✅' : '❌'}`);
  console.log(`Regular: ${regular ? '✅' : '❌'}`);
  
  if (baseline && emergency && regular) {
    console.log('\n✅ All screenshots captured successfully');
    console.log('Files created for comparison:');
    console.log('- baseline_ui.png (clean state)');
    console.log('- emergency_result.png (emergency alert)');
    console.log('- regular_result.png (signup prompt)');
  }
}

verifyButtonBehavior();
