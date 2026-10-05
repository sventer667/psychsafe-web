import { LegalLayout } from '../components/LegalLayout'

export function Support() {
  return (
    <LegalLayout title="Support Policy" version="1.0" effectiveDate="5 October 2026">
      <section>
        <h2>1. Purpose</h2>
        <p>
          This policy explains how to get help with Humanora, what you can expect from us, and what falls outside
          the scope of support. Humanora is a self-serve system of record for psychosocial workplace risk. We aim
          to be clear and honest about response times so you can plan around them.
        </p>
      </section>

      <section>
        <h2>2. How to contact support</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Email: <a href="mailto:contact@humanora.com.au">contact@humanora.com.au</a>. This is the only support
            channel. Please do not send support requests through social media or personal accounts.
          </li>
          <li>
            Include the email address on your Humanora account, your organisation name, the page or feature
            affected, what you expected to happen, what happened instead and a screenshot if possible.
          </li>
          <li>Never send your password, two-factor codes or recovery codes. We will never ask for them.</li>
        </ul>
      </section>

      <section>
        <h2>3. Support hours</h2>
        <p>
          Support is provided on business days (Monday to Friday, excluding Australian public holidays) between
          9:00 am and 5:00 pm Australian Eastern time. Requests received outside these hours are treated as
          received at the start of the next business day. We do not offer 24/7 or phone support.
        </p>
      </section>

      <section>
        <h2>4. Priorities and response targets</h2>
        <p>
          We assign a priority when we receive your request. The times below are targets measured in business
          hours or days, not guarantees, and apply to paid plans and active trials.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-ink">
                <th className="py-2 pr-4 font-medium">Priority</th>
                <th className="py-2 pr-4 font-medium">What it means</th>
                <th className="py-2 pr-4 font-medium">First response</th>
                <th className="py-2 font-medium">Target resolution or update</th>
              </tr>
            </thead>
            <tbody className="align-top text-muted">
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium text-ink">Critical</td>
                <td className="py-3 pr-4">
                  The service is down or unavailable to all users, or there is a suspected data loss or security
                  incident.
                </td>
                <td className="py-3 pr-4">Within 4 business hours</td>
                <td className="py-3">Updates at least every 4 business hours until resolved</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium text-ink">High</td>
                <td className="py-3 pr-4">
                  A core feature is broken for you (cannot sign in, create or export an assessment, or close and
                  seal one) and there is no workaround.
                </td>
                <td className="py-3 pr-4">Within 1 business day</td>
                <td className="py-3">Fix or workaround within 3 business days</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium text-ink">Normal</td>
                <td className="py-3 pr-4">
                  A feature is not working as expected but you can still do your work, or you have a billing or
                  account question.
                </td>
                <td className="py-3 pr-4">Within 2 business days</td>
                <td className="py-3">Within 10 business days</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-ink">Low</td>
                <td className="py-3 pr-4">General questions, how-to help and feature requests.</td>
                <td className="py-3 pr-4">Within 3 business days</td>
                <td className="py-3">Considered for future releases</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Critical incidents affecting all users will also be posted on a status notice on our website or by email
          to account owners where practical.
        </p>
      </section>

      <section>
        <h2>5. What is included</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Help signing in, resetting passwords and recovering two-factor authentication after identity verification.</li>
          <li>Help using features such as hazard libraries, action plans, consultation records, exports and sealing.</li>
          <li>Investigating and fixing faults in Humanora.</li>
          <li>Billing and plan questions, including invoices, plan changes and cancellations.</li>
          <li>Adding, removing and changing user seats within your plan.</li>
        </ul>
      </section>

      <section>
        <h2>6. What is not included</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Legal, regulatory or professional advice. Humanora is a tool that supports your risk management; it
            does not replace advice from a qualified WHS or legal professional, and results do not guarantee
            compliance.
          </li>
          <li>Consulting on how to rate a hazard or which controls to choose in your workplace.</li>
          <li>
            Custom development, bespoke reports, data migration from other systems or on-site training, unless
            agreed in writing.
          </li>
          <li>Problems caused by your own devices, browsers, networks or third-party software.</li>
        </ul>
      </section>

      <section>
        <h2>7. Account security and identity checks</h2>
        <p>
          To protect your data, we may ask you to confirm your identity before changing an account email,
          resetting two-factor authentication or sharing account information. Requests must come from the account
          owner or an administrator listed on the account. If we cannot verify the request, we will decline it.
        </p>
      </section>

      <section>
        <h2>8. Planned maintenance and outages</h2>
        <p>
          We aim to schedule maintenance outside business hours and to give notice by email where it is likely to
          affect you for more than a few minutes. We do not currently offer a formal uptime guarantee. If you need
          one, contact us before purchasing.
        </p>
      </section>

      <section>
        <h2>9. Data, backups and sealed assessments</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Sealed (closed) assessments cannot be edited. If a record was sealed in error, an administrator can
            reopen it with a recorded reason, and the reopen is kept in the audit trail.
          </li>
          <li>We cannot remove or alter sealed records or audit history on request.</li>
          <li>
            We will not access the content of your assessments except where needed to investigate a fault you
            have reported, to meet legal obligations, or with your permission.
          </li>
          <li>
            We take regular backups. Restoring individual customer data on request is not a standard service and
            is assessed case by case.
          </li>
        </ul>
      </section>

      <section>
        <h2>10. Security and privacy incidents</h2>
        <p>
          If you believe your account has been compromised or you have found a security issue, email{' '}
          <a href="mailto:contact@humanora.com.au">contact@humanora.com.au</a> with the subject &quot;Security&quot;
          as soon as possible. We treat these as Critical. If a data breach affecting your information occurs, we
          will assess it and notify affected customers and regulators as required by Australian privacy law.
        </p>
      </section>

      <section>
        <h2>11. Escalation and feedback</h2>
        <p>
          If you are unhappy with a response, reply to the same email with the word &quot;Escalate&quot; in the
          subject line and explain why. The founder will review it personally and reply within 2 business days.
          Your feedback helps us improve the product and this policy.
        </p>
      </section>

      <section>
        <h2>12. Customer responsibilities</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Keep your account details and user list current, and remove users who no longer need access.</li>
          <li>Keep your login details and two-factor devices secure.</li>
          <li>Provide the information we request promptly. Response targets pause while we wait for you.</li>
        </ul>
      </section>

      <section>
        <h2>13. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The current version and its effective date will be
          published on our website, and we will tell account owners about material changes.
        </p>
      </section>
    </LegalLayout>
  )
}
