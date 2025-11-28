# Map View Setup Guide

## Current Status
Map view is temporarily disabled to avoid `AIRMapMarker` error. The list view works perfectly.

## Why Map is Disabled
The `react-native-maps` package requires native modules to be linked, which needs a native rebuild when using `expo run:ios`.

## How to Enable Map View

### Option 1: Rebuild iOS App (Recommended)

1. **Stop the current app**
2. **Rebuild with native modules:**
   ```bash
   cd frontend
   npx expo run:ios
   ```
   This will:
   - Rebuild the iOS app with react-native-maps native modules
   - Take 2-5 minutes
   - Automatically start the app when done

3. **Enable map in code:**
   In `frontend/screens/DoctorResultsScreen.tsx`, change:
   ```typescript
   const [mapEnabled, setMapEnabled] = useState(false);
   ```
   to:
   ```typescript
   const [mapEnabled, setMapEnabled] = useState(true);
   ```

### Option 2: Use Expo Go (Simpler but Limited)

If you want to use Expo Go instead:
1. The map should work automatically in Expo Go
2. But you'll lose other native features

### Option 3: Keep List View Only (Current)

The list view works great and shows:
- ✅ All doctors sorted by distance
- ✅ Doctor details (specialty, clinic, address)
- ✅ Distance from user
- ✅ Context-aware buttons (Emergency vs Booking)
- ✅ Scrollable list
- ✅ Call and directions buttons

## What the Map Will Show (When Enabled)

- 📍 Blue marker: Your location
- 📍 Red markers: Doctor locations
- Tap markers to see doctor name and specialty
- Pinch to zoom in/out
- Pan to explore area

## Recommendation

**For now**: Use the list view - it's fully functional and shows all needed information.

**Later**: When you have time, run `npx expo run:ios` to rebuild and enable the map view.
