import Header from "@/components/header";
import ScrapingTool from "@/components/scraping-tool";
import Footer from "@/components/footer";

export default function Scraping() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-20">
        <ScrapingTool />
      </div>
      <Footer />
    </div>
  );
}
