import Header from "@/components/header";
import Footer from "@/components/footer";
import { config } from "@/lib/config";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
            <p>
              Grudge Studio ("we", "our", or "us") operates grudgestudio.com, grudgewarlords.com,
              grudgeplatform.com, grudgeplatform.io, and related services including Grudge Warlords,
              GDevelop Assistant, Nexus Nemesis TCG, and GrudaChain (collectively, the "Services").
              This Privacy Policy explains how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-gray-200 mt-4">Account Information</h3>
            <p>
              When you create an account we may collect your username, email address, and Discord
              profile information (via OAuth). If you connect a wallet we store your public wallet
              address — we never store private keys.
            </p>
            <h3 className="text-lg font-medium text-gray-200 mt-4">Usage Data</h3>
            <p>
              We automatically collect technical data such as IP address, browser type, device
              information, pages visited, and gameplay statistics (e.g. characters, levels, arena
              results) to improve our Services.
            </p>
            <h3 className="text-lg font-medium text-gray-200 mt-4">Cookies & Local Storage</h3>
            <p>
              We use cookies and browser local storage to maintain authentication sessions and
              remember preferences. You can disable cookies in your browser settings, but some
              features may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain our Services</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Track gameplay progress and leaderboard rankings</li>
              <li>Process transactions in our Asset Store</li>
              <li>Send service-related communications (e.g. security alerts)</li>
              <li>Improve our games, tools, and platform features</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">4. Sharing & Disclosure</h2>
            <p>
              We do not sell your personal information. We may share data with trusted third-party
              service providers (hosting, analytics, payment processing) who are contractually
              bound to protect your data. We may disclose information if required by law or to
              protect the rights and safety of our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encrypted connections
              (TLS/SSL), hashed credentials, and access controls. No method of transmission over
              the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">6. Third-Party Services</h2>
            <p>
              Our Services integrate with third-party platforms including Discord (authentication),
              Steam (game distribution), Solana blockchain (wallet connections), and Vercel
              (hosting). These services have their own privacy policies which we encourage you to
              review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">7. Children's Privacy</h2>
            <p>
              Our Services are not directed to children under 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected data
              from a child, please contact us and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">8. Your Rights</h2>
            <p>
              Depending on your jurisdiction you may have the right to access, correct, delete, or
              export your personal data. To exercise these rights, contact us at{" "}
              <a href={`mailto:${config.EMAIL}`} className="text-primary hover:underline">
                {config.EMAIL}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on this page with a revised "Last updated"
              date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
              <a href={`mailto:${config.EMAIL}`} className="text-primary hover:underline">
                {config.EMAIL}
              </a>{" "}
              or through our{" "}
              <a href={config.CONTACT_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                contact page
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
