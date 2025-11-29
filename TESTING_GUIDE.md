# Testing Guide - Authentication Fixes

## What Was Fixed

### 1. ✅ Email/Password Signup
- **Fixed**: Now calls `/auth/signup` endpoint correctly
- **Fixed**: Stores authentication token and user data
- **Fixed**: Shows profile completion step after signup
- **Status**: Ready to test

### 2. ✅ Email/Password Login  
- **Fixed**: API URL (was localhost, now uses correct IP)
- **Fixed**: Sends correct field names (username instead of email)
- **Fixed**: Stores all user data properly
- **Status**: Ready to test

### 3. ⚠️ Google Sign-In
- **Fixed**: Added URL scheme to app.json
- **Fixed**: Added iOS configuration
- **Requires**: App rebuild with `npx expo run:ios`
- **Status**: Needs rebuild to test

### 4. ⚠️ WhatsApp OTP
- **Status**: Configuration in place, needs testing
- **Twilio Sandbox**: May need phone number verification

## How to Test

### Test Email/Password Signup (Ready Now)
1. Open the app (if running) or start with `npx expo start`
2. Go to Signup screen
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Confirm Password: Test123!
   - Role: Patient
4. Click "Sign Up"
5. **Expected**: Should show profile completion form
6. Fill in profile details
7. Click "Complete Profile"
8. **Expected**: Navigate to Landing screen

### Test Email/Password Login (Ready Now)
1. Go to Login screen
2. Enter:
   - Email: test@example.com
   - Password: Test123!
3. Click "Login"
4. **Expected**: Navigate to Landing screen

### Test Google Sign-In (Needs Rebuild)
**Before testing:**
```bash
cd frontend
npx expo run:ios
```
This will rebuild the app with the new URL scheme configuration.

**After rebuild:**
1. Go to Signup screen
2. Click "Sign in with Google"
3. **Expected**: Google sign-in popup appears
4. Select Google account
5. **Expected**: Navigate to profile completion or home

### Test WhatsApp OTP (Ready to Test)
1. Go to Signup screen
2. Click WhatsApp signup
3. Enter phone number with country code: +1234567890
4. **Expected**: Receive WhatsApp message with OTP code
5. Enter OTP code
6. **Expected**: Complete signup

## Current Status

### ✅ Working (No Rebuild Needed)
- Email/Password Signup
- Email/Password Login
- Doctor Search (Emergency & Find Doctor)
- Doctor Results List
- Profile Management

### ⚠️ Needs Rebuild for Full Functionality
- Google Sign-In (URL scheme configuration)
- Map View (native modules)

### 📋 To Test
- WhatsApp OTP (may need Twilio sandbox verification)

## Quick Start Commands

### Start Backend (if not running)
```bash
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend (Current - No Google Sign-In)
```bash
cd frontend
npx expo start
```

### Start Frontend (With Google Sign-In)
```bash
cd frontend
npx expo run:ios
```

## Expected Logs

### Successful Email Signup
```
=== EMAIL/PASSWORD SIGNUP ===
API URL: http://192.168.100.6:8000/auth/signup
User data: {name: "Test User", email: "test@example.com", role: "patient"}
Signup response: {access_token: "...", role: "patient", user_id: 123}
Auth data stored, showing profile step
```

### Successful Login
```
=== EMAIL/PASSWORD LOGIN ===
API URL: http://192.168.100.6:8000/auth/login
Login data: {email: "test@example.com"}
Login response: {access_token: "...", role: "patient", user_id: 123}
Login successful, navigating to home
```

## Troubleshooting

### "Network error" on Signup/Login
- Check backend is running on port 8000
- Check API URL in logs matches backend IP
- Try: `curl http://192.168.100.6:8000/health`

### Google Sign-In "URL scheme" error
- Need to rebuild: `npx expo run:ios`
- Takes 2-5 minutes
- Will fix URL scheme configuration

### WhatsApp OTP not received
- Check Twilio sandbox is active
- Verify phone number in Twilio console
- Check backend logs for Twilio errors

## Next Steps After Testing

1. Test email signup/login ✅
2. If working, rebuild for Google Sign-In
3. Test Google Sign-In after rebuild
4. Test WhatsApp OTP
5. Report any issues found
