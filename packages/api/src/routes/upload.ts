import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { presignedUrlRequestSchema } from '@job-portal/shared';
import type { Bindings, Variables } from '../types';
import { generateId } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';
import { rateLimitPresets } from '../middleware/rateLimit';

export const uploadRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// All upload routes require authentication and rate limiting
uploadRoutes.use('*', authMiddleware);
uploadRoutes.use('*', rateLimitPresets.upload);

/**
 * POST /api/upload/presigned-url
 * Get a presigned URL for direct upload to R2
 */
uploadRoutes.post('/presigned-url', zValidator('json', presignedUrlRequestSchema), async (c) => {
  const user = c.get('user')!;
  const { filename, contentType, purpose, fileSize } = c.req.valid('json');

  // Validate purpose based on user role
  if (purpose === 'logo' && user.role !== 'employer' && user.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Only employers can upload logos' },
      403
    );
  }

  if ((purpose === 'resume' || purpose === 'avatar') && user.role !== 'seeker' && user.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Only job seekers can upload resumes' },
      403
    );
  }

  // Generate unique key
  const ext = filename.split('.').pop() || '';
  const uniqueId = generateId(12);
  const key = `${purpose}s/${user.id}/${uniqueId}.${ext}`;

  // For R2, we'll use a different approach since R2 doesn't support presigned URLs directly
  // Instead, we return upload instructions for multipart upload through our API
  const uploadToken = generateId(32);
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

  // In a production app, you'd store this token temporarily for validation
  // For now, we'll include the metadata in the response

  return c.json({
    success: true,
    data: {
      uploadUrl: `/api/upload/${purpose}`,
      key,
      uploadToken,
      expiresAt,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: getAllowedContentTypes(purpose),
    },
  });
});

/**
 * POST /api/upload/resume
 * Upload a resume file
 */
uploadRoutes.post('/resume', async (c) => {
  const user = c.get('user')!;

  if (user.role !== 'seeker' && user.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Only job seekers can upload resumes' },
      403
    );
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'No file provided' },
      400
    );
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'Invalid file type. Allowed: PDF, DOC, DOCX' },
      400
    );
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'File size must be less than 5MB' },
      400
    );
  }

  // Generate unique key
  const ext = file.name.split('.').pop() || 'pdf';
  const uniqueId = generateId(12);
  const key = `resumes/${user.id}/${uniqueId}.${ext}`;

  // Upload to R2
  try {
    await c.env.STORAGE.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        userId: user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update user profile with resume URL
    const publicUrl = `/api/upload/files/${key}`;
    
    await c.env.DB.prepare(
      'UPDATE seeker_profiles SET resume_url = ?, updated_at = datetime("now") WHERE user_id = ?'
    ).bind(publicUrl, user.id).run();

    return c.json({
      success: true,
      data: {
        key,
        url: publicUrl,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      },
      message: 'Resume uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      { success: false, error: 'Internal Server Error', message: 'Failed to upload file' },
      500
    );
  }
});

/**
 * POST /api/upload/logo
 * Upload a company logo
 */
uploadRoutes.post('/logo', async (c) => {
  const user = c.get('user')!;

  if (user.role !== 'employer' && user.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Only employers can upload logos' },
      403
    );
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'No file provided' },
      400
    );
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
      400
    );
  }

  // Validate file size (2MB for images)
  if (file.size > 2 * 1024 * 1024) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'File size must be less than 2MB' },
      400
    );
  }

  // Generate unique key
  const ext = file.type.split('/')[1] || 'png';
  const uniqueId = generateId(12);
  const key = `logos/${user.id}/${uniqueId}.${ext}`;

  // Upload to R2
  try {
    await c.env.STORAGE.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        userId: user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update employer profile with logo URL
    const publicUrl = `/api/upload/files/${key}`;
    
    await c.env.DB.prepare(
      'UPDATE employer_profiles SET logo_url = ?, updated_at = datetime("now") WHERE user_id = ?'
    ).bind(publicUrl, user.id).run();

    return c.json({
      success: true,
      data: {
        key,
        url: publicUrl,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      },
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      { success: false, error: 'Internal Server Error', message: 'Failed to upload file' },
      500
    );
  }
});

/**
 * POST /api/upload/avatar
 * Upload a profile avatar
 */
uploadRoutes.post('/avatar', async (c) => {
  const user = c.get('user')!;

  if (user.role !== 'seeker' && user.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Only job seekers can upload avatars' },
      403
    );
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'No file provided' },
      400
    );
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
      400
    );
  }

  // Validate file size (1MB for avatars)
  if (file.size > 1024 * 1024) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'File size must be less than 1MB' },
      400
    );
  }

  // Generate unique key
  const ext = file.type.split('/')[1] || 'png';
  const uniqueId = generateId(12);
  const key = `avatars/${user.id}/${uniqueId}.${ext}`;

  // Upload to R2
  try {
    await c.env.STORAGE.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        userId: user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update seeker profile with avatar URL
    const publicUrl = `/api/upload/files/${key}`;
    
    await c.env.DB.prepare(
      'UPDATE seeker_profiles SET avatar_url = ?, updated_at = datetime("now") WHERE user_id = ?'
    ).bind(publicUrl, user.id).run();

    return c.json({
      success: true,
      data: {
        key,
        url: publicUrl,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      },
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      { success: false, error: 'Internal Server Error', message: 'Failed to upload file' },
      500
    );
  }
});

/**
 * GET /api/upload/files/*
 * Serve uploaded files from R2
 */
uploadRoutes.get('/files/*', async (c) => {
  const key = c.req.path.replace('/api/upload/files/', '');

  try {
    const object = await c.env.STORAGE.get(key);

    if (!object) {
      return c.json({ success: false, error: 'Not Found', message: 'File not found' }, 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag);

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('File retrieval error:', error);
    return c.json(
      { success: false, error: 'Internal Server Error', message: 'Failed to retrieve file' },
      500
    );
  }
});

/**
 * DELETE /api/upload/files/*
 * Delete an uploaded file
 */
uploadRoutes.delete('/files/*', async (c) => {
  const user = c.get('user')!;
  const key = c.req.path.replace('/api/upload/files/', '');

  // Verify ownership (file path should contain user ID)
  if (!key.includes(user.id) && user.role !== 'admin') {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Not authorized to delete this file' },
      403
    );
  }

  try {
    await c.env.STORAGE.delete(key);
    return c.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    return c.json(
      { success: false, error: 'Internal Server Error', message: 'Failed to delete file' },
      500
    );
  }
});

// Helper function
function getAllowedContentTypes(purpose: string): string[] {
  switch (purpose) {
    case 'resume':
      return [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
    case 'logo':
    case 'avatar':
      return ['image/jpeg', 'image/png', 'image/webp'];
    default:
      return [];
  }
}

