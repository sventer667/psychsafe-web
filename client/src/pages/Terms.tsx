import { LegalLayout } from '../components/LegalLayout'

export function Terms() {
  return (
    <LegalLayout title="Terms & Conditions" version="0.1 (draft)" effectiveDate="August 2026">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These terms govern access to and use of Connexus, provided by{' '}
          <strong>Connexus OHS, ABN 80 423 515 887</strong> ("Connexus", "we", "us"). By creating
          an account, you agree to these terms on behalf of yourself and, if you're signing up for an organisation,
          on behalf of that organisation. If you don't agree, don't create an account or use the platform.
        </p>
      </section>

      <section>
        <h2>2. The service</h2>
        <p>
          Connexus is a web application for recording, tracking, and reporting on workplace psychosocial hazards,
          associated actions, and worker consultation, against a built-in reference library aligned to Australian
          WHS psychosocial hazard regulations. See our <a href="/legal">Legal Disclaimer</a> for what the platform
          does and doesn't do, it is a documentation tool, not a compliance guarantee or a source of legal advice.
        </p>
      </section>

      <section>
        <h2>3. Accounts and trial</h2>
        <p>
          New accounts start with a 7-day free trial. At the end of the trial, continued access requires an active
          paid subscription; if none is added, the account and its data are retained but write access is suspended
          until a plan is selected. You're responsible for the accuracy of the information you provide when signing
          up and for keeping your login credentials confidential. You're responsible for activity carried out under
          your account, including by anyone you invite to your organisation.
        </p>
      </section>

      <section>
        <h2>4. Plans, pricing, and billing</h2>
        <p>
          Connexus is offered on Starter, Growth, and Enterprise plans, billed per seat. Current pricing is shown on
          our pricing page and may change; we'll give existing subscribers at least [Insert notice period, e.g. 30
          days] notice before a price change takes effect on their account. Payment is processed by Stripe; we don't
          store your card details. Subscriptions renew automatically for the same billing period unless cancelled
          before the renewal date. Fees are non-refundable except where required by law or expressly stated
          otherwise, [Insert refund policy specifics, if any].
        </p>
      </section>

      <section>
        <h2>5. License and usage restrictions</h2>
        <p>
          Subject to these terms, we grant your organisation a non-exclusive, non-transferable licence to access and
          use Connexus for your own internal WHS and HR purposes for as long as your subscription is active. You must
          not: resell, sublicense, or provide platform access to anyone outside your organisation; reverse-engineer,
          decompile, or attempt to extract the source code; use the platform to build a competing product; or use it
          in a way that breaches any law, including by entering information you're not authorised to enter about
          another person.
        </p>
      </section>

      <section>
        <h2>6. Your assessment data</h2>
        <p>
          You own the hazard, action, and consultation data you enter into Connexus. We don't claim ownership of it,
          and we don't use it to train any model or share it with any other customer. You're responsible for having
          a lawful basis to enter personal information about your workers, see our <a href="/privacy">Privacy
          Policy</a> for how we handle that data on your behalf. Once an assessment is closed and sealed, its content
          is cryptographically fingerprinted; reopening it requires a stated reason, which is permanently logged
          alongside the seal it replaces, so a sealed record's history remains visible even after correction.
        </p>
      </section>

      <section>
        <h2>7. Availability and support</h2>
        <p>
          We aim to keep Connexus available at all times but don't guarantee uninterrupted access. Scheduled
          maintenance and issues with third-party infrastructure (see our <a href="/privacy">Privacy Policy</a> for
          the providers we rely on) can cause downtime. We don't currently offer a service-level agreement with
          uptime credits; if you need one, contact us to discuss an Enterprise arrangement.
        </p>
      </section>

      <section>
        <h2>8. Limitation of liability</h2>
        <p>
          Nothing in these terms excludes, restricts, or modifies any consumer guarantee, right, or remedy you have
          under the Australian Consumer Law that cannot lawfully be excluded. Subject to that, to the maximum extent
          permitted by law: Connexus is provided "as is"; we exclude all warranties not expressly stated in these
          terms; and our total liability arising out of or in connection with these terms, however caused, is limited
          to the fees you paid us in the 12 months before the claim arose. We're not liable for indirect or
          consequential loss, including loss connected to a WHS regulatory inquiry, prosecution, or dispute relating
          to an assessment you conducted using the platform, that responsibility sits with you as the person
          conducting a business or undertaking, not with Connexus as a software provider.
        </p>
      </section>

      <section>
        <h2>9. Indemnity</h2>
        <p>
          You agree to indemnify us against any loss, claim, or expense arising from your breach of these terms or
          your misuse of the platform, including entering information you weren't authorised to enter, except to the
          extent caused by our own breach or negligence.
        </p>
      </section>

      <section>
        <h2>10. Termination and cancellation</h2>
        <p>
          You can cancel your subscription at any time; access continues until the end of the current billing
          period, with no partial refund for the unused portion. We can suspend or terminate an account for material
          breach of these terms, non-payment, or unlawful use, with notice where practicable. We don't currently run
          an automated data-deletion process after cancellation, your data remains stored, though write access is
          suspended, until you ask us to delete it (see our <a href="/privacy">Privacy Policy</a>, Section 9).
        </p>
      </section>

      <section>
        <h2>11. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. We'll post the updated version here with a new effective
          date, and for material changes, notify account holders by email before the change takes effect.
        </p>
      </section>

      <section>
        <h2>12. Governing law and disputes</h2>
        <p>
          These terms are governed by the laws of Australia, and each party submits to the non-exclusive
          jurisdiction of Australian courts. Before commencing formal proceedings, both parties agree to first try
          to resolve a dispute in good faith by direct discussion.
        </p>
      </section>

      <section>
        <h2>13. Severability and entire agreement</h2>
        <p>
          If any part of these terms is found unenforceable, the rest continues in effect. These terms, together with
          our <a href="/legal">Legal Disclaimer</a> and <a href="/privacy">Privacy Policy</a>, are the entire
          agreement between you and us regarding the platform, and replace any prior discussions or agreements on the
          subject.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          <strong>Connexus</strong><br />
          Connexus OHS, ABN 80 423 515 887<br />
          Email: contact@connexusohs.com.au
        </p>
      </section>
    </LegalLayout>
  )
}
