import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart, Search, Filter, Grid, List } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import productShoes from "@/assets/product-shoes.jpg";
import productDumbbells from "@/assets/product-dumbbells.jpg";
import productYogaMat from "@/assets/product-yoga-mat.jpg";
import productShaker from "@/assets/product-shaker.jpg";

const products = [
  {
    id: 999,
    name: "🧪 Producto de Prueba",
    description: "Producto para probar pagos - Precio simbólico",
    price: 1,
    originalPrice: 100,
    image: productShaker,
    category: "Accesorios",
    inStock: true,
    isNew: true,
  },
  {
    id: 1,
    name: "Zapatillas Running Pro",
    description: "Zapatillas de alto rendimiento con amortiguación avanzada",
    price: 180000,
    originalPrice: 220000,
    image: productShoes,
    category: "Calzado",
    inStock: true,
    isNew: true,
  },
  {
    id: 2,
    name: "Set de Mancuernas Ajustables",
    description: "Mancuernas de 5-25kg con sistema de ajuste rápido",
    price: 350000,
    image: productDumbbells,
    category: "Pesas",
    inStock: true,
  },
  {
    id: 3,
    name: "Mat de Yoga Premium",
    description: "Colchoneta antideslizante de alta densidad 6mm",
    price: 55000,
    originalPrice: 75000,
    image: productYogaMat,
    category: "Accesorios",
    inStock: true,
  },
  {
    id: 4,
    name: "Shaker Pro 750ml",
    description: "Botella mezcladora con compartimento para suplementos",
    price: 30000,
    image: productShaker,
    category: "Accesorios",
    inStock: true,
    isNew: true,
  },
  {
    id: 5,
    name: "Cuerda de Saltar Profesional",
    description: "Cuerda ajustable con rodamientos de alta velocidad",
    price: 25000,
    image: productShaker,
    category: "Accesorios",
    inStock: true,
  },
  {
    id: 6,
    name: "Banda de Resistencia Kit",
    description: "Set de 5 bandas con diferentes niveles de resistencia",
    price: 42000,
    originalPrice: 55000,
    image: productYogaMat,
    category: "Accesorios",
    inStock: true,
  },
  {
    id: 7,
    name: "Guantes de Entrenamiento",
    description: "Guantes con protección palmar y muñequera ajustable",
    price: 38000,
    image: productDumbbells,
    category: "Accesorios",
    inStock: true,
  },
  {
    id: 8,
    name: "Zapatillas CrossFit Elite",
    description: "Diseño para entrenamientos de alta intensidad",
    price: 195000,
    image: productShoes,
    category: "Calzado",
    inStock: false,
  },
];

const categories = ["Todos", "Calzado", "Pesas", "Accesorios", "Ropa", "Nutrición"];

const Store = () => {
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-square bg-accent/20">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                          onClick={() => handleAddToCart(product)}
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

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Cargar Más Productos
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
