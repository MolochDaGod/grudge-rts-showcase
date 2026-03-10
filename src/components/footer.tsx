import { Link } from "wouter";
import { config } from "@/lib/config";
import { Github, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Grudge<span className="text-primary">Studio</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Game development ecosystem powering Grudge Warlords, GDevelop Assistant, and GrudaChain with real tools for real creators.
            </p>
            <div className="flex space-x-4">
              <a href={config.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href={config.DISCORD_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/scraping" className="hover:text-white transition-colors">Development Tools</Link>
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
                <Link href="/advantage" className="hover:text-white transition-colors">
                  Grudge Advantage
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-gray-400">
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
                <a href={config.STEAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Grudge on Steam
                </a>
              </li>
              <li>
                <a href={config.GRUDGE_PLATFORM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Grudge Platform
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href={config.DISCORD_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href={config.GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href={`${config.GRUDGE_WARLORDS_URL}/api/health`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Server Status
                </a>
              </li>
              <li>
                <Link href="/advantage" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Grudge Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
