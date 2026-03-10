import Header from "@/components/header";
import Footer from "@/components/footer";
import { config } from "@/lib/config";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using any Grudge Studio service — including grudgestudio.com,
              grudgewarlords.com, grudgeplatform.com, grudgeplatform.io, GDevelop Assistant,
              Nexus Nemesis TCG, GrudaChain, and any associated applications (collectively, the
              "Services") — you agree to be bound by these Terms of Service. If you do not agree,
              do not use the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">2. Eligibility</h2>
            <p>
              You must be at least 13 years old to use the Services. If you are under 18, you
              represent that you have your parent or guardian's permission to use the Services.
              By using the Services, you represent and warrant that you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You must notify us immediately
              of any unauthorized use. We reserve the right to suspend or terminate accounts that
              violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use cheats, exploits, automation software, bots, or hacks in any Grudge game</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Services or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Services</li>
              <li>Sell, trade, or transfer your account to another person without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">5. In-Game Content & Virtual Items</h2>
            <p>
              Grudge Warlords, Nexus Nemesis TCG, and other Grudge games may include virtual
              currencies, items, characters, and other in-game content. These are licensed to you,
              not sold. We reserve the right to modify, remove, or reset virtual items at any time
              for game balance, technical, or other reasons. Virtual items have no real-world monetary
              value unless explicitly stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">6. Digital Assets & Blockchain</h2>
            <p>
              Certain Services may involve blockchain-based digital assets (e.g. via GrudaChain or
              Solana wallet integrations). You are solely responsible for your wallet security and
              private keys. Blockchain transactions are irreversible — we cannot reverse or refund
              on-chain transactions. We make no guarantees about the value of any digital assets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">7. Asset Store & Purchases</h2>
            <p>
              Purchases made through the Grudge Studio Asset Store are subject to the pricing and
              terms displayed at the time of purchase. Digital products are non-refundable once
              delivered unless required by applicable law. We reserve the right to change prices at
              any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">8. Intellectual Property</h2>
            <p>
              All content, code, graphics, logos, game assets, and trademarks associated with Grudge
              Studio, Grudge Warlords, Nexus Nemesis, GrudaChain, and GDevelop Assistant are owned
              by or licensed to Grudge Studio. You may not copy, modify, distribute, or create
              derivative works without our written consent, except as permitted by open-source
              licenses where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">9. User-Generated Content</h2>
            <p>
              If you submit content to our Services (e.g. mods, feedback, forum posts), you grant
              us a non-exclusive, royalty-free, worldwide license to use, display, and distribute
              that content in connection with the Services. You retain ownership of your original
              content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">10. Third-Party Services</h2>
            <p>
              Our Services may link to or integrate with third-party platforms (Discord, Steam,
              Vercel, Solana, etc.). We are not responsible for the content, policies, or practices
              of third-party services. Your use of those services is governed by their own terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">11. Disclaimer of Warranties</h2>
            <p>
              The Services are provided "as is" and "as available" without warranties of any kind,
              whether express or implied. We do not guarantee that the Services will be
              uninterrupted, error-free, or secure. Games are in active development and features
              may change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Grudge Studio shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of the Services, including loss of data, virtual items, digital assets, or
              profits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">13. Termination</h2>
            <p>
              We may suspend or terminate your access to the Services at any time, with or without
              cause, with or without notice. Upon termination, your right to use the Services
              ceases immediately. Provisions that by their nature should survive termination
              (e.g. IP ownership, limitation of liability) will survive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Services after
              changes are posted constitutes acceptance of the revised Terms. We will make
              reasonable efforts to notify users of material changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">15. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the United States. Any disputes shall
              be resolved through binding arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">16. Contact Us</h2>
            <p>
              For questions about these Terms, contact us at{" "}
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
