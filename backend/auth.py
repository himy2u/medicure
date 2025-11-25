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

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database setup
def init_db():
    conn = sqlite3.connect('medicure.db')
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
    import hashlib
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    # Use simple hash for testing, bcrypt version issue
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

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
def get_user_by_email(email: str) -> Optional[User]:
    conn = sqlite3.connect('medicure.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, role FROM users WHERE email = ?', (email,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return User(id=result[0], name=result[1], email=result[2], role=result[3])
    return None

def create_user(user: UserCreate) -> User:
    conn = sqlite3.connect('medicure.db')
    cursor = conn.cursor()
    
    # Check if user already exists
    if get_user_by_email(user.email):
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

def authenticate_user(email: str, password: str) -> Optional[User]:
    conn = sqlite3.connect('medicure.db')
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
