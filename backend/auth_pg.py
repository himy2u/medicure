"""PostgreSQL-based authentication module (async)"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext
import uuid
import os
from dotenv import load_dotenv
from database import get_pool

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'medicure_secret_key_2025_change_in_production_abc123xyz789')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))

# Password hashing with argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Models (same as SQLite version)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "patient"

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against argon2 hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password using argon2"""
    return pwd_context.hash(password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Async database operations
async def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email from PostgreSQL"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchrow(
            'SELECT id, name, email, role FROM users WHERE email = $1',
            email
        )
        if result:
            return User(
                id=result['id'],
                name=result['name'],
                email=result['email'],
                role=result['role']
            )
        return None

async def create_user(user: UserCreate) -> User:
    """Create a new user in PostgreSQL"""
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)

    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            'INSERT INTO users (id, name, email, hashed_password, role) VALUES ($1, $2, $3, $4, $5)',
            user_id, user.name, user.email, hashed_password, user.role
        )

    return User(id=user_id, name=user.name, email=user.email, role=user.role)

async def log_audit_event(
    event_type: str,
    auth_method: str,
    email: str,
    role: Optional[str] = None,
    user_id: Optional[str] = None,
    success: bool = True,
    error_message: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Log authentication events to audit_log table"""
    audit_id = str(uuid.uuid4())

    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            '''INSERT INTO audit_log
               (id, user_id, event_type, auth_method, email, role, ip_address, user_agent, success, error_message)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)''',
            audit_id, user_id, event_type, auth_method, email, role, ip_address, user_agent, success, error_message
        )

async def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchrow(
            'SELECT id, name, email, hashed_password, role FROM users WHERE email = $1',
            email
        )

        if not result:
            return None

        user_id = result['id']
        name = result['name']
        email = result['email']
        hashed_password = result['hashed_password']
        role = result['role']

        if not verify_password(password, hashed_password):
            return None

        return User(id=user_id, name=name, email=email, role=role)
