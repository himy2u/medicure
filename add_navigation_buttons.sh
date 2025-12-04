#!/bin/bash

# Add back and home buttons to all dashboard screens

echo "Adding navigation buttons to dashboard screens..."

# List of dashboard screens
DASHBOARDS=(
  "frontend/screens/DoctorHomeScreen.tsx"
  "frontend/screens/MedicalStaffHomeScreen.tsx"
  "frontend/screens/AmbulanceStaffHomeScreen.tsx"
  "frontend/screens/LabStaffHomeScreen.tsx"
  "frontend/screens/PharmacyStaffHomeScreen.tsx"
  "frontend/screens/ClinicAdminHomeScreen.tsx"
  "frontend/screens/PatientDashboardScreen.tsx"
)

for screen in "${DASHBOARDS[@]}"; do
  echo "Processing $screen..."
  
  # Check if ProfileHeader already has hideHomeButton=false
  if grep -q "hideHomeButton={false}" "$screen"; then
    echo "  ✅ Home button already enabled"
  elif grep -q "ProfileHeader" "$screen"; then
    # Change hideHomeButton to false or add it
    if grep -q "hideHomeButton={true}" "$screen"; then
      sed -i '' 's/hideHomeButton={true}/hideHomeButton={false}/g' "$screen"
      echo "  ✅ Changed hideHomeButton to false"
    else
      echo "  ⚠️  ProfileHeader found but no hideHomeButton prop - manual check needed"
    fi
  else
    echo "  ⚠️  No ProfileHeader found - manual addition needed"
  fi
done

echo ""
echo "✅ Navigation buttons updated"
echo ""
echo "Note: Some screens may need manual review"
