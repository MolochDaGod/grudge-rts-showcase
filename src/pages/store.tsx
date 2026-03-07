import Header from "@/components/header";
import StoreSection from "@/components/store-section";
import Footer from "@/components/footer";

export default function Store() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-20">
        <StoreSection />
      </div>
      <Footer />
    </div>
  );
}
