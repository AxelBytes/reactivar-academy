import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ShoppingCart, ArrowRight, Download, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const FeaturedEbooks = () => {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .eq("category", "Digital")
          .order("created_at", { ascending: false })
          .limit(3);

        if (!error && data) setEbooks(data);
      } catch (err) {
        console.error("Error cargando ebooks:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddToCart = (product: any) => {
    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "",
      category: product.category,
    });
    toast({
      title: "Ebook agregado al carrito",
      description: `${product.name} fue agregado. Podés continuar comprando.`,
    });
  };

  if (!loading && ebooks.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Materiales digitales
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Ebooks
          </h2>
          <p className="text-lg text-muted-foreground">
            Diseñado por el profesor Diego Machado y su equipo de trabajo. Para profesores, entrenadores y también jugadores que quieran aprender y elevar su nivel en competencia.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-blue-700">
            <span className="flex items-center gap-1"><Download className="w-4 h-4" /> Descarga instantánea</span>
            <span className="flex items-center gap-1">📧 Enviado por email</span>
            <span className="flex items-center gap-1">📱 Usalo en cualquier dispositivo</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map((product) => (
              <article
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 flex flex-col"
              >
                <div className="relative h-52 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-24 h-24 text-blue-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white text-xs font-medium px-3 py-1">
                      <FileText className="w-3 h-3 mr-1" />
                      PDF Digital
                    </Badge>
                  </div>
                  {product.original_price && product.original_price > product.price && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-red-500 text-white text-xs">
                        -{Math.round((1 - product.price / product.original_price) * 100)}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-base mb-4 line-clamp-3 flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                    <div>
                      <span className="text-3xl font-bold text-blue-700">
                        ${product.price.toLocaleString("es-AR")}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="block text-sm text-muted-foreground line-through">
                          ${product.original_price.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold"
                      onClick={() => handleAddToCart(product)}
                      disabled={isInCart(product.id, "product")}
                    >
                      {isInCart(product.id, "product") ? (
                        "En el carrito ✓"
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4">
            <Link to="/pdfs">
              Ver Todos los Ebooks
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEbooks;
