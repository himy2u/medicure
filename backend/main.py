from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import (
    init_db, UserCreate, UserLogin, User, Token, DB_PATH,
    create_user, authenticate_user, create_access_token,
    get_user_by_email, ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = FastAPI(title="Medicure API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Pydantic models for responses
class SignupResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str

class ForgotPasswordRequest(BaseModel):
    email: str

class GoogleAuthRequest(BaseModel):
    id_token: str
    role: str = "patient"

# Auth endpoints
@app.post("/auth/signup", response_model=SignupResponse)
async def signup(user_data: UserCreate):
    """Create a new user account"""
    try:
        # Validate role
        valid_roles = ["patient", "doctor", "caregiver", "super_admin"]
        if user_data.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {valid_roles}"
            )
        
        # Create user
        user = create_user(user_data)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        return SignupResponse(
            access_token=access_token,
            token_type="bearer",
            role=user.role,
            user_id=user.id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@app.post("/auth/login", response_model=LoginResponse)
async def login(user_data: UserLogin):
    """Authenticate user and return JWT token"""
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id
    )

@app.post("/auth/google", response_model=SignupResponse)
async def google_auth(google_request: GoogleAuthRequest):
    """Authenticate user with Google OAuth ID token"""
    try:
        # List of valid client IDs (must match frontend .env client IDs)
        valid_client_ids = [
            '920375448724-pdnedfikt5kh3cphc1n89i270n4hasps.apps.googleusercontent.com',  # Web Client ID
            '920375448724-n0p1g2gbkenbmaduto9tcqt4fbq8hsr6.apps.googleusercontent.com',  # iOS Client ID
            '920375448724-c03e17m90cqb81bb14q7e5blp6b9vobb.apps.googleusercontent.com',  # Android Client ID
        ]

        # Verify the ID token
        idinfo = None
        for client_id in valid_client_ids:
            try:
                idinfo = id_token.verify_oauth2_token(
                    google_request.id_token,
                    google_requests.Request(),
                    client_id
                )
                break
            except ValueError:
                continue

        if not idinfo:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google ID token"
            )

        # Extract user information from Google
        email = idinfo.get('email')
        name = idinfo.get('name', email.split('@')[0])

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Check if user already exists
        existing_user = get_user_by_email(email)

        if existing_user:
            # User exists - login
            user = existing_user
        else:
            # Create new user with Google email
            # Use a random password since they're using OAuth
            import secrets
            random_password = secrets.token_urlsafe(32)

            user_data = UserCreate(
                name=name,
                email=email,
                password=random_password,  # Will be hashed
                role=google_request.role
            )
            user = create_user(user_data)

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role, "user_id": user.id},
            expires_delta=access_token_expires
        )

        return SignupResponse(
            access_token=access_token,
            token_type="bearer",
            role=user.role,
            user_id=user.id
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )

@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset email (mock implementation)"""
    user = get_user_by_email(request.email)
    if not user:
        # Don't reveal whether email exists for security
        return {"message": "If email exists, reset instructions will be sent"}

    # TODO: Implement actual email sending
    # For now, just return success message
    return {"message": "Password reset instructions sent to email"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2025-01-01T00:00:00Z"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Medicure API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
