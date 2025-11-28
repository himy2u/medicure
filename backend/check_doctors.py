#!/usr/bin/env python3
"""Check doctors in database"""

import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

async def check_doctors():
    """Check doctors in database"""
    
    # Connect to database
    database_url = os.getenv('DATABASE_URL', '')
    if database_url and 'postgresql://' in database_url:
        database_url = database_url.replace('@db:', '@localhost:')
        conn = await asyncpg.connect(database_url)
    else:
        conn = await asyncpg.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5432)),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres'),
            database=os.getenv('DB_NAME', 'medicure_dev')
        )
    
    try:
        # Check doctors
        doctors = await conn.fetch('SELECT * FROM doctors')
        print(f"\n✓ Total doctors: {len(doctors)}")
        
        for doc in doctors:
            print(f"  - {doc['full_name']}: {doc['specialty']} ({doc['sub_specialty']})")
        
        # Check locations
        locations = await conn.fetch('SELECT COUNT(*) FROM doctor_service_locations')
        print(f"\n✓ Total locations: {locations[0]['count']}")
        
        # Check availability
        availability = await conn.fetch('SELECT COUNT(*) FROM doctor_availability WHERE is_available = TRUE')
        print(f"✓ Available doctors: {availability[0]['count']}")
        
        # Check 24-hour availability
        available_24 = await conn.fetch('SELECT COUNT(*) FROM doctor_availability WHERE is_24_hours = TRUE')
        print(f"✓ 24-hour available: {available_24[0]['count']}")
        
        # Test search
        print("\n--- Testing Search ---")
        test_query = """
            SELECT 
                d.full_name,
                d.specialty,
                d.sub_specialty,
                dsl.address,
                da.is_24_hours,
                da.is_available
            FROM doctors d
            JOIN doctor_service_locations dsl ON d.id = dsl.doctor_id
            JOIN doctor_availability da ON d.id = da.doctor_id
            WHERE da.is_available = TRUE
            LIMIT 5
        """
        results = await conn.fetch(test_query)
        print(f"Sample available doctors: {len(results)}")
        for r in results:
            print(f"  - {r['full_name']}: {r['specialty']} at {r['address']}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        raise
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(check_doctors())
