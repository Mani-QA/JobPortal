-- Initial database schema for Job Portal
-- Migration: 0001_initial_schema

-- Users table (base authentication)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employer', 'seeker')),
    is_active INTEGER DEFAULT 1,
    email_verified INTEGER DEFAULT 0,
    gdpr_consent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Employer profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    industry TEXT NOT NULL,
    company_size TEXT,
    founded_year INTEGER,
    contact_details TEXT NOT NULL DEFAULT '{}',
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_employer_user ON employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_industry ON employer_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_employer_verified ON employer_profiles(verified);

-- Job seeker profiles table
CREATE TABLE IF NOT EXISTS seeker_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    resume_url TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    work_history TEXT DEFAULT '[]',
    education TEXT DEFAULT '[]',
    skills TEXT DEFAULT '[]',
    preferences TEXT DEFAULT '{}',
    profile_complete INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_seeker_user ON seeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seeker_location ON seeker_profiles(location);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    employer_id TEXT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('remote', 'hybrid', 'onsite')),
    location TEXT,
    salary_range TEXT NOT NULL DEFAULT '{}',
    responsibilities TEXT DEFAULT '[]',
    requirements TEXT DEFAULT '[]',
    nice_to_haves TEXT DEFAULT '[]',
    skills TEXT DEFAULT '[]',
    experience_level TEXT NOT NULL,
    job_type TEXT NOT NULL,
    deadline TEXT NOT NULL,
    apply_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location_type ON jobs(location_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    seeker_id TEXT NOT NULL REFERENCES seeker_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn')),
    cover_letter TEXT,
    resume_url TEXT,
    applied_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(job_id, seeker_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_seeker ON applications(seeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(applied_at DESC);

-- Saved jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id TEXT PRIMARY KEY,
    seeker_id TEXT NOT NULL REFERENCES seeker_profiles(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TEXT DEFAULT (datetime('now')),
    UNIQUE(seeker_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_seeker ON saved_jobs(seeker_id);
CREATE INDEX IF NOT EXISTS idx_saved_job ON saved_jobs(job_id);

-- Job alerts table
CREATE TABLE IF NOT EXISTS job_alerts (
    id TEXT PRIMARY KEY,
    seeker_id TEXT NOT NULL REFERENCES seeker_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    keywords TEXT DEFAULT '[]',
    locations TEXT DEFAULT '[]',
    location_type TEXT DEFAULT '[]',
    job_types TEXT DEFAULT '[]',
    min_salary INTEGER,
    salary_currency TEXT,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
    is_active INTEGER DEFAULT 1,
    last_sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_seeker ON job_alerts(seeker_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON job_alerts(is_active);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('employer', 'seeker')),
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_application ON messages(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Admin action logs
CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_date ON admin_logs(created_at DESC);
