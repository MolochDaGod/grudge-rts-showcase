import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, Target, TrendingUp, Code, Blocks } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Innovative Approach",
    description: "Look for works that reflect a unique character and differentiate in a crowded marketplace.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    icon: Users,
    title: "Seamless Experience",
    description: "A seamless user experience across all devices, ensuring every interaction connects with the user.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Ongoing Partnership",
    description: "Find a new partner easily, not just providers, who offer ongoing support even after the project ends.",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Code,
    title: "Custom Projects",
    description: "Develop adaptable solutions that comprehend and tackle any development challenge with precision.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Blocks,
    title: "Integration Solutions",
    description: "Build and integrate solutions to enhance efficiency and strengthen communities.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    icon: TrendingUp,
    title: "Expertise That Drives Quality",
    description: "With deep expertise, we deliver quality solutions that drive success and exceed industry standards consistently.",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" id="features">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Experience the Benefits of Our Expertise</h2>
          <p className="text-xl text-gray-600">That drives impactful gain powerful results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="card-hover bg-white">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                    <IconComponent className={`${feature.color} h-6 w-6`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
