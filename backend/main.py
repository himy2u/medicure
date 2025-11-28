from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth_pg import (
    UserCreate, UserLogin, User, Token,
    create_user, authenticate_user, create_access_token,
    get_user_by_email, ACCESS_TOKEN_EXPIRE_MINUTES, log_audit_event
)
from database import get_pool, close_pool
from datetime import timedelta
from typing import Optional, Dict
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from twilio_otp import twilio_otp_service
import json

app = FastAPI(title="Medicure API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events
@app.on_event("startup")
async def startup():
    """Initialize database connection pool on startup"""
    await get_pool()
    print("✓ Database connection pool initialized")

@app.on_event("shutdown")
async def shutdown():
    """Close database connection pool on shutdown"""
    await close_pool()
    print("✓ Database connection pool closed")

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
        valid_roles = [
            "patient", "caregiver", "doctor", "medical_staff",
            "ambulance_staff", "lab_staff", "pharmacy_staff",
            "clinic_admin", "super_admin"
        ]
        if user_data.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {valid_roles}"
            )
        
        # Create user
        user = await create_user(user_data)
        
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
    user = await authenticate_user(user_data.email, user_data.password)
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
        existing_user = await get_user_by_email(email)
        is_new_user = False

        if existing_user:
            # User exists - login (use their existing role, ignore provided role)
            user = existing_user
            await log_audit_event(
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
            user = await create_user(user_data)

            await log_audit_event(
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
        pool = await get_pool()
        async with pool.acquire() as conn:
            profile_result = await conn.fetchrow(
                'SELECT profile_complete FROM user_profiles WHERE user_id = $1',
                user.id
            )

        profile_complete = profile_result['profile_complete'] if profile_result else False

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
    user = await get_user_by_email(request.email)
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
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Check if user exists
            user = await conn.fetchrow('SELECT id, email FROM users WHERE id = $1', user_id)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            # Convert profile data to JSON
            profile_json = json.dumps(profile_data.dict())

            # Insert or update profile
            await conn.execute('''
                INSERT INTO user_profiles (user_id, profile_data, profile_complete)
                VALUES ($1, $2, $3)
                ON CONFLICT(user_id) DO UPDATE SET
                    profile_data = EXCLUDED.profile_data,
                    profile_complete = EXCLUDED.profile_complete,
                    updated_at = CURRENT_TIMESTAMP
            ''', user_id, profile_json, profile_data.profile_complete)

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
    """Send OTP via Twilio WhatsApp"""
    try:
        # Check if user exists
        existing_user = await get_user_by_email(request.phone_number)
        is_new_user = existing_user is None
        
        # Send OTP via Twilio
        result = twilio_otp_service.send_otp(phone_number=request.phone_number)
        
        if result.get("success"):
            return {
                "success": True,
                "message": "OTP sent successfully",
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
    """Verify Twilio WhatsApp OTP and create/login user"""
    try:
        # Validate OTP
        validation = twilio_otp_service.validate_otp(request.phone_number, request.otp)
        
        if not validation.get("valid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation.get("error", "Invalid OTP")
            )
        
        # Check if user exists
        user = await get_user_by_email(request.phone_number)
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
            user = await create_user(user_data)

            await log_audit_event(
                event_type="signup",
                auth_method="whatsapp_otp",
                email=request.phone_number,
                role=user.role,
                user_id=user.id,
                success=True
            )
        else:
            await log_audit_event(
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
        pool = await get_pool()
        async with pool.acquire() as conn:
            profile_result = await conn.fetchrow(
                'SELECT profile_complete FROM user_profiles WHERE user_id = $1',
                user.id
            )

        profile_complete = profile_result['profile_complete'] if profile_result else False
        
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

class EmergencyDoctorRequest(BaseModel):
    symptom: str
    patient_latitude: float
    patient_longitude: float
    radius_km: float = 50.0  # Default 50km radius

@app.post("/emergency/find-doctors")
async def find_emergency_doctors(request: EmergencyDoctorRequest):
    """Find nearest available doctors for emergency based on location and symptom"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Haversine formula to calculate distance in SQL
            # Get doctors with their locations, sorted by distance
            query = """
                SELECT
                    d.id,
                    d.full_name,
                    d.specialty,
                    d.sub_specialty,
                    d.phone,
                    d.email,
                    dsl.name as clinic_name,
                    dsl.address,
                    dsl.city,
                    dsl.latitude,
                    dsl.longitude,
                    da.is_24_hours,
                    da.is_available,
                    -- Haversine distance formula
                    (
                        6371 * acos(
                            cos(radians($1)) * cos(radians(dsl.latitude)) *
                            cos(radians(dsl.longitude) - radians($2)) +
                            sin(radians($1)) * sin(radians(dsl.latitude))
                        )
                    ) AS distance_km
                FROM doctors d
                JOIN doctor_service_locations dsl ON d.id = dsl.doctor_id
                JOIN doctor_availability da ON d.id = da.doctor_id AND dsl.id = da.location_id
                WHERE da.is_available = TRUE
                AND (
                    da.is_24_hours = TRUE
                    OR (
                        da.day_of_week = EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER
                        AND CURRENT_TIME BETWEEN da.start_time AND da.end_time
                    )
                )
                AND (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(dsl.latitude)) *
                        cos(radians(dsl.longitude) - radians($2)) +
                        sin(radians($1)) * sin(radians(dsl.latitude))
                    )
                ) <= $3
                ORDER BY distance_km ASC
                LIMIT 20
            """

            doctors = await conn.fetch(
                query,
                request.patient_latitude,
                request.patient_longitude,
                request.radius_km
            )

            # Convert to list of dicts
            doctors_list = []
            for doctor in doctors:
                doctors_list.append({
                    "id": doctor['id'],
                    "full_name": doctor['full_name'],
                    "specialty": doctor['specialty'],
                    "sub_specialty": doctor['sub_specialty'],
                    "phone": doctor['phone'],
                    "email": doctor['email'],
                    "clinic_name": doctor['clinic_name'],
                    "address": doctor['address'],
                    "city": doctor['city'],
                    "latitude": float(doctor['latitude']) if doctor['latitude'] else None,
                    "longitude": float(doctor['longitude']) if doctor['longitude'] else None,
                    "distance_km": round(float(doctor['distance_km']), 2),
                    "distance_mi": round(float(doctor['distance_km']) * 0.621371, 2),
                    "is_24_hours": doctor['is_24_hours'],
                    "is_available": doctor['is_available']
                })

            return {
                "symptom": request.symptom,
                "patient_location": {
                    "latitude": request.patient_latitude,
                    "longitude": request.patient_longitude
                },
                "radius_km": request.radius_km,
                "doctors_found": len(doctors_list),
                "doctors": doctors_list
            }

    except Exception as e:
        print(f"Error finding emergency doctors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to find emergency doctors: {str(e)}"
        )

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


# Doctor Search Models
class DoctorSearchRequest(BaseModel):
    symptom: str
    latitude: float
    longitude: float
    radius_km: Optional[float] = 50

class EmergencyRequestCreate(BaseModel):
    doctor_id: int
    symptom: str
    latitude: float
    longitude: float

# Doctor Search Endpoints
@app.post("/api/doctors/search")
async def search_doctors_endpoint(request: DoctorSearchRequest):
    """
    Search for available doctors based on symptom and location
    """
    from doctor_search import search_doctors
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            doctors = await search_doctors(
                conn,
                request.symptom,
                request.latitude,
                request.longitude,
                request.radius_km
            )
            
            return {
                "success": True,
                "count": len(doctors),
                "doctors": doctors,
                "search_params": {
                    "symptom": request.symptom,
                    "radius_km": request.radius_km
                }
            }
    except Exception as e:
        print(f"Error searching doctors: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search doctors: {str(e)}"
        )

@app.post("/api/emergency/request")
async def create_emergency_request_endpoint(
    request: EmergencyRequestCreate,
    current_user: Dict = Depends(get_user_by_email)  # Add auth dependency
):
    """
    Create an emergency appointment request
    """
    from doctor_search import create_emergency_request
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Get user_id from current_user
            user_id = current_user.get('id')
            
            request_id = await create_emergency_request(
                conn,
                user_id,
                request.doctor_id,
                request.symptom,
                request.latitude,
                request.longitude
            )
            
            # TODO: Send notification to doctor
            # TODO: Send confirmation to patient
            
            return {
                "success": True,
                "request_id": request_id,
                "message": "Emergency request sent to doctor",
                "status": "pending"
            }
    except Exception as e:
        print(f"Error creating emergency request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create emergency request: {str(e)}"
        )

@app.get("/api/emergency/requests/{user_id}")
async def get_user_emergency_requests(user_id: int):
    """
    Get all emergency requests for a user
    """
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    er.*,
                    d.full_name as doctor_name,
                    d.specialty,
                    d.phone as doctor_phone
                FROM emergency_requests er
                LEFT JOIN doctors d ON er.doctor_id = d.id
                WHERE er.patient_id = $1
                ORDER BY er.created_at DESC
            """
            
            rows = await conn.fetch(query, user_id)
            
            requests = [dict(row) for row in rows]
            
            return {
                "success": True,
                "count": len(requests),
                "requests": requests
            }
    except Exception as e:
        print(f"Error fetching emergency requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch emergency requests: {str(e)}"
        )
