# Portfolio Website

A modern full-stack portfolio website built with Next.js 16, featuring a blog system, project showcase, and **WebAuthn passkey authentication** (fingerprint/Face ID login).

## 🚀 Tech Stack

- **Framework:** Next.js 16.2.1 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** MySQL (TiDB Cloud)
- **Authentication:** WebAuthn (Passkeys) + JWT
- **Deployment:** Vercel (recommended)

## 📋 Features

- ✅ Responsive portfolio homepage
- ✅ Dynamic project showcase
- ✅ Full-featured blog system with CRUD operations
- ✅ **🔐 WebAuthn passkey authentication** (fingerprint, Face ID, Windows Hello)
- ✅ **Multi-device support** (register laptop, phone, security key)
- ✅ **Password fallback** for compatibility
- ✅ Form validation with toast notifications
- ✅ SEO optimized with metadata and sitemap
- ✅ Dark mode design with glassmorphism effects

## 🔐 Authentication Features (NEW!)

This portfolio now includes modern **WebAuthn passkey authentication**:

- 🚀 **One-touch login** - Use fingerprint or Face ID instead of passwords
- 📱 **Multi-device** - Register multiple devices (laptop + phone + security key)
- 🔒 **More secure** - Private keys never leave your device
- ⚡ **Faster** - No need to type passwords
- 🎯 **Password fallback** - Traditional password still works

### How to Login with Passkey

1. Navigate to `/blogs`
2. Click "Add a blog"
3. Click "Login with Passkey"
4. Touch your fingerprint or use Face ID
5. ✅ Logged in instantly!

**See [WEBAUTHN_SETUP.md](WEBAUTHN_SETUP.md) for detailed setup instructions.**

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

**For WebAuthn passkey authentication, also install:**
```bash
npm install @simplewebauthn/server @simplewebauthn/browser jsonwebtoken @types/jsonwebtoken
```

Or use the automated setup script:
```bash
# On Windows:
.\setup-webauthn.ps1

# On Linux/Mac:
chmod +x setup-webauthn.sh
./setup-webauthn.sh
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database (Required)
DATABASE_URL=mysql://user:password@host:port/database

# Password Authentication (Fallback)
BLOG_ADMIN_SECRET=your-secure-password-here

# WebAuthn Passkey Authentication (Required for passkey login)
JWT_SECRET=your-very-secure-random-jwt-secret-at-least-32-characters-long
RP_ID=localhost
RP_NAME=Portfolio Admin
NEXT_PUBLIC_ORIGIN=http://localhost:3000

```

**Generate a secure JWT_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Initialize database

Run the database schema to create tables (including passkey tables):

```bash
mysql -u your_user -p your_database < lib/db-init.sql
```

### 5. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables Required:
- `DATABASE_URL` - Your MySQL database connection string
- `BLOG_ADMIN_SECRET` - Password for blog admin access
- `JWT_SECRET` - JWT signing secret for auth cookies
- `RP_ID`, `RP_NAME`, `NEXT_PUBLIC_ORIGIN` - WebAuthn/passkey config
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` - Blog image upload storage

### Login Rate Limiting

Authentication endpoints are rate-limited server-side by client IP:
- `POST /api/auth/password-login`
- `POST /api/auth/login/challenge`
- `POST /api/auth/login/verify`
- `POST /api/uploads/blog-image`

When limit is exceeded, API returns `429` with `Retry-After` header.

Optional tuning env vars:
```env
AUTH_PASSWORD_RATE_LIMIT_MAX=5
AUTH_PASSWORD_RATE_LIMIT_WINDOW_MS=300000
AUTH_PASSKEY_CHALLENGE_RATE_LIMIT_MAX=10
AUTH_PASSKEY_CHALLENGE_RATE_LIMIT_WINDOW_MS=300000
AUTH_PASSKEY_VERIFY_RATE_LIMIT_MAX=10
AUTH_PASSKEY_VERIFY_RATE_LIMIT_WINDOW_MS=300000
IMAGE_UPLOAD_RATE_LIMIT_MAX=10
IMAGE_UPLOAD_RATE_LIMIT_WINDOW_MS=300000
```

### Supabase Blog Image Upload Setup

This project supports direct image upload from the blog form to Supabase Storage.

1. Create a storage bucket in Supabase (recommended name: `blog-images`)
2. Mark the bucket as public (or provide your own signed URL flow)
3. Add these environment variables:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=blog-images
```

Then in `/blogs` admin form:
- Select an image file
- Click `Upload Image`
- The returned public URL is auto-filled and saved as `image_url` in the database

### Update URLs in Production:
After deployment, update these files with your domain:
- `app/robots.ts` - Update sitemap URL
- `app/sitemap.ts` - Update baseUrl

## 📁 Project Structure

```
portfolio/
├── app/                  # Next.js App Router
│   ├── about/           # About page
│   ├── api/             # API routes
│   ├── blogs/           # Blog pages
│   ├── contact/         # Contact page
│   ├── projects/        # Projects page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   ├── robots.ts        # SEO robots.txt
│   └── sitemap.ts       # SEO sitemap
├── components/          # React components
│   └── ui/              # UI components
├── lib/                 # Utility functions
│   ├── blogs.ts         # Blog types
│   ├── blogs-db.ts      # Blog database operations
│   └── db.ts            # Database connection
├── public/              # Static assets
└── .env.example         # Environment template
```

## 🔐 Security Notes

- Never commit `.env` files to git
- Use strong passwords for `BLOG_ADMIN_SECRET`
- Database credentials are stored securely in environment variables
- Admin password is verified server-side for all blog operations

## 📝 Admin Access

To manage blogs:
1. Navigate to `/blogs`
2. Click "Add a blog"
3. Enter your admin password (from `BLOG_ADMIN_SECRET`)
4. Create, edit, or delete blogs

## 🎨 Customization

- Update personal information in page components
- Modify colors in `globals.css` and Tailwind config
- Add/remove projects in `app/projects/page.tsx`
- Customize metadata in `app/layout.tsx`

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Kartavya Gore**

---

Built with ❤️ using Next.js
