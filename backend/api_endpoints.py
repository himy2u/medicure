"""
Complete API endpoints for Medicure application
"""
from fastapi import APIRouter, HTTPException, Depends, status, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from database import get_pool
import json
import jwt
import os

router = APIRouter()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "medicure_secret_key_2025_change_in_production_abc123xyz789")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Auth dependency
async def get_current_user(authorization: str = Header(None)) -> Dict:
    """Get current user from JWT token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Get user from database using email (sub) or user_id
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Try to get user_id from payload first, otherwise use email (sub)
            user_id = payload.get("user_id")
            email = payload.get("sub")
            
            if user_id:
                query = "SELECT id, name, email, role FROM users WHERE id = $1"
                user = await conn.fetchrow(query, user_id)
            elif email:
                query = "SELECT id, name, email, role FROM users WHERE email = $1"
                user = await conn.fetchrow(query, email)
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            return dict(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except (jwt.PyJWTError, Exception) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_type: str  # 'emergency' or 'scheduled'
    appointment_date: datetime
    symptom: Optional[str] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    doctor_id: int
    appointment_id: Optional[str] = None
    medication_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    refills_remaining: int = 0
    expiry_date: Optional[datetime] = None

class ChatMessageCreate(BaseModel):
    appointment_id: str
    message_text: str
    message_type: str = 'text'
    file_url: Optional[str] = None

class LabTestCreate(BaseModel):
    patient_id: str
    doctor_id: int
    appointment_id: Optional[str] = None
    test_name: str
    test_type: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None

class DoctorAvailabilityUpdate(BaseModel):
    available_now: bool
    accepts_emergencies: bool
    notes: Optional[str] = None

# ============================================================================
# APPOINTMENTS ENDPOINTS
# ============================================================================

@router.post("/api/appointments/book")
async def book_appointment(
    appointment: AppointmentCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Book a new appointment"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                INSERT INTO appointments (
                    patient_id, doctor_id, appointment_type, appointment_date,
                    symptom, notes, latitude, longitude, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
                RETURNING id, patient_id, doctor_id, appointment_type, 
                          appointment_date, status, created_at
            """
            
            # Remove timezone info if present
            appt_date = appointment.appointment_date
            if hasattr(appt_date, 'replace') and appt_date.tzinfo is not None:
                appt_date = appt_date.replace(tzinfo=None)
            
            row = await conn.fetchrow(
                query,
                current_user['id'],
                appointment.doctor_id,
                appointment.appointment_type,
                appt_date,
                appointment.symptom,
                appointment.notes,
                appointment.latitude,
                appointment.longitude
            )
            
            return {
                "success": True,
                "appointment": dict(row)
            }
    except Exception as e:
        print(f"Error booking appointment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book appointment: {str(e)}"
        )

@router.get("/api/appointments/user/{user_id}")
async def get_user_appointments(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get all appointments for a user"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    a.*,
                    d.full_name as doctor_name,
                    d.specialty,
                    d.sub_specialty,
                    d.phone as doctor_phone
                FROM appointments a
                LEFT JOIN doctors d ON a.doctor_id = d.id
                WHERE a.patient_id = $1
                ORDER BY a.appointment_date DESC
            """
            
            rows = await conn.fetch(query, user_id)
            appointments = [dict(row) for row in rows]
            
            return {
                "success": True,
                "appointments": appointments,
                "count": len(appointments)
            }
    except Exception as e:
        print(f"Error fetching appointments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointments: {str(e)}"
        )

@router.get("/api/appointments/{appointment_id}")
async def get_appointment_details(
    appointment_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get details of a specific appointment"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    a.*,
                    d.full_name as doctor_name,
                    d.specialty,
                    d.sub_specialty,
                    d.phone as doctor_phone,
                    d.email as doctor_email,
                    u.name as patient_name,
                    u.email as patient_email
                FROM appointments a
                LEFT JOIN doctors d ON a.doctor_id = d.id
                LEFT JOIN users u ON a.patient_id = u.id
                WHERE a.id = $1
            """
            
            row = await conn.fetchrow(query, appointment_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Appointment not found"
                )
            
            return {
                "success": True,
                "appointment": dict(row)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching appointment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointment: {str(e)}"
        )

@router.post("/api/appointments/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Cancel an appointment"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                UPDATE appointments
                SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, status
            """
            
            row = await conn.fetchrow(query, appointment_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Appointment not found"
                )
            
            return {
                "success": True,
                "message": "Appointment cancelled successfully",
                "appointment": dict(row)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error cancelling appointment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel appointment: {str(e)}"
        )

# ============================================================================
# PRESCRIPTIONS ENDPOINTS
# ============================================================================

@router.get("/api/prescriptions/user/{user_id}")
async def get_user_prescriptions(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get all prescriptions for a user"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    p.*,
                    d.full_name as doctor_name,
                    d.specialty
                FROM prescriptions p
                LEFT JOIN doctors d ON p.doctor_id = d.id
                WHERE p.patient_id = $1
                ORDER BY p.issued_date DESC
            """
            
            rows = await conn.fetch(query, user_id)
            prescriptions = [dict(row) for row in rows]
            
            return {
                "success": True,
                "prescriptions": prescriptions,
                "count": len(prescriptions)
            }
    except Exception as e:
        print(f"Error fetching prescriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prescriptions: {str(e)}"
        )

@router.post("/api/prescriptions/{prescription_id}/refill")
async def request_prescription_refill(
    prescription_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Request a prescription refill"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Check if refills are available
            check_query = "SELECT refills_remaining FROM prescriptions WHERE id = $1"
            row = await conn.fetchrow(check_query, prescription_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Prescription not found"
                )
            
            if row['refills_remaining'] <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No refills remaining"
                )
            
            # Decrement refills
            update_query = """
                UPDATE prescriptions
                SET refills_remaining = refills_remaining - 1
                WHERE id = $1
                RETURNING id, refills_remaining
            """
            
            updated_row = await conn.fetchrow(update_query, prescription_id)
            
            return {
                "success": True,
                "message": "Refill requested successfully",
                "prescription": dict(updated_row)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error requesting refill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request refill: {str(e)}"
        )

# ============================================================================
# LAB RESULTS ENDPOINTS
# ============================================================================

@router.get("/api/lab-results/user/{user_id}")
async def get_user_lab_results(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get all lab results for a user"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    lt.*,
                    lr.result_summary,
                    lr.result_file_url,
                    lr.abnormal_flags,
                    lr.reviewed_by_doctor,
                    lr.created_at as result_date,
                    d.full_name as doctor_name
                FROM lab_tests lt
                LEFT JOIN lab_results lr ON lt.id = lr.lab_test_id
                LEFT JOIN doctors d ON lt.doctor_id = d.id
                WHERE lt.patient_id = $1
                ORDER BY lt.ordered_date DESC
            """
            
            rows = await conn.fetch(query, user_id)
            results = [dict(row) for row in rows]
            
            return {
                "success": True,
                "results": results,
                "count": len(results)
            }
    except Exception as e:
        print(f"Error fetching lab results: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch lab results: {str(e)}"
        )

# ============================================================================
# CHAT ENDPOINTS
# ============================================================================

@router.get("/api/chat/messages/{appointment_id}")
async def get_chat_messages(
    appointment_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get all chat messages for an appointment"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    cm.*,
                    u.name as sender_name,
                    u.role as sender_role
                FROM chat_messages cm
                LEFT JOIN users u ON cm.sender_id = u.id
                WHERE cm.appointment_id = $1
                ORDER BY cm.created_at ASC
            """
            
            rows = await conn.fetch(query, appointment_id)
            messages = [dict(row) for row in rows]
            
            return {
                "success": True,
                "messages": messages,
                "count": len(messages)
            }
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch messages: {str(e)}"
        )

@router.post("/api/chat/send")
async def send_chat_message(
    message: ChatMessageCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Send a chat message"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                INSERT INTO chat_messages (
                    appointment_id, sender_id, message_text, message_type, file_url
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, appointment_id, sender_id, message_text, 
                          message_type, created_at
            """
            
            row = await conn.fetchrow(
                query,
                message.appointment_id,
                current_user['id'],
                message.message_text,
                message.message_type,
                message.file_url
            )
            
            return {
                "success": True,
                "message": dict(row)
            }
    except Exception as e:
        print(f"Error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

# ============================================================================
# DOCTOR ENDPOINTS
# ============================================================================

@router.get("/api/doctors/{doctor_id}/availability")
async def get_doctor_availability(
    doctor_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get doctor's current availability status"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT available_now, accepts_emergencies, notes, created_at
                FROM doctor_availability_updates
                WHERE doctor_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            """
            
            row = await conn.fetchrow(query, int(doctor_id))
            
            if not row:
                # Return default availability
                return {
                    "success": True,
                    "data": {
                        "available_now": True,
                        "accepts_emergencies": True,
                        "notes": None
                    }
                }
            
            return {
                "success": True,
                "data": dict(row)
            }
    except Exception as e:
        print(f"Error fetching availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch availability: {str(e)}"
        )

@router.put("/api/doctors/{doctor_id}/availability")
async def update_doctor_availability(
    doctor_id: str,
    availability: DoctorAvailabilityUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update doctor's availability status"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                INSERT INTO doctor_availability_updates (
                    doctor_id, available_now, accepts_emergencies, notes
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id, doctor_id, available_now, accepts_emergencies, 
                          notes, created_at
            """
            
            row = await conn.fetchrow(
                query,
                int(doctor_id),
                availability.available_now,
                availability.accepts_emergencies,
                availability.notes
            )
            
            return {
                "success": True,
                "data": dict(row)
            }
    except Exception as e:
        print(f"Error updating availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update availability: {str(e)}"
        )

@router.get("/api/doctors/{doctor_id}/patients")
async def get_doctor_patients(
    doctor_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get list of doctor's patients"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT DISTINCT
                    u.id,
                    u.name,
                    u.email,
                    COUNT(a.id) as appointment_count,
                    MAX(a.appointment_date) as last_appointment
                FROM users u
                INNER JOIN appointments a ON u.id = a.patient_id
                WHERE a.doctor_id = $1
                GROUP BY u.id, u.name, u.email
                ORDER BY MAX(a.appointment_date) DESC
            """
            
            rows = await conn.fetch(query, int(doctor_id))
            patients = [dict(row) for row in rows]
            
            return {
                "success": True,
                "patients": patients,
                "count": len(patients)
            }
    except Exception as e:
        print(f"Error fetching patients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch patients: {str(e)}"
        )

@router.get("/api/patients/{patient_id}/history")
async def get_patient_history(
    patient_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get patient's medical history"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Get appointments
            appointments_query = """
                SELECT 
                    a.*,
                    d.full_name as doctor_name,
                    d.specialty
                FROM appointments a
                LEFT JOIN doctors d ON a.doctor_id = d.id
                WHERE a.patient_id = $1
                ORDER BY a.appointment_date DESC
                LIMIT 10
            """
            
            # Get prescriptions
            prescriptions_query = """
                SELECT 
                    p.*,
                    d.full_name as doctor_name
                FROM prescriptions p
                LEFT JOIN doctors d ON p.doctor_id = d.id
                WHERE p.patient_id = $1
                ORDER BY p.issued_date DESC
                LIMIT 10
            """
            
            # Get lab tests
            lab_tests_query = """
                SELECT 
                    lt.*,
                    d.full_name as doctor_name
                FROM lab_tests lt
                LEFT JOIN doctors d ON lt.doctor_id = d.id
                WHERE lt.patient_id = $1
                ORDER BY lt.ordered_date DESC
                LIMIT 10
            """
            
            appointments = await conn.fetch(appointments_query, patient_id)
            prescriptions = await conn.fetch(prescriptions_query, patient_id)
            lab_tests = await conn.fetch(lab_tests_query, patient_id)
            
            return {
                "success": True,
                "history": {
                    "appointments": [dict(row) for row in appointments],
                    "prescriptions": [dict(row) for row in prescriptions],
                    "lab_tests": [dict(row) for row in lab_tests]
                }
            }
    except Exception as e:
        print(f"Error fetching patient history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch patient history: {str(e)}"
        )

# ============================================================================
# EMERGENCY ENDPOINTS
# ============================================================================

@router.post("/api/emergency/accept")
async def accept_emergency_request(
    request_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Doctor accepts an emergency request"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                UPDATE emergency_requests
                SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, patient_id, doctor_id, status
            """
            
            row = await conn.fetchrow(query, request_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Emergency request not found"
                )
            
            return {
                "success": True,
                "message": "Emergency request accepted",
                "request": dict(row)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error accepting emergency request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept emergency request: {str(e)}"
        )

@router.post("/api/emergency/decline")
async def decline_emergency_request(
    request_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Doctor declines an emergency request"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                UPDATE emergency_requests
                SET status = 'declined', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, patient_id, doctor_id, status
            """
            
            row = await conn.fetchrow(query, request_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Emergency request not found"
                )
            
            return {
                "success": True,
                "message": "Emergency request declined",
                "request": dict(row)
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error declining emergency request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decline emergency request: {str(e)}"
        )
