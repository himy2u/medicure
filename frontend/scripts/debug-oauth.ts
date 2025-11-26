/**
 * Debug script to verify Google OAuth configuration
 * Run with: npx ts-node scripts/debug-oauth.ts
 */

import * as AuthSession from 'expo-auth-session';

console.log('=== Google OAuth Debug Information ===\n');

// Environment variables
console.log('1. Environment Variables:');
console.log('   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
console.log('   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:', process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
console.log('   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:', process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
console.log('');

// Redirect URIs
console.log('2. Redirect URIs:');
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'medic',
  path: 'redirect',
});
console.log('   Computed redirectUri:', redirectUri);
console.log('');

// Expected configuration
console.log('3. Expected Google Cloud Console Configuration:');
console.log('');
console.log('   iOS Client ID: 920375448724-n0p1g2gbkenbmaduto9tcqt4fbq8hsr6');
console.log('   Authorized redirect URIs:');
console.log('     - medic://redirect');
console.log('     - com.googleusercontent.apps.920375448724-n0p1g2gbkenbmaduto9tcqt4fbq8hsr6:/redirect');
console.log('');
console.log('   Android Client ID: 920375448724-c03e17m90cqb81bb14q7e5blp6b9vobb');
console.log('   Authorized redirect URIs:');
console.log('     - medic://redirect');
console.log('');
console.log('   Web Client ID: 920375448724-pdnedfikt5kh3cphc1n89i270n4hasps');
console.log('   Authorized redirect URIs:');
console.log('     - https://auth.expo.io/@anonymous/medic');
console.log('     - http://localhost:19006');
console.log('');

// Instructions
console.log('4. Next Steps:');
console.log('   a) Go to: https://console.cloud.google.com/apis/credentials');
console.log('   b) Select project: mcure-111');
console.log('   c) Configure each client ID with the redirect URIs listed above');
console.log('   d) Save changes and wait 5-10 minutes for propagation');
console.log('   e) Restart Expo dev server: npx expo start --clear');
console.log('');

console.log('5. Common Issues:');
console.log('   - redirect_uri_mismatch: URIs in Google Console don\'t match');
console.log('   - invalid_client: Client ID is incorrect');
console.log('   - access_denied: OAuth consent screen not configured or user not added as test user');
console.log('');

console.log('=== End Debug Information ===');
