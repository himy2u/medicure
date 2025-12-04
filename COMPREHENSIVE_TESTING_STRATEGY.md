# Comprehensive Testing Strategy - Medicure

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /--------\
                /          \
               / Integration \
              /--------------\
             /                \
            /   Unit Tests     \
           /--------------------\
```

---

## 1. UNIT TESTS

### What We Test
- Individual functions
- Component rendering
- State management
- Utility functions
- API request/response formatting

### Tools
- Jest
- React Native Testing Library
- Mock data

### Coverage Target: 80%+

### Examples

#### Frontend Unit Tests
```typescript
// tests/components/ProfileHeader.test.tsx
describe('ProfileHeader', () => {
  it('displays user name correctly', () => {});
  it('shows Guest when not logged in', () => {});
  it('truncates long names with ellipsis', () => {});
  it('calls signout when clicked', () => {});
});

// tests/utils/navigationHelper.test.ts
describe('getRoleBasedHomeScreen', () => {
  it('returns Landing for patient', () => {});
  it('returns DoctorHome for doctor', () => {});
  it('handles invalid roles', () => {});
});

// tests/screens/EmergencyScreen.test.tsx
describe('EmergencyScreen', () => {
  it('renders symptom list', () => {});
  it('validates location before search', () => {});
  it('calls API with correct params', () => {});
});
```

#### Backend Unit Tests
```python
# tests/test_auth.py
def test_whatsapp_otp_send():
    """Test OTP sending"""
    pass

def test_whatsapp_otp_verify():
    """Test OTP verification"""
    pass

def test_role_assignment():
    """Test correct role assignment"""
    pass

# tests/test_doctor_matching.py
def test_symptom_to_specialty_mapping():
    """Test symptom matching logic"""
    pass

def test_proximity_sorting():
    """Test distance calculation"""
    pass

def test_availability_filtering():
    """Test doctor availability check"""
    pass
```

---

## 2. INTEGRATION TESTS

### What We Test
- API endpoints
- Database operations
- Screen navigation flows
- Component interactions
- State persistence

### Tools
- Supertest (API testing)
- React Navigation testing
- Mock backend responses

### Coverage Target: 70%+

### Examples

#### API Integration Tests
```javascript
// tests/integration/api/emergency.test.js
describe('Emergency API Flow', () => {
  it('POST /api/emergency/request creates request', async () => {
    const response = await request(app)
      .post('/api/emergency/request')
      .send({
        patient_id: 1,
        symptom: 'chest pain',
        latitude: -0.1807,
        longitude: -78.4678
      });
    expect(response.status).toBe(200);
    expect(response.body.doctors).toBeDefined();
  });
  
  it('GET /api/emergency/status returns current status', async () => {});
  it('POST /api/emergency/accept accepts request', async () => {});
});

// tests/integration/api/appointments.test.js
describe('Appointments API Flow', () => {
  it('POST /api/appointments/book creates appointment', async () => {});
  it('GET /api/appointments/list returns user appointments', async () => {});
  it('PUT /api/appointments/cancel cancels appointment', async () => {});
});
```

#### Navigation Integration Tests
```typescript
// tests/integration/navigation/patient-flow.test.tsx
describe('Patient Navigation Flow', () => {
  it('navigates from Landing to Emergency to DoctorResults', () => {
    // Simulate user journey
    const { getByText } = render(<App />);
    fireEvent.press(getByText('Emergency'));
    expect(screen.getByText('Select Symptoms')).toBeTruthy();
    // ... continue flow
  });
});
```

---

## 3. END-TO-END (E2E) TESTS

### What We Test
- Complete user workflows
- Real API calls
- Real database operations
- Cross-role interactions
- Real-time features (WebSocket)

### Tools
- Detox (React Native E2E)
- Automated test scripts
- Test user accounts

### Coverage Target: All critical workflows

### Test Scenarios

#### E2E Test 1: Emergency Request Flow
```javascript
// e2e/emergency-flow.e2e.js
describe('Emergency Request Complete Flow', () => {
  beforeAll(async () => {
    // Create test users
    await createTestPatient();
    await createTestDoctor();
  });

  it('Patient requests emergency, Doctor accepts, Chat works', async () => {
    // 1. Patient logs in
    await loginAsPatient();
    
    // 2. Navigate to Emergency
    await element(by.text('Emergency')).tap();
    
    // 3. Select symptoms
    await element(by.text('Chest Pain')).tap();
    await element(by.text('Find Doctors Now')).tap();
    
    // 4. Wait for doctor list
    await waitFor(element(by.id('doctor-list')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 5. Alert first doctor
    await element(by.id('alert-doctor-0')).tap();
    
    // 6. Switch to doctor account
    await logoutAndLoginAsDoctor();
    
    // 7. Doctor should see alert
    await waitFor(element(by.text('Emergency Alert')))
      .toBeVisible()
      .withTimeout(10000);
    
    // 8. Doctor accepts
    await element(by.text('Accept')).tap();
    
    // 9. Verify chat screen opens
    await expect(element(by.id('chat-screen'))).toBeVisible();
    
    // 10. Send message
    await element(by.id('message-input')).typeText('On my way');
    await element(by.id('send-button')).tap();
    
    // 11. Switch back to patient
    await logoutAndLoginAsPatient();
    
    // 12. Verify message received
    await expect(element(by.text('On my way'))).toBeVisible();
  });
});
```

#### E2E Test 2: Scheduled Appointment Flow
```javascript
// e2e/scheduled-appointment.e2e.js
describe('Scheduled Appointment Complete Flow', () => {
  it('Patient books, Medical Staff checks in, Doctor sees patient', async () => {
    // 1. Patient books appointment
    await loginAsPatient();
    await element(by.text('Find a Doctor')).tap();
    await selectSpecialty('Cardiology');
    await selectDate(tomorrow);
    await selectTime('10:00 AM');
    await element(by.text('Search')).tap();
    await element(by.id('book-doctor-0')).tap();
    await element(by.text('Confirm Booking')).tap();
    
    // 2. Medical Staff checks in patient
    await logoutAndLoginAsMedicalStaff();
    await element(by.text('Check-In Patient')).tap();
    await searchPatient('Test Patient');
    await element(by.text('Check In')).tap();
    await enterVitals({ bp: '120/80', temp: '98.6' });
    await element(by.text('Complete Check-In')).tap();
    
    // 3. Doctor sees patient in queue
    await logoutAndLoginAsDoctor();
    await expect(element(by.text('Test Patient'))).toBeVisible();
    await element(by.text('Test Patient')).tap();
    await element(by.text('Start Consultation')).tap();
    
    // 4. Doctor completes consultation
    await element(by.id('notes-input')).typeText('Patient doing well');
    await element(by.text('Complete')).tap();
    
    // 5. Verify appointment marked complete
    await expect(element(by.text('Completed'))).toBeVisible();
  });
});
```

#### E2E Test 3: Prescription Flow
```javascript
// e2e/prescription-flow.e2e.js
describe('Prescription Complete Flow', () => {
  it('Doctor prescribes, Pharmacy fulfills, Patient picks up', async () => {
    // 1. Doctor writes prescription
    await loginAsDoctor();
    await navigateToPatient('Test Patient');
    await element(by.text('Write Prescription')).tap();
    await element(by.id('medication-input')).typeText('Amoxicillin 500mg');
    await element(by.id('dosage-input')).typeText('3 times daily');
    await element(by.id('duration-input')).typeText('7 days');
    await element(by.text('Send to Pharmacy')).tap();
    
    // 2. Pharmacy receives prescription
    await logoutAndLoginAsPharmacy();
    await waitFor(element(by.text('New Prescription')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('New Prescription')).tap();
    await element(by.text('Accept')).tap();
    
    // 3. Pharmacy prepares medication
    await element(by.text('Start Fulfillment')).tap();
    await element(by.text('Mark Ready')).tap();
    
    // 4. Patient receives notification
    await logoutAndLoginAsPatient();
    await waitFor(element(by.text('Prescription Ready')))
      .toBeVisible()
      .withTimeout(5000);
    
    // 5. Patient views prescription
    await element(by.text('My Prescriptions')).tap();
    await expect(element(by.text('Amoxicillin 500mg'))).toBeVisible();
    await expect(element(by.text('Ready for Pickup'))).toBeVisible();
  });
});
```

---

## 4. BUSINESS USER TESTING (UAT)

### What We Test
- Real user scenarios
- Usability
- Business logic correctness
- Edge cases
- User experience

### Test Users
- Real doctors
- Real patients
- Real medical staff
- Real pharmacy staff

### Test Scenarios

#### UAT Scenario 1: Patient Emergency
**Tester**: Real patient or caregiver
**Goal**: Request emergency help

**Steps**:
1. Open app
2. Click Emergency button
3. Select symptoms (e.g., "Severe headache", "Dizziness")
4. Add description: "Sudden onset, very painful"
5. Click "Find Doctors Now"
6. Review doctor list
7. Check if doctors are sorted by distance
8. Check if specialties match symptoms
9. Click "Alert Doctor" on nearest doctor
10. Wait for response
11. If accepted, start chat
12. Rate experience

**Success Criteria**:
- ✅ Symptoms easy to find
- ✅ Doctors appear within 10 seconds
- ✅ Distance calculations accurate
- ✅ Doctor responds within 5 minutes
- ✅ Chat works smoothly
- ✅ No confusing steps

#### UAT Scenario 2: Doctor Accepting Emergency
**Tester**: Real doctor
**Goal**: Respond to emergency request

**Steps**:
1. Set status to "Available"
2. Wait for emergency alert
3. Review alert details
4. Check patient location
5. Check symptoms
6. Decide to accept or decline
7. If accept, navigate to chat
8. Communicate with patient
9. Provide guidance
10. Complete consultation

**Success Criteria**:
- ✅ Alert is loud and noticeable
- ✅ All relevant info visible
- ✅ Easy to accept/decline
- ✅ Chat loads immediately
- ✅ Patient info accessible
- ✅ Can mark as complete

#### UAT Scenario 3: Medical Staff Check-In
**Tester**: Real nurse or medical assistant
**Goal**: Check in patient for appointment

**Steps**:
1. Patient arrives at clinic
2. Open app
3. Search for patient
4. Verify identity
5. Enter vitals
6. Assign to doctor
7. Notify doctor

**Success Criteria**:
- ✅ Patient search is fast
- ✅ Vitals entry is intuitive
- ✅ Doctor receives notification
- ✅ Patient appears in doctor's queue

#### UAT Scenario 4: Pharmacy Fulfillment
**Tester**: Real pharmacist
**Goal**: Fulfill prescription

**Steps**:
1. Receive prescription notification
2. Review prescription details
3. Check inventory
4. Verify insurance
5. Prepare medication
6. Mark as ready
7. Notify patient
8. Dispense to patient

**Success Criteria**:
- ✅ Prescription details clear
- ✅ Easy to mark status
- ✅ Patient notified automatically
- ✅ Can track fulfillment history

---

## 5. TEST DATA SETUP

### Test Users (Backend)

```python
# backend/tests/seed_test_data.py

test_users = {
    'patient': {
        'name': 'Test Patient',
        'email': 'patient@test.com',
        'phone': '+593987654321',
        'role': 'patient',
        'password': 'Test123!'
    },
    'caregiver': {
        'name': 'Test Caregiver',
        'email': 'caregiver@test.com',
        'phone': '+593987654322',
        'role': 'caregiver',
        'password': 'Test123!'
    },
    'doctor': {
        'name': 'Dr. Test Doctor',
        'email': 'doctor@test.com',
        'phone': '+593987654323',
        'role': 'doctor',
        'specialty': 'Cardiology',
        'sub_specialty': 'Interventional Cardiology',
        'password': 'Test123!'
    },
    'medical_staff': {
        'name': 'Test Nurse',
        'email': 'nurse@test.com',
        'phone': '+593987654324',
        'role': 'medical_staff',
        'password': 'Test123!'
    },
    'ambulance': {
        'name': 'Test Paramedic',
        'email': 'ambulance@test.com',
        'phone': '+593987654325',
        'role': 'ambulance_staff',
        'unit_number': 'AMB-001',
        'password': 'Test123!'
    },
    'lab': {
        'name': 'Test Lab Tech',
        'email': 'lab@test.com',
        'phone': '+593987654326',
        'role': 'lab_staff',
        'password': 'Test123!'
    },
    'pharmacy': {
        'name': 'Test Pharmacist',
        'email': 'pharmacy@test.com',
        'phone': '+593987654327',
        'role': 'pharmacy_staff',
        'password': 'Test123!'
    },
    'admin': {
        'name': 'Test Admin',
        'email': 'admin@test.com',
        'phone': '+593987654328',
        'role': 'super_admin',
        'password': 'Test123!'
    }
}
```

---

## 6. AUTOMATED TEST EXECUTION

### Test Scripts

```bash
# run_all_tests.sh

#!/bin/bash

echo "🧪 Running Medicure Test Suite"
echo "================================"

# 1. Unit Tests
echo "📝 Running Unit Tests..."
cd backend && pytest tests/unit/ -v
cd ../frontend && npm test -- --coverage

# 2. Integration Tests
echo "🔗 Running Integration Tests..."
cd ../backend && pytest tests/integration/ -v
cd ../frontend && npm run test:integration

# 3. E2E Tests
echo "🎭 Running E2E Tests..."
cd .. && npm run test:e2e

# 4. Generate Reports
echo "📊 Generating Test Reports..."
npm run test:report

echo "✅ All Tests Complete!"
```

### Continuous Testing

```yaml
# .github/workflows/test.yml

name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      
      - name: Install Dependencies
        run: |
          cd backend && pip install -r requirements.txt
          cd ../frontend && npm install
      
      - name: Run Unit Tests
        run: |
          cd backend && pytest tests/unit/
          cd ../frontend && npm test
      
      - name: Run Integration Tests
        run: |
          cd backend && pytest tests/integration/
          cd ../frontend && npm run test:integration
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

---

## 7. TEST COVERAGE REQUIREMENTS

### Minimum Coverage
- Unit Tests: 80%
- Integration Tests: 70%
- E2E Tests: All critical workflows
- UAT: All user roles

### Critical Paths (Must be 100% tested)
- Authentication (all methods)
- Emergency request flow
- Doctor alert and acceptance
- Prescription creation and fulfillment
- Payment processing
- Data privacy (PHI protection)

---

## 8. TEST EXECUTION SCHEDULE

### During Development
- Unit tests: Run on every save (watch mode)
- Integration tests: Run before commit
- E2E tests: Run before push

### Before Release
- Full test suite: All tests
- UAT: All scenarios with real users
- Performance tests: Load testing
- Security tests: Penetration testing

---

## 9. BUG TRACKING

### Bug Report Template
```markdown
## Bug Report

**Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Role**: Patient / Doctor / etc.

**Workflow**: Emergency Request / Scheduled Appointment / etc.

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots**:

**Environment**:
- Device: iPhone 14 / Android Pixel 7
- OS: iOS 17 / Android 13
- App Version: 1.0.0

**Test Data Used**:
- User: patient@test.com
- Timestamp: 2025-12-03 10:30 AM
```

---

## 10. SUCCESS METRICS

### Test Quality Metrics
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ Code coverage > 80%
- ✅ No critical bugs
- ✅ UAT approval from all roles

### Performance Metrics
- ✅ App loads < 3 seconds
- ✅ API response < 500ms
- ✅ Doctor search < 2 seconds
- ✅ Chat messages < 1 second
- ✅ Video call connects < 5 seconds

### User Experience Metrics
- ✅ Task completion rate > 95%
- ✅ User satisfaction > 4.5/5
- ✅ Error rate < 1%
- ✅ Support tickets < 5% of users

---

## IMPLEMENTATION PLAN

### Phase 1: Setup Testing Infrastructure (Day 1)
- ✅ Install testing libraries
- ✅ Create test data seed script
- ✅ Setup test users
- ✅ Configure test environment

### Phase 2: Write Tests Alongside Features (Days 2-10)
- ✅ Write unit test for each component
- ✅ Write integration test for each API
- ✅ Write E2E test for each workflow
- ✅ Run tests continuously

### Phase 3: UAT Testing (Days 11-12)
- ✅ Recruit test users
- ✅ Conduct UAT sessions
- ✅ Collect feedback
- ✅ Fix issues

### Phase 4: Final Validation (Day 13)
- ✅ Run full test suite
- ✅ Verify all metrics
- ✅ Generate test report
- ✅ Sign off for production

---

**Ready to implement with comprehensive testing at every level!**
