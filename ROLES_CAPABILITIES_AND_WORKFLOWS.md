# Medicure - Roles, Capabilities & Workflows

## Role 1: PATIENT

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 📝 Complete profile (Name, National ID/Cedula, Insurance)
- 📋 View/edit personal information
- 🔔 Manage notification preferences
- 📱 Update contact information
- 🏥 Add/manage insurance providers
- 📄 Upload/view medical documents
- 🔐 Change password/security settings

### Workflows

#### Workflow 1A: Emergency Request (In-Person)
**Goal**: Get immediate medical help
**Steps**:
1. Click "🚨 Emergency" button
2. Select symptoms from structured list (e.g., chest pain, difficulty breathing)
3. Add optional free text description
4. System auto-detects location OR manually enter address
5. Click "Find Doctors Now"
6. View doctors on map/list (sorted by proximity)
7. Click "🚨 Alert Doctor" on preferred doctor
8. Wait for doctor acceptance (5 min timeout)
9. If accepted → Chat with doctor
10. Share live location
11. Doctor arrives or directs to clinic
12. Complete appointment → Rate doctor

**Interactions**: Doctor, potentially Ambulance Staff (if critical), Medical Staff (at clinic)

#### Workflow 1B: Scheduled Appointment (In-Person)
**Goal**: Book future doctor visit
**Steps**:
1. Click "🔍 Find a Doctor"
2. Select specialty (or search by doctor name)
3. Select preferred date/time
4. Enter location or use current
5. Click "Search"
6. View available doctors
7. Click "📅 Book Appointment"
8. Confirm booking details
9. Receive confirmation
10. Get reminder 24h before
11. Attend appointment
12. Complete → Rate doctor

**Interactions**: Doctor, Medical Staff (check-in), potentially Lab Staff (if tests ordered), Pharmacy Staff (if prescription)

#### Workflow 1C: Scheduled Appointment (Virtual/Telemedicine)
**Goal**: Video consultation with doctor
**Steps**:
1. Click "🔍 Find a Doctor"
2. Select specialty
3. Select date/time
4. Toggle "Virtual Appointment"
5. Book appointment
6. At appointment time → Click "Join Video Call"
7. Video consultation with doctor
8. Receive prescription/lab orders digitally
9. Complete → Rate doctor

**Interactions**: Doctor only (remote), potentially Lab Staff (if tests ordered), Pharmacy Staff (if prescription)

#### Workflow 1D: View My Appointments
**Goal**: Manage appointments
**Steps**:
1. Click "📅 My Appointments"
2. View upcoming appointments
3. View past appointments
4. Cancel/reschedule if needed
5. View appointment details
6. Access chat with doctor

**Interactions**: View only, no active interaction

#### Workflow 1E: Manage Prescriptions
**Goal**: View and refill medications
**Steps**:
1. Click "💊 My Prescriptions"
2. View active prescriptions
3. Click "Request Refill"
4. Select pharmacy
5. Pharmacy fulfills order
6. Pick up or get delivery

**Interactions**: Pharmacy Staff

#### Workflow 1F: View Lab Results
**Goal**: Access test results
**Steps**:
1. Click "🧪 Lab Results"
2. View pending tests
3. View completed results
4. Download PDF reports
5. Share with doctor if needed

**Interactions**: Lab Staff (view only)

---

## Role 2: CAREGIVER

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 📝 Complete profile (Name, National ID/Cedula, Insurance)
- 👨‍👩‍👧 Add/manage multiple patients (care recipients)
- 📋 View/edit patient information
- 🔔 Manage notification preferences for each patient
- 📱 Update contact information
- 🏥 Manage insurance for each patient
- 📄 Upload/view medical documents for each patient

### Workflows

**Same as Patient (Workflows 1A-1F), PLUS:**

#### Workflow 2A: Manage Patient Profiles
**Goal**: Add and manage care recipients
**Steps**:
1. Click "👨‍👩‍👧 Patient Profiles"
2. Click "Add Patient"
3. Enter patient details (Name, DOB, Relationship)
4. Add medical conditions
5. Add medications
6. Add emergency contacts
7. Save profile
8. Switch between patients for booking

**Interactions**: None (self-service)

#### Workflow 2B: Medication Reminders
**Goal**: Track patient medications
**Steps**:
1. Select patient
2. Click "💊 Medications"
3. Add medication schedule
4. Set reminders
5. Mark as taken
6. Track adherence
7. Get refill alerts

**Interactions**: Pharmacy Staff (for refills)

---

## Role 3: DOCTOR

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 🩺 Set primary specialty (e.g., Cardiology, Pediatrics)
- 🔬 Set sub-specialties (e.g., Interventional Cardiology)
- 👶 Set expertise/niche (e.g., Pediatric Cardiology, Geriatric Care)
- 📍 Add multiple practice locations (clinics/hospitals)
- ⏰ Set availability schedule per location
- 🏥 Add insurance providers accepted
- 📜 Upload credentials/certifications
- 💰 Set consultation fees
- 🔔 Manage notification preferences
- 📱 Update contact information
- 🟢 Toggle "Available Now" status

### Workflows

#### Workflow 3A: Emergency Request Response
**Goal**: Respond to urgent patient needs
**Steps**:
1. Receive real-time alert notification (push + sound)
2. View alert modal:
   - Patient symptoms
   - Patient location + distance
   - Patient age/gender
   - 5-minute countdown timer
3. Click "Accept" OR "Decline"
4. **If Accept**:
   - Navigate to chat screen
   - View patient details
   - Chat with patient/caregiver
   - Share clinic location OR offer to visit patient
   - If patient needs transport → Request ambulance
   - Start video call if needed
   - Provide immediate guidance
   - Mark appointment as "In Progress"
   - Complete consultation
   - Write prescription (if needed) → Pharmacy notified
   - Order lab tests (if needed) → Lab notified
   - Mark as "Complete"
   - Patient rates doctor
5. **If Decline**:
   - Alert dismissed
   - Next doctor in list is alerted

**Interactions**: Patient/Caregiver, potentially Medical Staff (if at clinic), Ambulance Staff (if transport needed), Lab Staff (if tests ordered), Pharmacy Staff (if prescription)

#### Workflow 3B: Scheduled In-Person Appointment
**Goal**: See patient at clinic
**Steps**:
1. View "📅 Today's Appointments" on home screen
2. Medical Staff checks in patient
3. Receive notification "Patient has arrived"
4. Click appointment to view details
5. Review patient history/symptoms
6. Click "Start Consultation"
7. Examine patient
8. Chat with patient during/after visit
9. Write prescription → Pharmacy notified
10. Order lab tests → Lab notified
11. Schedule follow-up if needed
12. Mark as "Complete"
13. Patient rates doctor

**Interactions**: Patient/Caregiver, Medical Staff (check-in/assist), Lab Staff (if tests ordered), Pharmacy Staff (if prescription)

#### Workflow 3C: Scheduled Virtual Appointment (Telemedicine)
**Goal**: Video consultation with patient
**Steps**:
1. View "📅 Today's Appointments"
2. At appointment time → Click "Start Video Call"
3. Patient joins video call
4. Conduct video consultation
5. Review symptoms/concerns
6. Provide diagnosis/advice
7. Write prescription → Pharmacy notified
8. Order lab tests → Lab notified
9. Schedule follow-up if needed
10. End call
11. Mark as "Complete"
12. Patient rates doctor

**Interactions**: Patient/Caregiver (remote), Lab Staff (if tests ordered), Pharmacy Staff (if prescription)

#### Workflow 3D: Manage Availability
**Goal**: Control when accepting appointments
**Steps**:
1. Click "⏰ Availability"
2. View weekly schedule
3. Set working hours per location
4. Block specific dates (vacation)
5. Set break times
6. Toggle "Available Now" for emergencies
7. System auto-blocks during active appointments
8. Save changes

**Interactions**: None (self-service)

#### Workflow 3E: View Patient History
**Goal**: Review past interactions
**Steps**:
1. Click "📋 My Patients"
2. Search/filter patients
3. Click patient name
4. View appointment history
5. View prescriptions written
6. View lab results
7. View chat history
8. Add notes

**Interactions**: View only

---

## Role 4: MEDICAL STAFF (Nurse, Medical Assistant)

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 🏥 Set assigned clinic/hospital
- 👨‍⚕️ Link to supervising doctor(s)
- 📋 Set role (Nurse, Medical Assistant, Receptionist)
- 🔔 Manage notification preferences
- 📱 Update contact information

### Workflows

#### Workflow 4A: Patient Check-In (In-Person)
**Goal**: Register patient arrival
**Steps**:
1. Patient arrives at clinic
2. Click "✅ Check-In Patient"
3. Scan patient QR code OR search by name/phone
4. Verify patient identity
5. Update vitals (BP, temp, weight, etc.)
6. Confirm insurance information
7. Add reason for visit notes
8. Assign to doctor
9. Add to doctor's queue
10. Notify doctor "Patient ready"

**Interactions**: Patient/Caregiver, Doctor (notification)

#### Workflow 4B: Manage Today's Schedule
**Goal**: Coordinate patient flow
**Steps**:
1. View "📅 Today's Schedule"
2. See all appointments for the day
3. Mark patients as:
   - Scheduled
   - Arrived
   - In Consultation
   - Completed
   - No-show
4. Reschedule if needed
5. Handle walk-ins

**Interactions**: Patient/Caregiver, Doctor

#### Workflow 4C: Assist During Consultation
**Goal**: Support doctor during patient visit
**Steps**:
1. Doctor requests assistance
2. Receive notification
3. Join consultation room
4. Assist with procedures
5. Take notes
6. Prepare documents
7. Process prescriptions
8. Schedule follow-ups
9. Provide patient education

**Interactions**: Doctor, Patient/Caregiver

#### Workflow 4D: Process Prescriptions
**Goal**: Send prescriptions to pharmacy
**Steps**:
1. Doctor writes prescription
2. Receive prescription in queue
3. Review prescription
4. Verify patient information
5. Select pharmacy (patient preference)
6. Send to pharmacy
7. Notify patient when ready

**Interactions**: Doctor, Patient/Caregiver, Pharmacy Staff

---

## Role 5: AMBULANCE STAFF (Paramedic, EMT)

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 🚑 Set ambulance unit number
- 📍 Set base station location
- 🏥 Set service area/coverage zone
- 👥 Set crew members
- 🔔 Manage notification preferences
- 📱 Update contact information
- 🟢 Toggle "Available" status

### Workflows

#### Workflow 5A: Emergency Dispatch Response
**Goal**: Transport patient to medical facility
**Steps**:
1. Receive emergency dispatch alert
2. View dispatch details:
   - Patient location (live GPS)
   - Patient symptoms/condition
   - Requesting party (Patient/Caregiver/Doctor)
   - Destination hospital/clinic
3. Click "Accept Dispatch" OR "Unavailable"
4. **If Accept**:
   - Navigate to patient location (GPS)
   - Update status: "En Route to Patient"
   - View ETA
   - Call patient/caregiver for details
   - Arrive at scene
   - Mark "Arrived at Scene"
   - Assess patient condition
   - Provide emergency care
   - Update patient status
   - Load patient
   - Select destination (hospital/clinic)
   - Mark "En Route to Hospital"
   - Share live location with hospital
   - Update ETA
   - Notify hospital of arrival
   - Arrive at hospital
   - Mark "Arrived at Hospital"
   - Transfer patient to hospital staff
   - Complete incident report
   - Mark "Case Closed"
   - Return to base

**Interactions**: Patient/Caregiver, Doctor (if doctor requested), Medical Staff (at hospital)

#### Workflow 5B: Scheduled Patient Transport
**Goal**: Non-emergency patient transport
**Steps**:
1. View "📅 Scheduled Transports"
2. See pickup time and location
3. Navigate to pickup location
4. Mark "Arrived for Pickup"
5. Assist patient into ambulance
6. Transport to destination
7. Share live location
8. Arrive at destination
9. Assist patient out
10. Mark "Transport Complete"
11. Return to base

**Interactions**: Patient/Caregiver, Medical Staff (at destination)

---

## Role 6: LAB STAFF (Lab Technician, Phlebotomist)

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 🔬 Set lab facility name
- 📍 Set lab location
- 🧪 Set test types offered
- ⏰ Set operating hours
- 🔔 Manage notification preferences
- 📱 Update contact information

### Workflows

#### Workflow 6A: Process Lab Test Order
**Goal**: Complete lab tests and deliver results
**Steps**:
1. Receive "New Lab Order" notification
2. View order details:
   - Patient information
   - Tests requested
   - Ordering doctor
   - Priority (Routine/Urgent/STAT)
3. Click "Accept Order"
4. Schedule patient for sample collection
5. Patient arrives → Mark "Patient Arrived"
6. Collect sample (blood, urine, etc.)
7. Mark "Sample Collected"
8. Process sample
9. Mark "In Progress"
10. Run tests
11. Enter preliminary results
12. Flag abnormal values
13. Review results
14. Enter final results
15. Upload report PDF
16. Add technician notes
17. Mark "Complete"
18. System notifies doctor and patient
19. Patient can view results in app

**Interactions**: Doctor (receives order), Patient (sample collection, results), potentially Medical Staff (if at clinic)

#### Workflow 6B: Urgent/STAT Test Processing
**Goal**: Fast-track critical tests
**Steps**:
1. Receive "STAT Order" alert (high priority)
2. Immediately accept
3. Prioritize over routine tests
4. Expedite sample collection
5. Rush processing
6. Deliver results within target time
7. Call doctor with critical values
8. Complete documentation

**Interactions**: Doctor (urgent communication), Patient

---

## Role 7: PHARMACY STAFF (Pharmacist, Pharmacy Technician)

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (WhatsApp, Google, Email)
- 💊 Set pharmacy name
- 📍 Set pharmacy location
- ⏰ Set operating hours
- 🏥 Set insurance accepted
- 🚚 Set delivery options (pickup/delivery)
- 🔔 Manage notification preferences
- 📱 Update contact information

### Workflows

#### Workflow 7A: Process Prescription
**Goal**: Fulfill medication order
**Steps**:
1. Receive "New Prescription" notification
2. View prescription details:
   - Patient information
   - Medications ordered
   - Dosage and quantity
   - Prescribing doctor
   - Insurance information
3. Click "Accept Prescription"
4. Verify insurance coverage
5. Check medication inventory
6. If out of stock → Notify patient of delay
7. Verify dosage and interactions
8. Prepare medication
9. Package medication
10. Add patient counseling notes
11. Mark "Ready for Pickup"
12. Notify patient
13. Patient arrives → Verify identity
14. Provide medication counseling
15. Process payment
16. Mark "Dispensed"
17. Complete transaction

**Interactions**: Doctor (prescription source), Patient (pickup/counseling)

#### Workflow 7B: Prescription Refill Request
**Goal**: Refill existing medication
**Steps**:
1. Receive "Refill Request" from patient
2. View original prescription
3. Check refills remaining
4. If refills available → Process as new order
5. If no refills → Contact doctor for authorization
6. Doctor approves → Process refill
7. Notify patient when ready
8. Dispense as normal

**Interactions**: Patient (request), Doctor (if authorization needed)

#### Workflow 7C: Medication Delivery
**Goal**: Deliver medication to patient
**Steps**:
1. Patient selects "Delivery" option
2. Prepare medication
3. Package for delivery
4. Assign to delivery driver
5. Mark "Out for Delivery"
6. Share tracking with patient
7. Driver delivers
8. Patient signs for delivery
9. Mark "Delivered"
10. Complete transaction

**Interactions**: Patient (delivery)

---

## Role 8: SUPER ADMIN

### Individual Capabilities (Profile & Settings)
- ✅ Sign up/login (Email only - highest security)
- 👥 Full user management access
- 📊 System analytics access
- 🔍 Audit log access
- ⚙️ System configuration access
- 🔐 Security settings management

### Workflows

#### Workflow 8A: User Management
**Goal**: Manage platform users
**Steps**:
1. Click "👥 Users"
2. View all users (paginated)
3. Search by name/email/phone/role
4. Filter by role
5. Click user → View details
6. Actions available:
   - Edit user information
   - Change user role
   - Reset password
   - Soft delete (deactivate)
   - Hard delete (permanent removal)
   - View user activity
7. Create new user:
   - Click "Add User"
   - Select role
   - Enter details
   - Set initial password
   - Send invitation

**Interactions**: None (administrative)

#### Workflow 8B: System Monitoring
**Goal**: Monitor platform health
**Steps**:
1. Click "📊 Dashboard"
2. View real-time metrics:
   - Active users (now)
   - Appointments today
   - Emergency requests (active)
   - Average response time
   - System uptime
   - Error rate
3. View charts:
   - Users over time
   - Appointments per day
   - Popular specialties
   - Geographic distribution
4. Set up alerts for anomalies

**Interactions**: None (monitoring)

#### Workflow 8C: Audit Logs
**Goal**: Review system activity
**Steps**:
1. Click "🔍 Audit Logs"
2. View all system events
3. Filter by:
   - Date range
   - User
   - Action type
   - Role
4. Search for specific events
5. Export logs for compliance
6. Investigate security incidents

**Interactions**: None (review only)

---

## WORKFLOW INTERACTION MATRIX

| Workflow | Patient | Caregiver | Doctor | Medical Staff | Ambulance | Lab | Pharmacy | Admin |
|----------|---------|-----------|--------|---------------|-----------|-----|----------|-------|
| Emergency In-Person | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | - | - | - |
| Scheduled In-Person | ✅ | ✅ | ✅ | ✅ | - | ⚠️ | ⚠️ | - |
| Scheduled Virtual | ✅ | ✅ | ✅ | - | - | ⚠️ | ⚠️ | - |
| Lab Test Processing | ⚠️ | ⚠️ | ✅ | ⚠️ | - | ✅ | - | - |
| Prescription Fulfillment | ✅ | ✅ | ✅ | ⚠️ | - | - | ✅ | - |
| Ambulance Dispatch | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | - | - | - |
| User Management | - | - | - | - | - | - | - | ✅ |

Legend:
- ✅ Primary participant
- ⚠️ Secondary participant (may be involved)
- `-` Not involved

---

## SUMMARY: SCREENS NEEDED

### Patient/Caregiver (12 screens)
1. ✅ LandingScreen
2. ✅ SignupScreen
3. ✅ EmergencyScreen
4. ✅ FindDoctorScreen
5. ✅ DoctorResultsScreen
6. ⏳ AppointmentBookingScreen
7. ⏳ MyAppointmentsScreen
8. ⏳ AppointmentDetailsScreen
9. ⏳ ChatScreen
10. ⏳ VideoCallScreen
11. ⏳ MyPrescriptionsScreen
12. ⏳ LabResultsScreen

### Doctor (10 screens)
1. ✅ DoctorHomeScreen
2. ⏳ DoctorProfileSetupScreen
3. ⏳ EmergencyAlertModal
4. ⏳ MyAppointmentsScreen (shared)
5. ⏳ AppointmentDetailsScreen (shared)
6. ⏳ ChatScreen (shared)
7. ⏳ VideoCallScreen (shared)
8. ⏳ AvailabilityManagementScreen
9. ⏳ MyPatientsScreen
10. ⏳ PatientHistoryScreen

### Medical Staff (6 screens)
1. ✅ MedicalStaffHomeScreen
2. ⏳ CheckInPatientScreen
3. ⏳ TodayScheduleScreen
4. ⏳ PatientQueueScreen
5. ⏳ VitalsEntryScreen
6. ⏳ PrescriptionProcessingScreen

### Ambulance Staff (5 screens)
1. ✅ AmbulanceStaffHomeScreen
2. ⏳ DispatchAlertModal
3. ⏳ NavigationScreen
4. ⏳ PatientAssessmentScreen
5. ⏳ IncidentReportScreen

### Lab Staff (5 screens)
1. ✅ LabStaffHomeScreen
2. ⏳ LabOrdersListScreen
3. ⏳ OrderDetailsScreen
4. ⏳ SampleCollectionScreen
5. ⏳ ResultsEntryScreen

### Pharmacy Staff (5 screens)
1. ✅ PharmacyStaffHomeScreen
2. ⏳ PrescriptionsListScreen
3. ⏳ PrescriptionDetailsScreen
4. ⏳ FulfillmentScreen
5. ⏳ DispensingScreen

### Super Admin (4 screens)
1. ⏳ AdminDashboardScreen
2. ⏳ UserManagementScreen
3. ⏳ AnalyticsScreen
4. ⏳ AuditLogsScreen

**Total: 52 screens (7 done, 45 to build)**

---

## NEXT STEPS

Once you approve this breakdown, I will:

1. ✅ Build all 45 remaining screens
2. ✅ Use BaseScreen component for consistent UI
3. ✅ Implement all workflows
4. ✅ Add backend test data for all roles
5. ✅ Create automated test scripts
6. ✅ Test complete end-to-end flows

**Please review and approve so I can start building!**
