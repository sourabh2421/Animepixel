import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                By accessing and using Animeprix, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on Animeprix for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on Animeprix</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
              <p className="text-gray-400 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Billing</h2>
              <p className="text-gray-400 leading-relaxed">
                By subscribing to Animeprix, you agree to pay the subscription fees as indicated. Subscriptions automatically renew unless cancelled. You may cancel your subscription at any time from your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Content Usage</h2>
              <p className="text-gray-400 leading-relaxed">
                All content on Animeprix is protected by copyright and other intellectual property laws. You may not download, copy, or distribute any content without explicit permission from the content owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                In no event shall Animeprix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Animeprix.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                Animeprix may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

