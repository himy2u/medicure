"""
WhatsApp OTP Service using Meta Cloud API
Implements Free Entry Point (FEP) strategy for cost optimization
"""

import os
import secrets
import time
from typing import Optional, Dict
import httpx
from datetime import datetime, timedelta

# Configuration
WHATSAPP_API_VERSION = "v18.0"
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_TEMPLATE_NAME = os.getenv("WHATSAPP_TEMPLATE_NAME", "otp_verification")

# In-memory OTP storage (use Redis in production)
otp_store: Dict[str, Dict] = {}

class WhatsAppOTPService:
    """WhatsApp OTP service with FEP optimization"""
    
    def __init__(self):
        self.api_url = f"https://graph.facebook.com/{WHATSAPP_API_VERSION}/{WHATSAPP_PHONE_ID}/messages"
        self.headers = {
            "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
    
    def generate_otp(self, length: int = 6) -> str:
        """Generate a secure numeric OTP"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(length)])
    
    def store_otp(self, phone_number: str, otp: str, is_fep: bool = True) -> None:
        """Store OTP with expiration and metadata"""
        otp_store[phone_number] = {
            "otp": otp,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "attempts": 0,
            "is_fep": is_fep,
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
            return {"valid": True, "is_fep": stored["is_fep"]}
        
        return {"valid": False, "error": "Invalid OTP"}
    
    def check_rate_limit(self, phone_number: str) -> bool:
        """Check if phone number has exceeded rate limit (3 requests/hour)"""
        stored = otp_store.get(phone_number)
        if not stored:
            return True
        
        # Check if last request was within the hour
        if stored.get("request_count", 0) >= 3:
            time_since_first = datetime.utcnow() - stored["created_at"]
            if time_since_first < timedelta(hours=1):
                return False
        
        return True
    
    async def send_otp_fep(self, phone_number: str, otp: str) -> Dict:
        """
        Send OTP via WhatsApp using Authentication Template (FREE within FEP window)
        This is used for NEW user signups initiated via Click-to-WhatsApp ads
        """
        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "template",
            "template": {
                "name": WHATSAPP_TEMPLATE_NAME,
                "language": {
                    "code": "en"
                },
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": otp
                            }
                        ]
                    },
                    {
                        "type": "button",
                        "sub_type": "url",
                        "index": "0",
                        "parameters": [
                            {
                                "type": "text",
                                "text": otp
                            }
                        ]
                    }
                ]
            }
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                self.api_url,
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message_id": response.json().get("messages", [{}])[0].get("id"),
                    "cost": "FREE (FEP)",
                    "context": "72hr_window"
                }
            else:
                return {
                    "success": False,
                    "error": response.text,
                    "status_code": response.status_code
                }
    
    async def send_otp_paid(self, phone_number: str, otp: str) -> Dict:
        """
        Send OTP via WhatsApp (PAID - outside FEP window)
        This is used for existing users or re-login attempts
        """
        # Same implementation as FEP but outside the 72hr window
        # Meta will charge for this as an Authentication conversation
        return await self.send_otp_fep(phone_number, otp)
    
    async def send_otp(self, phone_number: str, is_new_user: bool = True) -> Dict:
        """
        Main entry point for sending OTP
        Automatically chooses FEP or paid based on user status
        """
        # Check rate limit
        if not self.check_rate_limit(phone_number):
            return {
                "success": False,
                "error": "Rate limit exceeded. Max 3 requests per hour."
            }
        
        # Generate OTP
        otp = self.generate_otp()
        
        # Store OTP
        self.store_otp(phone_number, otp, is_fep=is_new_user)
        
        # Send via appropriate method
        if is_new_user:
            result = await self.send_otp_fep(phone_number, otp)
        else:
            result = await self.send_otp_paid(phone_number, otp)
        
        if result.get("success"):
            print(f"✓ OTP sent to {phone_number}: {otp} (Cost: {result.get('cost', 'PAID')})")
        else:
            print(f"✗ Failed to send OTP to {phone_number}: {result.get('error')}")
        
        return result


# Webhook handler for incoming messages (FEP trigger)
async def handle_whatsapp_webhook(webhook_data: Dict) -> Dict:
    """
    Handle incoming WhatsApp messages (FEP trigger)
    This opens the 72hr free messaging window
    """
    try:
        entry = webhook_data.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])
        
        if not messages:
            return {"status": "no_messages"}
        
        message = messages[0]
        phone_number = message.get("from")
        message_type = message.get("type")
        
        # User initiated contact - FEP window opens
        print(f"✓ FEP window opened for {phone_number}")
        
        # Respond with welcome message (FREE)
        response = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "text",
            "text": {
                "body": "Welcome to Medicure! We'll send you a verification code shortly."
            }
        }
        
        return {
            "status": "fep_opened",
            "phone_number": phone_number,
            "window": "72hr_free"
        }
        
    except Exception as e:
        print(f"✗ Webhook error: {str(e)}")
        return {"status": "error", "error": str(e)}


# Initialize service
whatsapp_service = WhatsAppOTPService()
