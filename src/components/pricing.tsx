import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Consultation",
    price: "Free",
    description: "Perfect for exploring custom solutions",
    features: [
      "Initial project assessment",
      "Technology consultation",
      "Architecture planning",
      "Cost estimation",
    ],
    buttonText: "Book A Call",
    buttonVariant: "outline" as const,
  },
  {
    name: "Development Package",
    price: "$999",
    period: "/project",
    description: "For custom development projects",
    features: [
      "Custom development",
      "Integration solutions",
      "Quality assurance",
      "Documentation",
      "3 months support",
      "Source code delivery",
    ],
    buttonText: "Get Started",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise Partnership",
    price: "Custom",
    description: "For large-scale custom solutions",
    features: [
      "Full-custom solutions",
      "Dedicated development team",
      "Ongoing partnership",
      "SLA guarantee",
      "24/7 support",
      "Scalable architecture",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that fits your development needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? "border-primary border-2 gradient-bg text-white"
                  : "bg-white border shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-secondary text-white px-3 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className={plan.popular ? "text-white" : "text-gray-900"}>
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-lg ${plan.popular ? "text-indigo-100" : "text-gray-600"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 ${plan.popular ? "text-indigo-100" : "text-gray-600"}`}>
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className={`mr-3 h-4 w-4 ${plan.popular ? "text-white" : "text-green-500"}`} />
                      <span className={plan.popular ? "text-white" : "text-gray-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-6">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-white text-primary hover:bg-gray-100"
                        : plan.buttonVariant === "outline"
                        ? "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                        : "gradient-bg text-white"
                    }`}
                    variant={plan.popular ? "secondary" : plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
