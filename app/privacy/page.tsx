import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Curious Geeks collects, uses, and protects your information.',
}

const LAST_UPDATED = 'May 27, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] px-6 pt-28 pb-24">
      <div className="max-w-[760px] mx-auto">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#8A8A85] hover:text-[#18181A] transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={14} weight="bold" />
          Back home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-[#18181A] tracking-tight leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#8A8A85]">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Card wrapper */}
        <div className="p-[6px] rounded-[1.75rem] bg-[#F5F1E8] border border-[#E8E4DC]">
          <div className="bg-white rounded-[calc(1.75rem_-_6px)] px-8 md:px-12 py-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <div className="prose max-w-none">

              <p>
                Curious Geeks ("we", "us", or "our") is a community platform for builders, makers, and
                curious people. This Privacy Policy explains what information we collect when you use
                curiousgeekspm.com, how we use it, and the choices you have.
              </p>

              <p>
                By using Curious Geeks, you agree to the collection and use of information described
                in this policy. If you disagree, please do not use the platform.
              </p>

              {/* ── 1 ── */}
              <h2>1. Information we collect</h2>

              <h3>Information you give us</h3>
              <ul>
                <li>
                  <strong>Membership application</strong> — when you join the community via our Tally
                  form, we collect your name and email address.
                </li>
                <li>
                  <strong>Product submissions</strong> — when you submit a product, we collect your
                  product details (name, description, URL, category) and your name as the maker.
                </li>
                <li>
                  <strong>Comments</strong> — any text you post in comment sections on product pages.
                  Comments are stored alongside your name and a timestamp.
                </li>
              </ul>

              <h3>Information collected automatically</h3>
              <ul>
                <li>
                  <strong>Usage data</strong> — pages visited, time spent, referral source, and
                  browser/device type. This is used in aggregate to understand how the community is
                  growing.
                </li>
                <li>
                  <strong>Log data</strong> — our hosting provider (Vercel) automatically records
                  standard server logs, including your IP address, request timestamps, and HTTP status
                  codes. Logs are retained for up to 30 days.
                </li>
                <li>
                  <strong>Cookies</strong> — see Section 5 below.
                </li>
              </ul>

              {/* ── 2 ── */}
              <h2>2. How we use your information</h2>
              <ul>
                <li>To review and approve your membership application.</li>
                <li>To review and approve product submissions before they go live.</li>
                <li>To display your submitted products and comments to the community.</li>
                <li>To send a one-time welcome email after your membership is approved.</li>
                <li>To monitor and improve the platform experience.</li>
                <li>To prevent spam, abuse, and violations of our community guidelines.</li>
              </ul>

              <p>
                We do <strong>not</strong> send newsletters or marketing emails. We do not use your
                data for advertising. We do not build interest profiles or sell data.
              </p>

              {/* ── 3 ── */}
              <h2>3. How we share your information</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We share
                data only in the following limited circumstances:
              </p>
              <ul>
                <li>
                  <strong>Service providers</strong> — we use third-party infrastructure to operate
                  the platform. Each provider only receives the data required to perform their service:
                  <ul>
                    <li><strong>Neon</strong> (neon.tech) — database hosting. Stores membership info, products, and comments.</li>
                    <li><strong>Tally</strong> (tally.so) — form collection for membership and product submissions.</li>
                    <li><strong>Vercel</strong> (vercel.com) — web hosting and edge delivery.</li>
                    <li><strong>Google Fonts</strong> — font delivery via CDN. Google may log the request; no personal data is sent beyond standard browser headers.</li>
                  </ul>
                </li>
                <li>
                  <strong>Legal requirements</strong> — we may disclose information if required to do
                  so by law or in response to valid legal process (court orders, subpoenas).
                </li>
                <li>
                  <strong>Protection of rights</strong> — we may share information to investigate,
                  prevent, or act on suspected illegal activity, fraud, or threats to safety.
                </li>
              </ul>

              {/* ── 4 ── */}
              <h2>4. Public information</h2>
              <p>
                The following information you submit is publicly visible to all visitors of Curious Geeks:
              </p>
              <ul>
                <li>Your product submissions (name, tagline, description, URL, category, maker name).</li>
                <li>Comments you post on product pages (name, comment text, date).</li>
              </ul>
              <p>
                Your email address is <strong>never</strong> displayed publicly.
              </p>

              {/* ── 5 ── */}
              <h2>5. Cookies</h2>
              <p>
                We use a minimal number of cookies:
              </p>
              <ul>
                <li>
                  <strong>Essential cookies</strong> — small files set by Next.js and Vercel for
                  routing and caching. These are required for the site to function and cannot be
                  disabled.
                </li>
                <li>
                  <strong>No tracking or advertising cookies</strong> — we do not use Google Analytics,
                  Meta Pixel, or any third-party analytics cookies.
                </li>
              </ul>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is
                being sent. Some parts of the platform may not function correctly if cookies are
                disabled.
              </p>

              {/* ── 6 ── */}
              <h2>6. Data retention</h2>
              <ul>
                <li>
                  <strong>Membership records</strong> — retained as long as your membership is active.
                  Email us to request deletion (see Section 8).
                </li>
                <li>
                  <strong>Products and comments</strong> — retained indefinitely as community content
                  unless you request removal.
                </li>
                <li>
                  <strong>Server logs</strong> — automatically deleted after 30 days by our hosting
                  provider.
                </li>
                <li>
                  <strong>Form submissions</strong> — retained in Tally until processed, then deleted
                  from the form provider. Approved data is migrated to our database.
                </li>
              </ul>

              {/* ── 7 ── */}
              <h2>7. Your rights</h2>
              <p>
                Depending on your location, you may have the following rights regarding your personal
                data:
              </p>
              <ul>
                <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
                <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Deletion</strong> — request that we delete your personal data ("right to be forgotten").</li>
                <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
                <li><strong>Objection</strong> — object to processing of your data in certain circumstances.</li>
                <li><strong>Withdrawal of consent</strong> — where processing is based on consent, you may withdraw it at any time.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at{' '}
                <a href="mailto:hello@curiousgeekspm.com">hello@curiousgeekspm.com</a>. We will respond
                within 30 days. We may ask you to verify your identity before processing a request.
              </p>

              {/* ── 8 ── */}
              <h2>8. Security</h2>
              <p>
                We take reasonable technical and organisational measures to protect your personal data
                against unauthorised access, alteration, disclosure, or destruction. These include
                encrypted connections (HTTPS/TLS), database access controls, and restricting data
                access to those who need it.
              </p>
              <p>
                No method of internet transmission or electronic storage is 100% secure. We cannot
                guarantee absolute security, but we will notify you promptly if a breach affects your
                personal data.
              </p>

              {/* ── 9 ── */}
              <h2>9. Children's privacy</h2>
              <p>
                Curious Geeks is not directed at children under the age of 13. We do not knowingly
                collect personal data from children. If you are a parent or guardian and believe your
                child has provided us with personal information, please contact us and we will delete
                it promptly.
              </p>

              {/* ── 10 ── */}
              <h2>10. Third-party links</h2>
              <p>
                Product submissions on Curious Geeks may link to external websites. We are not
                responsible for the privacy practices or content of those sites. We encourage you to
                review the privacy policies of any third-party sites you visit.
              </p>

              {/* ── 11 ── */}
              <h2>11. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will update the
                "Last updated" date at the top. For significant changes we will make reasonable efforts
                to notify community members. Continued use of the platform after changes constitutes
                acceptance of the revised policy.
              </p>

              {/* ── 12 ── */}
              <h2>12. Contact us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your
                personal data, please contact:
              </p>
              <ul>
                <li><strong>Divyaraj Murugan</strong> — Founder, Curious Geeks</li>
                <li>Email: <a href="mailto:hello@curiousgeekspm.com">hello@curiousgeekspm.com</a></li>
              </ul>

            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#8A8A85] text-center mt-8">
          Questions?{' '}
          <a href="mailto:hello@curiousgeekspm.com" className="text-[#F26B3A] hover:underline">
            Email us
          </a>
        </p>

      </div>
    </div>
  )
}
