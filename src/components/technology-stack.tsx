import { motion } from "framer-motion";

const technologyStacks = [
  {
    category: "Game Development",
    image: "https://framerusercontent.com/images/7bxHqxSQqyn94XGykE6IVNtw1Eo.svg",
    technologies: ["Unity", "Unreal Engine", "C#", "C++", "Multiplayer Systems"]
  },
  {
    category: "Blockchain & Web3",
    image: "https://framerusercontent.com/images/hpu0TmZwLCrVSOtd6hOIG7lP8.svg",
    technologies: ["Solidity", "Smart Contracts", "DeFi", "NFTs", "Web3 Integration"]
  },
  {
    category: "AI & Machine Learning",
    image: "https://framerusercontent.com/images/K4mauElkun2mVNvT5AVW15LwJWI.svg",
    technologies: ["TensorFlow", "PyTorch", "Computer Vision", "NLP", "Predictive Analytics"]
  },
  {
    category: "Backend Development",
    image: "https://framerusercontent.com/images/sv2a4eygGjiTAs6GVt1u05sNYo.svg",
    technologies: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Microservices"]
  }
];

export default function TechnologyStack() {
  return (
    <section className="py-20 bg-gradient-to-br from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Technology Mastery</h2>
          <p className="text-xl text-gray-300">Our comprehensive technical expertise across multiple domains</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologyStacks.map((stack, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 group-hover:scale-105">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <img 
                      src={stack.image}
                      alt={stack.category}
                      className="w-8 h-8 filter brightness-0 invert"
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-center mb-4 group-hover:text-orange-300 transition-colors">
                  {stack.category}
                </h3>
                
                <div className="space-y-2">
                  {stack.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 text-center">
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Full-Stack Excellence</h3>
            <p className="text-lg text-gray-300 mb-6">
              From concept to deployment, we master every layer of modern technology stacks
            </p>
            <motion.button
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Our Capabilities
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}