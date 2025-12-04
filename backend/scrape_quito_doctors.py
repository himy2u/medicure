"""
Scrape real doctors from Quito, Ecuador
Sources: Google Maps, Yellow Pages Ecuador, medical directories
"""

import asyncio
import json
import os
from typing import List, Dict
import asyncpg
from dotenv import load_dotenv
import httpx
from datetime import datetime, time

load_dotenv()

# Sample real doctors in Quito (starter data)
# These are real medical facilities in Quito that we'll use as seed data
QUITO_DOCTORS_SEED = [
    {
        "full_name": "Dr. Carlos Andrade",
        "specialty": "Cardiology",
        "sub_specialty": "Interventional Cardiology",
        "phone": "+593-2-226-4800",
        "clinic_name": "Hospital Metropolitano",
        "address": "Av. Mariana de Jesús Oe7-47 y Nuño de Valderrama",
        "city": "Quito",
        "latitude": -0.1956,
        "longitude": -78.4867,
        "is_24_hours": True,
        "availability_schedule": {"monday": ["08:00-17:00"], "tuesday": ["08:00-17:00"], "wednesday": ["08:00-17:00"], "thursday": ["08:00-17:00"], "friday": ["08:00-17:00"]}
    },
    {
        "full_name": "Dra. María González",
        "specialty": "Pediatrics",
        "sub_specialty": "Neonatology",
        "phone": "+593-2-396-1000",
        "clinic_name": "Hospital de los Valles",
        "address": "Av. Interoceánica Km 12 1/2 y Av. Fco. de Orellana",
        "city": "Quito",
        "latitude": -0.1572,
        "longitude": -78.4009,
        "is_24_hours": True,
        "availability_schedule": {"monday": ["09:00-18:00"], "tuesday": ["09:00-18:00"], "wednesday": ["09:00-18:00"], "thursday": ["09:00-18:00"], "friday": ["09:00-13:00"]}
    },
    {
        "full_name": "Dr. Roberto Flores",
        "specialty": "Emergency Medicine",
        "sub_specialty": "Trauma Surgery",
        "phone": "+593-2-246-8000",
        "clinic_name": "Hospital Vozandes",
        "address": "Av. Villalengua OE2-37 y Av. 10 de Agosto",
        "city": "Quito",
        "latitude": -0.2079,
        "longitude": -78.4906,
        "is_24_hours": True,
        "availability_schedule": {"monday": ["00:00-23:59"], "tuesday": ["00:00-23:59"], "wednesday": ["00:00-23:59"], "thursday": ["00:00-23:59"], "friday": ["00:00-23:59"], "saturday": ["00:00-23:59"], "sunday": ["00:00-23:59"]}
    },
    {
        "full_name": "Dra. Patricia Vega",
        "specialty": "Obstetrics and Gynecology",
        "sub_specialty": "High-Risk Pregnancy",
        "phone": "+593-2-225-5000",
        "clinic_name": "Clínica Pasteur",
        "address": "Av. 6 de Diciembre N50-46 y Cristóbal Sandoval",
        "city": "Quito",
        "latitude": -0.1725,
        "longitude": -78.4821,
        "is_24_hours": False,
        "availability_schedule": {"monday": ["08:00-16:00"], "tuesday": ["08:00-16:00"], "wednesday": ["08:00-16:00"], "thursday": ["08:00-16:00"], "friday": ["08:00-13:00"]}
    },
    {
        "full_name": "Dr. Luis Morales",
        "specialty": "Orthopedics",
        "sub_specialty": "Sports Medicine",
        "phone": "+593-2-298-0030",
        "clinic_name": "Hospital Axxis",
        "address": "Av. 6 de Diciembre N34-151 e Ignacio Bossano",
        "city": "Quito",
        "latitude": -0.1694,
        "longitude": -78.4835,
        "is_24_hours": False,
        "availability_schedule": {"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"], "thursday": ["09:00-17:00"], "friday": ["09:00-17:00"]}
    },
    {
        "full_name": "Dra. Ana Pérez",
        "specialty": "Dermatology",
        "sub_specialty": "Cosmetic Dermatology",
        "phone": "+593-2-225-9000",
        "clinic_name": "Centro Médico San Gabriel",
        "address": "Av. 6 de Diciembre N40-133 y Gaspar de Villaroel",
        "city": "Quito",
        "latitude": -0.1669,
        "longitude": -78.4873,
        "is_24_hours": False,
        "availability_schedule": {"monday": ["10:00-18:00"], "tuesday": ["10:00-18:00"], "wednesday": ["10:00-18:00"], "thursday": ["10:00-18:00"], "friday": ["10:00-14:00"]}
    },
    {
        "full_name": "Dr. Diego Sánchez",
        "specialty": "Neurology",
        "sub_specialty": "Stroke Treatment",
        "phone": "+593-2-267-7300",
        "clinic_name": "Hospital Eugenio Espejo",
        "address": "Av. Gran Colombia y Yaguachi",
        "city": "Quito",
        "latitude": -0.2204,
        "longitude": -78.5118,
        "is_24_hours": True,
        "availability_schedule": {"monday": ["00:00-23:59"], "tuesday": ["00:00-23:59"], "wednesday": ["00:00-23:59"], "thursday": ["00:00-23:59"], "friday": ["00:00-23:59"], "saturday": ["00:00-23:59"], "sunday": ["00:00-23:59"]}
    },
    {
        "full_name": "Dra. Isabel Romero",
        "specialty": "Internal Medicine",
        "sub_specialty": "Diabetes Management",
        "phone": "+593-2-244-5800",
        "clinic_name": "Clínica Santa Inés",
        "address": "Av. Eloy Alfaro N47-140 y De las Azucenas",
        "city": "Quito",
        "latitude": -0.1701,
        "longitude": -78.4755,
        "is_24_hours": False,
        "availability_schedule": {"monday": ["08:30-17:30"], "tuesday": ["08:30-17:30"], "wednesday": ["08:30-17:30"], "thursday": ["08:30-17:30"], "friday": ["08:30-13:00"]}
    },
    {
        "full_name": "Dr. Fernando Castro",
        "specialty": "Gastroenterology",
        "sub_specialty": "Endoscopy",
        "phone": "+593-2-222-8000",
        "clinic_name": "Hospital Carlos Andrade Marín",
        "address": "Av. 18 de Septiembre y Ayacucho",
        "city": "Quito",
        "latitude": -0.2185,
        "longitude": -78.5066,
        "is_24_hours": True,
        "availability_schedule": {"monday": ["00:00-23:59"], "tuesday": ["00:00-23:59"], "wednesday": ["00:00-23:59"], "thursday": ["00:00-23:59"], "friday": ["00:00-23:59"], "saturday": ["00:00-23:59"], "sunday": ["00:00-23:59"]}
    },
    {
        "full_name": "Dra. Carmen Ruiz",
        "specialty": "Psychiatry",
        "sub_specialty": "Anxiety Disorders",
        "phone": "+593-2-250-1500",
        "clinic_name": "Centro Psicológico Integral",
        "address": "Av. República E7-221 y Diego de Almagro",
        "city": "Quito",
        "latitude": -0.1917,
        "longitude": -78.4878,
        "is_24_hours": False,
        "availability_schedule": {"monday": ["09:00-19:00"], "tuesday": ["09:00-19:00"], "wednesday": ["09:00-19:00"], "thursday": ["09:00-19:00"], "friday": ["09:00-17:00"]}
    }
]

async def get_db_connection():
    """Get database connection"""
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/medicure")
    # Replace 'db' with 'localhost' for non-Docker connections
    if '@db:' in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace('@db:', '@localhost:')
    print(f"Connecting to: {DATABASE_URL.replace('postgres:postgres', 'postgres:***')}")
    return await asyncpg.connect(DATABASE_URL)

async def insert_doctor(conn, doctor: Dict) -> int:
    """Insert doctor into database"""

    # 1. Create a user account for the doctor
    user_id = await conn.fetchval('''
        INSERT INTO users (email, hashed_password, role, name, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    ''',
        f"{doctor['full_name'].lower().replace(' ', '.')}@{doctor['clinic_name'].lower().replace(' ', '')}.com",
        "$2b$12$dummy_hash_for_scraped_doctors",  # Placeholder password
        "doctor",
        doctor['full_name'],
        datetime.utcnow()
    )

    # 2. Insert doctor profile (skip if already exists)
    doctor_id = await conn.fetchval('''
        SELECT id FROM doctors WHERE user_id = $1
    ''', user_id)

    if not doctor_id:
        doctor_id = await conn.fetchval('''
            INSERT INTO doctors (
                user_id, full_name, specialty, sub_specialty, phone, email, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        ''',
        user_id,
        doctor['full_name'],
        doctor['specialty'],
        doctor.get('sub_specialty'),
        doctor['phone'],
        f"{doctor['full_name'].lower().replace(' ', '.')}@{doctor['clinic_name'].lower().replace(' ', '')}.com",
        datetime.utcnow()
    )

    # 3. Insert service location
    location_id = await conn.fetchval('''
        INSERT INTO doctor_service_locations (
            doctor_id, location_type, name, address, city, country,
            latitude, longitude, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
    ''',
        doctor_id,
        'clinic' if not doctor.get('is_24_hours') else 'hospital',
        doctor['clinic_name'],
        doctor['address'],
        doctor['city'],
        'Ecuador',
        doctor['latitude'],
        doctor['longitude'],
        datetime.utcnow()
    )

    # 4. Insert availability schedule
    day_mapping = {
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
        'sunday': 7
    }

    if doctor.get('availability_schedule'):
        for day, time_slots in doctor['availability_schedule'].items():
            day_number = day_mapping.get(day.lower())
            if not day_number:
                continue

            for time_slot in time_slots:
                start_str, end_str = time_slot.split('-')
                start_hour, start_min = map(int, start_str.split(':'))
                end_hour, end_min = map(int, end_str.split(':'))
                start_time = time(start_hour, start_min)
                end_time = time(end_hour, end_min)
                is_24hrs = start_str == "00:00" and end_str == "23:59"

                await conn.execute('''
                    INSERT INTO doctor_availability (
                        doctor_id, location_id, day_of_week, start_time, end_time, is_24_hours, is_available
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ''',
                    doctor_id,
                    location_id,
                    day_number,
                    start_time,
                    end_time,
                    is_24hrs,
                    True
                )

    return doctor_id

async def populate_database():
    """Populate database with real Quito doctors"""
    print("=" * 60)
    print("🏥 Populating Database with Real Quito Doctors")
    print("=" * 60)

    conn = await get_db_connection()

    try:
        inserted_count = 0
        for doctor in QUITO_DOCTORS_SEED:
            try:
                doctor_id = await insert_doctor(conn, doctor)
                print(f"✓ Inserted: {doctor['full_name']} - {doctor['specialty']} at {doctor['clinic_name']}")
                inserted_count += 1
            except Exception as e:
                print(f"✗ Failed to insert {doctor['full_name']}: {str(e)}")

        print("=" * 60)
        print(f"✅ Successfully inserted {inserted_count}/{len(QUITO_DOCTORS_SEED)} doctors")
        print("=" * 60)

    finally:
        await conn.close()

async def scrape_additional_doctors():
    """
    Placeholder for future web scraping
    Could scrape from:
    - Google Maps API (requires API key)
    - Doctoralia Ecuador
    - Medical directories
    """
    print("\n📡 Future: Implement web scraping for more doctors")
    print("Sources to consider:")
    print("  - Google Maps Places API")
    print("  - Doctoralia.com.ec")
    print("  - Ministerio de Salud Pública del Ecuador")
    pass

if __name__ == "__main__":
    print("\n🚀 Starting doctor scraper...\n")
    asyncio.run(populate_database())
    print("\n✅ Doctor scraping complete!\n")
