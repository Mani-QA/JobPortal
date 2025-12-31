/**
 * Email Service
 * 
 * This module provides email notification functionality for the job portal.
 * It's designed to be easily integrated with various email providers:
 * - SendGrid
 * - Mailgun
 * - AWS SES
 * - Resend
 * - Postmark
 * 
 * For Cloudflare Workers, you can also use:
 * - Cloudflare Email Workers (for sending emails from Workers)
 * - External API calls to email providers
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | ArrayBuffer;
  contentType: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type EmailTemplate =
  | 'welcome'
  | 'verify-email'
  | 'password-reset'
  | 'application-received'
  | 'application-status-update'
  | 'new-applicant'
  | 'job-alert'
  | 'interview-scheduled';

export interface TemplateData {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Email Service Class
 * Handles all email-related functionality
 */
export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private provider: 'sendgrid' | 'mailgun' | 'resend' | 'console';

  constructor(config: {
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
    provider?: 'sendgrid' | 'mailgun' | 'resend' | 'console';
  }) {
    this.apiKey = config.apiKey || '';
    this.fromEmail = config.fromEmail || 'noreply@jobportal.com';
    this.fromName = config.fromName || 'JobPortal';
    this.provider = config.provider || 'console';
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    const from = options.from || `${this.fromName} <${this.fromEmail}>`;

    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid({ ...options, from });
        case 'mailgun':
          return await this.sendWithMailgun({ ...options, from });
        case 'resend':
          return await this.sendWithResend({ ...options, from });
        case 'console':
        default:
          return this.logToConsole({ ...options, from });
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send using SendGrid
   */
  private async sendWithSendGrid(options: EmailOptions & { from: string }): Promise<EmailResult> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(options.to) 
            ? options.to.map(email => ({ email })) 
            : [{ email: options.to }],
        }],
        from: { email: this.fromEmail, name: this.fromName },
        subject: options.subject,
        content: [
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          ...(options.html ? [{ type: 'text/html', value: options.html }] : []),
        ],
      }),
    });

    if (response.ok) {
      return { success: true, messageId: response.headers.get('X-Message-Id') || undefined };
    } else {
      const errorData = await response.json();
      return { success: false, error: JSON.stringify(errorData) };
    }
  }

  /**
   * Send using Mailgun
   */
  private async sendWithMailgun(options: EmailOptions & { from: string }): Promise<EmailResult> {
    // Mailgun requires form data
    const formData = new FormData();
    formData.append('from', options.from);
    formData.append('to', Array.isArray(options.to) ? options.to.join(',') : options.to);
    formData.append('subject', options.subject);
    if (options.text) formData.append('text', options.text);
    if (options.html) formData.append('html', options.html);

    const response = await fetch(`https://api.mailgun.net/v3/YOUR_DOMAIN/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${this.apiKey}`)}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, messageId: data.id };
    } else {
      const errorData = await response.json();
      return { success: false, error: JSON.stringify(errorData) };
    }
  }

  /**
   * Send using Resend
   */
  private async sendWithResend(options: EmailOptions & { from: string }): Promise<EmailResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, messageId: data.id };
    } else {
      const errorData = await response.json();
      return { success: false, error: JSON.stringify(errorData) };
    }
  }

  /**
   * Log email to console (for development)
   */
  private logToConsole(options: EmailOptions & { from: string }): EmailResult {
    console.log('='.repeat(50));
    console.log('📧 EMAIL NOTIFICATION (Development Mode)');
    console.log('='.repeat(50));
    console.log('From:', options.from);
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('-'.repeat(50));
    if (options.text) console.log('Text:', options.text);
    if (options.html) console.log('HTML:', options.html.substring(0, 500) + '...');
    console.log('='.repeat(50));
    
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  /**
   * Send a templated email
   */
  async sendTemplate(
    template: EmailTemplate,
    to: string | string[],
    data: TemplateData
  ): Promise<EmailResult> {
    const { subject, html, text } = this.renderTemplate(template, data);
    return this.send({ to, subject, html, text });
  }

  /**
   * Render an email template
   */
  private renderTemplate(template: EmailTemplate, data: TemplateData): {
    subject: string;
    html: string;
    text: string;
  } {
    const templates: Record<EmailTemplate, { subject: string; html: string; text: string }> = {
      'welcome': {
        subject: `Welcome to JobPortal, ${data.name}!`,
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Welcome to JobPortal! 🎉</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi ${data.name},
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for joining JobPortal! We're excited to have you on board.
          </p>
          ${data.role === 'job_seeker' ? `
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Start exploring thousands of job opportunities and find your dream job today.
            </p>
          ` : `
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Start posting jobs and find the perfect candidates for your team.
            </p>
          `}
          <a href="${data.dashboardUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Go to Dashboard
          </a>
        `),
        text: `Welcome to JobPortal!\n\nHi ${data.name},\n\nThank you for joining JobPortal! We're excited to have you on board.\n\nVisit your dashboard: ${data.dashboardUrl}`,
      },

      'verify-email': {
        subject: 'Verify your email address',
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Verify Your Email</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Please click the button below to verify your email address.
          </p>
          <a href="${data.verifyUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Verify Email
          </a>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            This link expires in 24 hours. If you didn't create an account, you can ignore this email.
          </p>
        `),
        text: `Verify your email address\n\nPlease click the link below to verify your email:\n${data.verifyUrl}\n\nThis link expires in 24 hours.`,
      },

      'password-reset': {
        subject: 'Reset your password',
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Reset Your Password</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <a href="${data.resetUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
          </p>
        `),
        text: `Reset your password\n\nClick the link below to reset your password:\n${data.resetUrl}\n\nThis link expires in 1 hour.`,
      },

      'application-received': {
        subject: `Application received for ${data.jobTitle}`,
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Application Received! ✅</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi ${data.applicantName},
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been received.
          </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Position</p>
            <p style="margin: 4px 0 0; color: #1f2937; font-weight: 600;">${data.jobTitle}</p>
          </div>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We'll notify you when the employer reviews your application.
          </p>
          <a href="${data.applicationUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Application
          </a>
        `),
        text: `Application Received!\n\nHi ${data.applicantName},\n\nYour application for ${data.jobTitle} at ${data.companyName} has been received.\n\nView your application: ${data.applicationUrl}`,
      },

      'application-status-update': {
        subject: `Application update: ${data.jobTitle}`,
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Application Status Update</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi ${data.applicantName},
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been updated.
          </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">New Status</p>
            <p style="margin: 4px 0 0; color: #1f2937; font-weight: 600;">${data.status}</p>
          </div>
          <a href="${data.applicationUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Details
          </a>
        `),
        text: `Application Status Update\n\nHi ${data.applicantName},\n\nYour application for ${data.jobTitle} has been updated to: ${data.status}\n\nView details: ${data.applicationUrl}`,
      },

      'new-applicant': {
        subject: `New application for ${data.jobTitle}`,
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">New Application Received! 📩</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            You have received a new application for <strong>${data.jobTitle}</strong>.
          </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Applicant</p>
            <p style="margin: 4px 0 0; color: #1f2937; font-weight: 600;">${data.applicantName}</p>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">${data.applicantEmail}</p>
          </div>
          <a href="${data.applicantUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Review Application
          </a>
        `),
        text: `New Application Received!\n\nYou have a new application for ${data.jobTitle}.\n\nApplicant: ${data.applicantName} (${data.applicantEmail})\n\nReview: ${data.applicantUrl}`,
      },

      'job-alert': {
        subject: `${data.jobCount} new jobs matching your criteria`,
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">New Jobs for You! 🔔</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi ${data.name},
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We found <strong>${data.jobCount} new jobs</strong> matching your job alert criteria.
          </p>
          <a href="${data.jobsUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Jobs
          </a>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            <a href="${data.unsubscribeUrl}" style="color: #9ca3af;">Manage your job alerts</a>
          </p>
        `),
        text: `New Jobs for You!\n\nHi ${data.name},\n\nWe found ${data.jobCount} new jobs matching your criteria.\n\nView jobs: ${data.jobsUrl}`,
      },

      'interview-scheduled': {
        subject: `Interview scheduled for ${data.jobTitle}`,
        html: this.wrapInLayout(`
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Interview Scheduled! 📅</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hi ${data.applicantName},
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Great news! An interview has been scheduled for your application to <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong>.
          </p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Date & Time</p>
            <p style="margin: 4px 0 0; color: #1f2937; font-weight: 600;">${data.interviewDate}</p>
            ${data.interviewLocation ? `
              <p style="margin: 12px 0 0; color: #6b7280; font-size: 14px;">Location</p>
              <p style="margin: 4px 0 0; color: #1f2937; font-weight: 600;">${data.interviewLocation}</p>
            ` : ''}
          </div>
          <a href="${data.applicationUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View Details
          </a>
        `),
        text: `Interview Scheduled!\n\nHi ${data.applicantName},\n\nAn interview has been scheduled for ${data.jobTitle} at ${data.companyName}.\n\nDate: ${data.interviewDate}\n${data.interviewLocation ? `Location: ${data.interviewLocation}\n` : ''}\nView details: ${data.applicationUrl}`,
      },
    };

    return templates[template];
  }

  /**
   * Wrap content in a consistent email layout
   */
  private wrapInLayout(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JobPortal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #4f46e5;">JobPortal</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} JobPortal. All rights reserved.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="#" style="color: #6b7280; text-decoration: none;">Privacy Policy</a> · 
                <a href="#" style="color: #6b7280; text-decoration: none;">Terms of Service</a> · 
                <a href="#" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

/**
 * Create email service instance
 */
export function createEmailService(env: {
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_PROVIDER?: 'sendgrid' | 'mailgun' | 'resend' | 'console';
}): EmailService {
  return new EmailService({
    apiKey: env.EMAIL_API_KEY,
    fromEmail: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME,
    provider: env.EMAIL_PROVIDER || 'console',
  });
}

/**
 * Email notification hooks - call these from your routes
 */
export const EmailNotifications = {
  /**
   * Send welcome email after registration
   */
  async sendWelcomeEmail(
    emailService: EmailService,
    user: { email: string; name: string; role: string },
    dashboardUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('welcome', user.email, {
      name: user.name,
      role: user.role,
      dashboardUrl,
    });
  },

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    emailService: EmailService,
    email: string,
    verifyUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('verify-email', email, { verifyUrl });
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    emailService: EmailService,
    email: string,
    resetUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('password-reset', email, { resetUrl });
  },

  /**
   * Notify applicant that application was received
   */
  async sendApplicationReceivedEmail(
    emailService: EmailService,
    applicant: { email: string; name: string },
    job: { title: string; companyName: string },
    applicationUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('application-received', applicant.email, {
      applicantName: applicant.name,
      jobTitle: job.title,
      companyName: job.companyName,
      applicationUrl,
    });
  },

  /**
   * Notify applicant of status change
   */
  async sendApplicationStatusUpdateEmail(
    emailService: EmailService,
    applicant: { email: string; name: string },
    job: { title: string; companyName: string },
    status: string,
    applicationUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('application-status-update', applicant.email, {
      applicantName: applicant.name,
      jobTitle: job.title,
      companyName: job.companyName,
      status,
      applicationUrl,
    });
  },

  /**
   * Notify employer of new applicant
   */
  async sendNewApplicantEmail(
    emailService: EmailService,
    employer: { email: string },
    job: { title: string },
    applicant: { name: string; email: string },
    applicantUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('new-applicant', employer.email, {
      jobTitle: job.title,
      applicantName: applicant.name,
      applicantEmail: applicant.email,
      applicantUrl,
    });
  },

  /**
   * Send job alert email
   */
  async sendJobAlertEmail(
    emailService: EmailService,
    user: { email: string; name: string },
    jobCount: number,
    jobsUrl: string,
    unsubscribeUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('job-alert', user.email, {
      name: user.name,
      jobCount,
      jobsUrl,
      unsubscribeUrl,
    });
  },

  /**
   * Send interview scheduled notification
   */
  async sendInterviewScheduledEmail(
    emailService: EmailService,
    applicant: { email: string; name: string },
    job: { title: string; companyName: string },
    interview: { date: string; location?: string },
    applicationUrl: string
  ): Promise<EmailResult> {
    return emailService.sendTemplate('interview-scheduled', applicant.email, {
      applicantName: applicant.name,
      jobTitle: job.title,
      companyName: job.companyName,
      interviewDate: interview.date,
      interviewLocation: interview.location,
      applicationUrl,
    });
  },
};

