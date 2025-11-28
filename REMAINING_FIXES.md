# Remaining Fixes - Detailed Plan

## ✅ COMPLETED
### Issue #1: MedicalStaffSignupScreen Layout
- ✅ Google & WhatsApp buttons in one row
- ✅ Reduced spacing throughout
- ✅ Two-column form layout (Name+Email, Password+Confirm)
- ✅ Fixed bottom buttons
- ✅ "See more roles" link added
- ✅ Removed header back button
- ✅ Compact, no-scroll layout

---

## 🔄 REMAINING ISSUES

### Issue #2: SignupScreen Back Button
**Problem**: Back button removed from patient/caregiver signup header
**Solution**: Add back button to left of "Signup" title in header
**Files**: `frontend/screens/SignupScreen.tsx`
**Code Change**:
```tsx
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backButtonText}>← Back</Text>
  </TouchableOpacity>
  <Text style={styles.title}>Signup</Text>
</View>
```

---

### Issue #3: Patient Dashboard (My Health)
**Problem**: "My Health" button redirects to landing page
**Solution**: Create PatientDashboardScreen with:
- Past medical history
- Ongoing treatments
- Upcoming appointments
- Recent test results
- Quick actions (Book appointment, View prescriptions, etc.)

**Files to Create**:
- `frontend/screens/PatientDashboardScreen.tsx`
- Update `frontend/navigation/AppNavigator.tsx`
- Update `frontend/screens/LandingScreen.tsx` navigation

**Dashboard Sections**:
1. Welcome header with patient name
2. Upcoming Appointments card
3. Active Prescriptions card
4. Recent Lab Results card
5. Health Summary card
6. Quick Actions buttons

---

### Issue #4: Prescription & Lab Test Screens
**Problem**: Buttons redirect back to landing
**Solution**: Create dedicated screens

#### A. PrescriptionScreen
**Features**:
- List of active prescriptions
- Prescription history
- Refill requests
- Upload new prescription
- Pharmacy locations

**Files**: `frontend/screens/PrescriptionScreen.tsx`

#### B. LabTestScreen
**Features**:
- Upcoming lab tests
- Test results history
- Book new test
- Download reports
- Lab locations

**Files**: `frontend/screens/LabTestScreen.tsx`

---

### Issue #5: Emergency Doctor Search - CRITICAL
**Problem**: "No doctors available" when searching
**Root Cause**: Backend API not implemented / Database not queried properly

**Solution Steps**:

#### A. Backend API Endpoint
Create `/api/doctors/search` endpoint:
```python
@app.post("/api/doctors/search")
async def search_doctors(
    symptom: str,
    latitude: float,
    longitude: float,
    radius_km: float = 50
):
    # 1. Match symptom to specialty
    # 2. Query doctors from database
    # 3. Calculate distances
    # 4. Filter by availability (24 hours for now)
    # 5. Sort by distance (nearest first)
    # 6. Return doctor list with locations
```

#### B. Symptom to Specialty Mapping
```python
SYMPTOM_SPECIALTY_MAP = {
    "chest pain": ["Cardiologist", "Emergency Medicine"],
    "headache": ["Neurosurgeon", "General Practitioner"],
    "fever": ["General Practitioner", "Internal Medicine"],
    "breathing": ["Pulmonologist", "Emergency Medicine"],
    # ... more mappings
}
```

#### C. Distance Calculation
Use Haversine formula or PostGIS:
```sql
SELECT *, 
  (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
   cos(radians(longitude) - radians(?)) + 
   sin(radians(?)) * sin(radians(latitude)))) AS distance
FROM doctor_service_locations
WHERE doctor_id IN (SELECT id FROM doctors WHERE specialty IN (?))
ORDER BY distance ASC
```

#### D. Frontend Integration
Update `EmergencyScreen.tsx`:
```tsx
const handleFindDoctors = async () => {
  const symptom = selectedSymptom || customSymptom;
  const location = await Location.getCurrentPositionAsync({});
  
  const response = await fetch(`${API_URL}/api/doctors/search`, {
    method: 'POST',
    body: JSON.stringify({
      symptom,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    })
  });
  
  const doctors = await response.json();
  // Navigate to results screen with doctors list
};
```

**Files to Modify**:
- `backend/main.py` - Add search endpoint
- `backend/doctor_search.py` - Create search logic
- `frontend/screens/EmergencyScreen.tsx` - Update handleFindDoctors
- `frontend/screens/DoctorResultsScreen.tsx` - Create results screen

---

### Issue #6: Spanish Translation Button Sizing
**Problem**: Buttons shrink when text changes to Spanish
**Solution**: Set minimum widths and use flexWrap

**Files**: `frontend/screens/LandingScreen.tsx`

**Fix**:
```tsx
// In styles
secondaryButtonRow: {
  flex: 1,
  minWidth: 150, // Add minimum width
  minHeight: 85,
  // ... rest of styles
}

// Or use flexWrap
buttonRow: {
  flexDirection: 'row',
  flexWrap: 'wrap', // Allow wrapping if needed
  gap: spacing.md,
  marginBottom: spacing.lg,
}
```

---

## Priority Order
1. **Issue #5** (Emergency Doctor Search) - CRITICAL - Blocks core functionality
2. **Issue #3** (Patient Dashboard) - HIGH - Core user experience
3. **Issue #4** (Prescription/Lab Screens) - HIGH - Core features
4. **Issue #6** (Spanish button sizing) - MEDIUM - UI polish
5. **Issue #2** (Signup back button) - LOW - Minor UX issue

---

## Estimated Implementation Time
- Issue #5: 2-3 hours (Backend + Frontend)
- Issue #3: 1-2 hours
- Issue #4: 1-2 hours
- Issue #6: 30 minutes
- Issue #2: 15 minutes

**Total**: ~5-8 hours of development work

---

## Next Steps
1. Implement backend doctor search API
2. Create symptom-to-specialty mapping
3. Implement distance calculation
4. Create patient dashboard
5. Create prescription/lab screens
6. Fix button sizing
7. Add back button to signup
