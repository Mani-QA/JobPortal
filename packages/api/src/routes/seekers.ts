import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { seekerProfileSchema, updateSeekerProfileSchema, createJobAlertSchema, updateJobAlertSchema, sendMessageSchema } from '@job-portal/shared';
import type { Bindings, Variables, SeekerProfileRow, ApplicationRow, JobRow, JobAlertRow, SavedJobRow, MessageRow } from '../types';
import { generateId } from '../utils/crypto';
import { authMiddleware, seekerOnly } from '../middleware/auth';

export const seekerRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All seeker routes require authentication
seekerRoutes.use('*', authMiddleware);

/**
 * GET /api/seekers/profile
 * Get current seeker's profile
 */
seekerRoutes.get('/profile', seekerOnly, async (c) => {
  const user = c.get('user')!;

  const profile = await c.env.DB.prepare(`
    SELECT * FROM seeker_profiles WHERE user_id = ?
  `).bind(user.id).first<SeekerProfileRow>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      id: profile.id,
      fullName: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      resumeUrl: profile.resume_url,
      avatarUrl: profile.avatar_url,
      phone: profile.phone,
      location: profile.location,
      workHistory: JSON.parse(profile.work_history),
      education: JSON.parse(profile.education),
      skills: JSON.parse(profile.skills),
      preferences: JSON.parse(profile.preferences),
      profileComplete: !!profile.profile_complete,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  });
});

/**
 * PUT /api/seekers/profile
 * Update seeker profile
 */
seekerRoutes.put('/profile', seekerOnly, zValidator('json', updateSeekerProfileSchema), async (c) => {
  const user = c.get('user')!;
  const input = c.req.valid('json');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.fullName !== undefined) { updates.push('full_name = ?'); values.push(input.fullName); }
  if (input.headline !== undefined) { updates.push('headline = ?'); values.push(input.headline || null); }
  if (input.bio !== undefined) { updates.push('bio = ?'); values.push(input.bio || null); }
  if (input.phone !== undefined) { updates.push('phone = ?'); values.push(input.phone || null); }
  if (input.location !== undefined) { updates.push('location = ?'); values.push(input.location || null); }
  if (input.workHistory !== undefined) { updates.push('work_history = ?'); values.push(JSON.stringify(input.workHistory)); }
  if (input.education !== undefined) { updates.push('education = ?'); values.push(JSON.stringify(input.education)); }
  if (input.skills !== undefined) { updates.push('skills = ?'); values.push(JSON.stringify(input.skills)); }
  if (input.preferences !== undefined) { updates.push('preferences = ?'); values.push(JSON.stringify(input.preferences)); }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'Bad Request', message: 'No fields to update' }, 400);
  }

  // Check if profile is complete
  const isComplete = !!(input.fullName || profile);
  updates.push('profile_complete = ?');
  values.push(isComplete ? 1 : 0);

  updates.push('updated_at = datetime("now")');
  values.push(profile.id);

  await c.env.DB.prepare(`UPDATE seeker_profiles SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return c.json({ success: true, message: 'Profile updated successfully' });
});

/**
 * GET /api/seekers/dashboard
 * Get seeker dashboard stats
 */
seekerRoutes.get('/dashboard', seekerOnly, async (c) => {
  const user = c.get('user')!;

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  // Get application stats
  const appStats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END) as reviewing,
      SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
      SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) as interview,
      SUM(CASE WHEN status = 'offered' THEN 1 ELSE 0 END) as offered,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM applications WHERE seeker_id = ?
  `).bind(profile.id).first<{
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    interview: number;
    offered: number;
    rejected: number;
  }>();

  // Get saved jobs count
  const savedCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM saved_jobs WHERE seeker_id = ?'
  ).bind(profile.id).first<{ count: number }>();

  // Get active alerts count
  const alertsCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM job_alerts WHERE seeker_id = ? AND is_active = 1'
  ).bind(profile.id).first<{ count: number }>();

  // Get recent applications
  const recentApps = await c.env.DB.prepare(`
    SELECT a.*, j.title, j.location, ep.company_name, ep.logo_url
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE a.seeker_id = ?
    ORDER BY a.applied_at DESC
    LIMIT 5
  `).bind(profile.id).all<ApplicationRow & {
    title: string;
    location: string | null;
    company_name: string;
    logo_url: string | null;
  }>();

  return c.json({
    success: true,
    data: {
      stats: {
        totalApplications: appStats?.total || 0,
        pending: appStats?.pending || 0,
        reviewing: appStats?.reviewing || 0,
        shortlisted: appStats?.shortlisted || 0,
        interview: appStats?.interview || 0,
        offered: appStats?.offered || 0,
        rejected: appStats?.rejected || 0,
        savedJobs: savedCount?.count || 0,
        activeAlerts: alertsCount?.count || 0,
      },
      recentApplications: recentApps.results.map((app) => ({
        id: app.id,
        jobId: app.job_id,
        jobTitle: app.title,
        location: app.location,
        companyName: app.company_name,
        companyLogo: app.logo_url,
        status: app.status,
        appliedAt: app.applied_at,
      })),
    },
  });
});

/**
 * GET /api/seekers/applications
 * Get seeker's applications
 */
seekerRoutes.get('/applications', seekerOnly, async (c) => {
  const user = c.get('user')!;
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '20');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  let sql = `
    SELECT a.*, j.title, j.location, j.location_type, j.salary_range, j.status as job_status,
           ep.company_name, ep.logo_url
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE a.seeker_id = ?
  `;
  const params: (string | number)[] = [profile.id];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  const countResult = await c.env.DB.prepare(
    sql.replace(/SELECT a\.\*, j\.title.*FROM/, 'SELECT COUNT(*) as total FROM')
  ).bind(...params).first<{ total: number }>();

  sql += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const result = await c.env.DB.prepare(sql).bind(...params).all<ApplicationRow & {
    title: string;
    location: string | null;
    location_type: string;
    salary_range: string;
    job_status: string;
    company_name: string;
    logo_url: string | null;
  }>();

  return c.json({
    success: true,
    data: {
      items: result.results.map((app) => ({
        id: app.id,
        status: app.status,
        coverLetter: app.cover_letter,
        appliedAt: app.applied_at,
        updatedAt: app.updated_at,
        job: {
          id: app.job_id,
          title: app.title,
          location: app.location,
          locationType: app.location_type,
          salaryRange: JSON.parse(app.salary_range),
          status: app.job_status,
        },
        employer: {
          companyName: app.company_name,
          logoUrl: app.logo_url,
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
 * DELETE /api/seekers/applications/:id
 * Withdraw an application
 */
seekerRoutes.delete('/applications/:id', seekerOnly, async (c) => {
  const user = c.get('user')!;
  const applicationId = c.req.param('id');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const app = await c.env.DB.prepare(
    'SELECT id, job_id FROM applications WHERE id = ? AND seeker_id = ?'
  ).bind(applicationId, profile.id).first<{ id: string; job_id: string }>();

  if (!app) {
    return c.json({ success: false, error: 'Not Found', message: 'Application not found' }, 404);
  }

  await c.env.DB.prepare(
    "UPDATE applications SET status = 'withdrawn', updated_at = datetime('now') WHERE id = ?"
  ).bind(applicationId).run();

  // Decrement application count
  await c.env.DB.prepare(
    'UPDATE jobs SET application_count = application_count - 1 WHERE id = ?'
  ).bind(app.job_id).run();

  return c.json({ success: true, message: 'Application withdrawn' });
});

/**
 * GET /api/seekers/applications/:id/messages
 * Get messages for an application
 */
seekerRoutes.get('/applications/:id/messages', seekerOnly, async (c) => {
  const user = c.get('user')!;
  const applicationId = c.req.param('id');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const app = await c.env.DB.prepare(
    'SELECT id FROM applications WHERE id = ? AND seeker_id = ?'
  ).bind(applicationId, profile.id).first();

  if (!app) {
    return c.json({ success: false, error: 'Not Found', message: 'Application not found' }, 404);
  }

  const messages = await c.env.DB.prepare(`
    SELECT * FROM messages WHERE application_id = ? ORDER BY created_at ASC
  `).bind(applicationId).all<MessageRow>();

  // Mark messages as read
  await c.env.DB.prepare(`
    UPDATE messages SET read = 1 WHERE application_id = ? AND sender_role = 'employer'
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
 * POST /api/seekers/applications/:id/messages
 * Send a message to employer
 */
seekerRoutes.post('/applications/:id/messages', seekerOnly, zValidator('json', sendMessageSchema.pick({ content: true })), async (c) => {
  const user = c.get('user')!;
  const applicationId = c.req.param('id');
  const { content } = c.req.valid('json');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const app = await c.env.DB.prepare(
    'SELECT id FROM applications WHERE id = ? AND seeker_id = ?'
  ).bind(applicationId, profile.id).first();

  if (!app) {
    return c.json({ success: false, error: 'Not Found', message: 'Application not found' }, 404);
  }

  const messageId = generateId();

  await c.env.DB.prepare(`
    INSERT INTO messages (id, application_id, sender_id, sender_role, content)
    VALUES (?, ?, ?, 'seeker', ?)
  `).bind(messageId, applicationId, user.id, content).run();

  return c.json({
    success: true,
    data: { id: messageId },
    message: 'Message sent successfully',
  }, 201);
});

/**
 * GET /api/seekers/saved-jobs
 * Get saved jobs
 */
seekerRoutes.get('/saved-jobs', seekerOnly, async (c) => {
  const user = c.get('user')!;
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '20');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const countResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as total FROM saved_jobs WHERE seeker_id = ?'
  ).bind(profile.id).first<{ total: number }>();

  const result = await c.env.DB.prepare(`
    SELECT s.*, j.title, j.location, j.location_type, j.salary_range, j.deadline, j.status,
           ep.company_name, ep.logo_url
    FROM saved_jobs s
    JOIN jobs j ON s.job_id = j.id
    JOIN employer_profiles ep ON j.employer_id = ep.id
    WHERE s.seeker_id = ?
    ORDER BY s.saved_at DESC
    LIMIT ? OFFSET ?
  `).bind(profile.id, pageSize, (page - 1) * pageSize).all<SavedJobRow & {
    title: string;
    location: string | null;
    location_type: string;
    salary_range: string;
    deadline: string;
    status: string;
    company_name: string;
    logo_url: string | null;
  }>();

  return c.json({
    success: true,
    data: {
      items: result.results.map((saved) => ({
        id: saved.id,
        savedAt: saved.saved_at,
        job: {
          id: saved.job_id,
          title: saved.title,
          location: saved.location,
          locationType: saved.location_type,
          salaryRange: JSON.parse(saved.salary_range),
          deadline: saved.deadline,
          status: saved.status,
        },
        employer: {
          companyName: saved.company_name,
          logoUrl: saved.logo_url,
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
 * GET /api/seekers/alerts
 * Get job alerts
 */
seekerRoutes.get('/alerts', seekerOnly, async (c) => {
  const user = c.get('user')!;

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const result = await c.env.DB.prepare(`
    SELECT * FROM job_alerts WHERE seeker_id = ? ORDER BY created_at DESC
  `).bind(profile.id).all<JobAlertRow>();

  return c.json({
    success: true,
    data: result.results.map((alert) => ({
      id: alert.id,
      name: alert.name,
      keywords: JSON.parse(alert.keywords),
      locations: JSON.parse(alert.locations),
      locationType: JSON.parse(alert.location_type),
      jobTypes: JSON.parse(alert.job_types),
      minSalary: alert.min_salary,
      salaryCurrency: alert.salary_currency,
      frequency: alert.frequency,
      isActive: !!alert.is_active,
      lastSentAt: alert.last_sent_at,
      createdAt: alert.created_at,
    })),
  });
});

/**
 * POST /api/seekers/alerts
 * Create a job alert
 */
seekerRoutes.post('/alerts', seekerOnly, zValidator('json', createJobAlertSchema), async (c) => {
  const user = c.get('user')!;
  const input = c.req.valid('json');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const alertId = generateId();

  await c.env.DB.prepare(`
    INSERT INTO job_alerts (id, seeker_id, name, keywords, locations, location_type, job_types, min_salary, salary_currency, frequency, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    alertId,
    profile.id,
    input.name,
    JSON.stringify(input.keywords || []),
    JSON.stringify(input.locations || []),
    JSON.stringify(input.locationType || []),
    JSON.stringify(input.jobTypes || []),
    input.minSalary || null,
    input.salaryCurrency || null,
    input.frequency || 'daily',
    input.isActive !== false ? 1 : 0
  ).run();

  return c.json({
    success: true,
    data: { id: alertId },
    message: 'Alert created successfully',
  }, 201);
});

/**
 * PUT /api/seekers/alerts/:id
 * Update a job alert
 */
seekerRoutes.put('/alerts/:id', seekerOnly, zValidator('json', updateJobAlertSchema), async (c) => {
  const user = c.get('user')!;
  const alertId = c.req.param('id');
  const input = c.req.valid('json');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  const alert = await c.env.DB.prepare(
    'SELECT id FROM job_alerts WHERE id = ? AND seeker_id = ?'
  ).bind(alertId, profile.id).first();

  if (!alert) {
    return c.json({ success: false, error: 'Not Found', message: 'Alert not found' }, 404);
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name); }
  if (input.keywords !== undefined) { updates.push('keywords = ?'); values.push(JSON.stringify(input.keywords)); }
  if (input.locations !== undefined) { updates.push('locations = ?'); values.push(JSON.stringify(input.locations)); }
  if (input.locationType !== undefined) { updates.push('location_type = ?'); values.push(JSON.stringify(input.locationType)); }
  if (input.jobTypes !== undefined) { updates.push('job_types = ?'); values.push(JSON.stringify(input.jobTypes)); }
  if (input.minSalary !== undefined) { updates.push('min_salary = ?'); values.push(input.minSalary || null); }
  if (input.salaryCurrency !== undefined) { updates.push('salary_currency = ?'); values.push(input.salaryCurrency || null); }
  if (input.frequency !== undefined) { updates.push('frequency = ?'); values.push(input.frequency); }
  if (input.isActive !== undefined) { updates.push('is_active = ?'); values.push(input.isActive ? 1 : 0); }

  if (updates.length === 0) {
    return c.json({ success: false, error: 'Bad Request', message: 'No fields to update' }, 400);
  }

  values.push(alertId);

  await c.env.DB.prepare(`UPDATE job_alerts SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return c.json({ success: true, message: 'Alert updated successfully' });
});

/**
 * DELETE /api/seekers/alerts/:id
 * Delete a job alert
 */
seekerRoutes.delete('/alerts/:id', seekerOnly, async (c) => {
  const user = c.get('user')!;
  const alertId = c.req.param('id');

  const profile = await c.env.DB.prepare(
    'SELECT id FROM seeker_profiles WHERE user_id = ?'
  ).bind(user.id).first<{ id: string }>();

  if (!profile) {
    return c.json({ success: false, error: 'Not Found', message: 'Profile not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM job_alerts WHERE id = ? AND seeker_id = ?'
  ).bind(alertId, profile.id).run();

  return c.json({ success: true, message: 'Alert deleted successfully' });
});

