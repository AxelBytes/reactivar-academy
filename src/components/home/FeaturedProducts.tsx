import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductDetailDialog from "@/components/products/ProductDetailDialog";
import { ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import productShoes from "@/assets/product-shoes.jpg";
import productDumbbells from "@/assets/product-dumbbells.jpg";
import productYogaMat from "@/assets/product-yoga-mat.jpg";
import productShaker from "@/assets/product-shaker.jpg";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  isNew?: boolean;
  videoUrl?: string;
  detailedDescription?: string;
  features?: string[];
}

const products: Product[] = [
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Zapatillas profesionales diseñadas para runners exigentes. Tecnología de amortiguación de última generación que reduce el impacto en articulaciones y mejora tu rendimiento en cada kilómetro.",
    features: [
      "Amortiguación React Foam de alta densidad",
      "Suela de carbono para mayor impulso",
      "Upper transpirable con tecnología Flyknit",
      "Diseño anatómico para máximo confort",
      "Peso ultra-ligero: solo 240g",
      "Ideal para maratones y entrenamientos largos"
    ],
  },
  {
    id: 2,
    name: "Set de Mancuernas Ajustables",
    description: "Mancuernas de 5-25kg con sistema de ajuste rápido",
    price: 350000,
    image: productDumbbells,
    category: "Pesas",
    inStock: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Set completo de mancuernas ajustables que reemplazan hasta 10 pares de mancuernas tradicionales. Sistema de ajuste rápido para cambiar el peso en segundos.",
    features: [
      "Rango de peso: 5kg a 25kg por mancuerna",
      "Sistema de ajuste rápido en 2 segundos",
      "Incluye soporte para almacenamiento",
      "Reemplazan 10 pares de mancuernas",
      "Ahorra espacio en tu gimnasio casero",
      "Material de alta durabilidad"
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Mat profesional de yoga y pilates fabricado con materiales ecológicos. Superficie antideslizante en ambos lados para máxima estabilidad.",
    features: [
      "Grosor de 6mm para máximo confort",
      "Material TPE ecológico libre de tóxicos",
      "Superficie antideslizante dual",
      "Dimensiones: 183cm x 61cm",
      "Incluye correa de transporte",
      "Fácil de limpiar y mantener"
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Shaker profesional con sistema de mezclado superior. Diseñado para preparar batidos perfectos sin grumos.",
    features: [
      "Capacidad de 750ml",
      "Sistema de bola mezcladora incluido",
      "Compartimento para suplementos",
      "Libre de BPA",
      "Tapa a rosca anti-derrames",
      "Marcas de medición en ml y oz"
    ],
  },
];

const FeaturedProducts = () => {
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

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
    <section className="py-16 lg:py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <article
              key={product.id}
              className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
              onClick={() => setSelectedProduct(product)}
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
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="rounded-full shadow-md">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Add to Cart Overlay */}
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/store">
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
