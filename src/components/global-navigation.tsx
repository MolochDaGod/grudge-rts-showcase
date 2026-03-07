import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Home, 
  Cpu, 
  Store, 
  Users, 
  BarChart3, 
  Settings, 
  Gamepad2, 
  Zap, 
  Globe,
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "wouter";

const quickLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Super Engine', href: '/super-engine', icon: Zap },
  { name: 'Engine Launcher', href: '/engine-launcher', icon: Cpu },
  { name: 'Asset Store', href: '/asset-store', icon: Store },
  { name: 'Collaboration', href: '/collaboration-hub', icon: Users },
  { name: 'Analytics', href: '/analytics-dashboard', icon: BarChart3 },
  { name: 'Tower Defense', href: '/tower-defense', icon: Gamepad2 },
  { name: 'RPG Studio', href: '/rpg-maker-studio', icon: Settings },
  { name: 'Web Scraper', href: '/scraping', icon: Globe }
];

const gameLinks = [
  { name: 'Wargus RTS', href: '/wargus', status: 'new' },
  { name: 'Tower Defense', href: '/tower-defense', status: 'new' },
  { name: 'Avernus 3D', href: '/avernus-3d', status: 'new' },
  { name: 'RPG Maker Studio', href: '/rpg-maker-studio', status: 'new' },
  { name: 'Game Studio', href: '/super-engine', status: 'active' }
];

const devTools = [
  { name: 'Advanced Engines', href: '/advanced-engines', status: 'beta' },
  { name: 'Advantage Platform', href: '/advantage', status: 'stable' }
];

export default function GlobalNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [showGames, setShowGames] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400';
      case 'beta': return 'bg-yellow-500/20 text-yellow-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      {/* Floating Navigation Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-700 shadow-lg"
          size="sm"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-end">
          <div className="bg-gray-900 border-l border-gray-700 w-80 h-full overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Quick Navigation</h2>
              <p className="text-gray-400 text-sm">Super Game Engine Platform</p>
            </div>

            {/* Current Page Indicator */}
            <div className="p-4 border-b border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Page</div>
              <div className="text-orange-400 font-medium">
                {quickLinks.find(link => link.href === location)?.name || 'Unknown Page'}
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4 border-b border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Quick Access</div>
              <div className="space-y-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.href;
                  
                  return (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-left ${
                          isActive 
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {link.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Games Section */}
            <div className="p-4 border-b border-gray-700">
              <Button
                variant="ghost"
                onClick={() => setShowGames(!showGames)}
                className="w-full justify-between text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span className="text-xs uppercase tracking-wide">Games & Demos</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showGames ? 'rotate-180' : ''}`} />
              </Button>
              
              {showGames && (
                <div className="space-y-2 ml-2">
                  {gameLinks.map((link) => {
                    const isActive = location === link.href;
                    
                    return (
                      <Link key={link.href} href={link.href}>
                        <div
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            isActive 
                              ? 'bg-orange-500/20 text-orange-400' 
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-sm">{link.name}</span>
                          <Badge className={`text-xs ${getStatusColor(link.status)}`}>
                            {link.status}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Developer Tools */}
            <div className="p-4">
              <Button
                variant="ghost"
                onClick={() => setShowDevTools(!showDevTools)}
                className="w-full justify-between text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
              >
                <span className="text-xs uppercase tracking-wide">Developer Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDevTools ? 'rotate-180' : ''}`} />
              </Button>
              
              {showDevTools && (
                <div className="space-y-2 ml-2">
                  {devTools.map((link) => {
                    const isActive = location === link.href;
                    
                    return (
                      <Link key={link.href} href={link.href}>
                        <div
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            isActive 
                              ? 'bg-orange-500/20 text-orange-400' 
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-sm">{link.name}</span>
                          <Badge className={`text-xs ${getStatusColor(link.status)}`}>
                            {link.status}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="text-xs text-gray-400 text-center">
                Super Game Engine v2.0
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}