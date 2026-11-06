import { LegalLayout } from '../components/LegalLayout'

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" version="1.2" effectiveDate="November 2026">
      <section>
        <h2>1. Scope</h2>
        <p>
          This policy explains how Humanora (<strong>ABN 80 423 515 887</strong>)
          collects, holds, uses, and discloses personal information through our website and platform. It's written
          to comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). Nothing here
          limits any right you have under the Privacy Act or the Australian Consumer Law that can't lawfully be
          excluded.
        </p>
      </section>

      <section>
        <h2>2. Who this policy is for</h2>
        <p>
          Humanora is self-service: the organisation that signs up is the organisation being assessed, there's no
          separate consultant-and-client layer. That means, in most cases, the organisation using Humanora is
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
          <li>If you enable two-factor authentication (required for admin accounts): an authenticator secret and bcrypt-hashed one-time backup codes</li>
          <li>Sign-in session details for each device signed in to your account: browser and operating system, IP address, and sign-in times. We also keep a record of the browser and operating system combinations you have signed in from, so we can email you when a new device signs in</li>
          <li>Your role in the organisation (admin, member, or read-only viewer)</li>
          <li>The name and email address of anyone an admin invites to join the organisation, including when many people are added at once from an uploaded CSV file, together with the invitation link we generate for them</li>
        </ul>
        <h3>Activity (audit) log</h3>
        <p>
          We keep a log of significant actions taken in each organisation's account so that organisations can see who
          did what. Each entry records the name of the user, the action (for example signing in, sealing, reopening
          or deleting an assessment, exporting a PDF report, inviting someone, importing data from a CSV file,
          changing a person's role, or changing the two-factor authentication requirement), a short detail (such as
          the assessment number, the invited person's email address, or the reason given for reopening a sealed
          assessment), the IP address the action came from, and the time. The log is recorded for every
          organisation. Admins of organisations on the Enterprise plan can view it and download it as a CSV file.
        </p>
        <h3>Assessment content</h3>
        <p>
          Whatever your organisation enters while running an assessment: hazard titles, categories, and free-text
          descriptions; action items, owners, and due dates; and consultation records (date, method, attendees, and
          a summary). These fields are free text, so depending on what you write, they can include a named worker
          and a description of a psychosocial hazard, incident, or their wellbeing. We treat this category as
          sensitive and apply the same access controls as account data; see Section 6.
        </p>
        <h3>Payment information</h3>
        <p>
          Payment is handled by Stripe. We receive your subscription plan and payment status from Stripe, we don't
          receive or store your card number.
        </p>
        <h3>Technical information</h3>
        <p>
          Our hosting providers automatically log standard web request data (IP address, requested URL,
          timestamp) for security and operational purposes, the same way any web host does. Our website's pages are served by Render (United States), and our application and database run in Australia (Sydney). Humanora doesn't run
          Google Analytics, advertising pixels, or any other third-party tracking or analytics tool, and doesn't set
          any cookies, your signed-in session is kept in your browser's session storage rather than a cookie, and is
          cleared when you close the tab or log out.
        </p>
      </section>

      <section>
        <h2>4. Why we collect and use it</h2>
        <ul>
          <li><strong>Service delivery</strong>: to create and run your account, store your assessments, and generate PDF reports</li>
          <li><strong>Payments</strong>: to manage your subscription and trial period via Stripe</li>
          <li><strong>Security and accountability</strong>: to authenticate sign-ins, support two-factor authentication, keep an activity log of who did what in an organisation's account, and investigate suspicious activity</li>
          <li><strong>Invitations</strong>: to email the people an admin invites to join the organisation, and to let the admin resend or revoke an invitation</li>
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
            <tr className="border-b border-border">
              <td className="py-2 pr-3 text-ink">Resend (email delivery)</td>
              <td className="py-2 pr-3">Name, email address and the content of emails we send you (for example Gap Check results, invitations, password resets and new-device sign-in alerts)</td>
              <td className="py-2 pr-3">Sending transactional emails</td>
              <td className="py-2">United States, delivered from Japan (Tokyo)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3 text-ink">Render (website hosting)</td>
              <td className="py-2 pr-3">IP address and standard request details of visitors to our website</td>
              <td className="py-2 pr-3">Serving the pages of our website</td>
              <td className="py-2">United States</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-3 text-ink">Microsoft 365 (email)</td>
              <td className="py-2 pr-3">Name, email address and content of emails you send to contact@humanora.com.au</td>
              <td className="py-2 pr-3">Receiving and answering support and general enquiries</td>
              <td className="py-2">Australia</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 text-ink">Cloud hosting provider</td>
              <td className="py-2 pr-3">The full application database, including assessment content</td>
              <td className="py-2 pr-3">Application hosting</td>
              <td className="py-2">Australia (Sydney)</td>
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
          Our application database, including all assessment content, is hosted on DigitalOcean infrastructure in
          Australia (Sydney), so that information is not sent overseas as part of hosting. Some service providers
          do handle limited personal information outside Australia:
        </p>
        <ul>
          <li>
            <strong>Render (United States).</strong> Serves our website pages and may log the IP address and basic
            request details of visitors.
          </li>
          <li>
            <strong>Stripe.</strong> Payments are processed by Stripe through its Australian entity, Stripe Payments
            Australia Pty Ltd. Stripe is a global provider and may process and store payment information in the
            United States and other countries, so the payment and billing details you provide may be handled outside
            Australia. We do not store your full card number.
          </li>
          <li>
            <strong>Resend (United States).</strong> Delivers our emails, which are sent from servers in Japan
            (Tokyo). Your name, email address and the content of emails we send you (such as Gap Check results,
            invitations, password resets and new-device sign-in alerts) are processed outside Australia. Resend
            stores its account and delivery records in the United States.
          </li>
        </ul>
        <p>
          Each of these providers states that it holds independent security attestations: Render and Resend publish
          SOC 2 Type II compliance, Stripe publishes SOC 2 and PCI DSS Level 1 certification, and DigitalOcean lists
          SOC 2 Type II and ISO 27001 for its Sydney data centre. Their detailed reports are generally available only
          on request or under NDA. We haven't independently audited these providers ourselves. We take reasonable
          steps, including contractual terms and the security measures described in Section 7, to make sure
          overseas providers handle your information consistently with the Australian Privacy Principles. If you
          need their current data-processing terms to meet your own compliance obligations, contact us (Section 11)
          and we'll point you to the relevant documentation.
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
          <li>Two-factor authentication (TOTP) is available on every account and required for admin accounts, with one-time backup codes stored as bcrypt hashes</li>
          <li>Organisations on the Enterprise plan can require two-factor authentication for every user (not only admins) and can give people a read-only viewer role that cannot change anything</li>
          <li>Significant actions are recorded in an activity log (see Section 3), so an organisation can review who did what</li>
          <li>Each account can be signed in on up to two devices at once, you can see and sign out your devices from the Security page, and we email you when your account is signed in from a new device</li>
          <li>All traffic between your browser and Humanora is encrypted in transit (HTTPS/TLS)</li>
          <li>Every API request is authenticated and scoped to your organisation, one organisation's data is never returned in response to another organisation's request</li>
          <li>Closed assessments are cryptographically fingerprinted (SHA-256), and every seal or reopen is permanently logged with who did it, when, and why, so a closed record's history can't be silently rewritten</li>
        </ul>
        <p>
          <strong>Backups:</strong> the server that holds our database is backed up weekly by our hosting provider.
          Because backups are weekly, changes made since the most recent backup could be lost in an infrastructure
          failure. We encourage you to keep your own export of any assessment you can't afford to lose (see the
          PDF export on each assessment's Export tab).
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
          by your employer, your employer (the Humanora account holder) is the data controller for that record, they
          decide what's collected and why, in the course of meeting their WHS obligations. Humanora stores and
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
          We keep your account and assessment data, including the activity log described in Section 3, for as long as your account is active. We don't currently run an
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
          If you think we've mishandled your personal information, email <strong>contact@humanora.com.au</strong> with
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
          <strong>Humanora</strong><br />
          ABN 80 423 515 887<br />
          Email: contact@humanora.com.au
        </p>
      </section>
    </LegalLayout>
  )
}
