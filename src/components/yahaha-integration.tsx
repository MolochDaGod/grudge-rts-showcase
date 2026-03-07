import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  Users, 
  Globe, 
  Zap, 
  Play, 
  Download, 
  Cloud, 
  Gamepad2,
  Cube,
  Palette,
  Music,
  Video
} from "lucide-react";
import { Link } from "wouter";

interface YahahaProject {
  id: string;
  name: string;
  type: 'metaverse' | '3d-world' | 'multiplayer' | 'vr' | 'ar';
  status: 'development' | 'published' | 'testing';
  players: number;
  features: string[];
  thumbnail: string;
  worldId?: string;
}

interface YahahaFeature {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'available' | 'beta' | 'coming-soon';
  examples: string[];
}

const yahahaFeatures: YahahaFeature[] = [
  {
    name: 'Visual Scripting',
    description: 'No-code game logic with node-based editor',
    icon: Code,
    status: 'available',
    examples: ['Combat Systems', 'AI Behavior', 'Game Mechanics', 'Interactive Objects']
  },
  {
    name: 'Multiplayer Engine',
    description: 'Built-in networking for seamless multiplayer experiences',
    icon: Users,
    status: 'available',
    examples: ['Real-time Combat', 'Collaborative Building', 'Social Worlds', 'Events']
  },
  {
    name: 'Cross-Platform Deploy',
    description: 'Publish to web, mobile, and VR with one click',
    icon: Globe,
    status: 'available',
    examples: ['WebGL', 'Mobile Apps', 'VR Headsets', 'Desktop']
  },
  {
    name: '3D World Builder',
    description: 'Advanced terrain and environment creation tools',
    icon: Cube,
    status: 'available',
    examples: ['Terrain Sculpting', 'Physics Objects', 'Lighting Systems', 'Weather']
  },
  {
    name: 'Asset Marketplace',
    description: 'Pre-built components and community assets',
    icon: Palette,
    status: 'available',
    examples: ['3D Models', 'Animations', 'Sound Effects', 'Scripts']
  },
  {
    name: 'Live Events',
    description: 'Dynamic content and real-time updates',
    icon: Zap,
    status: 'beta',
    examples: ['Seasonal Events', 'Live Concerts', 'Competitions', 'Updates']
  }
];

const sampleProjects: YahahaProject[] = [
  {
    id: 'combat-arena',
    name: 'Enhanced Combat Arena',
    type: 'multiplayer',
    status: 'development',
    players: 0,
    features: ['Real-time Combat', 'Power-ups', 'Leaderboards', 'Team Battles'],
    thumbnail: '',
    worldId: 'combat-world-001'
  },
  {
    id: 'adventure-world',
    name: 'Pixel Adventure Metaverse',
    type: 'metaverse',
    status: 'testing',
    players: 47,
    features: ['Open World', 'Quests', 'Social Hub', 'Custom Avatars'],
    thumbnail: '',
    worldId: 'adventure-meta-001'
  },
  {
    id: 'space-exploration',
    name: 'Space Exploration VR',
    type: 'vr',
    status: 'published',
    players: 156,
    features: ['VR Controls', 'Physics Simulation', 'Multiplayer Co-op', 'Voice Chat'],
    thumbnail: '',
    worldId: 'space-vr-001'
  }
];

export default function YahahaIntegration() {
  const [selectedProject, setSelectedProject] = useState<YahahaProject | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  useEffect(() => {
    // Simulate Yahaha Studio connection
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(connectTimer);
  }, []);

  const deployToYahaha = (project: YahahaProject) => {
    setSelectedProject(project);
    setDeploymentProgress(0);
    
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400';
      case 'testing': return 'bg-yellow-500/20 text-yellow-400';
      case 'development': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'metaverse': return <Globe className="w-4 h-4" />;
      case '3d-world': return <Cube className="w-4 h-4" />;
      case 'multiplayer': return <Users className="w-4 h-4" />;
      case 'vr': return <Video className="w-4 h-4" />;
      case 'ar': return <Zap className="w-4 h-4" />;
      default: return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Yahaha Studio Connection Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Cloud className="w-5 h-5 mr-2 text-blue-400" />
            Yahaha Studio Integration
            {isConnected ? (
              <Badge className="ml-auto bg-green-500/20 text-green-400">Connected</Badge>
            ) : (
              <Badge className="ml-auto bg-yellow-500/20 text-yellow-400">Connecting...</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Yahaha Studio enables creation of 3D metaverse experiences with visual scripting, 
            multiplayer networking, and cross-platform deployment capabilities.
          </p>
          
          {!isConnected ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
              <span>Establishing connection to Yahaha Studio...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yahahaFeatures.slice(0, 3).map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.name} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Icon className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-white text-sm font-medium">{feature.name}</span>
                    </div>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yahaha Features */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yahahaFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.name} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <h4 className="text-white font-medium">{feature.name}</h4>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      feature.status === 'available' ? 'bg-green-500/20 text-green-400' :
                      feature.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {feature.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Examples</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.examples.slice(0, 2).map((example, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {example}
                        </Badge>
                      ))}
                      {feature.examples.length > 2 && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          +{feature.examples.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Yahaha Projects */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Yahaha Projects
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <Code className="w-4 h-4 mr-2" />
              Create New World
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleProjects.map((project) => (
              <Card key={project.id} className="bg-gray-700/30 border-gray-600 hover:border-blue-500 transition-colors">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg mb-4 flex items-center justify-center">
                    {getTypeIcon(project.type)}
                    <span className="ml-2 text-white text-sm capitalize">{project.type}</span>
                  </div>
                  
                  <h4 className="text-white font-medium mb-2">{project.name}</h4>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{project.players} players</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {project.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {project.status === 'published' ? (
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white" 
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Join World
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                        size="sm"
                        onClick={() => deployToYahaha(project)}
                      >
                        <Cloud className="w-4 h-4 mr-2" />
                        Deploy to Yahaha
                      </Button>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300">
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Progress */}
      {selectedProject && deploymentProgress < 100 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Deploying {selectedProject.name}</span>
              <span className="text-gray-400">{deploymentProgress}%</span>
            </div>
            <Progress value={deploymentProgress} className="mb-2" />
            <p className="text-gray-400 text-sm">
              {deploymentProgress < 30 && "Building world assets..."}
              {deploymentProgress >= 30 && deploymentProgress < 60 && "Uploading to Yahaha Cloud..."}
              {deploymentProgress >= 60 && deploymentProgress < 90 && "Configuring multiplayer systems..."}
              {deploymentProgress >= 90 && "Finalizing deployment..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Integration Benefits */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Why Use Yahaha Studio?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Code className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-medium">Visual Scripting</h4>
                  <p className="text-gray-300 text-sm">Create complex game logic without coding using intuitive node-based editor</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-medium">Built-in Multiplayer</h4>
                  <p className="text-gray-300 text-sm">Seamless networking and real-time synchronization for multiplayer experiences</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-medium">Cross-Platform</h4>
                  <p className="text-gray-300 text-sm">Deploy to web, mobile, VR, and desktop with a single build process</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-medium">Live Updates</h4>
                  <p className="text-gray-300 text-sm">Push content updates and events to live games without rebuilds</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}