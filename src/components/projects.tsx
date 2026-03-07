import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gamepad2, Rocket, Zap } from "lucide-react";

const projects = [
  {
    title: "Grudge",
    description: "Our flagship Steam game featuring immersive gameplay, strategic combat mechanics, and rich storytelling. Available now on Steam with enhanced mobile optimization.",
    image: "https://framerusercontent.com/images/Lp3Ng0LfDz7uZD3T3bDgsjuM8.png",
    technologies: ["Steam Game", "PC Gaming", "Mobile Ready"],
    icon: Gamepad2,
    category: "Published Game",
    link: "https://store.steampowered.com/app/2707990/Grudge/"
  },
  {
    title: "Tower Defense",
    description: "Strategic tower defense game with 8 tower types, wave-based gameplay, and optimized touch controls for seamless gaming experience.",
    image: "https://framerusercontent.com/images/Lp3Ng0LfDz7uZD3T3bDgsjuM8.png",
    technologies: ["Web Platform", "Mobile Optimized", "Cross-Platform"],
    icon: Zap,
    category: "Gaming Platform",
    link: "/tower-defense"
  },
  {
    title: "Grudge Platform",
    description: "Comprehensive investment and gaming ecosystem connecting investors with innovative gaming projects and blockchain technology opportunities.",
    image: "https://framerusercontent.com/images/Lp3Ng0LfDz7uZD3T3bDgsjuM8.png",
    technologies: ["Investment Platform", "Blockchain", "Community"],
    icon: Rocket,
    category: "Investment Platform",
    link: "https://www.grudgeplatform.com/invest"
  }
];

export default function Projects() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" id="projects">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Work That Makes Us Proud</h2>
          <p className="text-xl text-gray-600">Some of our Recent Works</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const IconComponent = project.icon;
            return (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {project.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {project.category === "Published Game" ? "Play on Steam" : 
                     project.category === "Gaming Platform" ? "Try Platform" : "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3"
          >
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}