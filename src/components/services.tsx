import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Blocks, Cpu, Globe, Shield, Zap, Database, Users } from "lucide-react";

const services = [
  {
    icon: Code,
    title: "Full-Custom Solutions",
    description: "Develop adaptable solutions that comprehend and tackle any development challenge with precision and innovation.",
    features: ["Custom Development", "Scalable Architecture", "Performance Optimization"],
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    icon: Cpu,
    title: "AI Innovation",
    description: "Integrate cutting-edge artificial intelligence to enhance user experiences and automate complex processes.",
    features: ["Machine Learning", "Natural Language Processing", "Predictive Analytics"],
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    icon: Globe,
    title: "Web3 Integration",
    description: "Build decentralized applications and blockchain solutions that push the boundaries of technology.",
    features: ["Smart Contracts", "DeFi Solutions", "NFT Platforms"],
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    icon: Database,
    title: "Data Insight",
    description: "Transform raw data into actionable insights with advanced analytics and visualization tools.",
    features: ["Data Analytics", "Business Intelligence", "Real-time Dashboards"],
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    icon: Users,
    title: "Community Onboarding",
    description: "Build dynamic systems and seamless integrations to empower your community and enhance engagement.",
    features: ["User Onboarding", "Community Management", "Engagement Tools"],
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    icon: Shield,
    title: "API/Blockchain Security",
    description: "Implement robust security measures to protect your applications and blockchain infrastructure.",
    features: ["Security Audits", "Penetration Testing", "Compliance Monitoring"],
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  {
    icon: Zap,
    title: "Real-Time Support",
    description: "Provide instant support and monitoring solutions to ensure optimal performance and user satisfaction.",
    features: ["24/7 Monitoring", "Live Chat Support", "Performance Analytics"],
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    icon: Blocks,
    title: "Dynamic Development",
    description: "Create flexible and scalable development workflows that adapt to changing requirements and technologies.",
    features: ["Agile Development", "Continuous Integration", "DevOps Solutions"],
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  }
];

export default function Services() {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" id="services">
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-gray-300">Expertise That Drives Quality</p>
          <p className="text-lg text-gray-400 mt-2">
            With deep expertise, we deliver quality solutions that drive success and exceed industry standards consistently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className={`bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${service.borderColor} border-2`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`w-8 h-8 ${service.color}`} />
                  </div>
                  <CardTitle className={`text-lg text-gray-900 ${service.color}`}>
                    {service.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {service.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs mr-1 mb-1">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3 mr-4"
            onClick={() => window.open('https://discord.gg/grudgestudio', '_blank')}
          >
            Join Our Discord
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Portfolio
          </Button>
        </div>
      </div>
    </section>
  );
}