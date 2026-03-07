import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const brandGallery = [
  {
    category: "Logo Variants",
    items: [
      {
        image: "https://framerusercontent.com/images/3XwBBaY5Sv2nUacebkTDBMDc.png",
        title: "Primary Logo",
        description: "Main brand identifier"
      },
      {
        image: "https://framerusercontent.com/images/KoV16cZks0yEqkkT0F5QkoAyXM.png",
        title: "Logo White",
        description: "Light background variant"
      },
      {
        image: "https://framerusercontent.com/images/nnyJLiT9WrHIjM0ZOJy6RTKCc.png",
        title: "Brand Mark",
        description: "Simplified icon version"
      }
    ]
  },
  {
    category: "Development Visuals",
    items: [
      {
        image: "https://framerusercontent.com/images/kqJNnjGgAUImwuaX1RZZWjFMc.png",
        title: "Development Interface",
        description: "Custom development workspace"
      },
      {
        image: "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
        title: "Planning & Organization",
        description: "Project management tools"
      },
      {
        image: "https://framerusercontent.com/images/MDv2na8OgL3K1uWIO03HB27xCmU.jpeg",
        title: "Technical Stack",
        description: "Technology integration"
      }
    ]
  },
  {
    category: "Integration Assets",
    items: [
      {
        image: "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
        title: "Workflow Trigger",
        description: "Automation systems"
      },
      {
        image: "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
        title: "Process Flow",
        description: "Integration pathways"
      },
      {
        image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
        title: "Data Processing",
        description: "Information handling"
      },
      {
        image: "https://framerusercontent.com/images/osFEtXrggbbUFT2PcLhEKwtKw.png",
        title: "Communication Hub",
        description: "Messaging systems"
      }
    ]
  }
];

export default function BrandGallery() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Brand & Visual Assets</h2>
          <p className="text-xl text-gray-600">Authentic design elements that define our identity</p>
        </div>

        {brandGallery.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-16 last:mb-0">
            <div className="flex items-center justify-center mb-8">
              <Badge variant="outline" className="text-lg px-6 py-2 border-orange-200 text-orange-600">
                {section.category}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={itemIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Consistent Brand Experience</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Every visual element is crafted to reflect our commitment to quality, innovation, and professional excellence across all touchpoints.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-orange-500 text-white px-4 py-2">Brand Identity</Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2">Visual Consistency</Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2">Professional Design</Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2">Authentic Assets</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}