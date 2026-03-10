import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gamepad2, Star, Users, Trophy, Smartphone, Monitor } from "lucide-react";

const games = [
  {
    title: "Grudge Warlords",
    subtitle: "Live MMO — grudgewarlords.com",
    description: "The flagship Grudge MMO with 4 races (Human, Elf, Worge, Piglin), 4 classes (Warrior, Mage, Ranger, Worge), island-based factions, AI crew companions, arena PvP, and souls-like combat.",
    steamUrl: undefined,
    platformUrl: "https://grudgewarlords.com",
    platforms: ["Web", "Cloud"],
    features: ["4 Races & Classes", "AI Factions", "Arena PvP", "Souls-like Combat"],
    status: "Live Now",
    image: "https://framerusercontent.com/images/kqJNnjGgAUImwuaX1RZZWjFMc.png",
    improvements: {
      mobile: "Mobile client in development with touch-optimized combat",
      playability: "Dynamic AI crews, permadeath mechanics, and faction progression"
    }
  },
  {
    title: "Grudge",
    subtitle: "Steam Release",
    description: "Our flagship game on Steam with immersive gameplay, strategic combat, and rich storytelling. Enhanced graphics and multiplayer features.",
    steamUrl: "https://store.steampowered.com/app/2707990/Grudge/",
    platforms: ["PC", "Steam"],
    features: ["Single Player", "Multiplayer", "Steam Achievements", "Cloud Saves"],
    status: "Available Now",
    image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
    improvements: {
      mobile: "Enhanced touch controls and optimized UI for mobile devices",
      playability: "Streamlined mechanics and improved user experience"
    }
  },
  {
    title: "Tower Defense",
    subtitle: "Grudge Platform Exclusive",
    description: "Strategic tower defense with 8 unique tower types, wave-based gameplay, and 3D graphics. Built for both desktop and mobile.",
    platformUrl: "/tower-defense",
    platforms: ["Web", "Mobile", "Desktop"],
    features: ["8 Tower Types", "20 Waves", "3D Graphics", "Cross-Platform"],
    status: "Playable Now",
    image: "https://framerusercontent.com/images/Lp3Ng0LfDz7uZD3T3bDgsjuM8.png",
    improvements: {
      mobile: "Responsive design with touch-optimized controls",
      playability: "Balanced tower mechanics and wave progression"
    }
  }
];

const enhancements = [
  {
    icon: Smartphone,
    title: "Mobile Optimization",
    description: "Touch-friendly interfaces with responsive design for seamless mobile gaming"
  },
  {
    icon: Monitor,
    title: "Cross-Platform",
    description: "Consistent experience across desktop, web, and mobile platforms"
  },
  {
    icon: Gamepad2,
    title: "Enhanced Controls",
    description: "Intuitive control schemes optimized for both touch and traditional input"
  },
  {
    icon: Trophy,
    title: "Improved Progression",
    description: "Streamlined advancement systems with clear objectives and rewards"
  }
];

export default function GamingShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Gaming Excellence</h2>
          <p className="text-xl text-gray-300">Our flagship games with enhanced playability and mobile optimization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {games.map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-800/50 border-gray-700 overflow-hidden group hover:bg-gray-800/70 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-orange-500/20 to-purple-500/20 relative overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500 text-white">
                      {game.status}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white group-hover:text-orange-300 transition-colors">
                        {game.title}
                      </CardTitle>
                      <p className="text-orange-400 font-medium">{game.subtitle}</p>
                    </div>
                    <Gamepad2 className="w-8 h-8 text-orange-500" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-gray-300 leading-relaxed">
                    {game.description}
                  </p>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">PLATFORMS</h4>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map((platform, platformIndex) => (
                        <Badge key={platformIndex} variant="outline" className="border-gray-600 text-gray-300">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">FEATURES</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {game.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-orange-400" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-orange-400">ENHANCED VERSION IMPROVEMENTS</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Smartphone className="w-4 h-4 text-orange-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">Mobile Optimization</p>
                          <p className="text-xs text-gray-400">{game.improvements.mobile}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Trophy className="w-4 h-4 text-orange-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">Enhanced Playability</p>
                          <p className="text-xs text-gray-400">{game.improvements.playability}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                      onClick={() => {
                        if (game.steamUrl) {
                          window.open(game.steamUrl, '_blank');
                        } else if (game.platformUrl) {
                          window.location.href = game.platformUrl;
                        }
                      }}
                    >
                      Play Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-8">Enhancement Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enhancements.map((enhancement, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <enhancement.icon className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{enhancement.title}</h4>
                <p className="text-sm text-gray-400">{enhancement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience Our Games?</h3>
            <p className="text-lg text-gray-300 mb-6">
              Join the Grudge ecosystem — play Grudge Warlords, compete in arena PvP, and create with our game dev tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => window.open('https://grudgewarlords.com', '_blank')}
              >
                Play Grudge Warlords
              </Button>
              <Button 
                variant="outline" 
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black"
                onClick={() => window.open('https://store.steampowered.com/app/2707990/Grudge/', '_blank')}
              >
                Grudge on Steam
              </Button>
              <Button 
                variant="outline" 
                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black"
                onClick={() => window.location.href = '/tower-defense'}
              >
                Try Tower Defense
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}