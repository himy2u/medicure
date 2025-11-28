# Doctor Availability & Appointment Management Plan

## Overview
Implement a comprehensive availability and appointment management system for doctors and patients.

## Features to Implement

### 1. Doctor Availability Calendar
**Location**: DoctorHomeScreen

**Features**:
- Weekly recurring schedule (e.g., "Every Monday 9AM-5PM")
- Block entire days (weekends, holidays)
- Block specific time ranges (sleep hours, full-time work)
- 30-minute time slots
- Visual calendar interface
- Save/update availability

**UI Components**:
- Calendar view with time slots
- Quick presets: "Block Weekends", "Block Nights (10PM-6AM)", "Block Weekdays"
- Custom time range picker
- Toggle for specific days of week

### 2. Appointment Check-in/Check-out System

**For Doctors**:
- See upcoming appointments
- Check-in when patient arrives
- Check-out when consultation complete
- Mark as "In Progress" or "Completed"

**For Patients**:
- See appointment status
- Check-in when arriving at clinic
- See if doctor is available/busy
- Estimated wait time

**Status Flow**:
1. **Scheduled** → Appointment booked
2. **Patient Checked In** → Patient arrived
3. **Doctor Checked In** → Consultation started
4. **Completed** → Both checked out

## Database Schema

### doctor_availability table
```sql
CREATE TABLE doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id),
    day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc. NULL for specific dates
    specific_date DATE, -- For blocking specific days
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true, -- false for blocked times
    recurrence_type VARCHAR(20), -- 'weekly', 'once', 'daily'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### appointments table
```sql
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    doctor_id INTEGER REFERENCES doctors(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, patient_checked_in, in_progress, completed, cancelled
    symptom TEXT,
    patient_checkin_time TIMESTAMP,
    doctor_checkin_time TIMESTAMP,
    checkout_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Steps

### Phase 1: Doctor Availability (Priority)
1. Create availability management screen
2. Add API endpoints for CRUD operations
3. Implement calendar UI
4. Add quick preset buttons

### Phase 2: Appointment Booking
1. Update FindDoctor to check availability
2. Show available time slots
3. Book appointment API
4. Confirmation system

### Phase 3: Check-in/Check-out
1. Add check-in buttons for patients
2. Add check-in/check-out for doctors
3. Real-time status updates
4. Queue management

## API Endpoints Needed

### Availability
- POST /api/doctors/availability - Create/update availability
- GET /api/doctors/{id}/availability - Get doctor's availability
- DELETE /api/doctors/availability/{id} - Remove availability block

### Appointments
- POST /api/appointments - Book appointment
- GET /api/appointments/doctor/{id} - Get doctor's appointments
- GET /api/appointments/patient/{id} - Get patient's appointments
- PATCH /api/appointments/{id}/checkin - Check-in (patient or doctor)
- PATCH /api/appointments/{id}/checkout - Check-out
- GET /api/appointments/{id}/status - Get current status

## Next Steps
1. Create database migrations
2. Implement backend API endpoints
3. Create DoctorAvailabilityScreen component
4. Create AppointmentManagementScreen component
5. Update FindDoctorScreen to show available slots
6. Add real-time status updates
