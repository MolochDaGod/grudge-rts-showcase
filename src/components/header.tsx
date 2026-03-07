import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LogOut, User, ChevronDown } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { session, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="bg-black shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <img 
                  src="https://framerusercontent.com/images/3XwBBaY5Sv2nUacebkTDBMDc.png" 
                  alt="Grudge Studio" 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-2xl font-bold text-orange-500 cursor-pointer font-montserrat">
                  Grudge<span className="text-orange-400">Studio</span>
                </h1>
              </Link>
            </div>
            <nav className="hidden md:block ml-10">
              <div className="flex space-x-8">
                <a href="#features" className="text-white hover:text-orange-500 transition-colors">
                  About
                </a>
                <Link href="/super-engine" className={`transition-colors font-semibold ${
                  isActive('/super-engine') 
                    ? 'text-orange-500' 
                    : 'text-white hover:text-orange-500'
                }`}>
                  Super Engine
                </Link>
                <Link href="/advantage" className={`transition-colors ${
                  isActive('/advantage') 
                    ? 'text-orange-500' 
                    : 'text-white hover:text-orange-500'
                }`}>
                  Advantage
                </Link>
                <a href="#services" className="text-white hover:text-orange-500 transition-colors">
                  Services
                </a>
                <a href="#projects" className="text-white hover:text-orange-500 transition-colors">
                  Portfolio
                </a>
                <a href="#store" className="text-white hover:text-orange-500 transition-colors">
                  Solutions
                </a>
                <Link href="/scraping" className={`transition-colors ${
                  isActive('/scraping') 
                    ? 'text-orange-500' 
                    : 'text-white hover:text-orange-500'
                }`}>
                  Tools
                </Link>
              </div>
            </nav>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {session.displayName || session.username}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{session.displayName || session.username}</p>
                      <p className="text-xs text-gray-400">
                        {session.isGuest ? "Guest Account" : session.isPremium ? "Premium" : "Free Account"}
                      </p>
                    </div>
                    <Link href="/analytics-dashboard">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </button>
                    </Link>
                    <Link href="/collaboration-hub">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Collaboration
                      </button>
                    </Link>
                    <div className="border-t border-gray-700 mt-1">
                      <button
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors flex items-center"
                      >
                        <LogOut className="w-3 h-3 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-orange-500">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-orange-500 text-white hover:bg-orange-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
