-- Doctors table with specialties and sub-specialties
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    sub_specialty VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    license_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor service locations (clinics/hospitals)
CREATE TABLE IF NOT EXISTS doctor_service_locations (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    location_type VARCHAR(50) NOT NULL, -- 'private_clinic', 'private_hospital', 'public_hospital'
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Quito',
    country VARCHAR(100) DEFAULT 'Ecuador',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add city_id column for geo-structure integration (added after cities table exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'doctor_service_locations'
        AND column_name = 'city_id'
    ) THEN
        ALTER TABLE doctor_service_locations
        ADD COLUMN city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_service_locations_city ON doctor_service_locations(city_id);
    END IF;
END $$;

-- Doctor availability schedule
CREATE TABLE IF NOT EXISTS doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES doctor_service_locations(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc. NULL means all days
    start_time TIME,
    end_time TIME,
    is_24_hours BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency appointment requests
CREATE TABLE IF NOT EXISTS emergency_requests (
    id SERIAL PRIMARY KEY,
    patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
    symptom TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'timeout'
    patient_latitude DECIMAL(10, 8),
    patient_longitude DECIMAL(11, 8),
    distance_km DECIMAL(10, 2), -- Distance from doctor to patient
    timeout_at TIMESTAMP, -- 5-minute timeout for Uber-style dispatch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_sub_specialty ON doctors(sub_specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_locations_coords ON doctor_service_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_doctor ON emergency_requests(doctor_id);
