import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutDialog from "@/components/checkout/CheckoutDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FileText, ShoppingCart, Search, Download, Star, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";

const Pdfs = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .eq("category", "Digital")
          .order("created_at", { ascending: false });

        if (error) { setProducts([]); return; }
        setProducts(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "",
      quantity: 1,
    });
    toast({
      title: "📄 Agregado al carrito",
      description: `${product.name} fue agregado. Podés continuar comprando.`,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <SEO
        title="Productos Digitales PDF - Reactivar Academy"
        description="Descargá nuestros materiales educativos en PDF. Reglamentos, guías y recursos para profesores de educación física."
      />
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Productos Digitales</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Materiales PDF
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Descargá al instante reglamentos, guías y recursos educativos pensados
              para profesores de educación física.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 w-4 h-4" />
              <Input
                placeholder="Buscar materiales..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-blue-200 focus:bg-white/20"
              />
            </div>
          </div>
        </section>

        {/* Benefits strip */}
        <section className="bg-blue-50 border-b border-blue-100 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-800">
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Descarga instantánea</span>
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Formato PDF</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Contenido de calidad</span>
              <span className="flex items-center gap-2">📧 Enviado por email</span>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-medium">
                  {searchQuery ? "No se encontraron resultados" : "Pronto habrá materiales disponibles"}
                </p>
                <p className="text-sm mt-2">
                  {searchQuery ? "Intentá con otro término de búsqueda" : "Volvé pronto para ver las novedades"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {filtered.length} {filtered.length === 1 ? "material disponible" : "materiales disponibles"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(product => (
                    <Card key={product.id} className="group flex flex-col overflow-hidden hover:shadow-lg transition-shadow border-blue-100">
                      {/* Image / Cover */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-20 h-20 text-blue-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-blue-600 text-white text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            PDF Digital
                          </Badge>
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-red-500 text-white text-xs">
                              -{Math.round((1 - product.price / product.original_price) * 100)}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="flex-1 p-5">
                        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {product.description}
                        </p>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {product.features.slice(0, 3).map((feat: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="text-blue-500 mt-0.5">✓</span>
                                {feat}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>

                      <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-2xl font-bold text-blue-700">
                            ${product.price.toLocaleString("es-AR")}
                          </p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${product.original_price.toLocaleString("es-AR")}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={isInCart(product.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {isInCart(product.id) ? (
                            "En el carrito ✓"
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Comprar
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Info banner */}
        <section className="bg-blue-50 border-t border-blue-100 py-10 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-bold mb-2">¿Cómo recibo mi PDF?</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Luego de confirmar el pago te enviamos el archivo adjunto directamente a tu correo electrónico.
              Revisá tu bandeja de entrada y también la carpeta de <strong>spam</strong> por las dudas.
              La entrega es automática e inmediata.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  );
};

export default Pdfs;
