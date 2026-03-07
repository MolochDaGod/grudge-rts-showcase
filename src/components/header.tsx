import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-orange-500">
              Sign In
            </Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
