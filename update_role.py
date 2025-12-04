import asyncio
import asyncpg

async def update_role():
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='medicure_dev'
    )
    
    # Update role to doctor
    result = await conn.execute(
        "UPDATE users SET role = 'doctor' WHERE email = '+593998118039'"
    )
    print(f"✅ Updated: {result}")
    
    # Verify
    user = await conn.fetchrow(
        "SELECT email, role FROM users WHERE email = '+593998118039'"
    )
    if user:
        print(f"✅ Current role: {user['role']}")
    else:
        print("❌ User not found")
    
    await conn.close()

asyncio.run(update_role())
