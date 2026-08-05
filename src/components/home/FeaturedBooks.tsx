import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ShoppingCart, ArrowRight, Download, Loader2, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import EbookDetailDialog from "@/components/ebooks/EbookDetailDialog";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { motion } from "framer-motion";

const FeaturedBooks = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .eq("category", "Books")
          .order("created_at", { ascending: false })
          .limit(3);

        if (!error && data) setBooks(data);
      } catch (err) {
        console.error("Error cargando libros:", err);
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
      title: "Mini Ebook agregado al carrito",
      description: `${product.name} fue agregado. Podés continuar comprando.`,
    });
  };

  if (!loading && books.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <ScrollReveal width="100%" duration={0.8} direction="right">
        <div className="relative max-w-4xl mx-auto mb-14 px-6 md:px-10 py-10 md:py-14 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500 shadow-2xl border-4 border-cyan-300/30">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M25 30a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0 10a5 5 0 1 1 0-10 5 5 0 0 1 0 10zM25 10a5 5 0 1 1 0-10 5 5 0 0 1 0 10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/25 backdrop-blur-sm text-white font-bold text-sm uppercase tracking-widest mb-5 border border-white/40">
              <Book className="w-4 h-4" />
              Material de Consulta
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-5 leading-none tracking-tight drop-shadow-lg">
              <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-100 bg-clip-text text-transparent">Mini Ebooks</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
              Material digital en formato PDF. Guías rápidas y contenido específico para tu consulta.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-white/95 font-medium">
              <span className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <Download className="w-4 h-4" /> Descarga instantánea
              </span>
              <span className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                📧 Enviado por email
              </span>
              <span className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                📱 Lee en cualquier dispositivo
              </span>
            </div>
          </div>
        </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
          </div>
        ) : (
          <StaggerContainer 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            staggerDelay={0.15}
          >
            {books.map((product) => (
              <StaggerItem key={product.id}>
              <motion.article
                whileHover={{ 
                  scale: 1.03,
                  rotateY: 2,
                  rotateX: -2,
                  transition: { duration: 0.3 }
                }}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cyan-100 flex flex-col cursor-pointer"
                onClick={() => setSelectedBook(product)}
              >
                <div className="relative h-52 bg-gradient-to-br from-cyan-50 to-blue-100 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book className="w-24 h-24 text-cyan-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-cyan-500 text-white text-xs font-medium px-3 py-1">
                      <Book className="w-3 h-3 mr-1" />
                      Mini Ebook
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
                  <h3
                    className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-600 transition-colors leading-tight cursor-pointer"
                    onClick={() => navigate(`/producto/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-base mb-4 line-clamp-3 flex-1">
                    {product.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-cyan-100">
                    <div>
                      <span className="text-3xl font-bold text-cyan-700">
                        ${product.price.toLocaleString("es-AR")}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="block text-sm text-muted-foreground line-through">
                          ${product.original_price.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/producto/${product.id}`)}
                        title="Compartir"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="text-base border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white px-8 py-4">
            <Link to="/mini-ebooks">
              Ver Todos los Mini Ebooks
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>

      <EbookDetailDialog
        ebook={selectedBook}
        open={!!selectedBook}
        onOpenChange={(open) => !open && setSelectedBook(null)}
      />
    </section>
  );
};

export default FeaturedBooks;
