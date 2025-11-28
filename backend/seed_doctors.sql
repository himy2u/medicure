-- Insert sample doctors with real specialties in Quito, Ecuador
-- Note: These are sample entries. Real doctors will be uploaded via CSV later.

-- First, let's insert some sample doctors
INSERT INTO doctors (full_name, specialty, sub_specialty, phone, email, license_number) VALUES
-- Required doctors
('Andrea Ortiz', 'Neurosurgeon', 'Geriatría', '+593-2-1234567', 'andrea.ortiz@medicure.ec', 'EC-NS-001'),
('Himanshu Pandey', 'Neurosurgeon', 'Geriatría', '+593-2-1234568', 'himanshu.pandey@medicure.ec', 'EC-NS-002'),

-- Additional doctors in Quito
('Dr. María González', 'Cardiologist', 'Interventional Cardiology', '+593-2-2345678', 'maria.gonzalez@medicure.ec', 'EC-CA-001'),
('Dr. Carlos Ramírez', 'General Practitioner', 'Family Medicine', '+593-2-3456789', 'carlos.ramirez@medicure.ec', 'EC-GP-001'),
('Dr. Ana Morales', 'Pediatrician', 'Neonatology', '+593-2-4567890', 'ana.morales@medicure.ec', 'EC-PE-001'),
('Dr. Luis Fernández', 'Orthopedic Surgeon', 'Sports Medicine', '+593-2-5678901', 'luis.fernandez@medicure.ec', 'EC-OR-001'),
('Dr. Patricia Silva', 'Gynecologist', 'Obstetrics', '+593-2-6789012', 'patricia.silva@medicure.ec', 'EC-GY-001'),
('Dr. Roberto Mendoza', 'Emergency Medicine', 'Trauma', '+593-2-7890123', 'roberto.mendoza@medicure.ec', 'EC-EM-001'),
('Dr. Carmen Vega', 'Dermatologist', 'Cosmetic Dermatology', '+593-2-8901234', 'carmen.vega@medicure.ec', 'EC-DE-001'),
('Dr. Diego Torres', 'Psychiatrist', 'Child Psychiatry', '+593-2-9012345', 'diego.torres@medicure.ec', 'EC-PS-001'),
('Dr. Elena Ruiz', 'Ophthalmologist', 'Retina Specialist', '+593-2-0123456', 'elena.ruiz@medicure.ec', 'EC-OP-001'),
('Dr. Fernando Castro', 'Gastroenterologist', 'Hepatology', '+593-2-1234560', 'fernando.castro@medicure.ec', 'EC-GA-001'),
('Dr. Gabriela Herrera', 'Endocrinologist', 'Diabetes', '+593-2-2345671', 'gabriela.herrera@medicure.ec', 'EC-EN-001'),
('Dr. Hugo Paredes', 'Pulmonologist', 'Critical Care', '+593-2-3456782', 'hugo.paredes@medicure.ec', 'EC-PU-001'),
('Dr. Isabel Moreno', 'Rheumatologist', 'Autoimmune Diseases', '+593-2-4567893', 'isabel.moreno@medicure.ec', 'EC-RH-001'),
('Dr. Jorge Salazar', 'Urologist', 'Oncology', '+593-2-5678904', 'jorge.salazar@medicure.ec', 'EC-UR-001');

-- Insert service locations for doctors
-- Andrea Ortiz - Lumbisi, Cumbaya
INSERT INTO doctor_service_locations (doctor_id, location_type, name, address, city, country, latitude, longitude) VALUES
(1, 'private_clinic', 'Clínica Ortiz Neurología', 'Lumbisi, Cumbaya', 'Quito', 'Ecuador', -0.2054, -78.4310);

-- Himanshu Pandey - Jipijapa
INSERT INTO doctor_service_locations (doctor_id, location_type, name, address, city, country, latitude, longitude) VALUES
(2, 'private_clinic', 'Centro Neurológico Pandey', 'Jipijapa, Quito', 'Quito', 'Ecuador', -0.1865, -78.4810);

-- Other doctors - various locations in Quito
INSERT INTO doctor_service_locations (doctor_id, location_type, name, address, city, country, latitude, longitude) VALUES
(3, 'private_hospital', 'Hospital Metropolitano', 'Av. Mariana de Jesús y Occidental', 'Quito', 'Ecuador', -0.1807, -78.4678),
(4, 'private_clinic', 'Clínica Familiar Ramírez', 'La Carolina, Quito', 'Quito', 'Ecuador', -0.1807, -78.4865),
(5, 'public_hospital', 'Hospital de Niños Baca Ortiz', 'Av. 6 de Diciembre y Colón', 'Quito', 'Ecuador', -0.2006, -78.4978),
(6, 'private_clinic', 'Centro Ortopédico Fernández', 'González Suárez, Quito', 'Quito', 'Ecuador', -0.1865, -78.4765),
(7, 'private_hospital', 'Hospital de la Mujer', 'Av. Amazonas y Gaspar de Villarroel', 'Quito', 'Ecuador', -0.1865, -78.4865),
(8, 'public_hospital', 'Hospital Eugenio Espejo', 'Av. Gran Colombia y Yaguachi', 'Quito', 'Ecuador', -0.2186, -78.5097),
(9, 'private_clinic', 'Clínica Dermatológica Vega', 'La Floresta, Quito', 'Quito', 'Ecuador', -0.1865, -78.4965),
(10, 'private_clinic', 'Centro Psiquiátrico Torres', 'Av. 12 de Octubre y Cordero', 'Quito', 'Ecuador', -0.1965, -78.4865),
(11, 'private_hospital', 'Hospital Oftalmológico', 'Av. Naciones Unidas y Shyris', 'Quito', 'Ecuador', -0.1765, -78.4765),
(12, 'private_clinic', 'Centro Gastroenterológico Castro', 'Av. República y Eloy Alfaro', 'Quito', 'Ecuador', -0.1865, -78.4965),
(13, 'private_clinic', 'Clínica Endocrinológica Herrera', 'Av. 6 de Diciembre y Portugal', 'Quito', 'Ecuador', -0.1965, -78.4865),
(14, 'public_hospital', 'Hospital Carlos Andrade Marín', 'Av. 18 de Septiembre y Ayacucho', 'Quito', 'Ecuador', -0.2086, -78.5097),
(15, 'private_clinic', 'Centro Reumatológico Moreno', 'Av. Amazonas y Naciones Unidas', 'Quito', 'Ecuador', -0.1765, -78.4865),
(16, 'private_hospital', 'Hospital Vozandes', 'Av. Villalengua 267', 'Quito', 'Ecuador', -0.1965, -78.5065);

-- Set all doctors as available 24 hours for now
INSERT INTO doctor_availability (doctor_id, location_id, day_of_week, is_24_hours, is_available)
SELECT d.id, dsl.id, NULL, TRUE, TRUE
FROM doctors d
JOIN doctor_service_locations dsl ON d.id = dsl.doctor_id;
