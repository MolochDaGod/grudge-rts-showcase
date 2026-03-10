import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Hero() {
  return (
    <section className="gradient-bg text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <img 
            src="https://framerusercontent.com/images/3XwBBaY5Sv2nUacebkTDBMDc.png" 
            alt="Grudge Studio Logo" 
            className="w-24 h-24 mx-auto mb-8 object-contain"
          />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Full Custom Solutions<br />Beyond <span className="text-orange-300">⚛</span> Limits
        </h1>
        <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
          Powering Grudge Warlords MMO, GDevelop Assistant, GrudaChain, and 849+ indexed 3D models.
          From live game servers to blockchain integration — real tools, real games, real ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/advantage">
            <Button 
              size="lg" 
              className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-3"
            >
              Discover Our Advantage
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
            onClick={() => window.location.href = '#projects'}
          >
            View Our Work
          </Button>
        </div>
      </div>
    </section>
  );
}
