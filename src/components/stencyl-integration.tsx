import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Play, 
  Settings, 
  Code, 
  Monitor, 
  Gamepad2, 
  Zap, 
  Package,
  Terminal,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";

interface StencylProject {
  id: string;
  name: string;
  type: 'platformer' | 'action' | 'puzzle' | 'rpg';
  version: string;
  lastModified: string;
  buildStatus: 'ready' | 'building' | 'error' | 'needs_compile';
  platforms: string[];
  scenes: number;
  actors: number;
  behaviors: number;
}

interface StencylRuntime {
  platform: string;
  version: string;
  javaVersion: string;
  status: 'installed' | 'downloading' | 'missing' | 'updating';
  downloadProgress: number;
  fileSize: string;
}

const stencylProjects: StencylProject[] = [
  {
    id: 'combat-demo',
    name: 'Combat Demo',
    type: 'action',
    version: '4.1.4',
    lastModified: '1 week ago',
    buildStatus: 'ready',
    platforms: ['HTML5', 'Windows', 'Mac', 'Linux'],
    scenes: 5,
    actors: 12,
    behaviors: 8
  },
  {
    id: 'puzzle-adventure',
    name: 'Puzzle Adventure',
    type: 'puzzle',
    version: '4.1.4',
    lastModified: '3 days ago',
    buildStatus: 'needs_compile',
    platforms: ['HTML5', 'Android', 'iOS'],
    scenes: 15,
    actors: 25,
    behaviors: 18
  },
  {
    id: 'platform-hero',
    name: 'Platform Hero',
    type: 'platformer',
    version: '4.1.4',
    lastModified: '5 hours ago',
    buildStatus: 'building',
    platforms: ['HTML5', 'Windows', 'Mac'],
    scenes: 8,
    actors: 18,
    behaviors: 14
  }
];

const stencylRuntimes: StencylRuntime[] = [
  {
    platform: 'Windows x64',
    version: '4.1.4 (Build 12249)',
    javaVersion: 'OpenJDK 21.0.1+12',
    status: 'installed',
    downloadProgress: 100,
    fileSize: '125 MB'
  },
  {
    platform: 'macOS Universal',
    version: '4.1.4 (Build 12249)',
    javaVersion: 'OpenJDK 21.0.1+12',
    status: 'installed',
    downloadProgress: 100,
    fileSize: '128 MB'
  },
  {
    platform: 'Linux x64',
    version: '4.1.4 (Build 12249)',
    javaVersion: 'OpenJDK 21.0.1+12',
    status: 'missing',
    downloadProgress: 0,
    fileSize: '122 MB'
  }
];

export default function StencylIntegration() {
  const [selectedProject, setSelectedProject] = useState<StencylProject | null>(null);
  const [runtimes, setRuntimes] = useState<StencylRuntime[]>(stencylRuntimes);
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'building':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'needs_compile':
        return <Package className="w-4 h-4 text-orange-400" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRuntimeStatusIcon = (status: string) => {
    switch (status) {
      case 'installed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'downloading':
        return <Download className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  const buildProject = (project: StencylProject) => {
    setSelectedProject(project);
    setIsBuilding(true);
    setBuildProgress(0);

    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          // Update project status
          const updatedProjects = stencylProjects.map(p => 
            p.id === project.id ? { ...p, buildStatus: 'ready' as const } : p
          );
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const downloadRuntime = (platform: string) => {
    setRuntimes(prev => prev.map(runtime => 
      runtime.platform === platform 
        ? { ...runtime, status: 'downloading', downloadProgress: 0 }
        : runtime
    ));

    const interval = setInterval(() => {
      setRuntimes(prev => prev.map(runtime => {
        if (runtime.platform === platform && runtime.status === 'downloading') {
          const newProgress = runtime.downloadProgress + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...runtime, status: 'installed', downloadProgress: 100 };
          }
          return { ...runtime, downloadProgress: newProgress };
        }
        return runtime;
      }));
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Stencyl Engine Header */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Package className="w-6 h-6 mr-3 text-blue-400" />
            Stencyl Game Engine
            <Badge className="ml-auto bg-blue-500/20 text-blue-400">v4.1.4 Build 12249</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-4">
            Professional 2D game development with visual scripting, multi-platform publishing, 
            and integrated physics engine. Build games for web, mobile, and desktop.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Code className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-white text-sm font-medium">Visual Scripting</span>
              </div>
              <p className="text-xs text-gray-400">Drag-and-drop behaviors</p>
            </div>
            
            <div className="p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Monitor className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-white text-sm font-medium">Multi-Platform</span>
              </div>
              <p className="text-xs text-gray-400">Web, mobile, desktop</p>
            </div>
            
            <div className="p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Zap className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-white text-sm font-medium">Box2D Physics</span>
              </div>
              <p className="text-xs text-gray-400">Professional physics engine</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="projects" className="data-[state=active]:bg-blue-500">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="runtimes" className="data-[state=active]:bg-blue-500">
            <Download className="w-4 h-4 mr-2" />
            Runtimes
          </TabsTrigger>
          <TabsTrigger value="console" className="data-[state=active]:bg-blue-500">
            <Terminal className="w-4 h-4 mr-2" />
            Console
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Stencyl Projects</h3>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Code className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stencylProjects.map((project) => (
                <Card key={project.id} className="bg-gray-800/50 border-gray-700 hover:border-blue-500 transition-colors">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg mb-4 flex items-center justify-center">
                      <Gamepad2 className="w-12 h-12 text-blue-400" />
                    </div>
                    
                    <h4 className="text-white font-bold mb-2">{project.name}</h4>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                        {project.type}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(project.buildStatus)}
                        <span className="text-xs text-gray-400 capitalize">
                          {project.buildStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div>
                        <div className="text-gray-400">Scenes</div>
                        <div className="text-white font-bold">{project.scenes}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Actors</div>
                        <div className="text-white font-bold">{project.actors}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Behaviors</div>
                        <div className="text-white font-bold">{project.behaviors}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Platforms</p>
                      <div className="flex flex-wrap gap-1">
                        {project.platforms.slice(0, 3).map((platform, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {project.buildStatus === 'ready' ? (
                        project.name === 'Combat Demo' ? (
                          <Link href="/tower-defense">
                            <Button className="w-full bg-green-500 hover:bg-green-600 text-white" size="sm">
                              <Play className="w-4 h-4 mr-2" />
                              Play Game
                            </Button>
                          </Link>
                        ) : (
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Test Game
                          </Button>
                        )
                      ) : project.buildStatus === 'building' ? (
                        <Button className="w-full bg-yellow-500 text-white" size="sm" disabled>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Building...
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                          size="sm"
                          onClick={() => buildProject(project)}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Build Project
                        </Button>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300">
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-gray-300">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Runtimes Tab */}
        <TabsContent value="runtimes">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Stencyl Runtimes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {runtimes.map((runtime) => (
                <Card key={runtime.platform} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-medium">{runtime.platform}</h4>
                      </div>
                      {getRuntimeStatusIcon(runtime.status)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Version</span>
                        <span className="text-white">{runtime.version}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Java</span>
                        <span className="text-white">{runtime.javaVersion}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Size</span>
                        <span className="text-white">{runtime.fileSize}</span>
                      </div>
                    </div>
                    
                    {runtime.status === 'downloading' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Downloading</span>
                          <span className="text-blue-400">{runtime.downloadProgress}%</span>
                        </div>
                        <Progress value={runtime.downloadProgress} className="h-2" />
                      </div>
                    )}
                    
                    {runtime.status === 'installed' ? (
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white" size="sm" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Installed
                      </Button>
                    ) : runtime.status === 'downloading' ? (
                      <Button className="w-full bg-blue-500 text-white" size="sm" disabled>
                        <Download className="w-4 h-4 mr-2 animate-pulse" />
                        Downloading...
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white" 
                        size="sm"
                        onClick={() => downloadRuntime(runtime.platform)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Runtime
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Console Tab */}
        <TabsContent value="console">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Terminal className="w-5 h-5 mr-2 text-green-400" />
                Stencyl Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-4 font-mono text-sm">
                <div className="text-green-400">2024-07-01 23:18:56 INFO [main] stencyl.sw.app.Launcher: Starting Stencyl 4.1.4 (Build 12249)</div>
                <div className="text-blue-400">2024-07-01 23:18:56 INFO [main] stencyl.sw.app.Launcher: Java version: OpenJDK 21.0.1+12</div>
                <div className="text-white">2024-07-01 23:18:56 INFO [main] stencyl.sw.app.Launcher: Platform: {navigator.platform}</div>
                <div className="text-green-400">2024-07-01 23:18:57 INFO [main] stencyl.sw.util.LogManager: Log4j configuration loaded</div>
                <div className="text-white">2024-07-01 23:18:57 DEBUG [main] stencyl.sw.engine.Engine: Initializing Box2D physics engine</div>
                <div className="text-green-400">2024-07-01 23:18:58 INFO [main] stencyl.sw.app.Launcher: Stencyl ready for development</div>
                {isBuilding && selectedProject && (
                  <>
                    <div className="text-yellow-400">2024-07-01 23:19:00 INFO [build] stencyl.sw.build.Builder: Building project: {selectedProject.name}</div>
                    <div className="text-blue-400">2024-07-01 23:19:01 DEBUG [build] stencyl.sw.build.Builder: Compiling behaviors...</div>
                    <div className="text-blue-400">2024-07-01 23:19:02 DEBUG [build] stencyl.sw.build.Builder: Processing scenes...</div>
                    <div className="text-blue-400">2024-07-01 23:19:03 DEBUG [build] stencyl.sw.build.Builder: Building assets... ({buildProgress}%)</div>
                  </>
                )}
              </div>
              
              {isBuilding && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Building {selectedProject?.name}</span>
                    <span className="text-blue-400">{buildProgress}%</span>
                  </div>
                  <Progress value={buildProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}