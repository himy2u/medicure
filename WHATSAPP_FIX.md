# Fix WhatsApp OTP Not Received

## Problem
Backend sends OTP successfully but you don't receive WhatsApp messages.

## Root Cause
Twilio WhatsApp Sandbox requires phone numbers to "join" before receiving messages.

## Solution

### Step 1: Join Twilio Sandbox
1. Open WhatsApp on your phone
2. Send this message to: **+1 415 523 8886**
   ```
   join industrial-taught
   ```
3. You'll receive a confirmation message

### Step 2: Verify Your Number
The phone number must match exactly what you enter in the app.

Format: `+[country code][number]`
- Example: `+16477388366` (Canada)
- Example: `+593998118039` (Ecuador)

### Step 3: Test Again
1. Click WhatsApp signup in app
2. Enter your phone number (with +)
3. You should receive OTP within seconds

## Backend Logs Show Success
```
✓ OTP sent to +16477388366: 164773
Message SID: SM...
```

This means backend is working. The issue is Twilio sandbox setup.

## Alternative: Use Email/Password
Email/Password authentication is fully working and doesn't require any setup.

## Production Fix
For production, get a Twilio production number (not sandbox) and phone numbers will work without joining.
