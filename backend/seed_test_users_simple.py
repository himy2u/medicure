"""
Simple test user seeding script
"""

import asyncio
import asyncpg
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

async def seed():
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/medicure_dev')
    if '@db:' in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace('@db:', '@localhost:')
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    test_password = pwd_context.hash("Test123!")
    
    users = [
        ("patient@test.com", "Test Patient", "patient"),
        ("caregiver@test.com", "Test Caregiver", "caregiver"),
        ("doctor@test.com", "Dr. Test Cardiologist", "doctor"),
        ("doctor2@test.com", "Dr. Test Pediatrician", "doctor"),
        ("nurse@test.com", "Test Nurse", "medical_staff"),
        ("ambulance@test.com", "Test Paramedic", "ambulance_staff"),
        ("lab@test.com", "Test Lab Tech", "lab_staff"),
        ("pharmacy@test.com", "Test Pharmacist", "pharmacy_staff"),
        ("admin@test.com", "Test Admin", "super_admin"),
    ]
    
    for email, name, role in users:
        try:
            await conn.execute("""
                INSERT INTO users (email, hashed_password, name, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING
            """, email, test_password, name, role)
            print(f"✅ {name} ({role})")
        except Exception as e:
            print(f"⚠️  {name}: {e}")
    
    print("\n✅ Done! All users have password: Test123!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(seed())
