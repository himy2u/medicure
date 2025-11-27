"""
Twilio WhatsApp OTP Service
Simpler alternative to Meta Cloud API
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

# In-memory OTP storage (use Redis in production)
otp_store: Dict[str, Dict] = {}

class TwilioWhatsAppOTP:
    """Twilio WhatsApp OTP service"""
    
    def __init__(self):
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            print("⚠️  Twilio credentials not configured")
            self.client = None
        else:
            self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            print("✅ Twilio client initialized")
    
    def generate_otp(self, length: int = 6) -> str:
        """Generate a secure numeric OTP"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(length)])
    
    def store_otp(self, phone_number: str, otp: str) -> None:
        """Store OTP with expiration"""
        otp_store[phone_number] = {
            "otp": otp,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "attempts": 0,
            "request_count": otp_store.get(phone_number, {}).get("request_count", 0) + 1
        }
    
    def validate_otp(self, phone_number: str, otp: str) -> Dict:
        """Validate OTP with security checks"""
        stored = otp_store.get(phone_number)
        
        if not stored:
            return {"valid": False, "error": "No OTP found for this number"}
        
        # Check expiration
        if datetime.utcnow() > stored["expires_at"]:
            del otp_store[phone_number]
            return {"valid": False, "error": "OTP expired"}
        
        # Check attempt limit
        if stored["attempts"] >= 5:
            del otp_store[phone_number]
            return {"valid": False, "error": "Too many attempts"}
        
        # Increment attempts
        stored["attempts"] += 1
        
        # Validate OTP
        if stored["otp"] == otp:
            del otp_store[phone_number]
            return {"valid": True}
        
        return {"valid": False, "error": "Invalid OTP"}
    
    def check_rate_limit(self, phone_number: str) -> bool:
        """Check if phone number has exceeded rate limit (3 requests/hour)"""
        stored = otp_store.get(phone_number)
        if not stored:
            return True
        
        if stored.get("request_count", 0) >= 3:
            time_since_first = datetime.utcnow() - stored["created_at"]
            if time_since_first < timedelta(hours=1):
                return False
        
        return True
    
    def send_otp(self, phone_number: str) -> Dict:
        """Send OTP via Twilio WhatsApp"""
        
        if not self.client:
            return {
                "success": False,
                "error": "Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN"
            }
        
        # Check rate limit
        if not self.check_rate_limit(phone_number):
            return {
                "success": False,
                "error": "Rate limit exceeded. Max 3 requests per hour."
            }
        
        # Generate OTP
        otp = self.generate_otp()
        
        # Store OTP
        self.store_otp(phone_number, otp)
        
        # Format phone number for WhatsApp
        if not phone_number.startswith("whatsapp:"):
            to_number = f"whatsapp:{phone_number}"
        else:
            to_number = phone_number
        
        try:
            # Send WhatsApp message
            message = self.client.messages.create(
                from_=TWILIO_WHATSAPP_NUMBER,
                body=f"Your Medicure verification code is: {otp}\n\nValid for 5 minutes. Do not share this code.",
                to=to_number
            )
            
            print(f"✓ OTP sent to {phone_number}: {otp}")
            print(f"  Message SID: {message.sid}")
            
            return {
                "success": True,
                "message_sid": message.sid,
                "otp": otp  # Remove in production!
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"✗ Failed to send OTP to {phone_number}: {error_msg}")
            
            return {
                "success": False,
                "error": error_msg
            }

# Initialize service
twilio_otp_service = TwilioWhatsAppOTP()
