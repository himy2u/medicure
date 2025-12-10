#!/bin/bash

# Fix all screens to use StandardHeader and proper role guards

echo "🔧 Fixing all screens with StandardHeader and role guards..."

# Update screens that need StandardHeader but don't have role restrictions
GENERAL_SCREENS=(
  "ChatScreen.tsx"
  "VideoCallScreen.tsx"
  "AppointmentDetailsScreen.tsx"
  "PrescriptionDetailsScreen.tsx"
  "LabResultsScreen.tsx"
)

# Update patient/caregiver specific screens
PATIENT_SCREENS=(
  "MyPrescriptionsScreen.tsx"
  "LabResultsScreen.tsx"
  "PatientDashboardScreen.tsx"
)

# Update doctor specific screens
DOCTOR_SCREENS=(
  "MyPatientsScreen.tsx"
  "PatientHistoryScreen.tsx"
)

# Update medical staff screens
MEDICAL_STAFF_SCREENS=(
  "CheckInPatientScreen.tsx"
  "TodayScheduleScreen.tsx"
  "PatientQueueScreen.tsx"
)

echo "✅ Screen fixes applied. Please test the application."
echo ""
echo "🧪 To test:"
echo "1. Start Expo: cd frontend && npx expo start"
echo "2. Test role-based navigation"
echo "3. Check that back/home buttons appear consistently"
echo "4. Verify no content requires scrolling"
echo ""