import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { employerProfileSchema, updateEmployerProfileSchema, updateApplicationStatusSchema, sendMessageSchema } from '@job-portal/shared';
import type { Bindings, Variables, EmployerProfileRow, JobRow, ApplicationRow, SeekerProfileRow, MessageRow } from '../types';
import { generateId } from '../utils/crypto';
import { authMiddleware, employerOnly } from '../middleware/auth';
import { cachePresets } from '../middleware/cache';

export const employerRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * GET /api/employers (PUBLIC)
 * List all companies with active job listings
 */
employerRoutes.get('/', cachePresets.companyProfiles, async (c) => {
  const query = c.req.query('query') || '';
  const industry = c.req.query('industry') || '';
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '20');

  let sql = `
    SELECT ep.id, ep.company_name, ep.description, ep.logo_url, ep.industry, 
           ep.company_size, ep.founded_year, ep.verified,
           COUNT(DISTINCT CASE WHEN j.status = 'active' THEN j.id END) as active_job_count
    FROM employer_profiles ep
    LEFT JOIN jobs j ON ep.id = j.employer_id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (query) {
    sql += ` AND (ep.company_name LIKE ? OR ep.description LIKE ?)`;
    params.push(`%${query}%`, `%${query}%`);
  }

  if (industry) {
    sql += ` AND ep.industry = ?`;
    params.push(industry);
  }

  sql += ` GROUP BY ep.id`;

  // Count total
  const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
  const countResult = await c.env.DB.prepare(countSql).bind(...params).first<{ total: number }>();

  // Add sorting and pagination
  sql += ` ORDER BY active_job_count DESC, ep.verified DESC, ep.company_name ASC`;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(pageSize, (page - 1) * pageSize);

  const result = await c.env.DB.prepare(sql).bind(...params).all<{
    id: string;
    company_name: string;
    description: string | null;
    logo_url: string | null;
    industry: string;
    company_size: string | null;
    founded_year: number | null;
    verified: number;
    active_job_count: number;
  }>();

  return c.json({
    success: true,
    data: {
      items: result.results.map((company) => ({
        id: company.id,
        companyName: company.company_name,
        description: company.description,
        logoUrl: company.logo_url,
        industry: company.industry,
        companySize: company.company_size,
        foundedYear: company.founded_year,
        verified: !!company.verified,
        activeJobCount: company.active_job_count,
      })),
      total: countResult?.total || 0,
      page,
      pageSize,
      totalPages: Math.ceil((countResult?.total || 0) / pageSize),
    },
  });
});

/**
 * GET /api/employers/:id (PUBLIC - must be defined BEFORE auth middleware)
 * Get employer public profile
 */
employerRoutes.get('/:id', cachePresets.companyProfiles, async (c) => {
  const employerId = c.req.param('id');

  // Skip if this looks like a protected route path
  if (['profile', 'dashboard', 'jobs', 'applications'].includes(employerId)) {
    return c.json({ success: false, error: 'Not Found', message: 'Company not found' }, 404);
  }

  const profile = await c.env.DB.prepare(`
    SELECT id, company_name, description, logo_url, industry, company_size, founded_year, verified
    FROM employer_profiles WHERE id = ?
  `).bind(employerId).first<EmployerProfileRow>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Company not found' }, 404);
  }

  // Get active jobs count
  const jobCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = ?'
  ).bind(employerId, 'active').first<{ count: number }>();

  return c.json({
    success: true,
    data: {
      id: profile.id,
      companyName: profile.company_name,
      description: profile.description,
      logoUrl: profile.logo_url,
      industry: profile.industry,
      companySize: profile.company_size,
      foundedYear: profile.founded_year,
      verified: !!profile.verified,
      activeJobCount: jobCount?.count || 0,
    },
  });
});

// All other employer routes require authentication
employerRoutes.use('*', authMiddleware);

/**
 * GET /api/employers/profile
 * Get current employer's profile
 */
employerRoutes.get('/profile', employerOnly, async (c) => {
  const user = c.get('user')!;

  const profile = await c.env.DB.prepare(`
    SELECT * FROM employer_profiles WHERE user_id = ?
  `).bind(user.id).first<EmployerProfileRow>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      id: profile.id,
      companyName: profile.company_name,
      description: profile.description,
      logoUrl: profile.logo_url,
      industry: profile.industry,
      companySize: profile.company_size,
      foundedYear: profile.founded_year,
      contactDetails: JSON.parse(profile.contact_details),
      verified: !!profile.verified,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  });
});

/**
 * PUT /api/employers/profile
 * Update employer profile
 */
employerRoutes.put('/profile', employerOnly, zValidator('json', updateEmployerProfileSchema), async (c) => {
  const user = c.get('user')!;
  const input = c.req.valid('json');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM employer_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.companyName !== undefined) { updates.push('company_name = ?'); values.push(input.companyName); }
  if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description); }
  if (input.industry !== undefined) { updates.push('industry = ?'); values.push(input.industry); }
  if (input.companySize !== undefined) { updates.push('company_size = ?'); values.push(input.companySize || null); }
  if (input.foundedYear !== undefined) { updates.push('founded_year = ?'); values.push(input.foundedYear || null); }
  if (input.contactDetails !== undefined) { updates.push('contact_details = ?'); values.push(JSON.stringify(input.contactDetails)); }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'Bad Request', message: 'No fields to update' }, 400);
  }

  updates.push('updated_at = datetime("now")');
  values.push(profile.id);

  await c.env.DB.prepare(`UPDATE employer_profiles SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return c.json({ success: true, message: 'Profile updated successfully' });
});

/**
 * GET /api/employers/dashboard
 * Get employer dashboard stats
 */
employerRoutes.get('/dashboard', employerOnly, async (c) => {
  const user = c.get('user')!;

  const profile = await c.env.DB.prepare(
    'SELECT id FROM employer_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  // Get job stats
  const jobStats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_jobs,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_jobs,
      SUM(application_count) as total_applications,
      SUM(view_count) as total_views
    FROM jobs WHERE employer_id = ?
  `).bind(profile.id).first<{
    total_jobs: number;
    active_jobs: number;
    draft_jobs: number;
    total_applications: number;
    total_views: number;
  }>();

  // Get pending applications count
  const pendingApps = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = ? AND a.status = 'pending'
  `).bind(profile.id).first<{ count: number }>();

  // Get recent applications
  const recentApps = await c.env.DB.prepare(`
    SELECT a.*, j.title as job_title, sp.full_name, sp.avatar_url
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN seeker_profiles sp ON a.seeker_id = sp.id
    WHERE j.employer_id = ?
    ORDER BY a.applied_at DESC
    LIMIT 5
  `).bind(profile.id).all<ApplicationRow & { job_title: string; full_name: string; avatar_url: string | null }>();

  // Get applications by status
  const appsByStatus = await c.env.DB.prepare(`
    SELECT a.status, COUNT(*) as count
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.employer_id = ?
    GROUP BY a.status
  `).bind(profile.id).all<{ status: string; count: number }>();

  return c.json({
    success: true,
    data: {
      stats: {
        totalJobs: jobStats?.total_jobs || 0,
        activeJobs: jobStats?.active_jobs || 0,
        draftJobs: jobStats?.draft_jobs || 0,
        totalApplications: jobStats?.total_applications || 0,
        pendingApplications: pendingApps?.count || 0,
        totalViews: jobStats?.total_views || 0,
      },
      applicationsByStatus: appsByStatus.results.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {} as Record<string, number>),
      recentApplications: recentApps.results.map((app) => ({
        id: app.id,
        jobId: app.job_id,
        jobTitle: app.job_title,
        seekerName: app.full_name,
        seekerAvatar: app.avatar_url,
        status: app.status,
        appliedAt: app.applied_at,
      })),
    },
  });
});

/**
 * GET /api/employers/jobs
 * Get employer's job postings
 */
employerRoutes.get('/jobs', employerOnly, async (c) => {
  const user = c.get('user')!;
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '20');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM employer_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  let sql = 'SELECT * FROM jobs WHERE employer_id = ?';
  const params: (string | number)[] = [profile.id];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  // Count total
  const countResult = await c.env.DB.prepare(
    sql.replace('SELECT *', 'SELECT COUNT(*) as total')
  ).bind(...params).first<{ total: number }>();

  // Add pagination
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const result = await c.env.DB.prepare(sql).bind(...params).all<JobRow>();

  return c.json({
    success: true,
    data: {
      items: result.results.map((job) => ({
        id: job.id,
        title: job.title,
        locationType: job.location_type,
        location: job.location,
        salaryRange: JSON.parse(job.salary_range),
        experienceLevel: job.experience_level,
        jobType: job.job_type,
        deadline: job.deadline,
        status: job.status,
        applicationCount: job.application_count,
        viewCount: job.view_count,
        createdAt: job.created_at,
      })),
      total: countResult?.total || 0,
      page,
      pageSize,
      totalPages: Math.ceil((countResult?.total || 0) / pageSize),
    },
  });
});

/**
 * GET /api/employers/jobs/:jobId/applicants
 * Get applicants for a specific job
 */
employerRoutes.get('/jobs/:jobId/applicants', employerOnly, async (c) => {
  const user = c.get('user')!;
  const jobId = c.req.param('jobId');
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '20');

  // Verify job ownership
  const job = await c.env.DB.prepare(`
    SELECT j.id FROM jobs j
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE j.id = ? AND ep.user_id = ?
  `).bind(jobId, user.id).first();

  if (!job) {
    return c.json({ success: false, error: 'Not Found', message: 'Job not found' }, 404);
  }

  let sql = `
    SELECT a.*, sp.full_name, sp.headline, sp.avatar_url, sp.resume_url as profile_resume,
           sp.skills, sp.location, u.email
    FROM applications a
    JOIN seeker_profiles sp ON a.seeker_id = sp.id
    JOIN users u ON sp.user_id = u.id
    WHERE a.job_id = ?
  `;
  const params: (string | number)[] = [jobId];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  const countResult = await c.env.DB.prepare(
    sql.replace('SELECT a.*, sp.full_name, sp.headline, sp.avatar_url, sp.resume_url as profile_resume, sp.skills, sp.location, u.email', 'SELECT COUNT(*) as total')
  ).bind(...params).first<{ total: number }>();

  sql += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const result = await c.env.DB.prepare(sql).bind(...params).all<ApplicationRow & {
    full_name: string;
    headline: string | null;
    avatar_url: string | null;
    profile_resume: string | null;
    skills: string;
    location: string | null;
    email: string;
  }>();

  return c.json({
    success: true,
    data: {
      items: result.results.map((app) => ({
        id: app.id,
        status: app.status,
        coverLetter: app.cover_letter,
        resumeUrl: app.resume_url || app.profile_resume,
        appliedAt: app.applied_at,
        seeker: {
          id: app.seeker_id,
          fullName: app.full_name,
          headline: app.headline,
          avatarUrl: app.avatar_url,
          email: app.email,
          skills: JSON.parse(app.skills),
          location: app.location,
        },
      })),
      total: countResult?.total || 0,
      page,
      pageSize,
      totalPages: Math.ceil((countResult?.total || 0) / pageSize),
    },
  });
});

/**
 * PUT /api/employers/applications/:applicationId/status
 * Update application status
 */
employerRoutes.put('/applications/:applicationId/status', employerOnly, zValidator('json', updateApplicationStatusSchema), async (c) => {
  const user = c.get('user')!;
  const applicationId = c.req.param('applicationId');
  const { status } = c.req.valid('json');

  // Verify ownership
  const app = await c.env.DB.prepare(`
    SELECT a.id FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE a.id = ? AND ep.user_id = ?
  `).bind(applicationId, user.id).first();

  if (!app) {
    return c.json({ success: false, error: 'Not Found', message: 'Application not found' }, 404);
  }

  await c.env.DB.prepare(`
    UPDATE applications SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(status, applicationId).run();

  return c.json({ success: true, message: 'Application status updated' });
});

/**
 * GET /api/employers/applications/:applicationId/messages
 * Get messages for an application
 */
employerRoutes.get('/applications/:applicationId/messages', employerOnly, async (c) => {
  const user = c.get('user')!;
  const applicationId = c.req.param('applicationId');

  // Verify ownership
  const app = await c.env.DB.prepare(`
    SELECT a.id FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE a.id = ? AND ep.user_id = ?
  `).bind(applicationId, user.id).first();

  if (!app) {
    return c.json({ success: false, error: 'Not Found', message: 'Application not found' }, 404);
  }

  const messages = await c.env.DB.prepare(`
    SELECT * FROM messages WHERE application_id = ? ORDER BY created_at ASC
  `).bind(applicationId).all<MessageRow>();

  // Mark messages as read
  await c.env.DB.prepare(`
    UPDATE messages SET read = 1 WHERE application_id = ? AND sender_role = 'seeker'
  `).bind(applicationId).run();

  return c.json({
    success: true,
    data: messages.results.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderRole: msg.sender_role,
      content: msg.content,
      read: !!msg.read,
      createdAt: msg.created_at,
    })),
  });
});

/**
 * POST /api/employers/applications/:applicationId/messages
 * Send a message to applicant
 */
employerRoutes.post('/applications/:applicationId/messages', employerOnly, zValidator('json', sendMessageSchema.pick({ content: true })), async (c) => {
  const user = c.get('user')!;
  const applicationId = c.req.param('applicationId');
  const { content } = c.req.valid('json');

  // Verify ownership
  const app = await c.env.DB.prepare(`
    SELECT a.id FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE a.id = ? AND ep.user_id = ?
  `).bind(applicationId, user.id).first();

  if (!app) {
    return c.json({ success: false, error: 'Not Found', message: 'Application not found' }, 404);
  }

  const messageId = generateId();

  await c.env.DB.prepare(`
    INSERT INTO messages (id, application_id, sender_id, sender_role, content)
    VALUES (?, ?, ?, 'employer', ?)
  `).bind(messageId, applicationId, user.id, content).run();

  return c.json({
    success: true,
    data: { id: messageId },
    message: 'Message sent successfully',
  }, 201);
});

// Note: Public GET /api/employers/:id route is defined above the auth middleware

