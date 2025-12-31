import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createJobSchema, updateJobSchema, jobSearchSchema } from '@job-portal/shared';
import type { Bindings, Variables, JobRow, EmployerProfileRow } from '../types';
import { generateId } from '../utils/crypto';
import { authMiddleware, optionalAuthMiddleware, employerOnly } from '../middleware/auth';
import { cachePresets } from '../middleware/cache';
import { rateLimitPresets } from '../middleware/rateLimit';

export const jobRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/**
 * GET /api/jobs
 * Search and list jobs with filters
 */
jobRoutes.get('/', cachePresets.jobListings, zValidator('query', jobSearchSchema), async (c) => {
  const filters = c.req.valid('query');
  const {
    query,
    location,
    locationType,
    jobType,
    industry,
    experienceLevel,
    minSalary,
    maxSalary,
    currency,
    postedWithin,
    employerId,
    page = 1,
    pageSize = 20,
    sortBy = 'date',
    sortOrder = 'desc',
  } = filters;

  let sql = `
    SELECT j.*, ep.company_name, ep.logo_url, ep.industry as company_industry, ep.verified
    FROM jobs j
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE j.status = 'active'
  `;
  const params: (string | number)[] = [];

  // Text search (using LIKE for compatibility)
  if (query) {
    sql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.skills LIKE ? OR ep.company_name LIKE ?)`;
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Location filter
  if (location) {
    sql += ` AND j.location LIKE ?`;
    params.push(`%${location}%`);
  }

  // Location type filter
  if (locationType && locationType.length > 0) {
    sql += ` AND j.location_type IN (${locationType.map(() => '?').join(',')})`;
    params.push(...locationType);
  }

  // Job type filter
  if (jobType && jobType.length > 0) {
    sql += ` AND j.job_type IN (${jobType.map(() => '?').join(',')})`;
    params.push(...jobType);
  }

  // Industry filter
  if (industry && industry.length > 0) {
    sql += ` AND ep.industry IN (${industry.map(() => '?').join(',')})`;
    params.push(...industry);
  }

  // Experience level filter
  if (experienceLevel && experienceLevel.length > 0) {
    sql += ` AND j.experience_level IN (${experienceLevel.map(() => '?').join(',')})`;
    params.push(...experienceLevel);
  }

  // Salary range filter
  if (minSalary || maxSalary) {
    if (minSalary) {
      sql += ` AND json_extract(j.salary_range, '$.max') >= ?`;
      params.push(minSalary);
    }
    if (maxSalary) {
      sql += ` AND json_extract(j.salary_range, '$.min') <= ?`;
      params.push(maxSalary);
    }
    if (currency) {
      sql += ` AND json_extract(j.salary_range, '$.currency') = ?`;
      params.push(currency);
    }
  }

  // Posted within filter
  if (postedWithin) {
    sql += ` AND j.created_at >= datetime('now', '-' || ? || ' days')`;
    params.push(postedWithin);
  }

  // Employer ID filter
  if (employerId) {
    sql += ` AND j.employer_id = ?`;
    params.push(employerId);
  }

  // Count total
  const countSql = sql.replace('SELECT j.*, ep.company_name, ep.logo_url, ep.industry as company_industry, ep.verified', 'SELECT COUNT(*) as total');
  const countResult = await c.env.DB.prepare(countSql).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  // Add sorting
  switch (sortBy) {
    case 'salary':
      sql += ` ORDER BY json_extract(j.salary_range, '$.max') ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
      break;
    case 'relevance':
      // For relevance, order by most recent when query exists
      sql += ` ORDER BY j.created_at DESC`;
      break;
    default:
      sql += ` ORDER BY j.created_at ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
  }

  // Add pagination
  const offset = (page - 1) * pageSize;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(pageSize, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all<JobRow & { company_name: string; logo_url: string | null; company_industry: string; verified: number }>();

  const jobs = result.results.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    locationType: row.location_type,
    location: row.location,
    salaryRange: JSON.parse(row.salary_range),
    skills: JSON.parse(row.skills),
    experienceLevel: row.experience_level,
    jobType: row.job_type,
    deadline: row.deadline,
    status: row.status,
    applicationCount: row.application_count,
    viewCount: row.view_count,
    createdAt: row.created_at,
    employer: {
      id: row.employer_id,
      companyName: row.company_name,
      logoUrl: row.logo_url,
      industry: row.company_industry,
      verified: !!row.verified,
    },
  }));

  return c.json({
    success: true,
    data: {
      items: jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

/**
 * GET /api/jobs/featured
 * Get featured/promoted jobs
 */
jobRoutes.get('/featured', cachePresets.jobListings, async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT j.*, ep.company_name, ep.logo_url, ep.industry, ep.verified
    FROM jobs j
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE j.status = 'active' AND ep.verified = 1
    ORDER BY j.view_count DESC, j.created_at DESC
    LIMIT 6
  `).all<JobRow & { company_name: string; logo_url: string | null; industry: string; verified: number }>();

  const jobs = result.results.map((row) => ({
    id: row.id,
    title: row.title,
    locationType: row.location_type,
    location: row.location,
    salaryRange: JSON.parse(row.salary_range),
    skills: JSON.parse(row.skills).slice(0, 3),
    jobType: row.job_type,
    createdAt: row.created_at,
    employer: {
      id: row.employer_id,
      companyName: row.company_name,
      logoUrl: row.logo_url,
      verified: true,
    },
  }));

  return c.json({ success: true, data: jobs });
});

/**
 * GET /api/jobs/:id
 * Get job details by ID
 * Note: No caching to ensure view counts are accurate
 */
jobRoutes.get('/:id', optionalAuthMiddleware, async (c) => {
  const jobId = c.req.param('id');

  // Increment view count FIRST and await it
  await c.env.DB.prepare(
    'UPDATE jobs SET view_count = view_count + 1 WHERE id = ? AND status = ?'
  ).bind(jobId, 'active').run();

  // Then fetch the job with updated view count
  const job = await c.env.DB.prepare(`
    SELECT j.*, ep.company_name, ep.description as company_description, ep.logo_url, 
           ep.industry, ep.company_size, ep.contact_details, ep.verified
    FROM jobs j
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE j.id = ?
  `).bind(jobId).first<JobRow & {
    company_name: string;
    company_description: string;
    logo_url: string | null;
    industry: string;
    company_size: string | null;
    contact_details: string;
    verified: number;
  }>();

  if (!job) {
    return c.json({ success: false, error: 'Not Found', message: 'Job not found' }, 404);
  }

  // Check if job is accessible
  if (job.status !== 'active') {
    const user = c.get('user');
    if (!user || (user.role !== 'admin' && user.id !== job.employer_id)) {
      return c.json({ success: false, error: 'Not Found', message: 'Job not found' }, 404);
    }
  }

  // Check if user has applied (for authenticated seekers)
  let hasApplied = false;
  let isSaved = false;
  const user = c.get('user');
  
  if (user?.role === 'seeker') {
    const seekerProfile = await c.env.DB.prepare(
      'SELECT id FROM seeker_profiles WHERE user_id = ?'
    ).bind(user.id).first<{ id: string }>();
    
    if (seekerProfile) {
      const application = await c.env.DB.prepare(
        'SELECT id FROM applications WHERE job_id = ? AND seeker_id = ?'
      ).bind(jobId, seekerProfile.id).first();
      hasApplied = !!application;
      
      const saved = await c.env.DB.prepare(
        'SELECT id FROM saved_jobs WHERE job_id = ? AND seeker_id = ?'
      ).bind(jobId, seekerProfile.id).first();
      isSaved = !!saved;
    }
  }

  return c.json({
    success: true,
    data: {
      id: job.id,
      title: job.title,
      description: job.description,
      locationType: job.location_type,
      location: job.location,
      salaryRange: JSON.parse(job.salary_range),
      responsibilities: JSON.parse(job.responsibilities),
      requirements: JSON.parse(job.requirements),
      niceToHaves: JSON.parse(job.nice_to_haves),
      skills: JSON.parse(job.skills),
      experienceLevel: job.experience_level,
      jobType: job.job_type,
      deadline: job.deadline,
      applyUrl: job.apply_url,
      status: job.status,
      applicationCount: job.application_count,
      viewCount: job.view_count,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      employer: {
        id: job.employer_id,
        companyName: job.company_name,
        description: job.company_description,
        logoUrl: job.logo_url,
        industry: job.industry,
        companySize: job.company_size,
        contactDetails: JSON.parse(job.contact_details),
        verified: !!job.verified,
      },
      hasApplied,
      isSaved,
    },
  });
});

/**
 * POST /api/jobs
 * Create a new job posting (employer only)
 */
jobRoutes.post('/', authMiddleware, employerOnly, zValidator('json', createJobSchema), async (c) => {
  const user = c.get('user')!;
  const input = c.req.valid('json');

  // Get employer profile
  const employer = await c.env.DB.prepare(
    'SELECT id FROM employer_profiles WHERE user_id = ?'
  ).bind(user.id).first<EmployerProfileRow>();

  if (!employer) {
    return c.json(
      { success: false, error: 'Not Found', message: 'Employer profile not found. Please complete your profile first.' },
      404
    );
  }

  const jobId = generateId();

  await c.env.DB.prepare(`
    INSERT INTO jobs (
      id, employer_id, title, description, location_type, location,
      salary_range, responsibilities, requirements, nice_to_haves,
      skills, experience_level, job_type, deadline, apply_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    jobId,
    employer.id,
    input.title,
    input.description,
    input.locationType,
    input.location || null,
    JSON.stringify(input.salaryRange),
    JSON.stringify(input.responsibilities),
    JSON.stringify(input.requirements),
    JSON.stringify(input.niceToHaves),
    JSON.stringify(input.skills),
    input.experienceLevel,
    input.jobType,
    input.deadline,
    input.applyUrl || null,
    input.status || 'draft'
  ).run();

  return c.json({
    success: true,
    data: { id: jobId },
    message: 'Job created successfully',
  }, 201);
});

/**
 * PUT /api/jobs/:id
 * Update a job posting
 */
jobRoutes.put('/:id', authMiddleware, employerOnly, zValidator('json', updateJobSchema), async (c) => {
  const user = c.get('user')!;
  const jobId = c.req.param('id');
  const input = c.req.valid('json');

  // Verify ownership
  const job = await c.env.DB.prepare(`
    SELECT j.id, ep.user_id FROM jobs j
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE j.id = ?
  `).bind(jobId).first<{ id: string; user_id: string }>();

  if (!job) {
    return c.json({ success: false, error: 'Not Found', message: 'Job not found' }, 404);
  }

  if (job.user_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, error: 'Forbidden', message: 'Not authorized to update this job' }, 403);
  }

  // Build update query dynamically
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.title !== undefined) { updates.push('title = ?'); values.push(input.title); }
  if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description); }
  if (input.locationType !== undefined) { updates.push('location_type = ?'); values.push(input.locationType); }
  if (input.location !== undefined) { updates.push('location = ?'); values.push(input.location || null); }
  if (input.salaryRange !== undefined) { updates.push('salary_range = ?'); values.push(JSON.stringify(input.salaryRange)); }
  if (input.responsibilities !== undefined) { updates.push('responsibilities = ?'); values.push(JSON.stringify(input.responsibilities)); }
  if (input.requirements !== undefined) { updates.push('requirements = ?'); values.push(JSON.stringify(input.requirements)); }
  if (input.niceToHaves !== undefined) { updates.push('nice_to_haves = ?'); values.push(JSON.stringify(input.niceToHaves)); }
  if (input.skills !== undefined) { updates.push('skills = ?'); values.push(JSON.stringify(input.skills)); }
  if (input.experienceLevel !== undefined) { updates.push('experience_level = ?'); values.push(input.experienceLevel); }
  if (input.jobType !== undefined) { updates.push('job_type = ?'); values.push(input.jobType); }
  if (input.deadline !== undefined) { updates.push('deadline = ?'); values.push(input.deadline); }
  if (input.applyUrl !== undefined) { updates.push('apply_url = ?'); values.push(input.applyUrl || null); }
  if (input.status !== undefined) { updates.push('status = ?'); values.push(input.status); }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'Bad Request', message: 'No fields to update' }, 400);
  }

  updates.push('updated_at = datetime("now")');
  values.push(jobId);

  await c.env.DB.prepare(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return c.json({ success: true, message: 'Job updated successfully' });
});

/**
 * DELETE /api/jobs/:id
 * Delete a job posting
 */
jobRoutes.delete('/:id', authMiddleware, employerOnly, async (c) => {
  const user = c.get('user')!;
  const jobId = c.req.param('id');

  // Verify ownership
  const job = await c.env.DB.prepare(`
    SELECT j.id, ep.user_id FROM jobs j
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE j.id = ?
  `).bind(jobId).first<{ id: string; user_id: string }>();

  if (!job) {
    return c.json({ success: false, error: 'Not Found', message: 'Job not found' }, 404);
  }

  if (job.user_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, error: 'Forbidden', message: 'Not authorized to delete this job' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(jobId).run();

  return c.json({ success: true, message: 'Job deleted successfully' });
});

/**
 * POST /api/jobs/:id/apply
 * Apply to a job (seeker only)
 */
jobRoutes.post('/:id/apply', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const jobId = c.req.param('id');

  if (user.role !== 'seeker') {
    return c.json({ success: false, error: 'Forbidden', message: 'Only job seekers can apply' }, 403);
  }

  // Get seeker profile
  const seeker = await c.env.DB.prepare(
    'SELECT id, resume_url FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string; resume_url: string | null }>();

  if (!seeker) {
    return c.json(
      { success: false, error: 'Not Found', message: 'Please complete your profile first' },
      404
    );
  }

  // Check if job exists and is active
  const job = await c.env.DB.prepare(
    'SELECT id, status FROM jobs WHERE id = ?'
  ).bind(jobId).first<{ id: string; status: string }>();

  if (!job || job.status !== 'active') {
    return c.json({ success: false, error: 'Not Found', message: 'Job not found or not accepting applications' }, 404);
  }

  // Check if already applied
  const existingApp = await c.env.DB.prepare(
    'SELECT id FROM applications WHERE job_id = ? AND seeker_id = ?'
  ).bind(jobId, seeker.id).first();

  if (existingApp) {
    return c.json({ success: false, error: 'Conflict', message: 'You have already applied to this job' }, 409);
  }

  const body = await c.req.json<{ coverLetter?: string }>().catch(() => ({}));

  const applicationId = generateId();

  await c.env.DB.prepare(`
    INSERT INTO applications (id, job_id, seeker_id, cover_letter, resume_url, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).bind(applicationId, jobId, seeker.id, body.coverLetter || null, seeker.resume_url).run();

  // Increment application count
  await c.env.DB.prepare('UPDATE jobs SET application_count = application_count + 1 WHERE id = ?').bind(jobId).run();

  return c.json({
    success: true,
    data: { id: applicationId },
    message: 'Application submitted successfully',
  }, 201);
});

/**
 * POST /api/jobs/:id/save
 * Save a job (seeker only)
 */
jobRoutes.post('/:id/save', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const jobId = c.req.param('id');

  if (user.role !== 'seeker') {
    return c.json({ success: false, error: 'Forbidden', message: 'Only job seekers can save jobs' }, 403);
  }

  const seeker = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!seeker) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  // Check if already saved
  const existing = await c.env.DB.prepare(
    'SELECT id FROM saved_jobs WHERE job_id = ? AND seeker_id = ?'
  ).bind(jobId, seeker.id).first();

  if (existing) {
    return c.json({ success: false, error: 'Conflict', message: 'Job already saved' }, 409);
  }

  await c.env.DB.prepare(`
    INSERT INTO saved_jobs (id, seeker_id, job_id)
    VALUES (?, ?, ?)
  `).bind(generateId(), seeker.id, jobId).run();

  return c.json({ success: true, message: 'Job saved successfully' }, 201);
});

/**
 * DELETE /api/jobs/:id/save
 * Unsave a job
 */
jobRoutes.delete('/:id/save', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const jobId = c.req.param('id');

  const seeker = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!seeker) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM saved_jobs WHERE job_id = ? AND seeker_id = ?'
  ).bind(jobId, seeker.id).run();

  return c.json({ success: true, message: 'Job unsaved successfully' });
});

