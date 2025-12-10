-- Missing tables for Medicure application

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL,
    appointment_type VARCHAR(50) NOT NULL, -- 'emergency' or 'scheduled'
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    symptom TEXT,
    notes TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL,
    appointment_id TEXT REFERENCES appointments(id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, fulfilled, expired, cancelled
    refills_remaining INTEGER DEFAULT 0,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- Lab tests table
CREATE TABLE IF NOT EXISTS lab_tests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL,
    appointment_id TEXT REFERENCES appointments(id),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ordered', -- ordered, sample_collected, in_progress, completed, cancelled
    ordered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lab_tests_patient ON lab_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_doctor ON lab_tests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_status ON lab_tests(status);

-- Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lab_test_id TEXT NOT NULL REFERENCES lab_tests(id),
    result_data JSONB, -- Store test results as JSON
    result_summary TEXT,
    result_file_url TEXT, -- URL to PDF report
    abnormal_flags TEXT[], -- Array of abnormal values
    reviewed_by_doctor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lab_results_test ON lab_results(lab_test_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    appointment_id TEXT NOT NULL REFERENCES appointments(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, file
    file_url TEXT,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_appointment ON chat_messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL, -- emergency_alert, appointment_reminder, prescription_ready, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data as JSON
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);

-- Doctor availability updates
CREATE TABLE IF NOT EXISTS doctor_availability_updates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id INTEGER NOT NULL,
    available_now BOOLEAN DEFAULT TRUE,
    accepts_emergencies BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON doctor_availability_updates(doctor_id);


-- Emergency alerts table for doctors
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL,
    symptom TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'high', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
    patient_name VARCHAR(255),
    patient_phone VARCHAR(50),
    patient_location_lat DECIMAL(10, 8),
    patient_location_lng DECIMAL(11, 8),
    patient_location_address TEXT,
    ambulance_requested BOOLEAN DEFAULT FALSE,
    ambulance_eta_minutes INTEGER,
    ambulance_status VARCHAR(50), -- dispatched, en_route, arrived
    notes TEXT,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_doctor ON emergency_alerts(doctor_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_patient ON emergency_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created ON emergency_alerts(created_at);

-- Doctor locations table (for multi-location support)
CREATE TABLE IF NOT EXISTS doctor_locations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_primary BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_locations_doctor ON doctor_locations(doctor_id);

-- Doctor weekly schedule table
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id INTEGER NOT NULL,
    location_id TEXT REFERENCES doctor_locations(id),
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    time_slots JSONB NOT NULL, -- Array of {hour: number, available: boolean}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, location_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_location ON doctor_schedules(location_id);
