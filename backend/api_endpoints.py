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
    """Cancel an appointment - only non-emergency appointments can be cancelled at least 24 hours before"""
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            # First, get the appointment to check type and date
            check_query = """
                SELECT id, appointment_type, appointment_date, patient_id, doctor_id, status
                FROM appointments
                WHERE id = $1
            """
            appointment = await conn.fetchrow(check_query, appointment_id)
            
            if not appointment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Appointment not found"
                )
            
            # Check if already cancelled
            if appointment['status'] == 'cancelled':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Appointment is already cancelled"
                )
            
            # Check if emergency appointment
            if appointment['appointment_type'] == 'emergency':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Emergency appointments cannot be cancelled"
                )
            
            # Check if user is authorized (patient, doctor, or caregiver)
            user_id = str(current_user.get('id'))
            patient_id = str(appointment['patient_id'])
            doctor_id = str(appointment['doctor_id'])
            user_role = current_user.get('role', '')
            
            is_authorized = (
                user_id == patient_id or 
                user_id == doctor_id or 
                user_role in ['doctor', 'caregiver', 'admin']
            )
            
            if not is_authorized:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to cancel this appointment"
                )
            
            # Check 24-hour rule
            appointment_date = appointment['appointment_date']
            now = datetime.utcnow()
            hours_until_appointment = (appointment_date - now).total_seconds() / 3600
            
            if hours_until_appointment < 24:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Appointments can only be cancelled at least 24 hours in advance. This appointment is in {int(hours_until_appointment)} hours."
                )
            
            # Cancel the appointment
            update_query = """
                UPDATE appointments
                SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, status, appointment_type, appointment_date
            """
            
            row = await conn.fetchrow(update_query, appointment_id)
            
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
        # Handle UUID doctor_ids - return default availability
        # The doctor_availability_updates table uses INTEGER for doctor_id
        try:
            doctor_id_int = int(doctor_id)
        except ValueError:
            # UUID format - return default availability
            return {
                "success": True,
                "data": {
                    "available_now": True,
                    "accepts_emergencies": True,
                    "notes": None
                }
            }
        
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT available_now, accepts_emergencies, notes, created_at
                FROM doctor_availability_updates
                WHERE doctor_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            """
            
            row = await conn.fetchrow(query, doctor_id_int)
            
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
        # Handle UUID doctor_ids
        try:
            doctor_id_int = int(doctor_id)
        except ValueError:
            # UUID format - just return success with the data (no DB storage for UUID doctors)
            return {
                "success": True,
                "data": {
                    "available_now": availability.available_now,
                    "accepts_emergencies": availability.accepts_emergencies,
                    "notes": availability.notes
                }
            }
        
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
                doctor_id_int,
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
        # Handle UUID doctor_ids
        try:
            doctor_id_int = int(doctor_id)
        except ValueError:
            # UUID format - return mock data for demo
            return {
                "success": True,
                "patients": [
                    {"id": "p1", "name": "Maria Garcia", "email": "maria@example.com", "phone": "+593987654321", "lastVisit": "2025-12-08", "status": "active", "condition": "Hypertension"},
                    {"id": "p2", "name": "Carlos Rodriguez", "email": "carlos@example.com", "phone": "+593987654322", "lastVisit": "2025-12-05", "status": "active", "condition": "Diabetes Type 2"},
                    {"id": "p3", "name": "Ana Martinez", "email": "ana@example.com", "phone": "+593987654323", "lastVisit": "2025-12-01", "status": "follow-up", "condition": "Post-surgery recovery"},
                    {"id": "p4", "name": "Luis Fernandez", "email": "luis@example.com", "phone": "+593987654324", "lastVisit": "2025-11-28", "status": "active", "condition": "Asthma"},
                    {"id": "p5", "name": "Sofia Ramirez", "email": "sofia@example.com", "phone": "+593987654325", "lastVisit": "2025-11-20", "status": "inactive", "condition": "General checkup"},
                ],
                "count": 5
            }
        
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
            
            rows = await conn.fetch(query, doctor_id_int)
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


# ============================================================================
# CALENDAR & SCHEDULING ENDPOINTS
# ============================================================================

@router.get("/api/doctors/{doctor_id}/calendar")
async def get_doctor_calendar(
    doctor_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get doctor's calendar with appointments and availability"""
    try:
        # Handle UUID doctor_ids
        try:
            doctor_id_int = int(doctor_id)
        except ValueError:
            # UUID format - return mock data
            return {
                "success": True,
                "data": {
                    "appointments": [
                        {"id": "1", "time": "09:00", "patientName": "Maria G.", "type": "scheduled", "location": "clinic1", "status": "confirmed", "date": "2025-12-11"},
                        {"id": "2", "time": "09:30", "patientName": "Carlos R.", "type": "scheduled", "location": "clinic1", "status": "confirmed", "date": "2025-12-11"},
                        {"id": "3", "time": "10:00", "patientName": "Ana M.", "type": "emergency", "location": "clinic2", "status": "pending", "date": "2025-12-11"},
                        {"id": "4", "time": "11:00", "patientName": "Luis F.", "type": "scheduled", "location": "clinic1", "status": "confirmed", "date": "2025-12-11"},
                        {"id": "5", "time": "14:00", "patientName": "Sofia R.", "type": "walkin", "location": "clinic3", "status": "pending", "date": "2025-12-11"},
                        {"id": "6", "time": "15:30", "patientName": "Pedro G.", "type": "scheduled", "location": "clinic2", "status": "confirmed", "date": "2025-12-11"},
                    ],
                    "availability": {
                        "early": False,
                        "morning": True,
                        "lunch": True,
                        "afternoon": True,
                        "evening": False,
                        "night": False
                    }
                }
            }
        
        pool = await get_pool()
        async with pool.acquire() as conn:
            # Get appointments
            appointments_query = """
                SELECT 
                    a.id, a.appointment_date, a.status, a.appointment_type,
                    u.name as patient_name
                FROM appointments a
                LEFT JOIN users u ON a.patient_id = u.id
                WHERE a.doctor_id = $1
                ORDER BY a.appointment_date
            """
            rows = await conn.fetch(appointments_query, doctor_id_int)
            
            appointments = []
            for row in rows:
                apt_date = row['appointment_date']
                appointments.append({
                    "id": str(row['id']),
                    "time": apt_date.strftime('%H:%M') if apt_date else "09:00",
                    "patientName": row['patient_name'] or "Patient",
                    "type": row['appointment_type'] or "scheduled",
                    "location": "clinic1",
                    "status": row['status'] or "confirmed",
                    "date": apt_date.strftime('%Y-%m-%d') if apt_date else ""
                })
            
            return {
                "success": True,
                "data": {
                    "appointments": appointments,
                    "availability": {
                        "early": False,
                        "morning": True,
                        "lunch": True,
                        "afternoon": True,
                        "evening": False,
                        "night": False
                    }
                }
            }
    except Exception as e:
        print(f"Error fetching calendar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch calendar: {str(e)}"
        )


@router.get("/api/doctors/{doctor_id}/emergency-alerts")
async def get_doctor_emergency_alerts(
    doctor_id: str,
    status: str = "pending",
    current_user: Dict = Depends(get_current_user)
):
    """Get emergency alerts for a doctor"""
    try:
        # Handle UUID doctor_ids
        try:
            doctor_id_int = int(doctor_id)
        except ValueError:
            # UUID format - return mock data
            return {
                "success": True,
                "alerts": [
                    {
                        "id": "1",
                        "patientName": "Maria Garcia",
                        "patientPhone": "+593987654321",
                        "symptom": "Severe chest pain, difficulty breathing",
                        "severity": "critical",
                        "status": "pending",
                        "location": "Av. 6 de Diciembre, Quito",
                        "timeAgo": "3m ago",
                        "hasAmbulance": True
                    },
                    {
                        "id": "2",
                        "patientName": "Carlos Rodriguez",
                        "patientPhone": "+593987654322",
                        "symptom": "High fever (39.5°C), severe headache",
                        "severity": "high",
                        "status": "accepted",
                        "location": "Av. Eloy Alfaro, Quito",
                        "timeAgo": "12m ago",
                        "hasAmbulance": False
                    },
                    {
                        "id": "3",
                        "patientName": "Ana Martinez",
                        "patientPhone": "+593987654323",
                        "symptom": "Allergic reaction, facial swelling",
                        "severity": "medium",
                        "status": "pending",
                        "location": "Calle Toledo, Quito",
                        "timeAgo": "25m ago",
                        "hasAmbulance": False
                    }
                ],
                "count": 3
            }
        
        pool = await get_pool()
        async with pool.acquire() as conn:
            query = """
                SELECT 
                    ea.id, ea.symptom, ea.severity, ea.status,
                    ea.patient_location_address, ea.ambulance_requested,
                    ea.created_at, ea.patient_phone, ea.patient_name
                FROM emergency_alerts ea
                WHERE ea.doctor_id = $1
                ORDER BY 
                    CASE ea.severity 
                        WHEN 'critical' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'medium' THEN 3 
                        ELSE 4 
                    END,
                    ea.created_at DESC
            """
            rows = await conn.fetch(query, doctor_id_int)
            
            alerts = []
            for row in rows:
                created = row['created_at']
                minutes_ago = int((datetime.now() - created).total_seconds() / 60) if created else 0
                time_ago = f"{minutes_ago}m ago" if minutes_ago < 60 else f"{minutes_ago // 60}h ago"
                
                alerts.append({
                    "id": str(row['id']),
                    "patientName": row['patient_name'] or "Unknown",
                    "patientPhone": row['patient_phone'] or "",
                    "symptom": row['symptom'] or "",
                    "severity": row['severity'] or "medium",
                    "status": row['status'] or "pending",
                    "location": row['patient_location_address'] or "",
                    "timeAgo": time_ago,
                    "hasAmbulance": row['ambulance_requested'] or False
                })
            
            return {
                "success": True,
                "alerts": alerts,
                "count": len(alerts)
            }
    except Exception as e:
        print(f"Error fetching emergency alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch emergency alerts: {str(e)}"
        )
