// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'admin' | 'employer' | 'seeker';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  gdprConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser extends User {
  tokens: AuthTokens;
}

// ============================================
// Employer Types
// ============================================

export interface ContactDetails {
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  logoUrl?: string;
  industry: string;
  companySize?: string;
  foundedYear?: number;
  contactDetails: ContactDetails;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Job Types
// ============================================

export type LocationType = 'remote' | 'hybrid' | 'onsite';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface SalaryRange {
  min: number;
  max: number;
  currency: Currency;
  period: 'hourly' | 'monthly' | 'yearly';
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  locationType: LocationType;
  location?: string;
  salaryRange: SalaryRange;
  responsibilities: string[];
  requirements: string[];
  niceToHaves: string[];
  skills: string[];
  experienceLevel: string;
  jobType: string;
  deadline: string;
  applyUrl?: string;
  status: JobStatus;
  applicationCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobWithEmployer extends Job {
  employer: EmployerProfile;
}

// ============================================
// Job Seeker Types
// ============================================

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface JobPreferences {
  desiredRoles: string[];
  desiredLocations: string[];
  locationType: LocationType[];
  minSalary?: number;
  salaryCurrency?: Currency;
  jobTypes: string[];
  industries: string[];
  willingToRelocate: boolean;
}

export interface SeekerProfile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  workHistory: WorkExperience[];
  education: Education[];
  skills: string[];
  preferences: JobPreferences;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Application Types
// ============================================

export type ApplicationStatus = 
  | 'pending' 
  | 'reviewing' 
  | 'shortlisted' 
  | 'interview' 
  | 'offered' 
  | 'rejected' 
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationWithDetails extends Application {
  job: Job;
  seeker: SeekerProfile;
}

// ============================================
// Job Alert Types
// ============================================

export type AlertFrequency = 'instant' | 'daily' | 'weekly';

export interface JobAlert {
  id: string;
  seekerId: string;
  name: string;
  keywords: string[];
  locations: string[];
  locationType: LocationType[];
  jobTypes: string[];
  minSalary?: number;
  salaryCurrency?: Currency;
  frequency: AlertFrequency;
  isActive: boolean;
  lastSentAt?: string;
  createdAt: string;
}

// ============================================
// Saved Job Types
// ============================================

export interface SavedJob {
  id: string;
  seekerId: string;
  jobId: string;
  savedAt: string;
}

// ============================================
// Message Types
// ============================================

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  senderRole: 'employer' | 'seeker';
  content: string;
  read: boolean;
  createdAt: string;
}

// ============================================
// Analytics Types
// ============================================

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  viewsThisMonth: number;
  applicationsThisMonth: number;
}

export interface AdminStats extends DashboardStats {
  totalEmployers: number;
  totalSeekers: number;
  verifiedEmployers: number;
  newUsersThisMonth: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Search & Filter Types
// ============================================

export interface JobSearchFilters {
  query?: string;
  location?: string;
  locationType?: LocationType[];
  jobType?: string[];
  industry?: string[];
  experienceLevel?: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: Currency;
  postedWithin?: number; // days
  employerId?: string; // Filter by specific employer
}

export interface JobSearchParams extends JobSearchFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'date' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Upload Types
// ============================================

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  purpose: 'resume' | 'logo' | 'avatar';
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresAt: string;
}

// ============================================
// GDPR Types
// ============================================

export interface GdprExportData {
  user: User;
  profile: EmployerProfile | SeekerProfile;
  applications?: Application[];
  savedJobs?: SavedJob[];
  alerts?: JobAlert[];
  exportedAt: string;
}

