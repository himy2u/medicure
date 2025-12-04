#!/bin/bash

# Add auth checks to all home screens

HOME_SCREENS=(
  "frontend/screens/MedicalStaffHomeScreen.tsx"
  "frontend/screens/AmbulanceStaffHomeScreen.tsx"
  "frontend/screens/LabStaffHomeScreen.tsx"
  "frontend/screens/PharmacyStaffHomeScreen.tsx"
  "frontend/screens/ClinicAdminHomeScreen.tsx"
)

for screen in "${HOME_SCREENS[@]}"; do
  echo "Adding auth check to $screen..."
  
  # Check if useAuthCheck is already imported
  if grep -q "useAuthCheck" "$screen"; then
    echo "  ✅ Already has auth check"
  else
    # Add import
    sed -i '' "/import { RootStackParamList }/a\\
import { useAuthCheck } from '../hooks/useAuthCheck';
" "$screen"
    
    # Add useAuthCheck() call after navigation hook
    sed -i '' "/const navigation = useNavigation/a\\
  \\
  // Check authentication on mount\\
  useAuthCheck();
" "$screen"
    
    echo "  ✅ Added auth check"
  fi
done

echo ""
echo "✅ All home screens now have auth checks"
