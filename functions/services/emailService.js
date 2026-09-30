import nodemailer from 'nodemailer';

/**
 * Server-side Transactional Email Delivery Abstraction
 * Isolates email provider details (SMTP, Resend, SendGrid, Mailgun, etc.) from application logic.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to || typeof to !== 'string' || !to.trim() || !to.includes('@')) {
    const err = new Error('Invalid email recipient address provided.');
    err.status = 400;
    throw err;
  }

  const cleanRecipient = to.trim();
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'no-reply@farmhelper.app';
  const fromName = process.env.EMAIL_FROM_NAME || 'FarmHelper Weather Advisories';
  const fromHeader = `"${fromName}" <${fromAddress}>`;

  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_USERNAME;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || apiKey;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  console.log('[Email Service] Initiating email delivery', {
    to: cleanRecipient,
    subject,
    from: fromHeader,
    hasApiKey: Boolean(apiKey && apiKey.trim()),
    hasSmtpHost: Boolean(smtpHost && smtpHost.trim()),
  });

  // 1. Direct Resend API integration if RESEND_API_KEY or EMAIL_PROVIDER_API_KEY starting with 're_' is set
  if (apiKey && apiKey.startsWith('re_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromHeader,
          to: [cleanRecipient],
          subject: subject,
          html: html,
          text: text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `Resend API returned HTTP ${response.status}`);
      }

      console.log(`[Email Service] Delivered via Resend API. Message ID: ${data.id}`);
      return { success: true, provider: 'resend', messageId: data.id };
    } catch (err) {
      console.error('[Email Service Resend Failure]', err.message);
      throw err;
    }
  }

  // 2. Direct SendGrid API integration if EMAIL_PROVIDER_API_KEY starting with 'SG.' is set
  if (apiKey && apiKey.startsWith('SG.')) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: cleanRecipient }] }],
          from: { email: fromAddress, name: fromName },
          subject: subject,
          content: [
            { type: 'text/plain', value: text || '' },
            { type: 'text/html', value: html || '' },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid API returned HTTP ${response.status}: ${errorText}`);
      }

      const msgId = response.headers.get('x-message-id') || `sg_${Date.now()}`;
      console.log(`[Email Service] Delivered via SendGrid API. Message ID: ${msgId}`);
      return { success: true, provider: 'sendgrid', messageId: msgId };
    } catch (err) {
      console.error('[Email Service SendGrid Failure]', err.message);
      throw err;
    }
  }

  // 3. Nodemailer SMTP transport if SMTP_HOST or SMTP_USER/PASS is configured
  if (smtpHost || (smtpUser && smtpPass)) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromHeader,
        to: cleanRecipient,
        subject: subject,
        html: html,
        text: text,
      });

      console.log(`[Email Service] Delivered via SMTP (${smtpHost || 'custom'}). Message ID: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error('[Email Service SMTP Failure]', err.message);
      throw err;
    }
  }

  // 4. Production Safety Check: Throw explicit error if no provider credentials exist in production environment
  const isDevEnvironment =
    process.env.NODE_ENV === 'development' ||
    process.env.FUNCTIONS_EMULATOR === 'true';

  if (!isDevEnvironment) {
    const configError = new Error(
      'Email delivery failed: EMAIL_PROVIDER_API_KEY or SMTP configuration is missing or unconfigured in production environment.'
    );
    configError.status = 500;
    throw configError;
  }

  // 5. Development-only simulated fallback when running in local development / emulator
  console.warn(
    '[Email Service Dev Note] No live email credentials configured in functions/.env (EMAIL_PROVIDER_API_KEY or SMTP_HOST).\n' +
    `  Simulating email delivery for local development testing:\n` +
    `  To: ${cleanRecipient}\n` +
    `  Subject: ${subject}\n` +
    `  From: ${fromHeader}`
  );

  return {
    success: true,
    provider: 'simulated_dev',
    simulated: true,
    messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
  };
}
