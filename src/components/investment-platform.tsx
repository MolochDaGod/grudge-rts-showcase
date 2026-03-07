import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Shield, BarChart3, Users, Star, ExternalLink } from "lucide-react";

const investmentFeatures = [
  {
    icon: TrendingUp,
    title: "Growth Potential",
    description: "Strategic investments in cutting-edge gaming and blockchain technology",
    highlight: "High ROI Opportunities"
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Bank-level security with blockchain transparency and smart contract protection",
    highlight: "Verified & Audited"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Real-time tracking of investment performance with detailed analytics dashboard",
    highlight: "Live Data Insights"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join a community of investors backing innovative gaming and tech projects",
    highlight: "Exclusive Access"
  }
];

const investmentTiers = [
  {
    name: "Starter",
    amount: "$500",
    period: "minimum",
    features: [
      "Portfolio dashboard access",
      "Monthly performance reports",
      "Community forum access",
      "Basic analytics tools"
    ],
    highlight: false
  },
  {
    name: "Growth",
    amount: "$2,500",
    period: "minimum", 
    features: [
      "All Starter features",
      "Priority project access",
      "Advanced analytics suite",
      "Direct founder communication",
      "Quarterly strategy calls"
    ],
    highlight: true
  },
  {
    name: "Elite",
    amount: "$10,000",
    period: "minimum",
    features: [
      "All Growth features",
      "Exclusive project previews",
      "Custom investment strategies",
      "1-on-1 advisory sessions",
      "Early access to new platforms"
    ],
    highlight: false
  }
];

export default function InvestmentPlatform() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Investment Opportunities</h2>
          <p className="text-xl text-gray-600">Invest in the future of gaming and blockchain technology</p>
          <p className="text-lg text-gray-500 mt-2">
            Join our platform and be part of revolutionary gaming and tech innovations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {investmentFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <feature.icon className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <Badge className="bg-orange-500 text-white mx-auto">
                    {feature.highlight}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Investment Tiers</h3>
            <p className="text-lg text-gray-600">Choose the investment level that aligns with your goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {investmentTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`relative overflow-hidden ${
                  tier.highlight 
                    ? 'border-orange-500 shadow-xl scale-105' 
                    : 'border-gray-200 hover:shadow-lg'
                } transition-all duration-300`}>
                  {tier.highlight && (
                    <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className={tier.highlight ? 'pt-12' : 'pt-6'}>
                    <div className="text-center">
                      <CardTitle className="text-2xl text-gray-900 mb-2">{tier.name}</CardTitle>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-orange-600">{tier.amount}</span>
                        <span className="text-gray-600 ml-2">{tier.period}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <Star className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className={`w-full ${
                        tier.highlight 
                          ? 'bg-orange-500 text-white hover:bg-orange-600' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                      onClick={() => window.open('https://www.grudgeplatform.com/invest', '_blank')}
                    >
                      Get Started
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-12">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Ready to Invest in Innovation?</h3>
              <p className="text-xl mb-8 opacity-90">
                Join our investment platform and be part of the next generation of gaming and blockchain technology. 
                Access exclusive opportunities with transparent, secure, and profitable investments.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  onClick={() => window.open('https://www.grudgeplatform.com/invest', '_blank')}
                >
                  Start Investing
                  <DollarSign className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg"
                  onClick={() => window.open('https://www.grudgeplatform.com/star', '_blank')}
                >
                  Learn More
                  <Star className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="mt-8 flex justify-center space-x-8 text-sm opacity-75">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>SEC Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Transparent Returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Community Driven</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}