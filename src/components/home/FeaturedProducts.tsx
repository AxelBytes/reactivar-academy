import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductDetailDialog from "@/components/products/ProductDetailDialog";
import { ShoppingCart, Heart, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import productShaker from "@/assets/product-shaker.jpg";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(4);

        if (!error && data && data.length > 0) {
          const mapped = data.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.original_price || undefined,
            image: product.image_url || productShaker,
            category: product.category,
            inStock: product.stock > 0,
            isNew: product.is_new,
            videoUrl: product.video_url || undefined,
            detailedDescription: product.detailed_description || undefined,
            features: product.features || [],
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error cargando productos destacados:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    if (!product.inStock) {
      toast({
        title: "Producto no disponible",
        description: "Este producto está agotado actualmente.",
        variant: "destructive",
      });
      return;
    }

    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    toast({
      title: "¡Producto agregado!",
      description: `${product.name} se agregó al carrito.`,
    });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Equipamiento profesional
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Tienda Deportiva
          </h2>
          <p className="text-muted-foreground">
            Los mejores productos para tu entrenamiento, seleccionados por expertos
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article
                key={product.id}
                className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative overflow-hidden aspect-square bg-accent/20">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isNew && (
                      <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
                    )}
                    {product.originalPrice && (
                      <Badge variant="destructive">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-md">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-card/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={isInCart(product.id, "product")}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isInCart(product.id, "product") ? "En el Carrito" : "Agregar al Carrito"}
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="text-base font-semibold text-card-foreground mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-foreground">${product.price.toLocaleString("es-AR")}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/tienda">
              Ver Todos los Productos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </section>
  );
};

export default FeaturedProducts;
