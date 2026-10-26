import { config } from '../config.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(opts: EmailOptions): Promise<{ sent: boolean; reason?: string }> {
  // Try Resend first if configured
  if (config.mailerTransport === 'resend' && config.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.smtpFrom || 'Pehchaan <no-reply@pehchaan.local>',
          to: [opts.to],
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
        }),
      });
      if (res.ok) return { sent: true };
      // Log Resend's error response for debugging (no secrets)
      const errBody = await res.text().catch(() => '');
      console.warn(`[email] Resend error ${res.status}: ${errBody}`);
      return { sent: false, reason: `resend_error_${res.status}` };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[email] Resend exception: ${msg}`);
      return { sent: false, reason: 'resend_exception' };
    }
  }

  // Try SMTP if configured
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });
      await transporter.sendMail({
        from: config.smtpFrom || config.smtpUser,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      return { sent: true };
    } catch (e) {
      return { sent: false, reason: 'smtp_exception' };
    }
  }

  // No email configured - do not pretend to send
  return { sent: false, reason: 'not_configured' };
}
