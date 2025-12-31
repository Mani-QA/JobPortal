import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Bindings, Variables, SeekerProfileRow } from '../types';
import { optionalAuthMiddleware } from '../middleware/auth';

export const profileRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Schema for profile search
const profileSearchSchema = z.object({
  query: z.string().optional(), // Search in skills, headline, role names
  skills: z.preprocess(
    (val) => (typeof val === 'string' && val !== '') ? val.split(',').map(s => s.trim()) : undefined,
    z.array(z.string()).optional()
  ),
  location: z.string().optional(),
  minExperience: z.preprocess(
    (val) => (typeof val === 'string' && val !== '') ? Number(val) : undefined,
    z.number().min(0).max(50).optional()
  ),
  maxExperience: z.preprocess(
    (val) => (typeof val === 'string' && val !== '') ? Number(val) : undefined,
    z.number().min(0).max(50).optional()
  ),
  page: z.preprocess(
    (val) => (typeof val === 'string') ? Number(val) : val,
    z.number().min(1).default(1)
  ),
  pageSize: z.preprocess(
    (val) => (typeof val === 'string') ? Number(val) : val,
    z.number().min(1).max(50).default(20)
  ),
  sortBy: z.enum(['relevance', 'experience', 'recent']).default('recent'),
});

// Helper to mask email
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(Math.min(local.length - 2, 5)) + local[local.length - 1]
    : '**';
  const domainParts = domain.split('.');
  const maskedDomain = domainParts[0][0] + '***.' + domainParts.slice(1).join('.');
  return `${maskedLocal}@${maskedDomain}`;
}

// Helper to mask phone
function maskPhone(phone: string): string {
  // Keep last 4 digits, mask the rest
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

// Helper to calculate total years of experience from work history
function calculateExperience(workHistory: Array<{ startDate: string; endDate?: string; current?: boolean }>): number {
  let totalMonths = 0;
  const now = new Date();
  
  for (const job of workHistory) {
    const start = new Date(job.startDate);
    const end = job.current || !job.endDate ? now : new Date(job.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }
  
  return Math.round(totalMonths / 12);
}

/**
 * GET /api/profiles
 * Search and list public seeker profiles
 */
profileRoutes.get('/', optionalAuthMiddleware, zValidator('query', profileSearchSchema), async (c) => {
  const { query, skills, location, minExperience, maxExperience, page, pageSize, sortBy } = c.req.valid('query');
  const user = c.get('user');
  const isAuthenticated = !!user;
  
  // Build SQL query
  let sql = `
    SELECT sp.*, u.email
    FROM seeker_profiles sp
    JOIN users u ON sp.user_id = u.id
    WHERE sp.profile_complete = 1
  `;
  const params: (string | number)[] = [];
  
  // Location filter
  if (location) {
    sql += ` AND sp.location LIKE ?`;
    params.push(`%${location}%`);
  }
  
  // We'll filter by skills and experience in JavaScript since they're JSON fields
  
  // Count total (without pagination)
  const countSql = sql.replace('SELECT sp.*, u.email', 'SELECT COUNT(*) as total');
  
  // Add sorting
  switch (sortBy) {
    case 'recent':
      sql += ` ORDER BY sp.updated_at DESC`;
      break;
    case 'experience':
    case 'relevance':
    default:
      sql += ` ORDER BY sp.updated_at DESC`;
      break;
  }
  
  // Get all profiles first (we'll filter in JS for complex criteria)
  const allProfiles = await c.env.DB.prepare(sql).bind(...params).all<SeekerProfileRow & { email: string }>();
  
  // Filter and transform profiles
  let filteredProfiles = allProfiles.results.map(profile => {
    const workHistory = JSON.parse(profile.work_history || '[]');
    const education = JSON.parse(profile.education || '[]');
    const profileSkills: string[] = JSON.parse(profile.skills || '[]');
    const preferences = JSON.parse(profile.preferences || '{}');
    const yearsOfExperience = calculateExperience(workHistory);
    
    // Get current/most recent role
    const currentRole = workHistory.length > 0 
      ? workHistory.sort((a: { startDate: string }, b: { startDate: string }) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )[0]?.title || null
      : null;
    
    return {
      id: profile.id,
      fullName: profile.full_name,
      headline: profile.headline,
      avatarUrl: profile.avatar_url,
      location: profile.location,
      skills: profileSkills,
      currentRole,
      yearsOfExperience,
      desiredRoles: preferences.desiredRoles || [],
      // Mask sensitive data for non-authenticated users
      email: isAuthenticated ? profile.email : maskEmail(profile.email),
      phone: profile.phone ? (isAuthenticated ? profile.phone : maskPhone(profile.phone)) : null,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      // Store work history for experience calculation
      _workHistory: workHistory,
      _skills: profileSkills,
    };
  });
  
  // Apply skill filter
  if (skills && skills.length > 0) {
    const searchSkills = skills.map(s => s.toLowerCase());
    filteredProfiles = filteredProfiles.filter(profile => 
      searchSkills.some(skill => 
        profile._skills.some((ps: string) => ps.toLowerCase().includes(skill))
      )
    );
  }
  
  // Apply experience filter
  if (minExperience !== undefined) {
    filteredProfiles = filteredProfiles.filter(p => p.yearsOfExperience >= minExperience);
  }
  if (maxExperience !== undefined) {
    filteredProfiles = filteredProfiles.filter(p => p.yearsOfExperience <= maxExperience);
  }
  
  // Apply query filter (search in headline, skills, current role, desired roles)
  if (query) {
    const searchQuery = query.toLowerCase();
    filteredProfiles = filteredProfiles.filter(profile => 
      profile.headline?.toLowerCase().includes(searchQuery) ||
      profile.currentRole?.toLowerCase().includes(searchQuery) ||
      profile._skills.some((s: string) => s.toLowerCase().includes(searchQuery)) ||
      profile.desiredRoles.some((r: string) => r.toLowerCase().includes(searchQuery)) ||
      profile.fullName.toLowerCase().includes(searchQuery)
    );
  }
  
  // Sort by experience if requested
  if (sortBy === 'experience') {
    filteredProfiles.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
  }
  
  // Calculate total before pagination
  const total = filteredProfiles.length;
  
  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedProfiles = filteredProfiles.slice(startIndex, startIndex + pageSize);
  
  // Remove internal fields
  const responseProfiles = paginatedProfiles.map(({ _workHistory, _skills, ...profile }) => profile);
  
  return c.json({
    success: true,
    data: {
      items: responseProfiles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

/**
 * GET /api/profiles/:id
 * Get a single public seeker profile
 */
profileRoutes.get('/:id', optionalAuthMiddleware, async (c) => {
  const profileId = c.req.param('id');
  const user = c.get('user');
  const isAuthenticated = !!user;
  
  // Skip if this looks like a reserved path
  if (['search', 'featured'].includes(profileId)) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }
  
  const profile = await c.env.DB.prepare(`
    SELECT sp.*, u.email
    FROM seeker_profiles sp
    JOIN users u ON sp.user_id = u.id
    WHERE sp.id = ? AND sp.profile_complete = 1
  `).bind(profileId).first<SeekerProfileRow & { email: string }>();
  
  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }
  
  const workHistory = JSON.parse(profile.work_history || '[]');
  const education = JSON.parse(profile.education || '[]');
  const skills: string[] = JSON.parse(profile.skills || '[]');
  const preferences = JSON.parse(profile.preferences || '{}');
  const yearsOfExperience = calculateExperience(workHistory);
  
  // Get current/most recent role
  const sortedWorkHistory = [...workHistory].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const currentRole = sortedWorkHistory.length > 0 ? sortedWorkHistory[0]?.title : null;
  
  return c.json({
    success: true,
    data: {
      id: profile.id,
      fullName: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      location: profile.location,
      // Mask sensitive data for non-authenticated users
      email: isAuthenticated ? profile.email : maskEmail(profile.email),
      phone: profile.phone ? (isAuthenticated ? profile.phone : maskPhone(profile.phone)) : null,
      resumeUrl: isAuthenticated ? profile.resume_url : null, // Only show resume to authenticated users
      skills,
      currentRole,
      yearsOfExperience,
      workHistory: workHistory.map((w: { company: string; title: string; location?: string; startDate: string; endDate?: string; current?: boolean; description?: string }) => ({
        company: w.company,
        title: w.title,
        location: w.location,
        startDate: w.startDate,
        endDate: w.endDate,
        current: w.current,
        description: w.description,
      })),
      education: education.map((e: { institution: string; degree: string; field: string; startDate: string; endDate?: string; current?: boolean }) => ({
        institution: e.institution,
        degree: e.degree,
        field: e.field,
        startDate: e.startDate,
        endDate: e.endDate,
        current: e.current,
      })),
      preferences: {
        desiredRoles: preferences.desiredRoles || [],
        desiredLocations: preferences.desiredLocations || [],
        locationType: preferences.locationType || [],
        jobTypes: preferences.jobTypes || [],
        willingToRelocate: preferences.willingToRelocate || false,
      },
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  });
});

