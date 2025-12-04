"""
Seed test users for all roles
Run this to create test accounts for development and testing
"""

import asyncio
import asyncpg
from passlib.context import CryptContext
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_test_users():
    # Connect to database
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/medicure_dev')
    if '@db:' in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace('@db:', '@localhost:')
    
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("🌱 Seeding test users...")
        
        # Test password for all users
        test_password = hash_password("Test123!")
        
        # 1. Patient
        try:
            await conn.execute("""
                INSERT INTO users (email, hashed_password, name, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING
            """, "patient@test.com", test_password, "Test Patient", "patient")
            print("✅ Created test patient")
        except Exception as e:
            print(f"⚠️  Patient already exists or error: {e}")
        
        # 2. Caregiver
        try:
            await conn.execute("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            """, "caregiver@test.com", "+593987654322", test_password, "Test Caregiver", "caregiver", "1234567891", True, datetime.utcnow())
            print("✅ Created test caregiver")
        except Exception as e:
            print(f"⚠️  Caregiver already exists or error: {e}")
        
        # 3. Doctor (Cardiologist)
        try:
            doctor1_id = await conn.fetchval("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
                RETURNING id
            """, "doctor@test.com", "+593987654323", test_password, "Dr. Test Cardiologist", "doctor", "1234567892", True, datetime.utcnow())
            
            # Add doctor profile
            await conn.execute("""
                INSERT INTO doctors (user_id, specialty, sub_specialty, license_number, years_of_experience, consultation_fee, is_available, accepts_emergency)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id) DO UPDATE SET specialty = EXCLUDED.specialty
            """, doctor1_id, "Cardiology", "Interventional Cardiology", "MD-12345", 10, 50.00, True, True)
            
            # Add doctor location
            await conn.execute("""
                INSERT INTO doctor_locations (doctor_id, location_type, clinic_name, address, city, latitude, longitude, is_primary, is_24_hours)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT DO NOTHING
            """, doctor1_id, "private_clinic", "Test Cardiology Clinic", "Av. 6 de Diciembre, Quito", "Quito", -0.1807, -78.4678, True, False)
            
            print("✅ Created test doctor (Cardiologist)")
        except Exception as e:
            print(f"⚠️  Doctor 1 already exists or error: {e}")
        
        # 4. Doctor (Pediatrician)
        try:
            doctor2_id = await conn.fetchval("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
                RETURNING id
            """, "doctor2@test.com", "+593987654329", test_password, "Dr. Test Pediatrician", "doctor", "1234567899", True, datetime.utcnow())
            
            await conn.execute("""
                INSERT INTO doctors (user_id, specialty, sub_specialty, license_number, years_of_experience, consultation_fee, is_available, accepts_emergency)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id) DO UPDATE SET specialty = EXCLUDED.specialty
            """, doctor2_id, "Pediatrics", "General Pediatrics", "MD-12346", 8, 40.00, True, True)
            
            await conn.execute("""
                INSERT INTO doctor_locations (doctor_id, location_type, clinic_name, address, city, latitude, longitude, is_primary, is_24_hours)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT DO NOTHING
            """, doctor2_id, "private_clinic", "Test Pediatric Clinic", "Av. Eloy Alfaro, Quito", "Quito", -0.1701, -78.4755, True, False)
            
            print("✅ Created test doctor (Pediatrician)")
        except Exception as e:
            print(f"⚠️  Doctor 2 already exists or error: {e}")
        
        # 5. Medical Staff
        try:
            await conn.execute("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            """, "nurse@test.com", "+593987654324", test_password, "Test Nurse", "medical_staff", "1234567893", True, datetime.utcnow())
            print("✅ Created test medical staff")
        except Exception as e:
            print(f"⚠️  Medical staff already exists or error: {e}")
        
        # 6. Ambulance Staff
        try:
            await conn.execute("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            """, "ambulance@test.com", "+593987654325", test_password, "Test Paramedic", "ambulance_staff", "1234567894", True, datetime.utcnow())
            print("✅ Created test ambulance staff")
        except Exception as e:
            print(f"⚠️  Ambulance staff already exists or error: {e}")
        
        # 7. Lab Staff
        try:
            await conn.execute("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            """, "lab@test.com", "+593987654326", test_password, "Test Lab Technician", "lab_staff", "1234567895", True, datetime.utcnow())
            print("✅ Created test lab staff")
        except Exception as e:
            print(f"⚠️  Lab staff already exists or error: {e}")
        
        # 8. Pharmacy Staff
        try:
            await conn.execute("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            """, "pharmacy@test.com", "+593987654327", test_password, "Test Pharmacist", "pharmacy_staff", "1234567896", True, datetime.utcnow())
            print("✅ Created test pharmacy staff")
        except Exception as e:
            print(f"⚠️  Pharmacy staff already exists or error: {e}")
        
        # 9. Super Admin
        try:
            await conn.execute("""
                INSERT INTO users (email, phone_number, hashed_password, full_name, role, national_id, is_active, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            """, "admin@test.com", "+593987654328", test_password, "Test Admin", "super_admin", "1234567897", True, datetime.utcnow())
            print("✅ Created test super admin")
        except Exception as e:
            print(f"⚠️  Admin already exists or error: {e}")
        
        print("\n✅ All test users created successfully!")
        print("\n📋 Test Credentials:")
        print("=" * 50)
        print("Email: patient@test.com | Password: Test123!")
        print("Email: caregiver@test.com | Password: Test123!")
        print("Email: doctor@test.com | Password: Test123!")
        print("Email: doctor2@test.com | Password: Test123!")
        print("Email: nurse@test.com | Password: Test123!")
        print("Email: ambulance@test.com | Password: Test123!")
        print("Email: lab@test.com | Password: Test123!")
        print("Email: pharmacy@test.com | Password: Test123!")
        print("Email: admin@test.com | Password: Test123!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error seeding users: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(seed_test_users())
