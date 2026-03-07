import { motion } from "framer-motion";

const expertiseLogos = [
  {
    name: "Unreal Engine",
    image: "https://framerusercontent.com/images/KZxyxtoR5Qw2N4MJp52Ticj4.png"
  },
  {
    name: "Blockchain",
    image: "https://framerusercontent.com/images/HbuaBWVgEI5D4YUj1bqGRRmPzdc.png"
  },
  {
    name: "Unity",
    image: "https://framerusercontent.com/images/z1de2pxUinWLdnTQL1dvYD2LILk.png"
  },
  {
    name: "Web3",
    image: "https://framerusercontent.com/images/tgdMeb8SORSRH6LxCHG9oTT0UP4.png"
  },
  {
    name: "Discord",
    image: "https://framerusercontent.com/images/dJ9DW8UvU4NsNB2WJt5jpGsNU.png"
  },
  {
    name: "React",
    image: "https://framerusercontent.com/images/QEt0Q7u89f6G3CaMfpirSh9T5jE.png"
  }
];

export default function ExpertiseLogos() {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 to-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold text-white mb-4">Expertise</h3>
          <p className="text-gray-300">Technologies we master</p>
        </div>
        
        <div className="relative">
          <motion.div
            className="flex space-x-8"
            animate={{
              x: [0, -1920],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {/* First set of logos */}
            {expertiseLogos.map((logo, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 w-24 h-24 bg-white/10 rounded-lg p-4 flex items-center justify-center"
              >
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter brightness-0 invert"
                />
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {expertiseLogos.map((logo, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 w-24 h-24 bg-white/10 rounded-lg p-4 flex items-center justify-center"
              >
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter brightness-0 invert"
                />
              </div>
            ))}
            
            {/* Third set for extra smooth loop */}
            {expertiseLogos.map((logo, index) => (
              <div
                key={`third-${index}`}
                className="flex-shrink-0 w-24 h-24 bg-white/10 rounded-lg p-4 flex items-center justify-center"
              >
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter brightness-0 invert"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}