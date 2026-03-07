import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Download, Zap, Layers, Monitor, Code2, Gamepad2, Rocket, ChevronRight, Play } from "lucide-react";

export default function SuperEngineShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Cpu className="w-16 h-16 text-orange-500" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-500">
              Super Game Engine
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Revolutionary unified platform combining 7 powerful game engines into one comprehensive development suite. 
            Create games without limits across all platforms.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2">
              7 Engines Combined
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
              2.5GB Complete Package
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2">
              Cross-Platform
            </Badge>
          </div>
        </div>

        {/* Engine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left Column - Engine Features */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border-orange-500/30 hover:border-orange-400 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center">
                  <Layers className="w-6 h-6 mr-3" />
                  Unified Engine Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-orange-400 font-semibold">Construct3</div>
                    <div className="text-sm text-gray-400">2D Engine</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-orange-400 font-semibold">Buildbox</div>
                    <div className="text-sm text-gray-400">3D Engine</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-orange-400 font-semibold">GDevelop</div>
                    <div className="text-sm text-gray-400">Visual Script</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-orange-400 font-semibold">Stencyl</div>
                    <div className="text-sm text-gray-400">Physics</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  All engines work together seamlessly with shared assets, unified publishing, and cross-engine compatibility.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-blue-500/30 hover:border-blue-400 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center">
                  <Monitor className="w-6 h-6 mr-3" />
                  Cross-Platform Publishing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Web', 'iOS', 'Android', 'Windows', 'Mac', 'Linux', 'Console'].map((platform) => (
                    <Badge key={platform} variant="outline" className="border-blue-400 text-blue-400">
                      {platform}
                    </Badge>
                  ))}
                </div>
                <p className="text-gray-300 text-sm">
                  Deploy to all major platforms with a single click. Automatic optimization for each target platform.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/20 border-green-500/30 hover:border-green-400 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Code2 className="w-6 h-6 mr-3" />
                  Advanced Development Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Real-time collaborative editing</li>
                  <li>• AI-powered code generation</li>
                  <li>• Built-in version control</li>
                  <li>• Performance profiling tools</li>
                  <li>• Automated testing suite</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Demo */}
          <div className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Gamepad2 className="w-6 h-6 mr-3 text-orange-400" />
                    Live Engine Demo
                  </span>
                  <Badge className="bg-green-500 text-white">Running</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-spin opacity-20"></div>
                        <div className="absolute inset-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
                        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-orange-500" />
                        </div>
                      </div>
                      <p className="text-orange-400 font-semibold mb-2">Super Engine Active</p>
                      <p className="text-gray-400 text-sm">7 engines running in parallel</p>
                    </div>
                  </div>
                  
                  {/* Engine Status Indicators */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="grid grid-cols-4 gap-2">
                      {['C3', 'BB', 'GD', 'ST'].map((engine, index) => (
                        <div key={engine} className="bg-gray-900/80 rounded px-2 py-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-white">{engine}</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <Link href="/tower-defense">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Try Interactive Demo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">Package Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300 text-sm">Game Engines</span>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">7</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300 text-sm">Templates</span>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">200+</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300 text-sm">Assets</span>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">1000+</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <span className="text-gray-300 text-sm">Total Size</span>
                    <Badge variant="outline" className="border-purple-400 text-purple-400">2.5GB</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Build the Next Big Game?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Download the complete Super Game Engine bundle and start creating professional games today. 
              No limits, no compromises, just pure creative power.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/super-engine">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download Super Engine
                </Button>
              </Link>
              
              <Button variant="outline" className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black px-8 py-4 text-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Explore Features
              </Button>
            </div>
            
            <div className="flex items-center justify-center mt-6 text-sm text-gray-400">
              <span>Over 10,000 developers already building with Super Engine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}