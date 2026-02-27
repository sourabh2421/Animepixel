import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-cr-dark">
      <Navbar />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p className="text-gray-400 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Animeprix uses cookies for several purposes:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly, including authentication and security features.</li>
                <li><strong className="text-white">Performance Cookies:</strong> Help us understand how visitors interact with our website by collecting anonymous information.</li>
                <li><strong className="text-white">Functionality Cookies:</strong> Remember your preferences and settings to provide a personalized experience.</li>
                <li><strong className="text-white">Analytics Cookies:</strong> Help us analyze website traffic and user behavior to improve our services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-gray-400 leading-relaxed">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements, and so on. These cookies are set by domains other than animeprix.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Managing Cookies</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p className="text-gray-400 leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-400 leading-relaxed">
                If you have any questions about our use of cookies, please contact us at privacy@animeprix.com.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;

