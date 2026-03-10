import { Link } from "wouter";
import { config } from "@/lib/config";
import { Github, MessageCircle, Linkedin, Mail, Globe, Gamepad2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">
              Grudge<span className="text-primary">Studio</span>
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Game development ecosystem powering Grudge Warlords, GDevelop Assistant, Nexus Nemesis, and GrudaChain.
            </p>
            <div className="flex space-x-3">
              <a href={config.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href={config.DISCORD_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Discord">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href={config.LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href={`mailto:${config.EMAIL}`} className="text-gray-400 hover:text-white transition-colors" title="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href={config.STEAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Grudge Warlords (Steam)
                </a>
              </li>
              <li>
                <a href={config.NEXUS_TCG_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Nexus Nemesis TCG
                </a>
              </li>
              <li>
                <a href={config.GDEVELOP_ASSISTANT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GDevelop Assistant
                </a>
              </li>
              <li>
                <Link href="/asset-store" className="hover:text-white transition-colors">Asset Store</Link>
              </li>
              <li>
                <Link href="/advantage" className="hover:text-white transition-colors">Grudge Advantage</Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="font-semibold mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href={config.GRUDGE_WARLORDS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Grudge Warlords
                </a>
              </li>
              <li>
                <a href={config.GRUDACHAIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GrudaChain
                </a>
              </li>
              <li>
                <a href={config.GRUDGE_PLATFORM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Grudge Platform
                </a>
              </li>
              <li>
                <a href={config.INVEST_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Investors
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href={config.DISCORD_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href={config.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub (GrudgeDaDev)
                </a>
              </li>
              <li>
                <a href={config.GITHUB_MOLOCH_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub (MolochDaDev)
                </a>
              </li>
              <li>
                <a href={config.LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href={config.CONTACT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href={`mailto:${config.EMAIL}`} className="hover:text-white transition-colors">
                  {config.EMAIL}
                </a>
              </li>
              <li>
                <a href={config.WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  grudgestudio.com
                </a>
              </li>
              <li>
                <a href={`${config.GRUDGE_WARLORDS_URL}/api/health`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Server Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Grudge Studio. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href={config.CONTACT_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
