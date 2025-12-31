import type { Context } from 'hono';

// Cloudflare bindings
export interface Bindings {
  DB: D1Database;
  STORAGE: R2Bucket;
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  // Email configuration
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_PROVIDER?: 'sendgrid' | 'mailgun' | 'resend' | 'console';
}

// User context after authentication
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'employer' | 'seeker';
}

// Extended context with auth
export interface Variables {
  user?: AuthUser;
}

// Hono context with bindings and variables
export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;

// Database row types
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: number;
  email_verified: number;
  gdpr_consent: number;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfileRow {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  logo_url: string | null;
  industry: string;
  company_size: string | null;
  founded_year: number | null;
  contact_details: string;
  verified: number;
  created_at: string;
  updated_at: string;
}

export interface SeekerProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  resume_url: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  work_history: string;
  education: string;
  skills: string;
  preferences: string;
  profile_complete: number;
  created_at: string;
  updated_at: string;
}

export interface JobRow {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location_type: string;
  location: string | null;
  salary_range: string;
  responsibilities: string;
  requirements: string;
  nice_to_haves: string;
  skills: string;
  experience_level: string;
  job_type: string;
  deadline: string;
  apply_url: string | null;
  status: string;
  application_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRow {
  id: string;
  job_id: string;
  seeker_id: string;
  status: string;
  cover_letter: string | null;
  resume_url: string | null;
  applied_at: string;
  updated_at: string;
}

export interface JobAlertRow {
  id: string;
  seeker_id: string;
  name: string;
  keywords: string;
  locations: string;
  location_type: string;
  job_types: string;
  min_salary: number | null;
  salary_currency: string | null;
  frequency: string;
  is_active: number;
  last_sent_at: string | null;
  created_at: string;
}

export interface SavedJobRow {
  id: string;
  seeker_id: string;
  job_id: string;
  saved_at: string;
}

export interface MessageRow {
  id: string;
  application_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  read: number;
  created_at: string;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

