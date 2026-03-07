import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Twitter } from "lucide-react";

const teamMembers = [
  {
    name: "Racalvin",
    role: "Lead Developer",
    image: "https://framerusercontent.com/images/6CC7mecL0FCGuCbZNDoA9prwI.jpg",
    description: "Leading development initiatives with expertise in gaming systems and blockchain technology.",
  },
  {
    name: "Scorge",
    role: "Creative Director",
    image: "https://framerusercontent.com/images/tayX5HnUIUYgGD7Hcs1zsxGAK8E.png",
    description: "Driving creative vision and ensuring exceptional user experiences across all projects.",
  },
  {
    name: "FatalX3rror",
    role: "Head of BD & Strategic Partnerships",
    image: "https://framerusercontent.com/images/XVBd8JBlY22NA0oKlsdCppvu38.png",
    description: "Building strategic partnerships and expanding business development opportunities.",
  }
];

export default function Team() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Creative Minds</h2>
          <p className="text-xl text-gray-600 mb-2">The People Behind the Magic</p>
          <p className="text-lg text-gray-500">Meet our talented team turning ideas into exceptional results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-orange-100"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white">Team</Badge>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-orange-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {member.description}
                </p>
                
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}