import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']);
export const locationTypeSchema = z.enum(['remote', 'hybrid', 'onsite']);
export const userRoleSchema = z.enum(['admin', 'employer', 'seeker']);

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['employer', 'seeker']),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the privacy policy' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================
// Contact Details Schema
// ============================================

export const contactDetailsSchema = z.object({
  email: emailSchema,
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// ============================================
// Employer Schemas
// ============================================

export const employerProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  contactDetails: contactDetailsSchema,
});

export const updateEmployerProfileSchema = employerProfileSchema.partial();

// ============================================
// Salary Range Schema
// ============================================

export const salaryRangeSchema = z.object({
  min: z.number().min(0, 'Minimum salary must be positive'),
  max: z.number().min(0, 'Maximum salary must be positive'),
  currency: currencySchema,
  period: z.enum(['hourly', 'monthly', 'yearly']),
}).refine((data) => data.max >= data.min, {
  message: 'Maximum salary must be greater than or equal to minimum',
  path: ['max'],
});

// ============================================
// Job Schemas
// ============================================

export const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(100, 'Description must be at least 100 characters').max(10000),
  locationType: locationTypeSchema,
  location: z.string().optional(),
  salaryRange: salaryRangeSchema,
  responsibilities: z.array(z.string().min(10)).min(3, 'At least 3 responsibilities required'),
  requirements: z.array(z.string().min(10)).min(2, 'At least 2 requirements required'),
  niceToHaves: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(3, 'At least 3 skills required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  jobType: z.string().min(1, 'Job type is required'),
  deadline: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Deadline must be in the future',
  }),
  applyUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'active']).default('draft'),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['draft', 'active', 'paused', 'closed', 'archived']).optional(),
});

// ============================================
// Job Seeker Profile Schemas
// ============================================

export const workExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(2, 'Company name is required'),
  title: z.string().min(2, 'Job title is required'),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(2000).optional(),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(2, 'Institution name is required'),
  degree: z.string().min(2, 'Degree is required'),
  field: z.string().min(2, 'Field of study is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

export const jobPreferencesSchema = z.object({
  desiredRoles: z.array(z.string()).default([]),
  desiredLocations: z.array(z.string()).default([]),
  locationType: z.array(locationTypeSchema).default([]),
  minSalary: z.number().min(0).optional(),
  salaryCurrency: currencySchema.optional(),
  jobTypes: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  willingToRelocate: z.boolean().default(false),
});

export const seekerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  workHistory: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  preferences: jobPreferencesSchema.default({}),
});

export const updateSeekerProfileSchema = seekerProfileSchema.partial();

// ============================================
// Application Schemas
// ============================================

export const applicationStatusSchema = z.enum([
  'pending',
  'reviewing',
  'shortlisted',
  'interview',
  'offered',
  'rejected',
  'withdrawn',
]);

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string().max(5000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: applicationStatusSchema,
  notes: z.string().max(1000).optional(),
});

// ============================================
// Job Alert Schemas
// ============================================

export const alertFrequencySchema = z.enum(['instant', 'daily', 'weekly']);

export const createJobAlertSchema = z.object({
  name: z.string().min(2, 'Alert name is required').max(100),
  keywords: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  locationType: z.array(locationTypeSchema).default([]),
  jobTypes: z.array(z.string()).default([]),
  minSalary: z.number().min(0).optional(),
  salaryCurrency: currencySchema.optional(),
  frequency: alertFrequencySchema.default('daily'),
  isActive: z.boolean().default(true),
});

export const updateJobAlertSchema = createJobAlertSchema.partial();

// ============================================
// Message Schemas
// ============================================

export const sendMessageSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  content: z.string().min(1, 'Message content is required').max(5000),
});

// ============================================
// Search & Filter Schemas
// ============================================

// Helper to convert empty strings to undefined
const emptyToUndefined = (val: unknown) => (val === '' || val === undefined ? undefined : val);

// Helper to parse array from query string (handles empty string case)
const parseArrayParam = (val: unknown): string[] | undefined => {
  if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return undefined;
  if (Array.isArray(val)) return val.filter(v => v !== '');
  if (typeof val === 'string' && val !== '') return [val];
  return undefined;
};

// Helper to coerce number from query string
const coerceNumber = (val: unknown): number | undefined => {
  if (val === undefined || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

export const jobSearchSchema = z.object({
  query: z.preprocess(emptyToUndefined, z.string().optional()),
  location: z.preprocess(emptyToUndefined, z.string().optional()),
  locationType: z.preprocess(parseArrayParam, z.array(locationTypeSchema).optional()),
  jobType: z.preprocess(parseArrayParam, z.array(z.string()).optional()),
  industry: z.preprocess(parseArrayParam, z.array(z.string()).optional()),
  experienceLevel: z.preprocess(parseArrayParam, z.array(z.string()).optional()),
  minSalary: z.preprocess(coerceNumber, z.number().min(0).optional()),
  maxSalary: z.preprocess(coerceNumber, z.number().min(0).optional()),
  currency: z.preprocess(emptyToUndefined, currencySchema.optional()),
  postedWithin: z.preprocess(coerceNumber, z.number().min(1).max(365).optional()),
  employerId: z.preprocess(emptyToUndefined, z.string().optional()),
  page: z.preprocess((val) => coerceNumber(val) ?? 1, z.number().min(1).default(1)),
  pageSize: z.preprocess((val) => coerceNumber(val) ?? 20, z.number().min(1).max(100).default(20)),
  sortBy: z.preprocess(emptyToUndefined, z.enum(['relevance', 'date', 'salary']).default('date')),
  sortOrder: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).default('desc')),
});

// ============================================
// Upload Schemas
// ============================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const presignedUrlRequestSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().refine(
    (type) => [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ].includes(type),
    { message: 'Invalid file type' }
  ),
  purpose: z.enum(['resume', 'logo', 'avatar']),
  fileSize: z.number().max(MAX_FILE_SIZE, 'File size must be less than 5MB'),
});

// ============================================
// Admin Schemas
// ============================================

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const verifyEmployerSchema = z.object({
  verified: z.boolean(),
  notes: z.string().max(500).optional(),
});

export const adminJobActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'feature', 'unfeature', 'archive']),
  reason: z.string().max(500).optional(),
});

// ============================================
// Pagination Schema
// ============================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

// ============================================
// Type Exports from Schemas
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EmployerProfileInput = z.infer<typeof employerProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type SeekerProfileInput = z.infer<typeof seekerProfileSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CreateJobAlertInput = z.infer<typeof createJobAlertSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;
export type PresignedUrlRequestInput = z.infer<typeof presignedUrlRequestSchema>;

