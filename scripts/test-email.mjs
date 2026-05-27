/**
 * Run: node scripts/test-email.mjs your@email.com
 * Tests SMTP connectivity using the same credentials as the app.
 */
import { createTransport } from 'nodemailer'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// Parse .env.local manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = join(__dir, '..', '.env.local')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    env[key] = val
  }
  return env
}

const env = loadEnv()
const user = env.GMAIL_USER
const pass = env.GMAIL_APP_PASSWORD
const to = process.argv[2] || user

if (!user || !pass) {
  console.error('❌  GMAIL_USER or GMAIL_APP_PASSWORD missing from .env.local')
  process.exit(1)
}

console.log(`\nSMTP test`)
console.log(`  From : ${user}`)
console.log(`  To   : ${to}`)
console.log(`  Pass : ${pass.slice(0, 4)}...${pass.slice(-4)} (${pass.replace(/\s/g, '').length} chars without spaces)\n`)

const transport = createTransport({
  service: 'gmail',
  auth: { user, pass },
})

try {
  console.log('Verifying SMTP credentials…')
  await transport.verify()
  console.log('✅  SMTP connection OK — credentials accepted by Gmail\n')

  console.log(`Sending test email to ${to}…`)
  const info = await transport.sendMail({
    from: `"Curious Geeks Test" <${user}>`,
    to,
    subject: 'SMTP test — Curious Geeks',
    text: 'If you see this, Gmail SMTP is working correctly.',
    html: '<p>If you see this, Gmail SMTP is working correctly.</p>',
  })
  console.log(`✅  Email sent! Message ID: ${info.messageId}`)
  console.log(`    Check ${to} — also check your Spam folder.\n`)
} catch (err) {
  console.error('❌  SMTP error:\n')
  console.error(err.message)
  if (err.code === 'EAUTH') {
    console.error('\nAuth failure. Common causes:')
    console.error('  1. hello@curiousgeekspm.com needs 2-Step Verification enabled')
    console.error('  2. App Password must be generated from Google Account → Security → App passwords')
    console.error('  3. If using Google Workspace, check Admin Console → Security → Less secure apps')
    console.error('\n  Try logging in at mail.google.com with hello@curiousgeekspm.com first.')
  }
  process.exit(1)
}
