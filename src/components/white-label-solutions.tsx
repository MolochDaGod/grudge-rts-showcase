import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Code, Gamepad2, Smartphone, Monitor, Users, Zap, Star } from "lucide-react";

const gamingPlatforms = [
  {
    name: "Construct 3",
    description: "Web-based no-code game engine with drag-and-drop interface for 2D games. Features physics engines, pathfinding, and multiplayer support.",
    category: "2D Game Development",
    complexity: "Beginner Friendly",
    platforms: ["Web", "Mobile", "Desktop"],
    features: ["Drag & Drop", "Physics Engine", "Multiplayer", "Visual Scripting"],
    downloadUrl: "/downloads/construct3-template.zip",
    demoUrl: "https://editor.construct.net/",
    image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
    pricing: "Free Tier Available"
  },
  {
    name: "Buildbox",
    description: "Visual no-code game engine for creating 2D and 3D games. Includes animations, effects, and comprehensive sound systems.",
    category: "2D/3D Game Development",
    complexity: "Intermediate",
    platforms: ["iOS", "Android", "Desktop"],
    features: ["2D/3D Support", "Animations", "Effects", "Sound System"],
    downloadUrl: "/downloads/buildbox-starter.zip",
    demoUrl: "https://www.buildbox.com/",
    image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
    pricing: "Subscription Model"
  },
  {
    name: "GDevelop",
    description: "Open-source no-code game engine using visual scripting. Features physics engines, particle systems, and multiplayer capabilities.",
    category: "2D Game Development",
    complexity: "Beginner to Advanced",
    platforms: ["Web", "Mobile", "Desktop", "Console"],
    features: ["Visual Scripting", "Physics", "Particles", "Open Source"],
    downloadUrl: "/downloads/gdevelop-template.zip",
    demoUrl: "https://gdevelop.io/",
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
    pricing: "Free & Open Source"
  },
  {
    name: "Stencyl",
    description: "Drag-and-drop game creation platform with physics engines, animation tools, and integrated sound support for 2D games.",
    category: "2D Game Development",
    complexity: "Beginner Friendly",
    platforms: ["Web", "iOS", "Android", "Desktop"],
    features: ["Drag & Drop", "Physics", "Animations", "Cross-Platform"],
    downloadUrl: "/downloads/stencyl-kit.zip",
    demoUrl: "https://www.stencyl.com/",
    image: "https://framerusercontent.com/images/osFEtXrggbbUFT2PcLhEKwtKw.png",
    pricing: "Free for Web Publishing"
  },
  {
    name: "Gamefroot",
    description: "Visual game development platform for 2D games with built-in animations, effects, and sound systems.",
    category: "2D Game Development",
    complexity: "Beginner",
    platforms: ["Web", "Mobile"],
    features: ["Visual Interface", "Animations", "Effects", "Cloud Based"],
    downloadUrl: "/downloads/gamefroot-starter.zip",
    demoUrl: "https://make.gamefroot.com/",
    image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg",
    pricing: "Free Tier Available"
  },
  {
    name: "Yahaha Studios",
    description: "Anyone can make a game with no coding skills required. User-friendly platform for creating interactive experiences.",
    category: "3D Game Development",
    complexity: "Beginner Friendly",
    platforms: ["Mobile", "Web", "VR"],
    features: ["No Code Required", "3D Support", "Social Features", "VR Ready"],
    downloadUrl: "/downloads/yahaha-template.zip",
    demoUrl: "https://www.yahaha.com/",
    image: "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png",
    pricing: "Free to Start"
  },
  {
    name: "RPG Maker",
    description: "Create Final Fantasy style RPG games with a simple editor. Perfect for storytelling and classic RPG experiences.",
    category: "RPG Development",
    complexity: "Intermediate",
    platforms: ["PC", "Console", "Mobile"],
    features: ["RPG Templates", "Story Editor", "Character Creation", "Battle Systems"],
    downloadUrl: "/downloads/rpgmaker-assets.zip",
    demoUrl: "https://www.rpgmakerweb.com/",
    image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
    pricing: "One-time Purchase"
  }
];

const complexityColors = {
  "Beginner": "bg-green-100 text-green-800",
  "Beginner Friendly": "bg-green-100 text-green-800",
  "Intermediate": "bg-yellow-100 text-yellow-800",
  "Beginner to Advanced": "bg-blue-100 text-blue-800"
};

export default function WhiteLabelSolutions() {
  const handleDownload = (platformName: string, downloadUrl: string) => {
    // In a real implementation, this would trigger an actual download
    console.log(`Downloading ${platformName} from ${downloadUrl}`);
    
    // Create a mock download experience
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${platformName.toLowerCase().replace(/\s+/g, '-')}-template.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="bg-orange-500 text-white mb-4">White Label Solutions</Badge>
          <h2 className="text-4xl font-bold text-white mb-6">
            No-Code Game Development Platforms
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Download ready-to-use templates and start creating games immediately. No coding required - 
            just drag, drop, and deploy your ideas across multiple platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {gamingPlatforms.map((platform, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img 
                    src={platform.image} 
                    alt={platform.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={complexityColors[platform.complexity as keyof typeof complexityColors]}>
                      {platform.complexity}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-xl text-white flex items-center justify-between">
                  {platform.name}
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-orange-400 fill-current" />
                    <Star className="w-4 h-4 text-orange-400 fill-current" />
                    <Star className="w-4 h-4 text-orange-400 fill-current" />
                    <Star className="w-4 h-4 text-orange-400 fill-current" />
                    <Star className="w-4 h-4 text-gray-400" />
                  </div>
                </CardTitle>
                
                <Badge variant="outline" className="border-orange-400 text-orange-400 w-fit">
                  {platform.category}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {platform.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <Monitor className="w-4 h-4 mr-2 text-orange-400" />
                      Supported Platforms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {platform.platforms.map((platformType, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-700 text-gray-300">
                          {platformType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-orange-400" />
                      Key Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {platform.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Pricing:</span>
                      <span className="text-sm font-medium text-green-400">{platform.pricing}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                    onClick={() => handleDownload(platform.name, platform.downloadUrl)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => window.open(platform.demoUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Download</h3>
              <p className="text-gray-400">
                Get starter templates and assets immediately. No waiting, no setup complexity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Coding Required</h3>
              <p className="text-gray-400">
                Visual interfaces and drag-and-drop tools make game creation accessible to everyone.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Support</h3>
              <p className="text-gray-400">
                Join active communities and access tutorials, forums, and shared resources.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Start Creating Games Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}