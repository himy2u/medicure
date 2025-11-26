# WhatsApp OTP Integration TODO

## Current Status
The WhatsApp signup button exists but doesn't send actual OTP messages yet.

## Requirements

### Option 1: Twilio WhatsApp (Recommended for MVP)
1. **Twilio Account Setup**
   - Sign up at https://www.twilio.com
   - Get Account SID and Auth Token
   - Enable WhatsApp messaging
   - Get a Twilio WhatsApp number

2. **Backend Implementation**
   ```python
   # backend/whatsapp_otp.py
   from twilio.rest import Client
   
   def send_whatsapp_otp(phone_number: str, otp: str):
       client = Client(account_sid, auth_token)
       message = client.messages.create(
           from_='whatsapp:+14155238886',  # Twilio sandbox
           body=f'Your Medicure verification code is: {otp}',
           to=f'whatsapp:{phone_number}'
       )
       return message.sid
   ```

3. **Environment Variables**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

### Option 2: WhatsApp Business API
- More complex setup
- Requires Facebook Business Manager
- Better for production at scale

## Implementation Steps
1. ✅ Frontend UI exists (WhatsApp button in SignupScreen)
2. ⏳ Backend OTP generation endpoint
3. ⏳ Twilio/WhatsApp integration
4. ⏳ OTP verification endpoint
5. ⏳ Frontend OTP input screen
6. ⏳ User creation after OTP verification

## Estimated Time
- With Twilio: 2-3 hours
- With WhatsApp Business API: 1-2 days

## Cost
- Twilio: ~$0.005 per message
- WhatsApp Business API: Free for first 1000 conversations/month
