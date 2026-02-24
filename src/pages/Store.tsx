import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailDialog from "@/components/products/ProductDetailDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart, Search, Filter, Grid, List, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";
import productShaker from "@/assets/product-shaker.jpg";

const categories = ["Todos", "Calzado", "Pesas", "Accesorios", "Ropa", "Nutrición"];

const Store = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  // Cargar productos desde Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error cargando productos:", error);
          setProducts([]);
          return;
        }

        if (data && data.length > 0) {
          const mappedProducts = data.map((product) => ({
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
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error inesperado cargando productos:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = (product: typeof products[0]) => {
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Tienda de Productos Deportivos - Reactivar Academy"
        description="Encuentra productos de fitness y entrenamiento de alta calidad. Calzado deportivo, pesas, accesorios, ropa y suplementos. Envíos a toda Argentina. Pago seguro."
        keywords={[
          'productos fitness',
          'tienda deportiva',
          'equipamiento fitness',
          'accesorios gym',
          'productos entrenamiento',
          'tienda fitness Argentina',
          'comprar productos deportivos'
        ]}
        type="website"
      />
      <Header />
      
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-secondary text-secondary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Tienda Deportiva
            </h1>
            <p className="text-secondary-foreground/80 max-w-2xl">
              Equipamiento profesional seleccionado por expertos para potenciar 
              tu rendimiento deportivo.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === "Todos" ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar productos..." className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando productos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                <article
                  key={product.id}
                  className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-square bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>
                      )}
                      {product.originalPrice && (
                        <Badge variant="destructive">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                      {!product.inStock && (
                        <Badge variant="secondary">Agotado</Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="rounded-full shadow-md">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Add to Cart Overlay */}
                    {product.inStock && (
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
                    )}
                  </div>

                  {/* Content */}
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

                    {/* Price */}
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

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Cargar Más Productos
              </Button>
            </div>
          </div>
        </section>
      </main>

      <ProductDetailDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      <Footer />
    </div>
  );
};

export default Store;
