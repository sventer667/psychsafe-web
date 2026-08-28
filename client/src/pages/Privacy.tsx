import { LegalLayout } from '../components/LegalLayout'

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" version="0.1 (draft)" effectiveDate="August 2026">
      <section>
        <h2>1. Scope</h2>
        <p>
          This policy explains how Connexus (<strong>Connexus OHS, ABN 80 423 515 887</strong>)
          collects, holds, uses, and discloses personal information through our website and platform. It's written
          to comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). Nothing here
          limits any right you have under the Privacy Act or the Australian Consumer Law that can't lawfully be
          excluded.
        </p>
      </section>

      <section>
        <h2>2. Who this policy is for</h2>
        <p>
          Connexus is self-service: the organisation that signs up is the organisation being assessed, there's no
          separate consultant-and-client layer. That means, in most cases, the organisation using Connexus is
          already the employer of the workers described in its own hazard, action, and consultation records, and
          this policy is written primarily for that organisation and the people it invites as users. Section 8 below
          covers the position of a worker whose information appears in a record entered by someone else at their
          employer.
        </p>
      </section>

      <section>
        <h2>3. Information we collect</h2>
        <h3>Account and organisation information</h3>
        <ul>
          <li>Your name, email address, and password (stored as a bcrypt hash, we never see or store your plaintext password)</li>
          <li>Your organisation's name, industry, state or territory, and business unit</li>
          <li>If you enable two-factor authentication: an encrypted authenticator secret and bcrypt-hashed one-time backup codes</li>
        </ul>
        <h3>Assessment content</h3>
        <p>
          Whatever your organisation enters while running an assessment: hazard titles, categories, and free-text
          descriptions; action items, owners, and due dates; and consultation records (date, method, attendees, and
          a summary). These fields are free text, so depending on what you write, they can include a named worker
          and a description of a psychosocial hazard, incident, or their wellbeing. We treat this category as
          sensitive and apply the same access controls as account data; see Section 6.
        </p>
        <h3>Billing information</h3>
        <p>
          Payment is handled by Stripe. We receive your subscription plan and payment status from Stripe, we don't
          receive or store your card number.
        </p>
        <h3>Technical information</h3>
        <p>
          Our hosting provider, Render, automatically logs standard web request data (IP address, requested URL,
          timestamp) for security and operational purposes, the same way any web host does. Connexus doesn't run
          Google Analytics, advertising pixels, or any other third-party tracking or analytics tool, and doesn't set
          any cookies, your signed-in session is kept in your browser's session storage rather than a cookie, and is
          cleared when you close the tab or log out.
        </p>
      </section>

      <section>
        <h2>4. Why we collect and use it</h2>
        <ul>
          <li><strong>Service delivery</strong>: to create and run your account, store your assessments, and generate PDF reports</li>
          <li><strong>Billing</strong>: to manage your subscription and trial period via Stripe</li>
          <li><strong>Security</strong>: to authenticate sign-ins, support two-factor authentication, and investigate suspicious activity</li>
          <li><strong>Support</strong>: to respond if you contact us with a question or issue</li>
          <li><strong>Legal and accounting obligations</strong>: to keep records the law requires us to keep, such as financial records</li>
        </ul>
        <p>We don't use assessment content for advertising, and we don't sell or rent personal information.</p>
      </section>

      <section>
        <h2>5. Who we disclose information to</h2>
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border text-ink">
              <th className="py-2 pr-3">Service</th>
              <th className="py-2 pr-3">What it can access</th>
              <th className="py-2 pr-3">Purpose</th>
              <th className="py-2">Location</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-3 text-ink">Stripe</td>
              <td className="py-2 pr-3">Name, email, payment amount and status</td>
              <td className="py-2 pr-3">Payment processing</td>
              <td className="py-2">United States</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 text-ink">Render</td>
              <td className="py-2 pr-3">The full application database, including assessment content</td>
              <td className="py-2 pr-3">Application hosting</td>
              <td className="py-2">United States (Oregon)</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3">
          We don't currently use any AI service, email marketing platform, or analytics provider, so none of your
          information is shared with one. If that changes, we'll update this page and, for any material change,
          notify account holders directly.
        </p>
      </section>

      <section>
        <h2>6. Overseas disclosure (Australian Privacy Principle 8)</h2>
        <p>
          Both Stripe and Render, our only two service providers, are based in the United States, so your
          information, including assessment content stored in our database, is held on infrastructure located
          outside Australia rather than within it. We haven't independently verified the specific privacy
          certifications each provider holds; before publishing this policy, confirm current data-processing terms
          directly with each provider and record them here.
        </p>
        <p>
          You can ask us what information about you has been disclosed overseas, or object to a specific disclosure,
          by contacting us (Section 11). If you believe your information hasn't been adequately protected, you can
          complain to us or to the Office of the Australian Information Commissioner (OAIC).
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>Measures currently in place:</p>
        <ul>
          <li>Passwords are hashed with bcrypt and never stored or logged in plaintext</li>
          <li>Optional two-factor authentication (TOTP) is available on every account, with one-time backup codes stored as bcrypt hashes</li>
          <li>All traffic between your browser and Connexus is encrypted in transit (HTTPS/TLS)</li>
          <li>Every API request is authenticated and scoped to your organisation, one organisation's data is never returned in response to another organisation's request</li>
          <li>Closed assessments are cryptographically fingerprinted (SHA-256), and every seal or reopen is permanently logged with who did it, when, and why, so a closed record's history can't be silently rewritten</li>
        </ul>
        <p>
          <strong>Current gap:</strong> Connexus doesn't yet run automated, scheduled backups of the underlying
          database. This should be resolved (an attached persistent disk with a backup schedule) before this policy
          promises backup practices to customers. Until then, avoid claiming automated backups in the published
          version of this page.
        </p>
        <p>
          If we become aware of a data breach likely to result in serious harm, we'll notify affected account holders
          and, where required, the OAIC, in line with the Notifiable Data Breaches scheme.
        </p>
      </section>

      <section>
        <h2>8. Rights of a worker described in someone else's record</h2>
        <p>
          If you're a worker whose name or circumstances appear in a hazard, action, or consultation record entered
          by your employer, your employer (the Connexus account holder) is the data controller for that record, they
          decide what's collected and why, in the course of meeting their WHS obligations. Connexus stores and
          processes it on their behalf.
        </p>
        <p>
          If you want to see or correct information held about you, we suggest asking your employer directly first,
          they hold the context and can usually respond fastest. If you'd rather not, or don't know who to ask,
          contact us (Section 11) with enough detail to identify the record, and we'll pass your request to the
          account holder and ask them to respond within 30 days.
        </p>
        <p>
          If a record has already been closed and sealed, a correction is added as a dated, attributed entry
          alongside the original (see the seal history feature described in Section 7) rather than by silently
          rewriting it, so an inaccurate entry can always be corrected without erasing the record of what was
          originally said and when.
        </p>
      </section>

      <section>
        <h2>9. Data retention and deletion</h2>
        <p>
          We keep your account and assessment data for as long as your account is active. We don't currently run an
          automated deletion pipeline for cancelled accounts, if you cancel and want your data deleted rather than
          simply left inactive, contact us (Section 11) and we'll action it manually. Financial records are kept for
          as long as Australian tax law requires (currently seven years).
        </p>
      </section>

      <section>
        <h2>10. Your rights</h2>
        <p>Under the Australian Privacy Principles, you can ask us to:</p>
        <ul>
          <li><strong>Access</strong> a copy of the personal information we hold about you</li>
          <li><strong>Correct</strong> information that's inaccurate or out of date</li>
          <li><strong>Delete</strong> your information, subject to what we're legally required to keep (Section 9)</li>
          <li><strong>Explain</strong> who we've disclosed your information to, including overseas (Section 6)</li>
        </ul>
        <p>Email us (Section 11) and we'll respond within 30 days, or explain why we need more time.</p>
      </section>

      <section>
        <h2>11. Complaints</h2>
        <p>
          If you think we've mishandled your personal information, email <strong>contact@connexusohs.com.au</strong> with
          details. We'll acknowledge your complaint within 5 business days and aim to resolve it within 30 days. If
          you're not satisfied with our response, you can complain to the OAIC at oaic.gov.au, free of charge.
        </p>
      </section>

      <section>
        <h2>12. Changes to this policy</h2>
        <p>
          We may update this policy as the platform or our legal obligations change. We'll post the updated version
          here with a new effective date, and for material changes, email account holders directly.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          <strong>Connexus</strong><br />
          Connexus OHS, ABN 80 423 515 887<br />
          Email: contact@connexusohs.com.au
        </p>
      </section>
    </LegalLayout>
  )
}
