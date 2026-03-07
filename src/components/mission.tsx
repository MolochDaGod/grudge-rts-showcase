import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Mission() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Passionate about turning ideas into reality. Creating innovative products that push boundaries. 
              From MMO Game Development to cutting-edge blockchain technology, we're dedicated to delivering 
              quality and creativity in everything we do.
            </p>
            <Button 
              size="lg" 
              className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3"
            >
              Book A Call
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">5+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-sm text-gray-600">Projects Completed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Client Satisfaction</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}