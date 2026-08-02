import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, CreditCard } from "lucide-react";
import type { StoreProduct } from "@/shared/schema";
import PaymentForm from "./payment-form";

// Fallback products when API is unavailable
const fallbackProducts: StoreProduct[] = [
  {
    id: 1,
    name: "Game Development Package",
    description: "Full-stack game development services including design, coding, testing, and deployment for your custom game project.",
    price: 49900,
    image: "https://framerusercontent.com/images/kqJNnjGgAUImwuaX1RZZWjFMc.png",
    category: "service",
    features: ["Custom Game Design", "Cross-Platform Deploy", "3 Revision Rounds", "Source Code Included"],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "3D Asset Pack — Pro",
    description: "Curated pack of 100+ production-ready 3D models from the Grudge model library — characters, weapons, buildings, and props.",
    price: 2900,
    image: "https://framerusercontent.com/images/3EjDBnc06ZqM2DalAwEiwBISOzc.png",
    category: "asset",
    features: ["100+ GLB Models", "Game-Ready LODs", "Commercial License", "Grudge UUID Tagged"],
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Grudge Premium Access",
    description: "Premium tier across the Grudge ecosystem — priority access to Grudge Warlords features, GDevelop Assistant tools, and GrudaChain benefits.",
    price: 999,
    image: "https://framerusercontent.com/images/Lp3Ng0LfDz7uZD3T3bDgsjuM8.png",
    category: "subscription",
    features: ["Premium Warlords Features", "Priority Model API", "GrudaChain Benefits", "Discord VIP Role"],
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export default function StoreSection() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  const { data: apiProducts, isLoading, isError } = useQuery<StoreProduct[]>({
    queryKey: ["/api/store/products"],
    retry: 1,
    staleTime: 60_000,
  });

  // Use API data if available, otherwise fall back to static products
  const products = (apiProducts && apiProducts.length > 0) ? apiProducts : (isLoading ? [] : fallbackProducts);

  const createOrderMutation = useMutation({
    mutationFn: async (data: { customerEmail: string; productId: number; paymentMethod: string }) => {
      const response = await apiRequest("POST", "/api/store/orders", {
        ...data,
        amount: products.find(p => p.id === data.productId)?.price || 0,
        paymentStatus: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "Your order has been created. You will be redirected to payment.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/store/orders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (productId: number, paymentMethod: string = "card") => {
    // In a real app, you'd collect the customer email
    const customerEmail = "customer@example.com";
    createOrderMutation.mutate({ customerEmail, productId, paymentMethod });
  };

  const formatPrice = (priceInCents: number) => {
    if (priceInCents >= 100000) {
      return `$${(priceInCents / 100).toLocaleString()}+`;
    }
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  return (
    <section id="store" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Solutions</h2>
          <p className="text-xl text-gray-600">Professional development services and custom solutions</p>
        </div>

        {isLoading && !isError ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-8">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="card-hover bg-gray-50">
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                      {product.category === "api" && <span className="text-sm font-normal">/mo</span>}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{product.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {product.features?.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="text-green-500 mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    className="w-full gradient-bg"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {product.category === "enterprise" ? "Contact Sales" : `Buy Now - $${formatPrice(product.price)}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Options */}
        <Card className="mt-16 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Secure Payment Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fab fa-paypal text-blue-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">PayPal</h4>
                <p className="text-sm text-gray-600">Secure payments via PayPal with buyer protection</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fab fa-bitcoin text-yellow-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Cryptocurrency</h4>
                <p className="text-sm text-gray-600">Bitcoin, Ethereum, and other major cryptocurrencies</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-green-600 h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Debit & Credit Cards</h4>
                <p className="text-sm text-gray-600">Visa, Mastercard, American Express accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form Modal */}
      {selectedProduct && (
        <PaymentForm
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          price={selectedProduct.price}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
