# WhatsApp OTP Setup Guide (Meta Cloud API)

## ✅ Implementation Status
- **Backend**: Fully implemented with FEP optimization
- **Frontend**: Fully implemented with OTP flow
- **Cost Strategy**: FREE for new user signups (FEP)

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Meta Business Account
1. Go to https://business.facebook.com
2. Create a Business Account
3. Verify your business

### Step 2: Set Up WhatsApp Business API
1. Go to https://developers.facebook.com
2. Create a new app → Business → WhatsApp
3. Add WhatsApp product to your app
4. Get your **Phone Number ID** and **Access Token**

### Step 3: Create Authentication Template
1. In WhatsApp Manager, go to Message Templates
2. Create new template:
   - **Name**: `otp_verification`
   - **Category**: Authentication
   - **Language**: English
   - **Body**: `Your Medicure verification code is {{1}}. Valid for 5 minutes.`
   - **Button**: Add URL button with `{{1}}` parameter
3. Submit for approval (usually approved within minutes)

### Step 4: Configure Environment Variables
Add to `backend/.env`:

```bash
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_TEMPLATE_NAME=otp_verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=medicure_webhook_token_2025
```

### Step 5: Set Up Webhook
1. In your app dashboard, go to WhatsApp → Configuration
2. Set webhook URL: `https://yourdomain.com/whatsapp/webhook`
3. Set verify token: `medicure_webhook_token_2025`
4. Subscribe to `messages` events

## 💰 Cost Optimization (FEP Strategy)

### Free Entry Point (FEP)
- **New User Signups**: FREE (within 72hr window)
- **Existing User Logins**: ~$0.005 per conversation
- **Strategy**: Use Click-to-WhatsApp ads to trigger FEP

### How FEP Works
1. User clicks WhatsApp ad/button → Opens 72hr free window
2. App sends OTP template → FREE (within window)
3. User verifies → Account created → FREE
4. Total cost for new signup: **$0.00**

### Cost Comparison
- **Without FEP**: $0.005 per authentication
- **With FEP**: $0.00 for new users
- **Savings**: 100% for signups

## 🔒 Security Features

### Implemented
- ✅ Rate limiting (3 OTP requests/hour)
- ✅ Attempt limiting (5 verification attempts)
- ✅ OTP expiration (5 minutes)
- ✅ Secure OTP generation
- ✅ Server-side validation

### Production Recommendations
- Use Redis for OTP storage (currently in-memory)
- Add phone number validation
- Implement fraud detection
- Add CAPTCHA for high-risk requests
- Monitor for abuse patterns

## 📱 Testing

### Test Mode (Meta Sandbox)
1. Add test phone numbers in WhatsApp Manager
2. Use test numbers for development
3. No charges in test mode

### Production Testing
1. Start with small user group
2. Monitor costs in Meta Business Suite
3. Track FEP conversion rates
4. Optimize template approval rates

## 🔧 Troubleshooting

### Template Not Approved
- Ensure template follows Meta guidelines
- Use clear, concise language
- Include expiration time
- Don't use promotional language

### OTP Not Received
- Check phone number format (+country code)
- Verify template is approved
- Check webhook is receiving events
- Verify access token is valid

### High Costs
- Ensure FEP is properly implemented
- Check if users are within 72hr window
- Verify Click-to-WhatsApp ads are active
- Monitor conversation categories

## 📊 Monitoring

### Key Metrics
- OTP delivery rate
- Verification success rate
- FEP conversion rate
- Cost per authentication
- Average response time

### Meta Business Suite
- View message analytics
- Track conversation costs
- Monitor template performance
- Check webhook health

## 🎯 Next Steps

1. **Immediate**: Set up Meta Business Account
2. **Day 1**: Create and approve template
3. **Day 2**: Configure environment variables
4. **Day 3**: Set up webhook
5. **Day 4**: Test with sandbox numbers
6. **Day 5**: Launch to production

## 📚 Resources

- [Meta Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Authentication Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/authentication-templates)
- [Webhook Setup](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

## ⚠️ Important Notes

- Template approval required before production use
- Test thoroughly in sandbox mode
- Monitor costs closely in first week
- Keep access tokens secure
- Rotate tokens regularly
- Backup OTP data (use Redis in production)

---

**Estimated Setup Time**: 2-3 hours  
**Cost**: FREE for new user signups with FEP  
**Difficulty**: Medium
