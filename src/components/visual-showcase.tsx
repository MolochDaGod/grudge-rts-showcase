import { motion } from "framer-motion";

const brandAssets = [
  {
    name: "Brand Logo Variations",
    images: [
      "https://framerusercontent.com/images/ovMvicuECHwWrsvIq3llSxcgy8.png",
      "https://framerusercontent.com/images/emkvRbVNvzU8F33yxzXCm7kph4.png", 
      "https://framerusercontent.com/images/UyrhMEKO18YDAqja8AYX7kNBWw.png",
      "https://framerusercontent.com/images/mkiO0D2RyUjDpR6PzL8NNb1A.png"
    ]
  },
  {
    name: "Technology Integration",
    images: [
      "https://framerusercontent.com/images/YX9i3N9waLZ4JydRrYz5jum2W5o.png",
      "https://framerusercontent.com/images/RQWGh7f8Cnb8blhaJXengKND4Bw.png",
      "https://framerusercontent.com/images/c9Gh7XP4x4E6sMd2DeLSYdnLA.png",
      "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png"
    ]
  },
  {
    name: "Development Assets",
    images: [
      "https://framerusercontent.com/images/eKkVfcsfk3DfPJ0dLoklf2yAQw.png",
      "https://framerusercontent.com/images/zNQ5OIQGjYHmV7gZT5TlsNbB8Oo.png",
      "https://framerusercontent.com/images/zL8hKW3Mcw3iWl72VTAJ6lhP3I.png",
      "https://framerusercontent.com/images/U7CVJK3JBwK9BzYwcbk3Fpemxo.png"
    ]
  }
];

export default function VisualShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Design Philosophy</h2>
          <p className="text-xl text-gray-600">Visual excellence meets functional innovation</p>
        </div>

        {brandAssets.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16 last:mb-0">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
              {category.name}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {category.images.map((image, imageIndex) => (
                <motion.div
                  key={imageIndex}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: imageIndex * 0.1 
                  }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="aspect-square flex items-center justify-center">
                      <img
                        src={image}
                        alt={`${category.name} ${imageIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Something Amazing?</h3>
            <p className="text-lg mb-6">
              Let's transform your vision into reality with our proven design and development expertise.
            </p>
            <motion.button
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Project
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}