import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Code, Palette, Music, Map, Gamepad2, Star, Zap, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";

const gameEngines = [
  {
    name: "Construct 3",
    category: "Game Engine",
    description: "Web-based no-code game engine with drag-and-drop interface for 2D games. Features physics engines, pathfinding, and multiplayer support.",
    image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
    downloadUrl: "/downloads/construct3-template.zip",
    pricing: "Free Tier Available"
  },
  {
    name: "Buildbox",
    category: "Game Engine", 
    description: "Visual no-code game engine for creating 2D and 3D games. Includes animations, effects, and comprehensive sound systems.",
    image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
    downloadUrl: "/downloads/buildbox-starter.zip",
    pricing: "Subscription Model"
  },
  {
    name: "GDevelop",
    category: "Game Engine",
    description: "Open-source no-code game engine using visual scripting. Features physics engines, particle systems, and multiplayer capabilities.",
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
    downloadUrl: "/downloads/gdevelop-template.zip",
    pricing: "Free & Open Source"
  },
  {
    name: "Stencyl",
    category: "Game Engine",
    description: "Drag-and-drop game creation platform with physics engines, animation tools, and integrated sound support for 2D games.",
    image: "https://framerusercontent.com/images/osFEtXrggbbUFT2PcLhEKwtKw.png",
    downloadUrl: "/downloads/stencyl-kit.zip",
    pricing: "Free for Web"
  },
  {
    name: "Yahaha Studios",
    category: "Game Engine",
    description: "Anyone can make a game with no coding skills required. User-friendly platform for creating interactive 3D experiences.",
    image: "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png",
    downloadUrl: "/downloads/yahaha-template.zip",
    pricing: "Free to Start"
  },
  {
    name: "RPG Maker",
    category: "Game Engine",
    description: "Create Final Fantasy style RPG games with a simple editor. Perfect for storytelling and classic RPG experiences.",
    image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
    downloadUrl: "/downloads/rpgmaker-assets.zip",
    pricing: "One-time Purchase"
  }
];

const assetTools = [
  {
    name: "Adobe Photoshop",
    category: "Graphics & Animation",
    description: "Industry-standard tool for creating custom graphics and animations. Perfect for game assets, UI elements, and promotional materials.",
    image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg",
    downloadUrl: "/downloads/photoshop-game-assets.zip",
    pricing: "Creative Cloud"
  },
  {
    name: "Blender",
    category: "3D Modeling",
    description: "Professional 3D modeling tool for creating models and animations. Essential for 3D game development and asset creation.",
    image: "https://framerusercontent.com/images/kqJNnjGgAUImwuaX1RZZWjFMc.png",
    downloadUrl: "/downloads/blender-game-models.zip",
    pricing: "Free & Open Source"
  },
  {
    name: "Aseprite",
    category: "Pixel Art",
    description: "Specialized pixel art tool for creating retro-style 2D game graphics. Perfect for indie game development.",
    image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
    downloadUrl: "/downloads/aseprite-sprites.zip",
    pricing: "One-time Purchase"
  },
  {
    name: "Inkscape",
    category: "Vector Graphics",
    description: "Vector graphics tool for creating scalable graphics perfect for UI elements and logos that work at any resolution.",
    image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
    downloadUrl: "/downloads/inkscape-vectors.zip",
    pricing: "Free & Open Source"
  }
];

const audioTools = [
  {
    name: "FL Studio",
    category: "Music Production",
    description: "Professional digital audio workstation for creating game music, soundtracks, and ambient audio.",
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
    downloadUrl: "/downloads/fl-studio-game-music.zip",
    pricing: "Lifetime License"
  },
  {
    name: "Audacity",
    category: "Audio Editing",
    description: "Free audio editing tool for creating and editing sound effects, voice-overs, and music for games.",
    image: "https://framerusercontent.com/images/osFEtXrggbbUFT2PcLhEKwtKw.png",
    downloadUrl: "/downloads/audacity-sfx-pack.zip",
    pricing: "Free & Open Source"
  },
  {
    name: "LMMS",
    category: "Music Production",
    description: "Free digital audio workstation for creating game music and sound design without expensive software.",
    image: "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png",
    downloadUrl: "/downloads/lmms-game-tracks.zip",
    pricing: "Free & Open Source"
  },
  {
    name: "Bfxr / SFXR",
    category: "Sound Effects",
    description: "Retro-style sound effect generators perfect for creating classic arcade and indie game sound effects.",
    image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
    downloadUrl: "/downloads/retro-sfx-collection.zip",
    pricing: "Free"
  }
];

const mapTools = [
  {
    name: "Tiled",
    category: "Map Editor",
    description: "Professional map editor for creating game levels and environments. Supports multiple formats and exports to various engines.",
    image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg",
    downloadUrl: "/downloads/tiled-map-templates.zip",
    pricing: "Free & Open Source"
  }
];

export default function GrudgeStudioAdvantage() {
  const handleDownload = (toolName: string, downloadUrl: string) => {
    console.log(`Downloading ${toolName} from ${downloadUrl}`);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${toolName.toLowerCase().replace(/\s+/g, '-')}-assets.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-orange-500 text-white mb-4 text-lg px-6 py-2">Grudge Studio Advantage</Badge>
            <h1 className="text-5xl font-bold mb-6">
              Complete Game Development Ecosystem
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Access our comprehensive suite of no-code game engines and professional asset creation tools. 
              From concept to deployment, we provide everything you need to create amazing games without coding expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">7 Game Engines</h3>
              <p className="text-gray-300">No-code platforms for every type of game development need</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Palette className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">10+ Asset Tools</h3>
              <p className="text-gray-300">Professional graphics, audio, and level design software</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Instant Access</h3>
              <p className="text-gray-300">Download templates and assets immediately</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Game Engines Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">No-Code Game Engines</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create games without programming knowledge using these powerful visual development platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameEngines.map((engine, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={engine.image} 
                      alt={engine.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white">{engine.category}</Badge>
                    </div>
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {engine.name}
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-orange-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{engine.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Pricing:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">{engine.pricing}</Badge>
                  </div>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleDownload(engine.name, engine.downloadUrl)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Asset Creation Tools */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Asset Creation Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional software for creating graphics, 3D models, and visual assets for your games.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assetTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img 
                      src={tool.image} 
                      alt={tool.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{tool.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Pricing:</span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">{tool.pricing}</Badge>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleDownload(tool.name, tool.downloadUrl)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download Assets
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Audio Tools */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Audio Creation Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create music, sound effects, and audio experiences that bring your games to life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {audioTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img 
                      src={tool.image} 
                      alt={tool.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{tool.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Pricing:</span>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">{tool.pricing}</Badge>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleDownload(tool.name, tool.downloadUrl)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download Pack
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Map Tools */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Level Design Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create engaging game levels and environments with professional mapping tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mapTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={tool.image} 
                      alt={tool.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {tool.name}
                    <Badge className="bg-purple-500 text-white">{tool.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Pricing:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">{tool.pricing}</Badge>
                  </div>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleDownload(tool.name, tool.downloadUrl)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Templates
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gray-100 rounded-2xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Grudge Studio Advantage</h2>
            <p className="text-lg text-gray-600">What makes our game development ecosystem unique</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Coding Required</h3>
              <p className="text-gray-600 text-sm">Visual interfaces make game development accessible to everyone</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapid Prototyping</h3>
              <p className="text-gray-600 text-sm">Go from idea to playable game in hours, not months</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Support</h3>
              <p className="text-gray-600 text-sm">Active communities and comprehensive tutorials for every tool</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-gray-600 text-sm">Industry-standard tools used by professional game developers</p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
              Explore Our Platform
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}