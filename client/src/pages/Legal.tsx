import { LegalLayout } from '../components/LegalLayout'

export function Legal() {
  return (
    <LegalLayout title="Legal Disclaimer" version="0.2 (draft)" effectiveDate="[Insert date of publication]">
      <section>
        <h2>1. What this page is</h2>
        <p>
          This Legal Disclaimer, together with our <a href="/terms">Terms &amp; Conditions</a> and{' '}
          <a href="/privacy">Privacy Policy</a>, sets out the basis on which Connexus (<strong>Connexus OHS
          Consultants, ABN 80 423 515 887</strong>) makes its platform available to you. If anything here conflicts
          with the Terms &amp; Conditions, the Terms &amp; Conditions govern.
        </p>
      </section>

      <section>
        <h2>2. Connexus is not legal, WHS, or clinical advice</h2>
        <p>Nothing produced by or through the platform, including:</p>
        <ul>
          <li>hazard descriptions and control suggestions from the built-in reference library</li>
          <li>legislation and code-of-practice citations</li>
          <li>exported PDF reports</li>
        </ul>
        <p>
          constitutes legal advice, WHS consulting advice, HR or industrial relations advice, or clinical or
          psychological advice. Connexus is a software tool, not a qualified work health and safety consultant,
          employment lawyer, HR professional, or registered psychologist, and using it does not create an advisory
          or professional relationship between you and Connexus. Seek independent professional advice before making
          a decision that affects a worker's health, safety, or employment based on anything the platform produces.
        </p>
      </section>

      <section>
        <h2>3. What the platform does and doesn't do</h2>
        <p>Connexus gives you structured tools to:</p>
        <ul>
          <li>Record hazards against a reference library aligned to the model Work Health and Safety Act 2011 and Safe Work Australia's Managing Psychosocial Hazards at Work Code of Practice, plus, for Victoria (which sits outside the harmonised model WHS scheme), the Occupational Health and Safety (Psychological Health) Regulations 2025 and the associated WorkSafe Victoria compliance code</li>
          <li>Track actions, owners, and due dates arising from those hazards, and rate a hazard's risk again after controls are applied</li>
          <li>Log worker consultation records</li>
          <li>Export a PDF report, and cryptographically fingerprint an assessment once you close it</li>
        </ul>
        <p>
          Connexus does not review, audit, verify, or certify the accuracy of anything you or your team enter, and
          assessment quality depends entirely on the information put into it. Using the platform, including closing
          and sealing an assessment, does not by itself demonstrate or guarantee compliance with the Work Health and
          Safety Act, the psychosocial hazard regulations, or any code of practice or equivalent regulation in your
          state or territory. Those obligations rest on you as the person conducting a business or undertaking
          (PCBU), or as the relevant duty holder under Victoria's OHS Act, not on the software.
        </p>
      </section>

      <section>
        <h2>4. Currency of legislation content</h2>
        <p>
          We take reasonable care to keep the legislation and code-of-practice citations in the hazard library
          current, but this area of law has been moving quickly and differs by state and territory. Two changes
          worth knowing about specifically: from 1 July 2026, NSW's approved codes of practice, including the
          Managing Psychosocial Hazards at Work code, stop being advisory guidance and become a benchmark a PCBU
          must either follow or demonstrably meet or exceed by another method; and Victoria's Occupational Health
          and Safety (Psychological Health) Regulations 2025 took effect on 1 December 2025 with active WorkSafe
          Victoria enforcement. We don't guarantee that any citation in the platform reflects the current legal
          position at the moment you rely on it. Verify current requirements directly with your state or territory's
          WHS regulator, or with a qualified adviser, before relying on a citation.
        </p>
      </section>

      <section>
        <h2>5. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Connexus is not liable for any indirect or consequential loss
          arising from your use of the platform, or for the outcome of any WHS inquiry, regulatory action, or dispute
          connected to an assessment you conducted using it. Nothing in this page excludes, restricts, or modifies
          any guarantee, right, or remedy you have under the Australian Consumer Law that cannot lawfully be
          excluded. See our <a href="/terms">Terms &amp; Conditions</a> for the full limitation of liability clause.
        </p>
      </section>

      <section>
        <h2>6. Intellectual property</h2>
        <p>
          The Connexus platform, including its design, hazard library, control-hierarchy framework, report layout,
          and underlying code, belongs to us or our licensors and is protected by the Copyright Act 1968 (Cth). The
          assessment data you enter, your hazards, actions, and consultation records, remains yours; we don't claim
          ownership of it. See Section 5 (License &amp; usage) of our <a href="/terms">Terms &amp; Conditions</a> for
          what you can and can't do with the platform itself.
        </p>
      </section>

      <section>
        <h2>7. Third-party services</h2>
        <p>
          Connexus relies on third-party infrastructure to operate: <strong>Stripe</strong> for payment processing
          and <strong>Render</strong> for application hosting. We're not responsible for the availability, content,
          or practices of these or any other third-party service, including any external site you reach via a link
          from Connexus. Their own terms and privacy policies apply to your use of them. See our{' '}
          <a href="/privacy">Privacy Policy</a> for where these providers are located and what they can access.
        </p>
      </section>

      <section>
        <h2>8. Governing law</h2>
        <p>
          This page is governed by the laws of Australia, and you submit to the non-exclusive jurisdiction of
          Australian courts. See Section 10 of our <a href="/terms">Terms &amp; Conditions</a> for the full governing
          law and dispute resolution clause.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Questions about this page: <strong>contact@connexusohs.com.au</strong>.
        </p>
      </section>
    </LegalLayout>
  )
}
