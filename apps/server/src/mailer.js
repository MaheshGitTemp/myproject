// Swappable email sender. In dev (EMAIL_DRIVER=console) it prints the message to
// the terminal so no real email account is needed. In prod set EMAIL_DRIVER=smtp
// with the SMTP_* vars (e.g. Gmail app password). Moving to a provider like
// Brevo/SES later is a config change here, not across the app.
import nodemailer from 'nodemailer';
import { config } from './config.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.secure,
    auth: config.email.smtp.user
      ? { user: config.email.smtp.user, pass: config.email.smtp.pass }
      : undefined,
  });
  return transporter;
}

/**
 * Send an email. Honors EMAIL_DRIVER.
 * @param {{ to: string, subject: string, text: string, html?: string }} msg
 */
export async function sendMail({ to, subject, text, html }) {
  const from = `"${config.email.fromName}" <${config.email.fromAddress}>`;

  if (config.email.driver === 'console') {
    console.log('\n==================== EMAIL (dev console) ====================');
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('-------------------------------------------------------------');
    console.log(text);
    // Surface any 6-digit code on its own banner line so it is unmistakable in
    // the backend terminal during local dev (OTP flows).
    const codeMatch = String(subject + ' ' + text).match(/\b(\d{4,8})\b/);
    if (codeMatch) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log(`>>>>  OTP CODE: ${codeMatch[1]}  (${to})`);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    }
    console.log('=============================================================\n');
    return { driver: 'console' };
  }

  const info = await getTransporter().sendMail({ from, to, subject, text, html });
  return { driver: 'smtp', messageId: info.messageId };
}

/** Convenience wrapper for OTP emails. */
export async function sendOtpEmail(to, code, purpose) {
  const purposeText =
    purpose === 'reset' ? 'reset your password'
      : purpose === 'login' ? 'sign in'
        : 'verify your email';
  const subject = `Your Telugu Sambandham verification code: ${code}`;
  const text =
    `Your one-time code to ${purposeText} is: ${code}\n\n`
    + `This code expires in ${config.otp.ttlMinutes} minutes.\n`
    + `If you did not request this, you can ignore this email.\n\n`
    + `— Telugu Sambandham`;
  return sendMail({ to, subject, text });
}
