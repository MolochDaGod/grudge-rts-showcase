import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Play, Settings, Code, Layers, Gamepad2, Smartphone, Monitor, Cpu, Zap, Eye, Volume2 } from "lucide-react";
import { Link, useLocation } from "wouter";

interface EngineModule {
  name: string;
  type: '2D' | '3D' | 'Physics' | 'Audio' | 'Rendering' | 'Input' | 'Networking';
  status: 'loaded' | 'loading' | 'error';
  features: string[];
}

interface GameProject {
  id: string;
  name: string;
  type: '2D' | '3D' | 'RPG' | 'Puzzle' | 'Action';
  engine: string;
  thumbnail: string;
}

export default function SuperEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [engineModules, setEngineModules] = useState<EngineModule[]>([]);
  const [gameProjects, setGameProjects] = useState<GameProject[]>([]);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [, navigate] = useLocation();

  const launchProject = (projectId: string) => {
    const projectRoutes: { [key: string]: string } = {
      'decay': '/decay-survival',
      'overdrive': '/overdrive-3d',
      'avernus': '/avernus-3d',
      'avernus-2d': '/avernus-arena',
      'tower-defense': '/tower-defense',
      'wargus': '/wargus',
      '1': '/puzzle-platformer',
      '2': '/multiplayer-racing',
      '3': '/rpg-maker-studio',
      '4': '/tower-defense'
    };
    const route = projectRoutes[projectId];
    if (route) {
      navigate(route);
    }
  };

  // Initialize Super Engine modules
  useEffect(() => {
    const modules: EngineModule[] = [
      {
        name: 'Construct3 2D Engine',
        type: '2D',
        status: 'loading',
        features: ['Drag & Drop', 'Physics', 'Behaviors', 'Events']
      },
      {
        name: 'Buildbox 3D Renderer',
        type: '3D',
        status: 'loading',
        features: ['3D Models', 'Lighting', 'Materials', 'Animations']
      },
      {
        name: 'GDevelop Physics',
        type: 'Physics',
        status: 'loading',
        features: ['Box2D', 'Collisions', 'Forces', 'Joints']
      },
      {
        name: 'Stencyl Audio System',
        type: 'Audio',
        status: 'loading',
        features: ['Sound Effects', 'Music', 'Spatial Audio', 'Mixing']
      },
      {
        name: 'Yahaha Rendering Pipeline',
        type: 'Rendering',
        status: 'loading',
        features: ['PBR', 'Post-Processing', 'Shadows', 'Particles']
      },
      {
        name: 'Universal Input Manager',
        type: 'Input',
        status: 'loading',
        features: ['Keyboard', 'Mouse', 'Touch', 'Gamepad']
      },
      {
        name: 'Multi-Engine Networking',
        type: 'Networking',
        status: 'loading',
        features: ['WebRTC', 'WebSockets', 'P2P', 'Server Sync']
      }
    ];

    setEngineModules(modules);

    // Simulate loading modules
    const loadModules = async () => {
      for (let i = 0; i < modules.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setEngineModules(prev => prev.map((module, index) => 
          index === i ? { ...module, status: 'loaded' as const } : module
        ));
        
        setDownloadProgress(((i + 1) / modules.length) * 100);
      }
      
      setIsEngineReady(true);
    };

    loadModules();

    // Initialize sample projects
    const projects: GameProject[] = [
      {
        id: 'decay',
        name: 'Decay Survival',
        type: 'Action',
        engine: 'Three.js Shooter',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: 'overdrive',
        name: 'Overdrive Racing',
        type: '3D',
        engine: 'Three.js Racing',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: 'avernus',
        name: 'Avernus Arena',
        type: 'Action',
        engine: 'Three.js Combat',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: '1',
        name: 'Platformer Pro',
        type: '2D',
        engine: 'Construct3 + GDevelop',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: '2',
        name: '3D Adventure',
        type: '3D',
        engine: 'Buildbox + Yahaha',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: '3',
        name: 'RPG Master',
        type: 'RPG',
        engine: 'RPG Maker + Custom',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: '4',
        name: 'Puzzle World',
        type: 'Puzzle',
        engine: 'Stencyl + Custom',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: 'wargus',
        name: 'Wargus RTS',
        type: 'Action',
        engine: 'Stratagus RTS Engine',
        thumbnail: '/api/placeholder/300/200'
      },
      {
        id: 'tower-defense',
        name: 'Tower Defense',
        type: 'Action',
        engine: 'Three.js TD',
        thumbnail: '/api/placeholder/300/200'
      }
    ];

    setGameProjects(projects);
  }, []);

  // Super Engine Canvas Demo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEngineReady) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // Demo visualization showing all engines working together
    const renderDemo = () => {
      time += 0.02;
      
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f0f23');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw engine modules as interconnected nodes
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;

      engineModules.forEach((module, index) => {
        const angle = (index / engineModules.length) * Math.PI * 2 + time;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Draw connections to center
        ctx.strokeStyle = module.status === 'loaded' ? '#00ff88' : '#ff6b35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw module node
        ctx.fillStyle = module.status === 'loaded' ? '#00ff88' : '#ff6b35';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw module label
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(module.type, x, y - 25);
      });

      // Draw central core
      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SUPER', centerX, centerY - 5);
      ctx.fillText('ENGINE', centerX, centerY + 10);

      // Draw floating particles
      for (let i = 0; i < 50; i++) {
        const px = (Math.sin(time + i) * 200) + centerX;
        const py = (Math.cos(time * 0.7 + i) * 150) + centerY;
        
        ctx.fillStyle = `rgba(255, 107, 53, ${0.3 + 0.3 * Math.sin(time + i)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(renderDemo);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    renderDemo();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isEngineReady, engineModules]);

  const downloadAllEngines = async () => {
    try {
      setDownloadProgress(0);
      
      const response = await fetch('/api/super-engine/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate download');
      }

      const result = await response.json();
      
      // Simulate progressive download of the complete bundle
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Trigger actual file download
      const link = document.createElement('a');
      link.href = result.bundleInfo.downloadUrl;
      link.download = 'super-engine-complete.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Super Engine download initiated:', result);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Super Engine</Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">All Engines Combined</Badge>
            {isEngineReady && <Badge className="bg-green-500 text-white">Ready</Badge>}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engine Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 flex items-center">
                  <Cpu className="w-8 h-8 mr-3 text-orange-400" />
                  Grudge Studio Super Web Game Engine
                </CardTitle>
                <p className="text-gray-300">
                  Unified engine combining Construct3, Buildbox, GDevelop, Stencyl, Yahaha, RPG Maker, and Gamefroot
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-96 border border-gray-700 rounded-lg bg-black"
                  />
                  {!isEngineReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-300 mb-2">Loading Super Engine...</p>
                        <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${downloadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{Math.round(downloadProgress)}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engine Status */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-orange-400" />
                  Engine Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {engineModules.map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        module.status === 'loaded' ? 'bg-green-500' :
                        module.status === 'loading' ? 'bg-orange-500 animate-pulse' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-white text-sm font-medium">{module.name}</p>
                        <p className="text-gray-400 text-xs">{module.type}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      module.status === 'loaded' ? 'border-green-500 text-green-500' :
                      module.status === 'loading' ? 'border-orange-500 text-orange-500' :
                      'border-red-500 text-red-500'
                    }>
                      {module.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500">
                <Eye className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-orange-500">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-orange-500">
                <Zap className="w-4 h-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="download" className="data-[state=active]:bg-orange-500">
                <Download className="w-4 h-4 mr-2" />
                Download
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
                  <CardHeader>
                    <CardTitle className="text-blue-400 flex items-center">
                      <Layers className="w-5 h-5 mr-2" />
                      Unified Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Combines the best features from all major no-code game engines into one powerful platform.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Construct3's event system</li>
                      <li>• Buildbox's 3D capabilities</li>
                      <li>• GDevelop's open-source flexibility</li>
                      <li>• Stencyl's physics engine</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Cross-Platform
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Deploy your games across all platforms with a single codebase.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Web (HTML5)</li>
                      <li>• Mobile (iOS/Android)</li>
                      <li>• Desktop (Windows/Mac/Linux)</li>
                      <li>• Consoles (with plugins)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      Advanced Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Professional-grade features for serious game development.
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Real-time multiplayer</li>
                      <li>• Advanced physics</li>
                      <li>• AI behavior trees</li>
                      <li>• Custom scripting</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gameProjects.map((project) => (
                  <Card key={project.id} className="bg-gray-800/50 border-gray-700 hover:border-orange-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                        {project.id === 'decay' && <span className="text-4xl">🧟</span>}
                        {project.id === 'overdrive' && <span className="text-4xl">🏎️</span>}
                        {project.id === 'avernus' && <span className="text-4xl">⚔️</span>}
                        {!['decay', 'overdrive', 'avernus'].includes(project.id) && <Gamepad2 className="w-12 h-12 text-gray-500" />}
                      </div>
                      <h3 className="text-white font-semibold mb-2">{project.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${['decay', 'overdrive', 'avernus'].includes(project.id) ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                          {project.type}
                        </Badge>
                        {['decay', 'overdrive', 'avernus'].includes(project.id) && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Playable</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Built with: {project.engine}</p>
                      <Button 
                        className={`w-full ${['decay', 'overdrive', 'avernus'].includes(project.id) ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
                        size="sm"
                        onClick={() => launchProject(project.id)}
                        data-testid={`button-launch-${project.id}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {['decay', 'overdrive', 'avernus'].includes(project.id) ? 'Play Now' : 'Launch'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-orange-400">2D Game Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Sprite-based animation system</li>
                        <li>• Tile-based level editor</li>
                        <li>• Physics with Box2D integration</li>
                        <li>• Particle effects engine</li>
                        <li>• Event-driven programming</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-blue-400">3D Game Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-gray-300">
                        <li>• 3D model importing (FBX, OBJ, GLTF)</li>
                        <li>• PBR material system</li>
                        <li>• Real-time lighting and shadows</li>
                        <li>• Skeletal animation support</li>
                        <li>• Terrain generation tools</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-green-400">Audio & Effects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-gray-300">
                        <li>• 3D spatial audio system</li>
                        <li>• Music composition tools</li>
                        <li>• Sound effect generation</li>
                        <li>• Dynamic audio mixing</li>
                        <li>• Voice chat integration</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-purple-400">Networking & Cloud</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Real-time multiplayer</li>
                        <li>• Cloud save synchronization</li>
                        <li>• Leaderboards and achievements</li>
                        <li>• Analytics integration</li>
                        <li>• Monetization tools</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="download" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                      Download Super Game Engine
                    </CardTitle>
                    <p className="text-gray-300">
                      Get all game engines and tools in one comprehensive package
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Construct3', 'Buildbox', 'GDevelop', 'Stencyl', 'Yahaha', 'RPG Maker'].map((engine) => (
                        <div key={engine} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-white">{engine}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center space-y-4">
                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">Complete Engine Suite</h3>
                        <p className="text-gray-300 mb-4">
                          Over 2.5GB of game development tools, templates, and assets
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                          <span>• 7 Game Engines</span>
                          <span>• 200+ Templates</span>
                          <span>• 1000+ Assets</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <Link href="/grudge-editor">
                          <Button 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full"
                          >
                            <Layers className="w-4 h-4 mr-2" />
                            3D Editor
                          </Button>
                        </Link>
                        
                        <Button 
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                          onClick={downloadAllEngines}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Suite
                        </Button>
                        
                        <Link href="/engine-launcher">
                          <Button 
                            variant="outline" 
                            className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black w-full"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Engine Manager
                          </Button>
                        </Link>

                        <Link href="/asset-store">
                          <Button 
                            variant="outline" 
                            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Asset Store
                          </Button>
                        </Link>

                        <Link href="/analytics-dashboard">
                          <Button 
                            variant="outline" 
                            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black w-full"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Analytics
                          </Button>
                        </Link>
                      </div>

                      <p className="text-sm text-gray-400">
                        Complete ecosystem with collaboration tools, asset marketplace, and analytics dashboard
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}