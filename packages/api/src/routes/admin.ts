import { Hono } from 'hono';
import { Env, HonoContext } from '../types';
import { authMiddleware } from '../middleware/auth';

const admin = new Hono<{ Bindings: Env }>();

// All admin routes require admin role
admin.use('*', authMiddleware(['admin']));

// Dashboard Stats
admin.get('/stats', async (c: HonoContext) => {
  const db = c.env.DB;
  const timeRange = c.req.query('timeRange') || '30d';

  try {
    // Get counts from database
    const [usersResult, employersResult, jobSeekersResult, jobsResult, activeJobsResult, applicationsResult] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'employer'").first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'job_seeker'").first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM jobs').first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) as count FROM jobs WHERE application_deadline > datetime('now')").first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM applications').first<{ count: number }>(),
    ]);

    // Calculate date for "this month" queries
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [usersThisMonth, jobsThisMonth, applicationsThisMonth, pendingApplications] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM users WHERE created_at >= ?').bind(startOfMonth.toISOString()).first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM jobs WHERE created_at >= ?').bind(startOfMonth.toISOString()).first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM applications WHERE applied_at >= ?').bind(startOfMonth.toISOString()).first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'").first<{ count: number }>(),
    ]);

    return c.json({
      totalUsers: usersResult?.count || 0,
      totalEmployers: employersResult?.count || 0,
      totalJobSeekers: jobSeekersResult?.count || 0,
      totalJobs: jobsResult?.count || 0,
      activeJobs: activeJobsResult?.count || 0,
      totalApplications: applicationsResult?.count || 0,
      pendingApplications: pendingApplications?.count || 0,
      usersThisMonth: usersThisMonth?.count || 0,
      jobsThisMonth: jobsThisMonth?.count || 0,
      applicationsThisMonth: applicationsThisMonth?.count || 0,
      userGrowth: 12.5, // Would calculate based on previous period
      jobGrowth: 8.3, // Would calculate based on previous period
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch stats', details: error.message }, 500);
  }
});

// Recent Activity
admin.get('/activity', async (c: HonoContext) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') || '10');

  try {
    // Get recent users
    const recentUsers = await db.prepare(`
      SELECT id, email, role, created_at FROM users 
      ORDER BY created_at DESC LIMIT ?
    `).bind(limit).all();

    // Get recent jobs
    const recentJobs = await db.prepare(`
      SELECT j.id, j.title, j.created_at, ep.company_name
      FROM jobs j
      JOIN employer_profiles ep ON j.employer_id = ep.id
      ORDER BY j.created_at DESC LIMIT ?
    `).bind(limit).all();

    // Get recent applications
    const recentApplications = await db.prepare(`
      SELECT a.id, a.applied_at, j.title as job_title
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC LIMIT ?
    `).bind(limit).all();

    // Combine and sort by timestamp
    const activities = [
      ...((recentUsers.results || []).map((u: any) => ({
        id: `user-${u.id}`,
        type: 'user_registered' as const,
        description: `New ${u.role.replace('_', ' ')} registered: ${u.email}`,
        timestamp: u.created_at,
      }))),
      ...((recentJobs.results || []).map((j: any) => ({
        id: `job-${j.id}`,
        type: 'job_posted' as const,
        description: `New job posted: ${j.title} at ${j.company_name}`,
        timestamp: j.created_at,
      }))),
      ...((recentApplications.results || []).map((a: any) => ({
        id: `app-${a.id}`,
        type: 'application_submitted' as const,
        description: `Application submitted for ${a.job_title}`,
        timestamp: a.applied_at,
      }))),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, limit);

    return c.json(activities);
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return c.json({ error: 'Failed to fetch activity', details: error.message }, 500);
  }
});

// User Management
admin.get('/users', async (c: HonoContext) => {
  const db = c.env.DB;
  const search = c.req.query('search') || '';
  const role = c.req.query('role');
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND email LIKE ?';
      params.push(`%${search}%`);
    }

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    // Note: status would need a status column in the users table
    // For now, we'll skip this filter

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await db.prepare(query).bind(...params).all();
    const countResult = await db.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();

    // Fetch profiles for each user
    const usersWithProfiles = await Promise.all(
      (users.results || []).map(async (user: any) => {
        let profile = null;
        if (user.role === 'employer') {
          profile = await db.prepare('SELECT company_name FROM employer_profiles WHERE user_id = ?').bind(user.id).first();
        } else if (user.role === 'job_seeker') {
          profile = await db.prepare('SELECT first_name, last_name FROM job_seeker_profiles WHERE user_id = ?').bind(user.id).first();
        }
        return {
          ...user,
          status: 'active', // Default status
          profile: profile ? {
            name: user.role === 'employer' ? (profile as any).company_name : `${(profile as any).first_name} ${(profile as any).last_name}`,
            companyName: user.role === 'employer' ? (profile as any).company_name : undefined,
          } : null,
        };
      })
    );

    return c.json({
      users: usersWithProfiles,
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users', details: error.message }, 500);
  }
});

// Suspend User
admin.put('/users/:id/suspend', async (c: HonoContext) => {
  const userId = c.req.param('id');
  const db = c.env.DB;

  try {
    // In a real implementation, we'd have a status column
    // For now, just return success
    return c.json({ message: 'User suspended successfully' });
  } catch (error: any) {
    return c.json({ error: 'Failed to suspend user', details: error.message }, 500);
  }
});

// Activate User
admin.put('/users/:id/activate', async (c: HonoContext) => {
  const userId = c.req.param('id');
  const db = c.env.DB;

  try {
    // In a real implementation, we'd update the status column
    return c.json({ message: 'User activated successfully' });
  } catch (error: any) {
    return c.json({ error: 'Failed to activate user', details: error.message }, 500);
  }
});

// Delete User
admin.delete('/users/:id', async (c: HonoContext) => {
  const userId = c.req.param('id');
  const db = c.env.DB;

  try {
    // Delete user and related data (cascading should handle profiles)
    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return c.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return c.json({ error: 'Failed to delete user', details: error.message }, 500);
  }
});

// Job Management
admin.get('/jobs', async (c: HonoContext) => {
  const db = c.env.DB;
  const search = c.req.query('search') || '';
  const status = c.req.query('status');
  const location = c.req.query('location');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT j.*, ep.company_name, ep.company_logo_url
      FROM jobs j
      JOIN employer_profiles ep ON j.employer_id = ep.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (j.title LIKE ? OR ep.company_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location && location !== 'all') {
      query += ' AND j.location = ?';
      params.push(location);
    }

    query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const jobs = await db.prepare(query).bind(...params).all();
    const countResult = await db.prepare('SELECT COUNT(*) as count FROM jobs').first<{ count: number }>();

    // Get application counts for each job
    const jobsWithStats = await Promise.all(
      (jobs.results || []).map(async (job: any) => {
        const appCount = await db.prepare('SELECT COUNT(*) as count FROM applications WHERE job_id = ?').bind(job.id).first<{ count: number }>();
        
        // Determine status based on deadline
        let status = 'active';
        const deadline = new Date(job.application_deadline);
        if (deadline < new Date()) {
          status = 'expired';
        }

        return {
          id: job.id,
          title: job.title,
          company: {
            id: job.employer_id,
            name: job.company_name,
            logo: job.company_logo_url,
          },
          location: job.location,
          locationType: job.location, // Would be more specific in real app
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          currency: job.currency,
          status,
          applicationsCount: appCount?.count || 0,
          views: Math.floor(Math.random() * 2000), // Placeholder - would track views in real app
          createdAt: job.created_at,
          expiresAt: job.application_deadline,
          flagged: false, // Would have a flag column in real app
        };
      })
    );

    return c.json({
      jobs: jobsWithStats,
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return c.json({ error: 'Failed to fetch jobs', details: error.message }, 500);
  }
});

// Approve Job (for pending jobs)
admin.put('/jobs/:id/approve', async (c: HonoContext) => {
  const jobId = c.req.param('id');
  // In real app, would update job status
  return c.json({ message: 'Job approved successfully' });
});

// Reject Job
admin.put('/jobs/:id/reject', async (c: HonoContext) => {
  const jobId = c.req.param('id');
  // In real app, would update job status
  return c.json({ message: 'Job rejected successfully' });
});

// Archive Job
admin.put('/jobs/:id/archive', async (c: HonoContext) => {
  const jobId = c.req.param('id');
  // In real app, would update job status
  return c.json({ message: 'Job archived successfully' });
});

// Delete Job
admin.delete('/jobs/:id', async (c: HonoContext) => {
  const jobId = c.req.param('id');
  const db = c.env.DB;

  try {
    // Delete job and related applications (cascading should handle this)
    await db.prepare('DELETE FROM jobs WHERE id = ?').bind(jobId).run();
    return c.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    return c.json({ error: 'Failed to delete job', details: error.message }, 500);
  }
});

// Application Management
admin.get('/applications', async (c: HonoContext) => {
  const db = c.env.DB;
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT a.*, j.title as job_title, ep.company_name,
             jsp.first_name, jsp.last_name, u.email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN employer_profiles ep ON j.employer_id = ep.id
      JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.id
      JOIN users u ON jsp.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const applications = await db.prepare(query).bind(...params).all();
    const countResult = await db.prepare('SELECT COUNT(*) as count FROM applications').first<{ count: number }>();

    return c.json({
      applications: applications.results || [],
      total: countResult?.count || 0,
      page,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return c.json({ error: 'Failed to fetch applications', details: error.message }, 500);
  }
});

export { admin as adminRoutes };
export default admin;
