#!/usr/bin/env python3
"""Initialize doctor tables and seed data"""

import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

async def init_tables():
    """Create tables and seed initial data"""
    
    # Connect to database
    # Parse DATABASE_URL or use individual env vars
    database_url = os.getenv('DATABASE_URL', '')
    if database_url and 'postgresql://' in database_url:
        # For local development, replace db with localhost
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
        print("Creating base tables...")

        # Read and execute base table creation SQL
        with open('create_base_tables.sql', 'r') as f:
            base_sql = f.read()
        await conn.execute(base_sql)
        print("✓ Base tables created successfully")

        print("\nCreating geo-structure tables...")

        # Read and execute geo-structure SQL
        with open('create_geo_structure.sql', 'r') as f:
            geo_sql = f.read()
        await conn.execute(geo_sql)
        print("✓ Geo-structure tables created successfully")

        print("\nCreating doctor tables...")

        # Read and execute table creation SQL
        with open('create_doctor_tables.sql', 'r') as f:
            create_sql = f.read()
        await conn.execute(create_sql)
        print("✓ Doctor tables created successfully")
        
        # Read and execute seed data SQL
        print("\nSeeding doctor data...")
        with open('seed_doctors.sql', 'r') as f:
            seed_sql = f.read()
        await conn.execute(seed_sql)
        print("✓ Data seeded successfully")
        
        # Verify data
        count = await conn.fetchval('SELECT COUNT(*) FROM doctors')
        print(f"\n✓ Total doctors in database: {count}")
        
        locations_count = await conn.fetchval('SELECT COUNT(*) FROM doctor_service_locations')
        print(f"✓ Total service locations: {locations_count}")
        
        availability_count = await conn.fetchval('SELECT COUNT(*) FROM doctor_availability')
        print(f"✓ Total availability records: {availability_count}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        raise
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(init_tables())
