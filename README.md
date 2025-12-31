# JobPortal

<div align="center">
  <img src="packages/frontend/public/favicon.svg" alt="JobPortal Logo" width="120" height="120" />
  
  <h3>🚀 A Modern, Full-Stack Job Portal Platform</h3>
  
  <p>
    <a href="https://job-portal.www5.workers.dev/">Live Demo</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#getting-started">Getting Started</a>
  </p>
</div>

---

## 📖 Overview

JobPortal is a modern, full-stack job portal application built for speed and scalability. It enables job seekers to discover opportunities and employers to find top talent, all through an intuitive, beautiful interface.

### ✨ Key Highlights

- **Blazing Fast** - Deployed on Cloudflare's edge network for sub-100ms response times globally
- **Type-Safe** - End-to-end TypeScript with shared schemas between frontend and backend
- **Modern Stack** - Built with the latest technologies and best practices
- **SEO Optimized** - Dynamic meta tags, structured data, and Open Graph support for every page
- **Accessible** - WCAG 2.1 compliant with keyboard navigation and screen reader support

---

## 🎯 Features

### For Job Seekers
| Feature | Description |
|---------|-------------|
| 🔍 **Smart Job Search** | Search by keywords, location, job type, industry, and experience level |
| 📄 **Profile Builder** | Create a comprehensive profile with work history, education, and skills |
| 💼 **One-Click Apply** | Apply to jobs instantly with your saved profile |
| 🔔 **Job Alerts** | Get notified when new jobs match your preferences |
| 💾 **Saved Jobs** | Bookmark interesting positions for later review |
| 📊 **Application Tracking** | Monitor the status of all your applications |
| 🏢 **Browse Companies** | Explore company profiles and discover employers hiring in your field |

### For Employers
| Feature | Description |
|---------|-------------|
| 📝 **Job Posting** | Create detailed job listings with rich descriptions |
| 👥 **Applicant Management** | Review, filter, and manage all applicants in one place |
| 🏢 **Company Profile** | Showcase your company culture and values |
| 📈 **Analytics Dashboard** | Track job views, applications, and hiring metrics |
| ✅ **Verified Badge** | Build trust with a verified company profile |
| 🎯 **Employer Landing Page** | Dedicated marketing page showcasing platform benefits for employers |

### For Administrators
| Feature | Description |
|---------|-------------|
| 🎛️ **Admin Dashboard** | Full control over users, jobs, and platform settings |
| 📊 **Platform Analytics** | Insights into platform usage and performance |
| 🔒 **User Management** | Manage user accounts and permissions |

### Public Pages
| Page | Description |
|------|-------------|
| 🏠 **Homepage** | Landing page with job search, featured jobs, and platform statistics |
| 💼 **Jobs** | Browse and search all available job listings with advanced filters |
| 👥 **Profiles/Find Talent** | Browse candidate profiles (for employers) |
| 🏢 **Companies** | Explore all companies hiring on the platform with search and industry filters |
| 🎯 **For Employers** | Marketing landing page showcasing employer features and benefits |

---

## 🛠️ Tech Stack

### Why These Technologies?

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Cloudflare Workers** | Backend Runtime | Edge-first deployment with global distribution, zero cold starts, and built-in DDoS protection |
| **Hono** | API Framework | Ultra-lightweight (12KB), fastest Web Standards-based framework, perfect for edge computing |
| **D1 Database** | Data Storage | SQLite at the edge with automatic replication, ACID transactions, and zero configuration |
| **R2 Storage** | File Storage | S3-compatible object storage with zero egress fees, perfect for resumes and company logos |
| **React** | Frontend Library | Industry-standard UI library with excellent ecosystem, hooks, and concurrent features |
| **TypeScript** | Language | Full type safety across the entire stack, reducing bugs and improving developer experience |
| **Zod** | Validation | Runtime validation with TypeScript inference, shared between frontend and backend |
| **Vite** | Build Tool | Lightning-fast HMR, optimized production builds, and excellent plugin ecosystem |
| **TanStack Query** | Data Fetching | Powerful server-state management with caching, background updates, and optimistic UI |
| **Tailwind CSS** | Styling | Utility-first CSS for rapid UI development with excellent performance |
| **Framer Motion** | Animations | Production-ready animations with a declarative API |
| **Zustand** | State Management | Minimal, flexible state management without boilerplate |
| **Turborepo** | Monorepo Tool | Efficient monorepo management with caching and parallel execution |

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Static Assets │    │   Hono API      │    │  D1 Database │ │
│  │   (React SPA)   │◄──►│   (Workers)     │◄──►│  (SQLite)    │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                     │                               │
│           │              ┌──────┴──────┐                        │
│           │              │  R2 Bucket  │                        │
│           │              │  (Files)    │                        │
│           │              └─────────────┘                        │
└───────────┼─────────────────────────────────────────────────────┘
            │
    ┌───────┴───────┐
    │    Browser    │
    │  (React App)  │
    └───────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Wrangler CLI (Cloudflare Workers CLI)
- A Cloudflare account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/job-portal.git
   cd job-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Cloudflare resources**
   ```bash
   # Create D1 database
   npx wrangler d1 create job-portal-db
   
   # Create R2 bucket
   npx wrangler r2 bucket create job-portal-storage
   ```

4. **Update configuration**
   
   Update `packages/api/wrangler.toml` and `packages/app/wrangler.toml` with your D1 database ID.

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:5173
   - API: http://localhost:8787

### Deployment

Deploy the unified application to Cloudflare:

```bash
npm run deploy
```

---

## 📱 User Guide

### For Job Seekers

1. **Create an Account**
   - Click "Get Started" or "Register" on the homepage
   - Select "Job Seeker" as your role
   - Fill in your details and verify your email

2. **Complete Your Profile**
   - Navigate to Dashboard → Profile
   - Add your work experience, education, and skills
   - Upload your resume (PDF format recommended)

3. **Search for Jobs**
   - Use the search bar on the homepage or Jobs page
   - Filter by location, job type, industry, and experience level
   - Save interesting jobs for later

4. **Explore Companies**
   - Navigate to "Companies" in the main navigation
   - Search companies by name or filter by industry
   - View company profiles to learn about culture and open positions
   - Click on a company to see all their job listings

5. **Apply for Jobs**
   - Click on a job to view details
   - Click "Apply Now" to submit your application
   - Optionally add a cover letter
   - Track your application status in Dashboard → Applications

6. **Set Up Job Alerts**
   - Go to Dashboard → Job Alerts
   - Create alerts based on your preferred criteria
   - Receive email notifications for new matching jobs

### For Employers

1. **Learn About the Platform**
   - Visit "For Employers" in the main navigation to learn about platform features
   - See statistics, testimonials, and how the hiring process works
   - Click "Start Hiring Today" to create an employer account

2. **Create an Employer Account**
   - Click "Register" and select "Employer"
   - Fill in your company details
   - Verify your business email

3. **Complete Company Profile**
   - Navigate to Dashboard → Company Profile
   - Add your company logo, description, and culture
   - Request verification for a trust badge
   - Your company will appear on the public Companies page

4. **Post a Job**
   - Go to Dashboard → Post Job
   - Fill in job details: title, description, requirements
   - Set salary range and location preferences
   - Publish or save as draft

5. **Manage Applications**
   - View all applications in Dashboard → Applicants
   - Filter by job, status, or date
   - Review candidate profiles and resumes
   - Update application status (Reviewing, Shortlisted, Interview, etc.)

6. **Browse Talent**
   - Navigate to "Find Talent" to browse candidate profiles
   - Filter by skills, experience, and location
   - View candidate details and contact information

7. **Track Performance**
   - Check your Dashboard for job views and applications
   - Monitor which jobs are performing best
   - Adjust job listings based on insights

---

## 📂 Project Structure

```
job-portal/
├── packages/
│   ├── api/              # Hono API (Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── middleware/ # Auth, rate limiting, etc.
│   │   │   └── lib/      # Utilities and helpers
│   │   └── schema/       # Database migrations
│   │
│   ├── frontend/         # React SPA (Vite)
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   │   ├── public/    # Public pages (Home, Jobs, Companies, For Employers, Profiles)
│   │   │   │   ├── auth/      # Authentication pages (Login, Register, Forgot Password)
│   │   │   │   ├── seeker/    # Job seeker dashboard pages
│   │   │   │   ├── employer/  # Employer dashboard pages
│   │   │   │   └── admin/     # Admin dashboard pages
│   │   │   ├── layouts/     # Page layouts (Public, Dashboard, Admin)
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── stores/      # Zustand stores
│   │   │   └── lib/         # Utilities
│   │   └── public/        # Static assets
│   │
│   ├── shared/           # Shared types and schemas
│   │   └── src/
│   │       ├── schemas.ts  # Zod validation schemas
│   │       └── types.ts    # TypeScript types
│   │
│   └── app/              # Unified worker deployment
│       └── src/
│           └── index.ts  # Combined API + static serving
│
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json
```

---

## 🔐 Security

- **Authentication**: JWT-based with secure HTTP-only refresh tokens
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Per-endpoint rate limiting to prevent abuse
- **Input Validation**: Zod schemas validate all API inputs
- **CORS**: Configured for production domains only
- **XSS Protection**: React's built-in escaping + Content Security Policy

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Cloudflare](https://cloudflare.com) for their amazing edge platform
- [Hono](https://hono.dev) for the elegant API framework
- [React](https://react.dev) team for the UI library
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- All open-source contributors whose libraries made this possible

---

<div align="center">
  <p>Built with ❤️ for the modern web</p>
  <p>
    <a href="https://job-portal.www5.workers.dev/">🌐 Live Demo</a>
  </p>
</div>

