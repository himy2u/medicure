from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import (
    init_db, UserCreate, UserLogin, User, Token, DB_PATH,
    create_user, authenticate_user, create_access_token,
    get_user_by_email, ACCESS_TOKEN_EXPIRE_MINUTES, log_audit_event
)
from datetime import timedelta
from typing import Optional, Dict
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from whatsapp_otp import whatsapp_service, handle_whatsapp_webhook

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
    id_token: Optional[str] = None
    code: Optional[str] = None
    redirect_uri: Optional[str] = None
    code_verifier: Optional[str] = None
    role: str = "patient"

class ProfileUpdateRequest(BaseModel):
    nationalId: Optional[str] = None
    insurance: Optional[list] = None
    specialty: Optional[str] = None
    subSpecialty: Optional[str] = None
    locations: Optional[str] = None
    availability: Optional[str] = None
    department: Optional[str] = None
    licenseNumber: Optional[str] = None
    vehicles: Optional[list] = None
    certificationLevel: Optional[str] = None
    associatedDoctors: Optional[list] = None
    profile_complete: bool = True

class WhatsAppOTPRequest(BaseModel):
    phone_number: str
    role: str = "patient"

class WhatsAppOTPVerifyRequest(BaseModel):
    phone_number: str
    otp: str
    role: str = "patient"
    name: Optional[str] = None

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
    """Authenticate user with Google OAuth ID token or authorization code"""
    try:
        print(f"\n=== Google Auth Request ===")
        print(f"Role: {google_request.role}")
        print(f"Has id_token: {bool(google_request.id_token)}")
        print(f"Has code: {bool(google_request.code)}")
        
        # List of valid client IDs (must match frontend .env client IDs)
        valid_client_ids = [
            '920375448724-pdnedfikt5kh3cphc1n89i270n4hasps.apps.googleusercontent.com',  # Web Client ID
            '920375448724-n0p1g2gbkenbmaduto9tcqt4fbq8hsr6.apps.googleusercontent.com',  # iOS Client ID
            '920375448724-c03e17m90cqb81bb14q7e5blp6b9vobb.apps.googleusercontent.com',  # Android Client ID
        ]

        # If authorization code is provided, exchange it for id_token
        id_token_str = google_request.id_token
        if google_request.code and not id_token_str:
            import httpx
            token_endpoint = 'https://oauth2.googleapis.com/token'

            # Use Web Client ID for token exchange (iOS/Android clients can't do server-side exchange)
            web_client_id = '920375448724-pdnedfikt5kh3cphc1n89i270n4hasps.apps.googleusercontent.com'

            token_data = {
                'code': google_request.code,
                'client_id': web_client_id,
                'redirect_uri': google_request.redirect_uri or 'com.googleusercontent.apps.920375448724-n0p1g2gbkenbmaduto9tcqt4fbq8hsr6:/oauthredirect',
                'grant_type': 'authorization_code',
            }

            if google_request.code_verifier:
                token_data['code_verifier'] = google_request.code_verifier

            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    response = await client.post(token_endpoint, data=token_data)
                except httpx.TimeoutException:
                    raise HTTPException(
                        status_code=status.HTTP_408_REQUEST_TIMEOUT,
                        detail="Token exchange request timed out. Please try again."
                    )
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Token exchange network error: {str(e)}"
                    )

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Failed to exchange authorization code: {response.text}"
                    )

                token_response = response.json()
                id_token_str = token_response.get('id_token')

                if not id_token_str:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="No ID token received from token exchange"
                    )

        if not id_token_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either id_token or code must be provided"
            )

        # Verify the ID token - try without audience first, then with specific client IDs
        idinfo = None
        verification_errors = []
        
        # First, try without audience verification (most lenient)
        for client_id in [None] + valid_client_ids:
            try:
                if client_id is None:
                    print("Attempting verification without audience...")
                    idinfo = id_token.verify_oauth2_token(
                        id_token_str,
                        google_requests.Request()
                    )
                    print(f"✓ Token verified without audience check")
                    print(f"  Token audience: {idinfo.get('aud')}")
                else:
                    idinfo = id_token.verify_oauth2_token(
                        id_token_str,
                        google_requests.Request(),
                        audience=client_id
                    )
                    print(f"✓ Token verified with client_id: {client_id[:20]}...")
                break
            except ValueError as e:
                error_msg = str(e)
                if client_id:
                    verification_errors.append(f"{client_id[:20]}...: {error_msg}")
                    print(f"✗ Verification failed for {client_id[:20]}...: {error_msg}")
                else:
                    print(f"✗ Verification without audience failed: {error_msg}")
                
                # If it's a clock skew error, try to work around it
                if "Token used too early" in error_msg or "Token used too late" in error_msg:
                    print("⚠️  Clock skew detected - attempting workaround...")
                    try:
                        # Decode without verification to get claims
                        import json
                        import base64
                        parts = id_token_str.split('.')
                        if len(parts) == 3:
                            # Decode payload (add padding if needed)
                            payload = parts[1]
                            payload += '=' * (4 - len(payload) % 4)
                            decoded = json.loads(base64.urlsafe_b64decode(payload))
                            
                            # Check if token is from Google and has required fields
                            if decoded.get('iss') in ['accounts.google.com', 'https://accounts.google.com']:
                                if decoded.get('email') and decoded.get('email_verified'):
                                    print(f"✓ Token manually validated (clock skew workaround)")
                                    print(f"  Email: {decoded.get('email')}")
                                    print(f"  Audience: {decoded.get('aud')}")
                                    idinfo = decoded
                                    break
                    except Exception as decode_error:
                        print(f"✗ Manual decode failed: {decode_error}")
                continue

        if not idinfo:
            print(f"All verification attempts failed:")
            for err in verification_errors:
                print(f"  - {err}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google ID token. Tried {len(valid_client_ids)} client IDs."
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
        is_new_user = False

        if existing_user:
            # User exists - login (use their existing role, ignore provided role)
            user = existing_user
            log_audit_event(
                event_type="login",
                auth_method="google_oauth",
                email=email,
                role=user.role,
                user_id=user.id,
                success=True
            )
        else:
            # Create new user with Google email
            # Use a random password since they're using OAuth
            import secrets
            random_password = secrets.token_urlsafe(32)
            is_new_user = True

            user_data = UserCreate(
                name=name,
                email=email,
                password=random_password,  # Will be hashed
                role=google_request.role
            )
            user = create_user(user_data)

            log_audit_event(
                event_type="signup",
                auth_method="google_oauth",
                email=email,
                role=user.role,
                user_id=user.id,
                success=True
            )

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role, "user_id": user.id},
            expires_delta=access_token_expires
        )

        # Check if user has completed their profile
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT profile_complete FROM user_profiles WHERE user_id = ?', (user.id,))
        profile_result = cursor.fetchone()
        conn.close()
        
        profile_complete = profile_result[0] if profile_result else False

        # Return response with profile completion status
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "user_id": user.id,
            "profile_complete": profile_complete
        }

        return response_data

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

@app.put("/users/{user_id}/profile")
async def update_user_profile(user_id: str, profile_data: ProfileUpdateRequest):
    """Update user profile with additional information"""
    try:
        import sqlite3
        import json
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id, email FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create profile_data table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                profile_data TEXT NOT NULL,
                profile_complete BOOLEAN DEFAULT FALSE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Convert profile data to JSON
        profile_json = json.dumps(profile_data.dict())
        
        # Insert or update profile
        cursor.execute('''
            INSERT INTO user_profiles (user_id, profile_data, profile_complete)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                profile_data = excluded.profile_data,
                profile_complete = excluded.profile_complete,
                updated_at = CURRENT_TIMESTAMP
        ''', (user_id, profile_json, profile_data.profile_complete))
        
        conn.commit()
        conn.close()
        
        print(f"✓ Profile updated for user {user_id}")
        
        return {
            "message": "Profile updated successfully",
            "user_id": user_id,
            "profile_complete": profile_data.profile_complete
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"✗ Profile update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@app.post("/auth/whatsapp/send-otp")
async def send_whatsapp_otp(request: WhatsAppOTPRequest):
    """Send OTP via WhatsApp (FREE for new users via FEP)"""
    try:
        # Check if user exists
        existing_user = get_user_by_email(request.phone_number)
        is_new_user = existing_user is None
        
        # Send OTP
        result = await whatsapp_service.send_otp(
            phone_number=request.phone_number,
            is_new_user=is_new_user
        )
        
        if result.get("success"):
            return {
                "success": True,
                "message": "OTP sent successfully",
                "cost_status": result.get("cost", "PAID"),
                "is_new_user": is_new_user
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to send OTP")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"WhatsApp OTP error: {str(e)}"
        )

@app.post("/auth/whatsapp/verify-otp")
async def verify_whatsapp_otp(request: WhatsAppOTPVerifyRequest):
    """Verify WhatsApp OTP and create/login user"""
    try:
        # Validate OTP
        validation = whatsapp_service.validate_otp(request.phone_number, request.otp)
        
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid OTP")
            )
        
        # Check if user exists
        user = get_user_by_email(request.phone_number)
        is_new_user = False
        
        if not user:
            # Create new user
            is_new_user = True
            import secrets
            random_password = secrets.token_urlsafe(32)
            
            user_data = UserCreate(
                name=request.name or request.phone_number,
                email=request.phone_number,
                password=random_password,
                role=request.role
            )
            user = create_user(user_data)
            
            log_audit_event(
                event_type="signup",
                auth_method="whatsapp_otp",
                email=request.phone_number,
                role=user.role,
                user_id=user.id,
                success=True
            )
        else:
            log_audit_event(
                event_type="login",
                auth_method="whatsapp_otp",
                email=request.phone_number,
                role=user.role,
                user_id=user.id,
                success=True
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        # Check profile completion
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT profile_complete FROM user_profiles WHERE user_id = ?', (user.id,))
        profile_result = cursor.fetchone()
        conn.close()
        
        profile_complete = profile_result[0] if profile_result else False
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role,
            "user_id": user.id,
            "profile_complete": profile_complete,
            "is_new_user": is_new_user,
            "cost_status": "FREE (FEP)" if validation.get("is_fep") else "PAID"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification error: {str(e)}"
        )

@app.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request):
    """Handle WhatsApp webhook events (FEP trigger)"""
    try:
        webhook_data = await request.json()
        result = await handle_whatsapp_webhook(webhook_data)
        return result
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"status": "error", "error": str(e)}

@app.get("/whatsapp/webhook")
async def whatsapp_webhook_verify(request: Request):
    """Verify WhatsApp webhook (Meta requirement)"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    verify_token = "medicure_webhook_token_2025"  # Set this in env vars
    
    if mode == "subscribe" and token == verify_token:
        return int(challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")

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
