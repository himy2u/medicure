"""
Seed test users for all roles
Run this to create test accounts for development and testing
"""

import asyncio
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Doctor, DoctorLocation
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_test_users():
    db = SessionLocal()
    
    try:
        print("🌱 Seeding test users...")
        
        # Test password for all users
        test_password = hash_password("Test123!")
        
        # 1. Patient
        patient = User(
            email="patient@test.com",
            phone_number="+593987654321",
            hashed_password=test_password,
            full_name="Test Patient",
            role="patient",
            national_id="1234567890",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(patient)
        print("✅ Created test patient")
        
        # 2. Caregiver
        caregiver = User(
            email="caregiver@test.com",
            phone_number="+593987654322",
            hashed_password=test_password,
            full_name="Test Caregiver",
            role="caregiver",
            national_id="1234567891",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(caregiver)
        print("✅ Created test caregiver")
        
        # 3. Doctor (Cardiologist)
        doctor1 = User(
            email="doctor@test.com",
            phone_number="+593987654323",
            hashed_password=test_password,
            full_name="Dr. Test Cardiologist",
            role="doctor",
            national_id="1234567892",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(doctor1)
        db.flush()  # Get doctor1.id
        
        # Add doctor profile
        doctor1_profile = Doctor(
            user_id=doctor1.id,
            specialty="Cardiology",
            sub_specialty="Interventional Cardiology",
            license_number="MD-12345",
            years_of_experience=10,
            consultation_fee=50.00,
            is_available=True,
            accepts_emergency=True
        )
        db.add(doctor1_profile)
        
        # Add doctor location
        doctor1_location = DoctorLocation(
            doctor_id=doctor1.id,
            location_type="private_clinic",
            clinic_name="Test Cardiology Clinic",
            address="Av. 6 de Diciembre, Quito",
            city="Quito",
            latitude=-0.1807,
            longitude=-78.4678,
            is_primary=True,
            is_24_hours=False
        )
        db.add(doctor1_location)
        print("✅ Created test doctor (Cardiologist)")
        
        # 4. Doctor (Pediatrician)
        doctor2 = User(
            email="doctor2@test.com",
            phone_number="+593987654329",
            hashed_password=test_password,
            full_name="Dr. Test Pediatrician",
            role="doctor",
            national_id="1234567899",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(doctor2)
        db.flush()
        
        doctor2_profile = Doctor(
            user_id=doctor2.id,
            specialty="Pediatrics",
            sub_specialty="General Pediatrics",
            license_number="MD-12346",
            years_of_experience=8,
            consultation_fee=40.00,
            is_available=True,
            accepts_emergency=True
        )
        db.add(doctor2_profile)
        
        doctor2_location = DoctorLocation(
            doctor_id=doctor2.id,
            location_type="private_clinic",
            clinic_name="Test Pediatric Clinic",
            address="Av. Eloy Alfaro, Quito",
            city="Quito",
            latitude=-0.1701,
            longitude=-78.4755,
            is_primary=True,
            is_24_hours=False
        )
        db.add(doctor2_location)
        print("✅ Created test doctor (Pediatrician)")
        
        # 5. Medical Staff
        medical_staff = User(
            email="nurse@test.com",
            phone_number="+593987654324",
            hashed_password=test_password,
            full_name="Test Nurse",
            role="medical_staff",
            national_id="1234567893",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(medical_staff)
        print("✅ Created test medical staff")
        
        # 6. Ambulance Staff
        ambulance = User(
            email="ambulance@test.com",
            phone_number="+593987654325",
            hashed_password=test_password,
            full_name="Test Paramedic",
            role="ambulance_staff",
            national_id="1234567894",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(ambulance)
        print("✅ Created test ambulance staff")
        
        # 7. Lab Staff
        lab = User(
            email="lab@test.com",
            phone_number="+593987654326",
            hashed_password=test_password,
            full_name="Test Lab Technician",
            role="lab_staff",
            national_id="1234567895",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(lab)
        print("✅ Created test lab staff")
        
        # 8. Pharmacy Staff
        pharmacy = User(
            email="pharmacy@test.com",
            phone_number="+593987654327",
            hashed_password=test_password,
            full_name="Test Pharmacist",
            role="pharmacy_staff",
            national_id="1234567896",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(pharmacy)
        print("✅ Created test pharmacy staff")
        
        # 9. Super Admin
        admin = User(
            email="admin@test.com",
            phone_number="+593987654328",
            hashed_password=test_password,
            full_name="Test Admin",
            role="super_admin",
            national_id="1234567897",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(admin)
        print("✅ Created test super admin")
        
        # Commit all
        db.commit()
        
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
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_test_users())
