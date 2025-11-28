-- Geo-structure tables: Countries → States → Cities → Service Locations
-- Uber/Lyft-style scalable location model

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3 (e.g., 'ECU', 'USA')
    phone_code VARCHAR(10), -- e.g., '+593'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10), -- State/Province code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INTEGER,
    timezone VARCHAR(100), -- e.g., 'America/Guayaquil'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_id, name)
);

-- Seed Ecuador data (Quito focus)
INSERT INTO countries (name, code, phone_code) VALUES
('Ecuador', 'ECU', '+593'),
('United States', 'USA', '+1')
ON CONFLICT (code) DO NOTHING;

-- Ecuador provinces/states
INSERT INTO states (country_id, name, code) VALUES
((SELECT id FROM countries WHERE code = 'ECU'), 'Pichincha', 'P'),
((SELECT id FROM countries WHERE code = 'ECU'), 'Guayas', 'G'),
((SELECT id FROM countries WHERE code = 'ECU'), 'Azuay', 'A'),
((SELECT id FROM countries WHERE code = 'ECU'), 'Manabí', 'M')
ON CONFLICT (country_id, name) DO NOTHING;

-- USA states (for future expansion)
INSERT INTO states (country_id, name, code) VALUES
((SELECT id FROM countries WHERE code = 'USA'), 'California', 'CA'),
((SELECT id FROM countries WHERE code = 'USA'), 'New York', 'NY'),
((SELECT id FROM countries WHERE code = 'USA'), 'Texas', 'TX')
ON CONFLICT (country_id, name) DO NOTHING;

-- Ecuador cities
INSERT INTO cities (state_id, name, latitude, longitude, timezone) VALUES
((SELECT id FROM states WHERE name = 'Pichincha'), 'Quito', -0.1807, -78.4678, 'America/Guayaquil'),
((SELECT id FROM states WHERE name = 'Pichincha'), 'Cumbayá', -0.2054, -78.4310, 'America/Guayaquil'),
((SELECT id FROM states WHERE name = 'Pichincha'), 'Lumbisí', -0.2054, -78.4310, 'America/Guayaquil'),
((SELECT id FROM states WHERE name = 'Guayas'), 'Guayaquil', -2.1962, -79.8862, 'America/Guayaquil'),
((SELECT id FROM states WHERE name = 'Azuay'), 'Cuenca', -2.8997, -79.0056, 'America/Guayaquil')
ON CONFLICT (state_id, name) DO NOTHING;

-- USA cities (for future expansion)
INSERT INTO cities (state_id, name, latitude, longitude, timezone) VALUES
((SELECT id FROM states WHERE name = 'California'), 'Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles'),
((SELECT id FROM states WHERE name = 'New York'), 'New York City', 40.7128, -74.0060, 'America/New_York')
ON CONFLICT (state_id, name) DO NOTHING;

-- Create indexes for fast geo-queries
CREATE INDEX IF NOT EXISTS idx_cities_coords ON cities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_id);
