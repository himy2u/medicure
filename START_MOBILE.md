# Start App for Mobile Devices

## Issue: QR Code "No usable data"

Your mobile device can't reach your computer's local IP. Use tunnel mode:

```bash
cd frontend
npx expo start --tunnel
```

This creates a public URL that works from any network. Scan the new QR code.

## Alternative: Use Same WiFi

1. Ensure phone and computer on same WiFi
2. Start normally: `npx expo start`
3. Scan QR code

## Current Setup

Backend: http://192.168.100.91:8000
Frontend: Expo on port 8081

For mobile to work, use tunnel mode.
