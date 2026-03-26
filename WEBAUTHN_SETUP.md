# WebAuthn Passkey Authentication - Setup Guide

## 🎯 What is WebAuthn Passkey Authentication?

WebAuthn allows you to log in using your device's biometric authentication (fingerprint, Face ID, Windows Hello) or security keys instead of passwords. It's more secure, faster, and more convenient!

---

## 📋 Prerequisites

- Node.js 18+ installed
- MySQL database running
- Modern browser (Chrome 67+, Firefox 60+, Safari 13+, Edge 18+)
- HTTPS connection (or localhost for development)

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
npm install @simplewebauthn/server @simplewebauthn/browser jsonwebtoken @types/jsonwebtoken
```

### Step 2: Set Up Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Database (Required)
DATABASE_URL=mysql://user:password@host:port/database

# Passkey Authentication (Required)
JWT_SECRET=your-very-secure-random-jwt-secret-at-least-32-characters-long
RP_ID=localhost
RP_NAME=Portfolio Admin
NEXT_PUBLIC_ORIGIN=http://localhost:3000

# Password Fallback (Optional but recommended)
BLOG_ADMIN_SECRET=your-secure-password-here
```

**⚠️ Important Notes:**
- `JWT_SECRET`: Generate a strong random string (at least 32 characters)
- `RP_ID`: Use `localhost` for development, your domain for production (e.g., `yourdomain.com`)
- `NEXT_PUBLIC_ORIGIN`: Use `http://localhost:3000` for dev, `https://yourdomain.com` for production
- `BLOG_ADMIN_SECRET`: Keep this as a fallback authentication method

**Generate a secure JWT_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 3: Initialize Database

Run the database schema file to create required tables:

```sql
-- Connect to your MySQL database and run:
source lib/db-init.sql;

-- Or manually:
mysql -u your_user -p your_database < lib/db-init.sql
```

This creates two tables:
- `passkey_credentials` - Stores registered passkeys
- `webauthn_challenges` - Temporary storage for authentication challenges

### Step 4: Build and Run

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Or run in production mode
npm run build && npm run start
```

---

## 🔐 How to Use

### First-Time Setup (Register Your First Passkey)

1. Navigate to `/blogs`
2. Click "Add a blog"
3. In the authentication modal, click "Login with Passkey"
4. Enter a device name (e.g., "My Laptop", "iPhone 15")
5. Your browser will prompt for biometric authentication
6. Touch your fingerprint sensor or use Face ID
7. ✅ Passkey registered! You're now logged in

### Subsequent Logins

1. Navigate to `/blogs`
2. Click "Add a blog"
3. Click "Login with Passkey"
4. Touch fingerprint/Face ID (no typing needed!)
5. ✅ Logged in instantly!

### Managing Passkeys

1. After logging in, click "Manage Passkeys"
2. View all registered devices
3. Register additional passkeys (laptop + phone + security key)
4. Delete passkeys you no longer use

### Password Fallback

If passkey authentication fails or isn't available:
1. Click "Use Password Instead"
2. Enter your `BLOG_ADMIN_SECRET` password
3. ✅ Logged in with password

---

## 🌐 Deployment Guide

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   DATABASE_URL=mysql://...
   JWT_SECRET=your-production-secret
   RP_ID=yourdomain.com
   RP_NAME=Portfolio Admin
   NEXT_PUBLIC_ORIGIN=https://yourdomain.com
   BLOG_ADMIN_SECRET=your-password
   ```
4. Deploy!

### Railway Deployment

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Set environment variables:
   ```bash
   railway variables set DATABASE_URL="mysql://..."
   railway variables set JWT_SECRET="your-production-secret"
   railway variables set RP_ID="yourdomain.com"
   railway variables set RP_NAME="Portfolio Admin"
   railway variables set NEXT_PUBLIC_ORIGIN="https://yourdomain.com"
   railway variables set BLOG_ADMIN_SECRET="your-password"
   ```
5. Deploy: `railway up`

**⚠️ Production Checklist:**
- [ ] Change `RP_ID` from `localhost` to your actual domain
- [ ] Change `NEXT_PUBLIC_ORIGIN` to use `https://`
- [ ] Generate a new, secure `JWT_SECRET`
- [ ] Ensure HTTPS is enabled (required for WebAuthn)
- [ ] Test passkey registration and login
- [ ] Test password fallback

---

## 🔧 Browser Compatibility

### Supported Browsers
- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 13+
- ✅ Edge 18+
- ✅ Opera 54+

### Unsupported Browsers
- ❌ Internet Explorer (all versions)
- ❌ Very old mobile browsers

**Fallback Behavior:**
The app automatically detects if WebAuthn is unsupported and shows:
1. A warning message
2. Automatic fallback to password authentication

---

## 🐛 Troubleshooting

### "Browser doesn't support passkeys"
**Solution:** Use a modern browser (Chrome, Firefox, Safari, Edge) or use password fallback.

### "No passkeys registered for this user"
**Solution:** Register a passkey first. Click "Add a blog" → "Login with Passkey" → Enter device name → Complete biometric auth.

### "Invalid or expired challenge"
**Solution:** The authentication challenge expired (5 minutes). Try logging in again.

### "Credential not found"
**Solution:** The passkey was deleted or not properly registered. Register a new passkey.

### "User cancelled passkey registration"
**Solution:** Complete the biometric prompt. On iOS, ensure Face ID/Touch ID is enabled in Settings.

### "This device is already registered"
**Solution:** Use a different device name or delete the existing passkey and register again.

### Passkey works on laptop but not phone
**Solution:** Register a separate passkey for each device. Each device needs its own registration.

### Authentication fails after deployment
**Solution:**
1. Verify `RP_ID` matches your domain (no `www.` prefix)
2. Verify `NEXT_PUBLIC_ORIGIN` uses `https://` in production
3. Ensure your site is served over HTTPS
4. Check browser console for error messages

---

## 🔒 Security Best Practices

1. **Use Strong JWT_SECRET**
   - At least 32 characters
   - Random, unguessable string
   - Different between dev and production

2. **HTTPS Required**
   - WebAuthn only works on HTTPS (except localhost)
   - Use Vercel/Railway for automatic HTTPS

3. **Keep Password Fallback**
   - Useful if device breaks or passkey is lost
   - Store `BLOG_ADMIN_SECRET` in password manager

4. **Regular Passkey Cleanup**
   - Delete passkeys for devices you no longer use
   - Review passkeys periodically

5. **Monitor Failed Attempts**
   - Check logs for suspicious auth failures
   - Consider adding rate limiting (future enhancement)

---

## 🎨 Features

### What Works Now
- ✅ Passkey registration (fingerprint, Face ID, Windows Hello)
- ✅ Passkey login (biometric authentication)
- ✅ Multi-device support (register laptop + phone + security key)
- ✅ Passkey management (view, delete devices)
- ✅ Password fallback authentication
- ✅ JWT session tokens (7-day expiry)
- ✅ Secure httpOnly cookies
- ✅ Browser compatibility detection
- ✅ Automatic session persistence
- ✅ Logout functionality

### Future Enhancements
- ⏳ Rate limiting on auth endpoints
- ⏳ Email notifications for new passkey registrations
- ⏳ Passkey renaming
- ⏳ Two-factor authentication
- ⏳ Account recovery options

---

## 📚 Technical Details

### How It Works

1. **Registration Flow:**
   ```
   User clicks "Register Passkey"
   ↓
   Server generates challenge (random string)
   ↓
   Browser prompts for biometric (fingerprint/Face ID)
   ↓
   Device creates cryptographic key pair (private key stays on device)
   ↓
   Public key sent to server and stored in database
   ↓
   JWT token generated and set in httpOnly cookie
   ```

2. **Login Flow:**
   ```
   User clicks "Login with Passkey"
   ↓
   Server sends challenge
   ↓
   Browser prompts for biometric
   ↓
   Device signs challenge with private key
   ↓
   Signature sent to server
   ↓
   Server verifies signature with stored public key
   ↓
   JWT token generated and set in httpOnly cookie
   ```

3. **Session Management:**
   - JWT tokens stored in httpOnly cookies (XSS protection)
   - 7-day expiry
   - Automatic renewal on activity
   - Cleared on logout

### Database Schema

**passkey_credentials:**
- `id` - Unique identifier
- `user_id` - User identifier (always "admin" for this portfolio)
- `credential_id` - WebAuthn credential ID (base64)
- `public_key` - Public key for verification (base64)
- `counter` - Replay attack prevention counter
- `transports` - How device communicates (USB, NFC, Bluetooth, internal)
- `device_name` - User-friendly device name
- `created_at` - Registration timestamp
- `last_used_at` - Last authentication timestamp

**webauthn_challenges:**
- `id` - Challenge identifier
- `challenge` - Random challenge string
- `user_id` - User identifier
- `type` - "registration" or "authentication"
- `created_at` - Creation timestamp
- `expires_at` - Expiry timestamp (5 minutes)

---

## 🤝 Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Ensure database tables exist
4. Try password fallback
5. Clear cookies and try again

---

## 📝 License

This implementation uses:
- **SimpleWebAuthn** (MIT License)
- **jsonwebtoken** (MIT License)

---

**Happy authenticating! 🎉**
