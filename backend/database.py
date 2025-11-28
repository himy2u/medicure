"""PostgreSQL database connection and utilities"""
import os
import asyncpg
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/medicure_dev')
# Replace @db: with @localhost: for local development
if '@db:' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('@db:', '@localhost:')

# Connection pool
_pool: Optional[asyncpg.Pool] = None

async def get_pool() -> asyncpg.Pool:
    """Get or create the connection pool"""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
    return _pool

async def close_pool():
    """Close the connection pool"""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None

async def get_connection():
    """Get a connection from the pool"""
    pool = await get_pool()
    return await pool.acquire()

async def release_connection(conn):
    """Release a connection back to the pool"""
    pool = await get_pool()
    await pool.release(conn)

# Utility functions for common queries
async def execute_query(query: str, *args):
    """Execute a query and return results"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)

async def execute_one(query: str, *args):
    """Execute a query and return one result"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)

async def execute_command(query: str, *args):
    """Execute a command (INSERT, UPDATE, DELETE)"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)
