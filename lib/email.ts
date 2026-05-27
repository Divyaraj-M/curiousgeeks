import nodemailer from 'nodemailer'

function getTransport() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD is not set')
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

// GMAIL_FROM lets you show hello@curiousgeekspm.com as the sender
// while authenticating as the real account (GMAIL_USER)
const FROM = `"Curious Geeks" <${process.env.GMAIL_FROM ?? process.env.GMAIL_USER}>`
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://curiousgeekspm.com'

export async function sendWelcomeEmail({ name, email }: { name: string; email: string }) {
  const transport = getTransport()
  await transport.sendMail({
    from: FROM,
    to: email,
    subject: "You're in — Welcome to Curious Geeks",
    html: `
      <div style="font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#FAFAF6;padding:40px 32px;border-radius:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
          <span style="font-size:22px;font-weight:700;color:#18181A;letter-spacing:-0.025em">Curious Geeks</span>
        </div>

        <h1 style="font-size:28px;font-weight:600;color:#18181A;margin:0 0 12px;letter-spacing:-0.025em">
          Hey ${name}, you're in.
        </h1>
        <p style="font-size:16px;color:#8A8A85;line-height:1.6;margin:0 0 24px">
          Welcome to Curious Geeks — a small community for people who build things and pay attention.
        </p>

        <div style="background:#F5F1E8;border:1px solid #E8E4DC;border-radius:16px;padding:24px;margin-bottom:32px">
          <p style="font-size:14px;color:#3A3A3C;margin:0 0 16px;font-weight:500">What you can do now:</p>
          <ul style="margin:0;padding:0 0 0 16px;font-size:14px;color:#3A3A3C;line-height:2">
            <li>Share products you've built with the community</li>
            <li>Leave comments on other members' products</li>
            <li>Read writing from people who notice things</li>
          </ul>
        </div>

        <a href="${SITE}/products/submit"
           style="display:inline-block;background:#18181A;color:#FAFAF6;text-decoration:none;border-radius:100px;padding:12px 24px;font-size:14px;font-weight:500">
          Share your first product →
        </a>

        <p style="font-size:12px;color:#8A8A85;margin-top:40px;border-top:1px solid #E8E4DC;padding-top:20px">
          You're receiving this because you joined Curious Geeks at ${SITE}.
          No newsletters, ever — just this one welcome.
        </p>
      </div>
    `,
    text: `Hey ${name}, you're in!\n\nWelcome to Curious Geeks.\n\nShare your first product: ${SITE}/products/submit\n\n— The Curious Geeks community`,
  })
}

export async function sendOtpEmail({ email, code }: { email: string; code: string }) {
  const transport = getTransport()
  await transport.sendMail({
    from: FROM,
    to: email,
    subject: `${code} — your Curious Geeks sign-in code`,
    html: `
      <div style="font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#FAFAF6;padding:40px 32px;border-radius:20px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#18181A;letter-spacing:-0.025em">Curious Geeks</span>
        </div>

        <p style="font-size:16px;color:#3A3A3C;margin:0 0 24px;line-height:1.6">
          Here's your sign-in code. It expires in 10 minutes.
        </p>

        <div style="background:#F5F1E8;border:1px solid #E8E4DC;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px">
          <span style="font-size:40px;font-weight:700;letter-spacing:0.15em;color:#18181A;font-family:monospace">
            ${code}
          </span>
        </div>

        <p style="font-size:13px;color:#8A8A85;line-height:1.6;margin:0">
          If you didn't request this, you can safely ignore this email.
          Someone may have entered your email address by mistake.
        </p>
      </div>
    `,
    text: `Your Curious Geeks sign-in code is: ${code}\n\nExpires in 10 minutes. If you didn't request this, ignore this email.`,
  })
}

export async function sendPasswordResetEmail({ email, token }: { email: string; token: string }) {
  const transport = getTransport()
  const resetUrl = `${SITE}/reset-password?token=${token}`
  await transport.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your Curious Geeks password',
    html: `
      <div style="font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#FAFAF6;padding:40px 32px;border-radius:20px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#18181A;letter-spacing:-0.025em">Curious Geeks</span>
        </div>
        <p style="font-size:16px;color:#3A3A3C;margin:0 0 24px;line-height:1.6">
          We received a request to reset your password. Click the button below — the link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#18181A;color:#FAFAF6;text-decoration:none;border-radius:100px;padding:12px 24px;font-size:14px;font-weight:500;margin-bottom:24px">
          Reset password →
        </a>
        <p style="font-size:13px;color:#8A8A85;line-height:1.6;margin:0">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </p>
      </div>
    `,
    text: `Reset your Curious Geeks password:\n\n${resetUrl}\n\nExpires in 1 hour. If you didn't request this, ignore this email.`,
  })
}

export async function sendSignupOtpEmail({ email, code }: { email: string; code: string }) {
  const transport = getTransport()
  await transport.sendMail({
    from: FROM,
    to: email,
    subject: `${code} — confirm your Curious Geeks account`,
    html: `
      <div style="font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#FAFAF6;padding:40px 32px;border-radius:20px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#18181A;letter-spacing:-0.025em">Curious Geeks</span>
        </div>
        <p style="font-size:16px;color:#3A3A3C;margin:0 0 8px;line-height:1.6">
          Almost there! Enter this code to confirm your email and finish creating your account.
        </p>
        <p style="font-size:13px;color:#8A8A85;margin:0 0 24px">Expires in 10 minutes.</p>
        <div style="background:#F5F1E8;border:1px solid #E8E4DC;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
          <span style="font-size:40px;font-weight:700;letter-spacing:0.15em;color:#18181A;font-family:monospace">
            ${code}
          </span>
        </div>
        <p style="font-size:13px;color:#8A8A85;line-height:1.6;margin:0">
          If you didn't try to create a Curious Geeks account, ignore this email.
        </p>
      </div>
    `,
    text: `Your Curious Geeks confirmation code: ${code}\n\nExpires in 10 minutes.`,
  })
}
