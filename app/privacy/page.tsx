export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">Effective Date: February 25, 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Vazivo operates a booking platform connecting customers with beauty and wellness service providers. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
            <li><strong>Profile Information:</strong> Profile photo, preferences, saved addresses</li>
            <li><strong>Booking Information:</strong> Service selections, appointment dates and times, special requests</li>
            <li><strong>Payment Information:</strong> Credit card details, billing address (processed through secure third-party payment processors)</li>
            <li><strong>Communications:</strong> Messages, customer support inquiries, reviews and ratings</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Usage Data:</strong> Pages viewed, features used, search queries, booking history</li>
            <li><strong>Location Data:</strong> Approximate location based on IP address</li>
            <li><strong>Cookies:</strong> We use cookies and similar technologies to track activity</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Process and manage bookings</li>
            <li>Facilitate communication between customers and providers</li>
            <li>Send booking confirmations, reminders, and updates</li>
            <li>Process payments and prevent fraud</li>
            <li>Provide customer support</li>
            <li>Personalize your experience and recommend services</li>
            <li>Analyze usage and improve our platform</li>
            <li>Send marketing communications (with consent)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">4.1 With Service Providers</h3>
          <p className="mb-4">
            When you book an appointment, we share necessary information with the service provider to fulfill your booking.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.2 With Service Partners</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Payment processors (Stripe, PayPal)</li>
            <li>Email service providers (SendGrid)</li>
            <li>Analytics providers</li>
            <li>Cloud hosting services</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.3 For Legal Reasons</h3>
          <p className="mb-4">
            We may disclose information if required by law or to protect our rights and safety.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">5. Email Communications</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Transactional Emails</h3>
          <p className="mb-4">
            We send essential transactional emails that cannot be disabled:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Booking confirmations and receipts</li>
            <li>Appointment reminders</li>
            <li>Cancellation notifications</li>
            <li>Password reset and security alerts</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Marketing Emails</h3>
          <p className="mb-4">
            You can opt out of marketing emails at any time via the unsubscribe link or your account settings.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p className="mb-4">We implement security measures including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and password hashing</li>
            <li>Regular security audits</li>
            <li>Access controls and employee training</li>
            <li>PCI-DSS compliant payment processing</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Account information: Until deletion, plus 90 days</li>
            <li>Booking history: 7 years for legal compliance</li>
            <li>Marketing data: Until you unsubscribe</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Access:</strong> View and update your information in account settings</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Request a copy of your data</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
            <li><strong>Cookies:</strong> Manage preferences through browser settings</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="mb-4">
            Our services are not intended for individuals under 18. We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">10. International Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in other countries with appropriate safeguards in place.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this policy and will notify you of material changes by email or platform notice.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">12. Regional Rights</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">California Residents (CCPA)</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Right to know what information is collected</li>
            <li>Right to deletion</li>
            <li>Right to opt-out of sale (we do not sell data)</li>
            <li>Right to non-discrimination</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">European Residents (GDPR)</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Right of access and rectification</li>
            <li>Right to erasure</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Right to lodge a complaint</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="mb-2"><strong>Email:</strong> privacy@vazivo.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
