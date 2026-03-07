import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Cpu, 
  Store, 
  Users, 
  BarChart3, 
  Settings, 
  Gamepad2, 
  Zap, 
  Globe,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface NavigationItem {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  category: string;
  status: 'active' | 'beta' | 'new' | 'stable';
  features: string[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    name: 'Home',
    description: 'Main dashboard and overview',
    href: '/',
    icon: Home,
    category: 'Core',
    status: 'stable',
    features: ['Dashboard', 'Quick Access', 'Recent Projects']
  },
  {
    id: 'super-engine',
    name: 'Super Engine',
    description: 'Unified game development platform',
    href: '/super-engine',
    icon: Zap,
    category: 'Development',
    status: 'active',
    features: ['15+ Engines', 'Templates', 'Instant Deploy']
  },
  {
    id: 'engine-launcher',
    name: 'Engine Launcher',
    description: 'Manage and launch game engines',
    href: '/engine-launcher',
    icon: Cpu,
    category: 'Development',
    status: 'active',
    features: ['Project Management', 'Engine Switching', 'Build Tools']
  },
  {
    id: 'advanced-engines',
    name: 'Advanced Engines',
    description: 'Professional game development tools',
    href: '/advanced-engines',
    icon: Settings,
    category: 'Development',
    status: 'beta',
    features: ['Unity', 'Unreal', 'Godot', 'Custom Tools']
  },
  {
    id: 'asset-store',
    name: 'Asset Store',
    description: 'Game assets and marketplace',
    href: '/asset-store',
    icon: Store,
    category: 'Resources',
    status: 'stable',
    features: ['Templates', '3D Models', 'Audio', 'UI Kits']
  },
  {
    id: 'collaboration-hub',
    name: 'Collaboration Hub',
    description: 'Team development and communication',
    href: '/collaboration-hub',
    icon: Users,
    category: 'Collaboration',
    status: 'active',
    features: ['Video Calls', 'Real-time Chat', 'Version Control']
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Project metrics and performance',
    href: '/analytics-dashboard',
    icon: BarChart3,
    category: 'Analytics',
    status: 'stable',
    features: ['Performance Metrics', 'Usage Statistics', 'Reports']
  },
  {
    id: 'tower-defense',
    name: 'Tower Defense',
    description: '3D tower defense strategy game',
    href: '/tower-defense',
    icon: Gamepad2,
    category: 'Games',
    status: 'new',
    features: ['Strategic Tower Placement', 'Wave Defense', '8 Tower Types']
  },
  {
    id: 'scraping',
    name: 'Web Scraper',
    description: 'Extract web content and data',
    href: '/scraping',
    icon: Globe,
    category: 'Tools',
    status: 'stable',
    features: ['Content Extraction', 'Batch Processing', 'Export Options']
  }
];

const categories = ['All', 'Core', 'Development', 'Resources', 'Collaboration', 'Analytics', 'Games', 'Tools'];

export default function NavigationHub() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCompact, setIsCompact] = useState(false);

  const filteredItems = selectedCategory === 'All' 
    ? navigationItems 
    : navigationItems.filter(item => item.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'beta': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isCompact) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsCompact(false)}
          className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 text-white hover:bg-gray-700"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Navigation Hub</h2>
              <p className="text-gray-400">Quick access to all Super Game Engine components</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCompact(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Minimize
              </Button>
              <Link href={location}>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isCurrentPage = location === item.href;
              
              return (
                <Link key={item.id} href={item.href}>
                  <Card 
                    className={`bg-gray-800/50 border-gray-700 hover:border-orange-500 transition-all duration-300 cursor-pointer group ${
                      isCurrentPage ? 'border-orange-500 ring-1 ring-orange-500/30' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                              {item.name}
                            </h3>
                            <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                      </div>

                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Key Features</p>
                        <div className="flex flex-wrap gap-1">
                          {item.features.slice(0, 3).map((feature, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-xs border-gray-600 text-gray-300"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {item.features.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs border-gray-600 text-gray-400"
                            >
                              +{item.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isCurrentPage && (
                        <div className="mt-4 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <p className="text-xs text-orange-400 text-center">Currently Active</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{filteredItems.length} components available</span>
            <span>Super Game Engine v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}