from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext
import sqlite3
import uuid

# JWT Configuration
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database configuration
DB_PATH = "medicure.db"

# Password hashing with argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Database setup
def init_db(db_path: str = None):
    if db_path is None:
        db_path = DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'patient',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create audit_log table for tracking authentication events
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            event_type TEXT NOT NULL,
            auth_method TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT,
            ip_address TEXT,
            user_agent TEXT,
            success BOOLEAN NOT NULL,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # Create user_profiles table for storing additional profile data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            profile_data TEXT NOT NULL,
            profile_complete BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()

# Models
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

# Database operations
def get_user_by_email(email: str, db_path: str = None) -> Optional[User]:
    if db_path is None:
        db_path = DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, role FROM users WHERE email = ?', (email,))
    result = cursor.fetchone()
    conn.close()

    if result:
        return User(id=result[0], name=result[1], email=result[2], role=result[3])
    return None

def create_user(user: UserCreate, db_path: str = None) -> User:
    if db_path is None:
        db_path = DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check if user already exists
    if get_user_by_email(user.email, db_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)

    cursor.execute(
        'INSERT INTO users (id, name, email, hashed_password, role) VALUES (?, ?, ?, ?, ?)',
        (user_id, user.name, user.email, hashed_password, user.role)
    )

    conn.commit()
    conn.close()

    return User(id=user_id, name=user.name, email=user.email, role=user.role)

def log_audit_event(
    event_type: str,
    auth_method: str,
    email: str,
    role: Optional[str] = None,
    user_id: Optional[str] = None,
    success: bool = True,
    error_message: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    db_path: str = None
):
    """Log authentication events to audit_log table"""
    if db_path is None:
        db_path = DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    audit_id = str(uuid.uuid4())
    cursor.execute(
        '''INSERT INTO audit_log
           (id, user_id, event_type, auth_method, email, role, ip_address, user_agent, success, error_message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (audit_id, user_id, event_type, auth_method, email, role, ip_address, user_agent, success, error_message)
    )

    conn.commit()
    conn.close()

def authenticate_user(email: str, password: str, db_path: str = None) -> Optional[User]:
    if db_path is None:
        db_path = DB_PATH
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, hashed_password, role FROM users WHERE email = ?', (email,))
    result = cursor.fetchone()
    conn.close()

    if not result:
        return None

    user_id, name, email, hashed_password, role = result

    if not verify_password(password, hashed_password):
        return None

    return User(id=user_id, name=name, email=email, role=role)
