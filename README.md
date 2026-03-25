# Portfolio Website

A modern full-stack portfolio website built with Next.js 16, featuring a blog system, project showcase, and admin authentication.

## 🚀 Tech Stack

- **Framework:** Next.js 16.2.1 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** MySQL (TiDB Cloud)
- **Deployment:** Vercel (recommended)

## 📋 Features

- ✅ Responsive portfolio homepage
- ✅ Dynamic project showcase
- ✅ Full-featured blog system with CRUD operations
- ✅ Admin authentication for blog management
- ✅ Form validation with toast notifications
- ✅ SEO optimized with metadata and sitemap
- ✅ Dark mode design with glassmorphism effects

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

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=mysql://user:password@host:port/database
BLOG_ADMIN_SECRET=your-secure-password-here
```

### 4. Run development server

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

