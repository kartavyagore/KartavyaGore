# Quick Installation Guide

Follow these steps to get your portfolio running with WebAuthn passkey authentication.

## Prerequisites

- Node.js 18+ installed
- MySQL database running
- Git installed

## Installation Steps

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd portfolio

# Install dependencies
npm install

# Install WebAuthn dependencies
npm install @simplewebauthn/server @simplewebauthn/browser jsonwebtoken @types/jsonwebtoken
```

**Or use the automated setup script:**

Windows:
```powershell
.\setup-webauthn.ps1
```

Linux/Mac:
```bash
chmod +x setup-webauthn.sh
./setup-webauthn.sh
```

### Step 2: Configure Environment

Create `.env.local` file:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Password Fallback
BLOG_ADMIN_SECRET=your-secure-password-here

# WebAuthn Passkeys
JWT_SECRET=<generate-with-command-below>
RP_ID=localhost
RP_NAME=Portfolio Admin
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

Generate JWT_SECRET:
```bash
# Linux/Mac:
openssl rand -base64 32

# Windows:
powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))"
```

### Step 3: Initialize Database

```bash
mysql -u your_user -p your_database < lib/db-init.sql
```

This creates:
- `blogs` table (existing)
- `passkey_credentials` table (for passkeys)
- `webauthn_challenges` table (for auth challenges)

### Step 4: Run

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Visit: http://localhost:3000

### Step 5: Register Your First Passkey

1. Go to http://localhost:3000/blogs
2. Click "Add a blog"
3. Click "Login with Passkey"
4. Enter device name (e.g., "My Laptop")
5. Complete biometric authentication
6. ✅ Done! You're logged in

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables (update RP_ID to your domain)
4. Deploy

### Railway

1. `railway init`
2. Set environment variables
3. `railway up`

**Important for production:**
- Change `RP_ID` to your domain (e.g., `yourdomain.com`)
- Change `NEXT_PUBLIC_ORIGIN` to `https://yourdomain.com`
- Generate new `JWT_SECRET`
- Ensure HTTPS is enabled

## Troubleshooting

**"Browser doesn't support passkeys"**
→ Use Chrome 67+, Firefox 60+, Safari 13+, or Edge 18+

**"No passkeys registered"**
→ Register a passkey first (Step 5 above)

**"Invalid or expired challenge"**
→ Try logging in again (challenges expire after 5 minutes)

## Need Help?

See detailed documentation:
- [WEBAUTHN_SETUP.md](WEBAUTHN_SETUP.md) - Complete passkey setup guide
- [README.md](README.md) - Project overview
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment guide

## What's Next?

After installation:
1. ✅ Customize your portfolio content
2. ✅ Add your projects
3. ✅ Write blogs
4. ✅ Register passkeys on all your devices
5. ✅ Deploy to production

Enjoy your secure, modern portfolio! 🎉
