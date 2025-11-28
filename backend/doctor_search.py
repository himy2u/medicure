"""
Doctor search and matching logic
"""
import math
from typing import List, Dict, Optional
from datetime import datetime

# Symptom to specialty mapping
SYMPTOM_SPECIALTY_MAP = {
    # Cardiovascular
    "chest pain": ["Cardiologist", "Emergency Medicine", "General Practitioner"],
    "heart": ["Cardiologist", "Emergency Medicine"],
    "palpitations": ["Cardiologist", "Internal Medicine"],
    
    # Neurological
    "headache": ["Neurosurgeon", "General Practitioner", "Internal Medicine"],
    "migraine": ["Neurosurgeon", "General Practitioner"],
    "dizziness": ["Neurosurgeon", "General Practitioner", "Internal Medicine"],
    "seizure": ["Neurosurgeon", "Emergency Medicine"],
    
    # Respiratory
    "breathing": ["Pulmonologist", "Emergency Medicine", "General Practitioner"],
    "cough": ["Pulmonologist", "General Practitioner", "Internal Medicine"],
    "asthma": ["Pulmonologist", "Emergency Medicine"],
    "shortness of breath": ["Pulmonologist", "Emergency Medicine", "Cardiologist"],
    
    # Gastrointestinal
    "stomach": ["Gastroenterologist", "General Practitioner", "Internal Medicine"],
    "abdominal pain": ["Gastroenterologist", "Emergency Medicine", "General Practitioner"],
    "nausea": ["Gastroenterologist", "General Practitioner"],
    "vomiting": ["Gastroenterologist", "Emergency Medicine", "General Practitioner"],
    
    # General/Emergency
    "fever": ["General Practitioner", "Internal Medicine", "Emergency Medicine"],
    "pain": ["General Practitioner", "Emergency Medicine"],
    "injury": ["Orthopedic Surgeon", "Emergency Medicine"],
    "bleeding": ["Emergency Medicine", "General Practitioner"],
    "accident": ["Emergency Medicine", "Orthopedic Surgeon"],
    
    # Pediatric
    "child": ["Pediatrician", "General Practitioner"],
    "baby": ["Pediatrician"],
    
    # Orthopedic
    "bone": ["Orthopedic Surgeon", "Emergency Medicine"],
    "fracture": ["Orthopedic Surgeon", "Emergency Medicine"],
    "joint": ["Orthopedic Surgeon", "Rheumatologist"],
    "back pain": ["Orthopedic Surgeon", "General Practitioner"],
    
    # Dermatological
    "skin": ["Dermatologist", "General Practitioner"],
    "rash": ["Dermatologist", "General Practitioner"],
    
    # Gynecological
    "pregnancy": ["Gynecologist", "Obstetrician"],
    "menstrual": ["Gynecologist", "General Practitioner"],
    
    # Urological
    "urinary": ["Urologist", "General Practitioner"],
    "kidney": ["Urologist", "Nephrologist", "Internal Medicine"],
    
    # Ophthalmological
    "eye": ["Ophthalmologist", "General Practitioner"],
    "vision": ["Ophthalmologist"],
    
    # ENT
    "ear": ["ENT Specialist", "General Practitioner"],
    "throat": ["ENT Specialist", "General Practitioner"],
    "nose": ["ENT Specialist", "General Practitioner"],
}

def match_symptom_to_specialties(symptom: str) -> List[str]:
    """
    Match a symptom description to relevant medical specialties
    """
    symptom_lower = symptom.lower()
    matched_specialties = set()
    
    # Check for keyword matches
    for keyword, specialties in SYMPTOM_SPECIALTY_MAP.items():
        if keyword in symptom_lower:
            matched_specialties.update(specialties)
    
    # If no match, default to general practitioners and emergency medicine
    if not matched_specialties:
        matched_specialties = {"General Practitioner", "Emergency Medicine", "Internal Medicine"}
    
    return list(matched_specialties)

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)

async def search_doctors(
    conn,
    symptom: str,
    patient_latitude: float,
    patient_longitude: float,
    radius_km: float = 50,
    limit: int = 20
) -> List[Dict]:
    """
    Search for available doctors based on symptom and location
    """
    # Match symptom to specialties
    specialties = match_symptom_to_specialties(symptom)
    
    # Query doctors with matching specialties
    query = """
        SELECT 
            d.id as doctor_id,
            d.full_name,
            d.specialty,
            d.sub_specialty,
            d.phone,
            d.email,
            dsl.id as location_id,
            dsl.location_type,
            dsl.name as clinic_name,
            dsl.address,
            dsl.city,
            dsl.latitude,
            dsl.longitude,
            da.is_24_hours,
            da.is_available
        FROM doctors d
        JOIN doctor_service_locations dsl ON d.id = dsl.doctor_id
        JOIN doctor_availability da ON d.id = da.doctor_id AND dsl.id = da.location_id
        WHERE d.specialty = ANY($1)
        AND da.is_available = TRUE
        AND dsl.latitude IS NOT NULL
        AND dsl.longitude IS NOT NULL
    """
    
    rows = await conn.fetch(query, specialties)
    
    # Calculate distances and sort
    doctors_with_distance = []
    for row in rows:
        distance = calculate_distance(
            patient_latitude,
            patient_longitude,
            float(row['latitude']),
            float(row['longitude'])
        )
        
        # Only include doctors within radius
        if distance <= radius_km:
            doctors_with_distance.append({
                'doctor_id': row['doctor_id'],
                'full_name': row['full_name'],
                'specialty': row['specialty'],
                'sub_specialty': row['sub_specialty'],
                'phone': row['phone'],
                'email': row['email'],
                'location_id': row['location_id'],
                'location_type': row['location_type'],
                'clinic_name': row['clinic_name'],
                'address': row['address'],
                'city': row['city'],
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'distance_km': distance,
                'is_24_hours': row['is_24_hours'],
                'is_available': row['is_available']
            })
    
    # Sort by distance (nearest first)
    doctors_with_distance.sort(key=lambda x: x['distance_km'])
    
    # Limit results
    return doctors_with_distance[:limit]

async def create_emergency_request(
    conn,
    patient_id: int,
    doctor_id: int,
    symptom: str,
    patient_latitude: float,
    patient_longitude: float
) -> int:
    """
    Create an emergency appointment request
    """
    query = """
        INSERT INTO emergency_requests 
        (patient_id, doctor_id, symptom, patient_latitude, patient_longitude, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING id
    """
    
    request_id = await conn.fetchval(
        query,
        patient_id,
        doctor_id,
        symptom,
        patient_latitude,
        patient_longitude
    )
    
    return request_id
