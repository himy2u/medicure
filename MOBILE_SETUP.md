# Mobile Device Setup for Medicure

## Issue: "No usable data" when scanning QR code

When scanning the Expo QR code with your mobile device, you may see "No usable data found" error. This happens when your mobile device cannot reach your development machine's local IP address.

## Solutions:

### Option 1: Use Tunnel Mode (Recommended for different networks)

Stop the current Expo server and restart with tunnel mode:

```bash
cd frontend
npx expo start --tunnel
```

This will:
- Create a public URL that works from any network
- Show a new QR code that mobile devices can scan
- May be slightly slower but works reliably

### Option 2: Use Same WiFi Network (Faster but requires same network)

1. Ensure your computer and mobile device are on the **same WiFi network**
2. Make sure your firewall allows connections on port 8081
3. Restart Expo:
   ```bash
   cd frontend
   npx expo start --clear
   ```

### Option 3: Use Expo Go with Manual URL

1. Install Expo Go app on your mobile device:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. In Expo Go app, manually enter the URL shown in your terminal:
   - Look for: `exp://192.168.x.x:8081` or `exp://your-tunnel-url`

### Option 4: Build Development Client (Best for production testing)

For a more production-like experience:

```bash
cd frontend
npx expo run:ios    # For iOS simulator/device
npx expo run:android # For Android emulator/device
```

This builds a development client directly on your device without needing Expo Go.

## Current Status

- ✅ Backend running on port 8000
- ✅ Frontend running on port 8081
- ✅ iOS simulator working
- ⚠️ Mobile QR code needs tunnel mode or same network

## Recommended Next Steps

1. **For quick testing**: Use tunnel mode
   ```bash
   cd frontend
   npx expo start --tunnel
   ```

2. **For production**: Build development client
   ```bash
   npx expo run:ios
   npx expo run:android
   ```
