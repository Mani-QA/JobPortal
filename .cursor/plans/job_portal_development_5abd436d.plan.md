---
name: Job Portal Development
overview: Build a full-stack job portal using ReactJS frontend with Hono/Cloudflare Workers backend, D1 database, and R2 storage. The portal will support employers, job seekers, and administrators with comprehensive features, edge caching, and modern authentication.
todos:
  - id: setup-monorepo
    content: Initialize monorepo with Turborepo, configure workspaces and shared dependencies
    status: completed
  - id: setup-shared-types
    content: Create shared package with TypeScript types and Zod validation schemas
    status: completed
  - id: setup-api-base
    content: Set up Hono API with Wrangler, D1 bindings, and R2 configuration
    status: completed
  - id: create-db-schema
    content: Create D1 database migrations for all tables (users, profiles, jobs, applications)
    status: completed
  - id: implement-auth
    content: Build JWT authentication with refresh tokens and OAuth hooks
    status: completed
  - id: implement-api-routes
    content: Implement all API routes (auth, jobs, employers, seekers, admin, upload)
    status: completed
  - id: implement-cache-middleware
    content: Create edge caching middleware with stale-while-revalidate strategy
    status: completed
  - id: setup-frontend
    content: Initialize React + Vite frontend with TailwindCSS and custom theme
    status: completed
  - id: build-ui-components
    content: Create reusable UI component library with animations
    status: completed
  - id: build-public-pages
    content: Build public pages (home, job listings, job detail, auth pages)
    status: completed
  - id: build-seeker-dashboard
    content: Build job seeker dashboard with profile, applications, alerts
    status: completed
  - id: build-employer-dashboard
    content: Build employer dashboard with job posting, ATS, messaging
    status: completed
  - id: build-admin-panel
    content: Build admin panel with analytics, user management, moderation
    status: completed
  - id: integrate-r2-uploads
    content: Implement presigned URL file uploads for resumes and logos
    status: completed
  - id: add-email-hooks
    content: Prepare email notification hooks for future integration
    status: completed
  - id: testing-polish
    content: Add responsive polish, accessibility checks, and final testing
    status: completed
---

# Job Portal -

Full Stack Development Plan

## Architecture Overview

```mermaid
flowchart TB
    subgraph frontend [React Frontend]
        EmployerUI[Employer Dashboard]
        SeekerUI[Job Seeker Dashboard]
        AdminUI[Admin Panel]
        PublicUI[Public Job Listings]
    end

    subgraph edge [Cloudflare Edge]
        Workers[Hono Workers API]
        Cache[Edge Cache]
        R2[R2 Storage]
        D1[D1 Database]
    end

    subgraph auth [Authentication]
        JWT[JWT Auth]
        OAuth[OAuth Providers]
    end

    frontend --> Cache
    Cache --> Workers
    Workers --> D1
    Workers --> R2
    Workers --> auth
```



## Project Structure (Monorepo)

```javascript
JobPortal/
├── packages/
│   ├── frontend/          # React + Vite app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   └── package.json
│   ├── api/               # Hono + Cloudflare Workers
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── schema/        # D1 migrations
│   │   └── wrangler.toml
│   └── shared/            # Shared types & validation
│       └── src/
├── package.json           # Workspace root
└── turbo.json             # Turborepo config
```



## Tech Stack Details

| Layer | Technology ||-------|------------|| Frontend | React 18, Vite, TailwindCSS, Zustand, React Query || Backend | Hono, Cloudflare Workers || Database | Cloudflare D1 (SQLite) || Storage | Cloudflare R2 (resumes, logos) || Auth | Custom JWT + OAuth (Google, LinkedIn) || Caching | Cloudflare Cache API, stale-while-revalidate || Validation | Zod (shared schemas) |

## Database Schema

```mermaid
erDiagram
    users ||--o{ employer_profiles : has
    users ||--o{ seeker_profiles : has
    employer_profiles ||--o{ jobs : posts
    seeker_profiles ||--o{ applications : submits
    jobs ||--o{ applications : receives
    seeker_profiles ||--o{ job_alerts : configures
    seeker_profiles ||--o{ saved_jobs : saves

    users {
        string id PK
        string email UK
        string password_hash
        string role
        boolean is_active
        datetime created_at
    }

    employer_profiles {
        string id PK
        string user_id FK
        string company_name
        text description
        string logo_url
        string industry
        json contact_details
        boolean verified
    }

    seeker_profiles {
        string id PK
        string user_id FK
        string full_name
        text bio
        string resume_url
        json work_history
        json education
        json skills
        json preferences
    }

    jobs {
        string id PK
        string employer_id FK
        string title
        text description
        string location_type
        string location
        json salary_range
        json responsibilities
        json requirements
        json nice_to_haves
        json skills
        datetime deadline
        string apply_url
        string status
        datetime created_at
    }

    applications {
        string id PK
        string job_id FK
        string seeker_id FK
        string status
        text cover_letter
        datetime applied_at
    }
```



## Implementation Details

### 1. Authentication System

- **JWT-based auth** with httpOnly cookies and refresh tokens
- **OAuth integration** hooks for Google and LinkedIn
- **Password hashing** using Web Crypto API (Cloudflare Workers compatible)
- **GDPR compliance**: Consent tracking, data export, account deletion endpoints

### 2. Edge Caching Strategy

```mermaid
flowchart LR
    Request[Client Request] --> CacheCheck{Cache Hit?}
    CacheCheck -->|Yes| ServeCache[Serve Cached Response]
    CacheCheck -->|No| Worker[Worker Processes]
    Worker --> D1Query[D1 Query]
    D1Query --> CacheStore[Store in Cache]
    CacheStore --> Response[Return Response]
    ServeCache --> Response
```



- **Public job listings**: Cache for 5 minutes with stale-while-revalidate
- **Job details**: Cache for 1 minute
- **Static assets**: Cache for 1 year with immutable
- **User data**: No caching (always fresh)

### 3. File Upload Flow (R2)

- Generate presigned URLs from Workers for direct client uploads
- Validate file types (PDF, DOC, DOCX) and size (max 5MB)
- Store with structured keys: `resumes/{user_id}/{filename}` and `logos/{employer_id}/{filename}`

### 4. API Routes Structure

| Route Group | Endpoints ||-------------|-----------|| `/api/auth` | login, register, logout, refresh, oauth-callback, forgot-password || `/api/jobs` | CRUD operations, search with filters, bulk actions || `/api/employers` | profile, dashboard, applicants, analytics || `/api/seekers` | profile, applications, saved-jobs, alerts || `/api/admin` | users, jobs, applications, analytics, settings || `/api/upload` | presigned-url, confirm-upload |

### 5. Frontend Pages

**Public**

- Home with featured jobs and search
- Job listings with filters
- Job detail page
- Login/Register

**Job Seeker**

- Dashboard with application stats
- Profile editor with resume upload
- Application tracker
- Job alerts management
- Saved jobs

**Employer**

- Dashboard with job stats
- Job posting form (rich editor)
- Applicant tracking system
- Candidate messaging interface
- Company profile editor

**Admin**

- Overview dashboard with analytics
- User management (employers/seekers)
- Job moderation tools
- System settings
- Content moderation queue

### 6. UI/UX Design Approach

- **Design System**: Custom TailwindCSS configuration with Framer Motion animations
- **Typography**: Outfit (headings) + Source Sans 3 (body) - professional yet modern
- **Color Palette**: Deep navy primary (#0f172a), teal accent (#14b8a6), warm neutral backgrounds
- **Components**: Custom-built with accessibility (ARIA) compliance
- **Responsive**: Mobile-first with breakpoints at sm, md, lg, xl

### 7. Security Measures

- Input validation with Zod on both client and server
- CORS configuration for allowed origins
- Rate limiting on auth endpoints
- SQL injection prevention via D1 parameterized queries
- XSS prevention with proper escaping
- CSRF protection via SameSite cookies
- Data encryption at rest (D1/R2 default) and in transit (HTTPS)

## Files to Create

### Core Configuration

- [`package.json`](package.json) - Workspace root with Turborepo
- [`turbo.json`](turbo.json) - Build pipeline configuration
- [`packages/shared/src/types.ts`](packages/shared/src/types.ts) - Shared TypeScript types
- [`packages/shared/src/schemas.ts`](packages/shared/src/schemas.ts) - Zod validation schemas

### Backend (API)

- [`packages/api/wrangler.toml`](packages/api/wrangler.toml) - Cloudflare config
- [`packages/api/src/index.ts`](packages/api/src/index.ts) - Hono app entry
- [`packages/api/src/middleware/auth.ts`](packages/api/src/middleware/auth.ts) - Auth middleware
- [`packages/api/src/middleware/cache.ts`](packages/api/src/middleware/cache.ts) - Cache middleware
- [`packages/api/src/routes/*.ts`](packages/api/src/routes/) - Route handlers
- [`packages/api/schema/migrations/`](packages/api/schema/migrations/) - D1 migrations

### Frontend

- [`packages/frontend/src/App.tsx`](packages/frontend/src/App.tsx) - Root component with routing
- [`packages/frontend/src/stores/`](packages/frontend/src/stores/) - Zustand stores
- [`packages/frontend/src/pages/`](packages/frontend/src/pages/) - Page components
- [`packages/frontend/src/components/`](packages/frontend/src/components/) - Reusable components
- [`packages/frontend/tailwind.config.js`](packages/frontend/tailwind.config.js) - Custom theme