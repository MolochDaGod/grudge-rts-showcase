import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqData = [
  {
    question: "What makes Grudge Studio different from others?",
    answer: "Grudge Studio stands out with our unique approach to custom development solutions. We specialize in cutting-edge technology including MMO game development, blockchain integration, and AI innovation. Our team combines deep technical expertise with creative vision to deliver solutions that push boundaries and exceed industry standards."
  },
  {
    question: "How does AI enhance the services provided by Grudge Studio?",
    answer: "We integrate AI across our development processes to enhance user experiences, automate complex workflows, and provide intelligent solutions. Our AI capabilities include machine learning algorithms, natural language processing, and predictive analytics that help create more engaging and efficient applications."
  },
  {
    question: "How does Grudge Studio ensure the quality of its solutions?",
    answer: "Quality is at the core of everything we do. We follow rigorous development standards, conduct comprehensive testing, and provide ongoing support. Our experienced team of developers, led by our technical experts, ensures every project meets the highest standards of performance, security, and user experience."
  },
  {
    question: "Does Grudge Studio offer customized solutions?",
    answer: "Yes, custom solutions are our specialty. We develop adaptable solutions that comprehend and tackle any development challenge with precision. From MMO games and blockchain applications to AI-powered platforms, we create tailored solutions that fit your specific requirements and business goals."
  },
  {
    question: "What types of projects does Grudge Studio work on?",
    answer: "We work on diverse projects including MMO game development, gaming launchers, trading card games, blockchain applications, Web3 integrations, custom software solutions, and AI-powered platforms. Our portfolio includes the Grudge Launcher, Grudge MMO Game, and Nexus TCG Game."
  },
  {
    question: "How long does a typical project take?",
    answer: "Project timelines vary based on complexity and scope. Simple integrations may take weeks, while comprehensive custom solutions like MMO games can take several months. We provide detailed project timelines during our initial consultation and keep you updated throughout the development process."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Need to Know</h2>
          <p className="text-xl text-gray-600">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-orange-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-500" />
                  )}
                </CardTitle>
              </CardHeader>
              
              {openIndex === index && (
                <CardContent className="pt-0 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}