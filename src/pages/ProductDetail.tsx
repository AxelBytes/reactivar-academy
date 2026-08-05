import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Loader2, FileText, Book, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";
import { SEO } from "@/components/SEO";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error cargando producto:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id, isAuthenticated]);

  // Si el usuario llega desde un link compartido sin estar registrado,
  // lo mandamos a crear cuenta y luego lo traemos de vuelta a este producto
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(`/producto/${id}`)}&tab=register`} replace />;
  }

  const handleAddToCart = () => {
    if (!product) return;
    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "",
      category: product.category,
    });
    toast({
      title: "Producto agregado",
      description: `${product.name} fue agregado al carrito`,
    });
  };

  const getCategoryIcon = (category: string) => {
    if (category === "Digital") return <FileText className="w-5 h-5" />;
    if (category === "Books") return <Book className="w-5 h-5" />;
    return <ShoppingBag className="w-5 h-5" />;
  };

  const getCategoryLabel = (category: string) => {
    if (category === "Digital") return "Ebook Educativo";
    if (category === "Books") return "Mini Ebook";
    if (category === "Fisico") return "Artículo Deportivo";
    return category;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} | Reactivar Academy`}
        description={product.description}
        type="product"
        image={product.image_url}
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getCategoryIcon(product.category)}
                  </div>
                )}
                {product.original_price && product.original_price > product.price && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                      -{Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4" variant="secondary">
                  {getCategoryIcon(product.category)}
                  <span className="ml-2">{getCategoryLabel(product.category)}</span>
                </Badge>
                <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.detailed_description && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Descripción Detallada</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.detailed_description}
                  </p>
                </div>
              )}

              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Características</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-primary">
                    ${product.price.toLocaleString("es-AR")}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-2xl text-muted-foreground line-through">
                      ${product.original_price.toLocaleString("es-AR")}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    size="lg"
                    className="flex-1 text-lg py-6"
                    onClick={handleAddToCart}
                    disabled={isInCart(product.id, "product")}
                  >
                    {isInCart(product.id, "product") ? (
                      "En el carrito ✓"
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Agregar al Carrito
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-semibold mb-3">Compartir este producto</h3>
                  <ShareButtons
                    url={`/producto/${product.id}`}
                    title={product.name}
                    description={product.description}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
