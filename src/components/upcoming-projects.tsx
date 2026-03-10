import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Code, Gamepad2, Database, Globe, Zap, Bot, Shield, Users } from "lucide-react";

const upcomingProjects = [
  {
    title: "GrudaChain Public Launch",
    description: "On-chain systems for the Grudge ecosystem — Solana wallet integration via Web3Auth, token-gated access, and on-chain asset ownership for Grudge Warlords items.",
    status: "In Development",
    technologies: ["Solana", "Web3Auth", "Smart Contracts"],
    icon: Globe,
    category: "Blockchain",
    timeline: "Q2 2026",
    image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png"
  },
  {
    title: "3D Model Library Public API",
    description: "Public REST API serving the 849+ indexed 3D models (GLB, FBX, OBJ) from GDevelop Assistant. Search, filter, stream, and integrate models into any game engine.",
    status: "In Development",
    technologies: ["REST API", "Three.js", "849+ Models"],
    icon: Database,
    category: "Developer Tools",
    timeline: "Q2 2026",
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png"
  },
  {
    title: "Grudge Warlords Mobile",
    description: "Mobile-optimized client for Grudge Warlords MMO — touch controls, responsive UI, offline island management, and cross-platform account sync.",
    status: "Planning",
    technologies: ["React Native", "Mobile", "Cross-Platform"],
    icon: Gamepad2,
    category: "Mobile Gaming",
    timeline: "Q3 2026",
    image: "https://framerusercontent.com/images/kqJNnjGgAUImwuaX1RZZWjFMc.png"
  },
  {
    title: "AI Agent Service v2",
    description: "Specialized AI agents for game development — code generation, art direction, lore writing, balance tuning, QA testing, and mission design for Grudge Warlords.",
    status: "Early Development",
    technologies: ["AI Agents", "LLM", "Game Dev"],
    icon: Bot,
    category: "AI Platform",
    timeline: "Q3 2026",
    image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png"
  },
  {
    title: "Grudge Studio Marketplace",
    description: "Creator marketplace for game assets, templates, mods, and services. Integrated with Grudge auth, GrudaChain payments, and the 3D model library.",
    status: "Concept",
    technologies: ["Marketplace", "Payments", "Creator Economy"],
    icon: Shield,
    category: "Commerce",
    timeline: "Q4 2026",
    image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg"
  },
  {
    title: "Grudge Warlords Mod SDK",
    description: "Official modding toolkit for Grudge Warlords — custom islands, new factions, weapon types, AI behaviors, and community content pipeline.",
    status: "Planning",
    technologies: ["SDK", "Modding", "Community"],
    icon: Code,
    category: "Developer Tools",
    timeline: "2027",
    image: "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png"
  }
];

const statusColors = {
  "In Development": "bg-blue-100 text-blue-800",
  "Planning": "bg-yellow-100 text-yellow-800", 
  "Research Phase": "bg-purple-100 text-purple-800",
  "Concept": "bg-gray-100 text-gray-800",
  "Early Development": "bg-green-100 text-green-800"
};

export default function UpcomingProjects() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What's Coming Next</h2>
          <p className="text-xl text-gray-300">Upcoming projects and innovations in development</p>
          <p className="text-lg text-gray-400 mt-2">
            Expanding our portfolio with cutting-edge solutions across gaming, AI, blockchain, and enterprise tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingProjects.map((project, index) => {
            const IconComponent = project.icon;
            return (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                      <IconComponent className="w-6 h-6 text-orange-400" />
                    </div>
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-orange-300 transition-colors">
                    {project.title}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit text-gray-400 border-gray-600">
                    {project.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="bg-gray-700 text-gray-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{project.timeline}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-black"
                      onClick={() => window.open('https://discord.gg/grudgestudio', '_blank')}
                    >
                      Follow Progress
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Interested in collaborating on any of these projects or have a custom solution in mind?
          </p>
          <Button 
            className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3"
            onClick={() => window.open('https://discord.gg/grudgestudio', '_blank')}
          >
            Join the Discussion
          </Button>
        </div>
      </div>
    </section>
  );
}