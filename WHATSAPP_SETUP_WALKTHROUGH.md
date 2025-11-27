# WhatsApp OTP Setup - Step-by-Step Walkthrough

## 🎯 Goal
Set up WhatsApp Business API with Meta Cloud API to enable FREE OTP authentication for new user signups.

## ⏱️ Estimated Time: 30-45 minutes

---

## Step 1: Create Meta Business Account (5 minutes)

### 1.1 Go to Meta Business Suite
1. Open browser and go to: https://business.facebook.com
2. Click **"Create Account"**
3. Enter your business details:
   - Business Name: `Medicure` (or your company name)
   - Your Name: [Your name]
   - Business Email: [Your email]
4. Click **"Next"**
5. Add business details:
   - Address (can be home address for testing)
   - Phone number
   - Website (optional)
6. Click **"Submit"**

### 1.2 Verify Your Business
1. Check your email for verification link
2. Click the verification link
3. Complete any additional verification steps

✅ **Checkpoint**: You should now see the Meta Business Suite dashboard

---

## Step 2: Create Facebook App (10 minutes)

### 2.1 Go to Meta for Developers
1. Open: https://developers.facebook.com
2. Click **"My Apps"** (top right)
3. Click **"Create App"**

### 2.2 Choose App Type
1. Select **"Business"**
2. Click **"Next"**

### 2.3 App Details
1. App Name: `Medicure WhatsApp`
2. App Contact Email: [Your email]
3. Business Account: Select your business (created in Step 1)
4. Click **"Create App"**

### 2.4 Add WhatsApp Product
1. In the app dashboard, scroll to **"Add Products"**
2. Find **"WhatsApp"**
3. Click **"Set Up"**

✅ **Checkpoint**: You should see WhatsApp in your app's products list

---

## Step 3: Get API Credentials (5 minutes)

### 3.1 Get Phone Number ID
1. In WhatsApp settings, go to **"API Setup"**
2. You'll see a test phone number provided by Meta
3. Copy the **Phone Number ID** (looks like: `123456789012345`)
4. Save this - you'll need it for environment variables

### 3.2 Get Access Token
1. In the same page, find **"Temporary Access Token"**
2. Click **"Copy"**
3. Save this token temporarily

### 3.3 Generate Permanent Token (Important!)
1. Go to **"System Users"** in Business Settings
2. Click **"Add"** to create a system user
3. Name: `Medicure WhatsApp Service`
4. Role: **Admin**
5. Click **"Create System User"**
6. Click **"Generate New Token"**
7. Select your app: `Medicure WhatsApp`
8. Permissions needed:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
9. Click **"Generate Token"**
10. **IMPORTANT**: Copy and save this token securely - you won't see it again!

✅ **Checkpoint**: You have Phone Number ID and Permanent Access Token

---

## Step 4: Create Authentication Template (10 minutes)

### 4.1 Go to Message Templates
1. In WhatsApp Manager, click **"Message Templates"**
2. Click **"Create Template"**

### 4.2 Template Details
1. **Category**: Select **"Authentication"**
2. **Name**: `otp_verification` (must match exactly!)
3. **Languages**: Select **"English"**
4. Click **"Continue"**

### 4.3 Template Content
1. **Header**: Leave empty (optional)
2. **Body**: Enter this EXACT text:
   ```
   Your Medicure verification code is {{1}}. Valid for 5 minutes. Do not share this code with anyone.
   ```
3. **Footer**: (Optional) `Medicure Healthcare`
4. **Buttons**: Click **"Add Button"**
   - Type: **"Copy Code"**
   - Button text: `Copy Code`
   - Example: `123456`

### 4.4 Submit Template
1. Review your template
2. Click **"Submit"**
3. Wait for approval (usually 5-30 minutes)

✅ **Checkpoint**: Template submitted and pending approval

---

## Step 5: Configure Backend (5 minutes)

### 5.1 Create Environment File
1. In your backend folder, create `.env` file:
   ```bash
   cd backend
   touch .env
   ```

2. Add these variables (replace with your actual values):
   ```bash
   # WhatsApp Cloud API Configuration
   WHATSAPP_PHONE_ID=your_phone_number_id_from_step_3
   WHATSAPP_ACCESS_TOKEN=your_permanent_token_from_step_3
   WHATSAPP_TEMPLATE_NAME=otp_verification
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=medicure_webhook_token_2025
   
   # Existing variables (keep these)
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

### 5.2 Restart Backend
```bash
# Stop current backend (Ctrl+C)
# Start with new environment variables
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Checkpoint**: Backend configured with WhatsApp credentials

---

## Step 6: Set Up Webhook (5 minutes)

### 6.1 Expose Your Backend (Development)
For testing, you need a public URL. Options:

**Option A: ngrok (Recommended for testing)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 8000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Option B: Production Server**
Use your actual domain (e.g., `https://api.medicure.com`)

### 6.2 Configure Webhook in Meta
1. Go to WhatsApp → **Configuration**
2. Click **"Edit"** next to Webhook
3. **Callback URL**: `https://your-url.com/whatsapp/webhook`
4. **Verify Token**: `medicure_webhook_token_2025`
5. Click **"Verify and Save"**

### 6.3 Subscribe to Webhooks
1. In the same page, find **"Webhook Fields"**
2. Subscribe to:
   - ✅ `messages`
3. Click **"Save"**

✅ **Checkpoint**: Webhook configured and verified

---

## Step 7: Test WhatsApp OTP (5 minutes)

### 7.1 Add Test Phone Number
1. Go to WhatsApp → **"API Setup"**
2. Find **"To"** field
3. Click **"Manage phone number list"**
4. Add your phone number (with country code, e.g., +1234567890)
5. You'll receive a verification code on WhatsApp
6. Enter the code to verify

### 7.2 Test from App
1. Open your Medicure app
2. Go to Signup screen
3. Click **"WhatsApp"** button
4. Enter your test phone number (with country code)
5. Click **"Send OTP"**
6. Check your WhatsApp for the OTP message
7. Enter the OTP in the app
8. Click **"Verify"**

### 7.3 Check Backend Logs
```bash
# You should see:
✓ OTP sent to +1234567890: 123456 (Cost: FREE (FEP))
```

✅ **Checkpoint**: OTP received and verified successfully!

---

## Step 8: Production Checklist

### Before Going Live:
- [ ] Template approved by Meta
- [ ] Permanent access token generated
- [ ] Webhook on production server (HTTPS)
- [ ] Environment variables in production
- [ ] Test with multiple phone numbers
- [ ] Monitor costs in Meta Business Suite
- [ ] Set up Redis for OTP storage (replace in-memory)
- [ ] Add phone number validation
- [ ] Implement fraud detection
- [ ] Set up monitoring and alerts

---

## 🎉 Success Criteria

You've successfully set up WhatsApp OTP when:
1. ✅ Template is approved
2. ✅ Test OTP received on WhatsApp
3. ✅ OTP verification works in app
4. ✅ User can sign up/login
5. ✅ Backend logs show "FREE (FEP)"

---

## 🐛 Troubleshooting

### Template Not Approved
**Problem**: Template rejected or pending too long
**Solution**:
- Ensure exact format: "Your Medicure verification code is {{1}}. Valid for 5 minutes."
- Don't use promotional language
- Include security warning
- Resubmit if rejected

### OTP Not Received
**Problem**: No WhatsApp message received
**Solution**:
1. Check phone number format (+country code)
2. Verify template is approved
3. Check backend logs for errors
4. Verify access token is valid
5. Check webhook is receiving events

### "Invalid Access Token" Error
**Problem**: Backend returns 401 error
**Solution**:
1. Regenerate permanent token
2. Update .env file
3. Restart backend
4. Test again

### Webhook Verification Failed
**Problem**: Meta can't verify webhook
**Solution**:
1. Ensure URL is HTTPS (not HTTP)
2. Check verify token matches exactly
3. Ensure backend is running and accessible
4. Check firewall/security settings

### High Costs
**Problem**: Being charged for OTP messages
**Solution**:
1. Ensure FEP is properly implemented
2. Check if users are within 72hr window
3. Verify Click-to-WhatsApp ads are active
4. Monitor conversation categories in Meta Business Suite

---

## 📊 Monitoring

### Check Costs
1. Go to Meta Business Suite
2. Click **"Billing"**
3. View WhatsApp conversation charges
4. Monitor daily/monthly costs

### Check Analytics
1. Go to WhatsApp Manager
2. Click **"Analytics"**
3. View:
   - Messages sent
   - Delivery rate
   - Template performance
   - Conversation categories

---

## 🎯 Next Steps After Setup

1. **Test Thoroughly**
   - Test with multiple phone numbers
   - Test both signup and login flows
   - Verify FEP is working (check costs)

2. **Monitor First Week**
   - Watch for any errors
   - Monitor costs daily
   - Check delivery rates
   - Gather user feedback

3. **Optimize**
   - Improve template if needed
   - Add more security features
   - Implement Redis for production
   - Set up proper monitoring

4. **Scale**
   - Add more phone numbers if needed
   - Increase rate limits if necessary
   - Implement caching
   - Add analytics

---

## 📞 Support Resources

- **Meta for Developers**: https://developers.facebook.com/support
- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp
- **Community Forum**: https://developers.facebook.com/community
- **Status Page**: https://developers.facebook.com/status

---

## ✅ Completion Checklist

- [ ] Meta Business Account created
- [ ] Facebook App created
- [ ] WhatsApp product added
- [ ] Phone Number ID obtained
- [ ] Permanent Access Token generated
- [ ] Authentication template created and approved
- [ ] Backend environment variables configured
- [ ] Webhook set up and verified
- [ ] Test phone number added
- [ ] OTP successfully sent and received
- [ ] User can sign up/login with WhatsApp
- [ ] Costs monitored (should be FREE for new users)

---

**Congratulations! 🎉**

Your WhatsApp OTP is now fully functional with FREE signups via FEP!

**Estimated Monthly Cost**: $0-$5 (depending on login volume)
**Setup Time**: 30-45 minutes
**Status**: Production Ready

---

**Need Help?**
- Check WHATSAPP_SETUP_GUIDE.md for detailed API documentation
- Review IMPLEMENTATION_SUMMARY.md for feature overview
- Check backend logs for debugging
- Test in sandbox mode first before production
