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
import productShoes from "@/assets/product-shoes.jpg";
import productDumbbells from "@/assets/product-dumbbells.jpg";
import productYogaMat from "@/assets/product-yoga-mat.jpg";
import productShaker from "@/assets/product-shaker.jpg";

// Productos de respaldo (fallback) por si no hay conexión a Supabase
const FALLBACK_PRODUCTS = [
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Este es un producto de prueba diseñado para validar el sistema de pagos. No es un producto real, sino una herramienta de testing para asegurar que todas las pasarelas de pago funcionen correctamente antes del lanzamiento oficial.",
    features: [
      "Precio simbólico de $1 ARS para testing",
      "Funciona con todas las pasarelas de pago",
      "Ideal para probar el checkout completo",
      "No incluye envío real"
    ],
  },
  {
    id: 997,
    name: "💵 Test $1 USD",
    description: "Producto de prueba - Equivale a $1 USD exacto",
    price: 1450,
    originalPrice: 2000,
    image: productShaker,
    category: "Accesorios",
    inStock: true,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Producto especial de prueba calibrado para convertirse exactamente a $1 USD en PayPal. Permite testear la conversión de moneda automática y verificar que los pagos internacionales funcionen correctamente.",
    features: [
      "Conversión automática ARS a USD",
      "Precio equivalente a $1 USD",
      "Prueba de pagos internacionales",
      "Testing de tipo de cambio en tiempo real"
    ],
  },
  {
    id: 998,
    name: "🎯 Curso Básico de Fitness",
    description: "Curso completo de entrenamiento - Precio accesible",
    price: 2000,
    originalPrice: 3500,
    image: productDumbbells,
    category: "Cursos",
    inStock: true,
    isNew: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Curso introductorio de fitness diseñado para principiantes. Aprende los fundamentos del entrenamiento físico con rutinas personalizadas, guías de nutrición y seguimiento profesional.",
    features: [
      "12 semanas de entrenamiento guiado",
      "Videos instructivos en HD",
      "Plan de nutrición personalizado",
      "Soporte por WhatsApp",
      "Certificado al finalizar"
    ],
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
    detailedDescription: "Set completo de mancuernas ajustables que reemplazan hasta 10 pares de mancuernas tradicionales. Sistema de ajuste rápido para cambiar el peso en segundos, ideal para entrenamientos intensos sin interrupciones.",
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
    detailedDescription: "Mat profesional de yoga y pilates fabricado con materiales ecológicos. Superficie antideslizante en ambos lados para máxima estabilidad en tus posturas más desafiantes.",
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
    detailedDescription: "Shaker profesional con sistema de mezclado superior. Diseñado para preparar batidos perfectos sin grumos. Incluye compartimentos separados para llevar tus suplementos organizados.",
    features: [
      "Capacidad de 750ml",
      "Sistema de bola mezcladora incluido",
      "Compartimento para suplementos",
      "Libre de BPA",
      "Tapa a rosca anti-derrames",
      "Marcas de medición en ml y oz"
    ],
  },
  {
    id: 5,
    name: "Cuerda de Saltar Profesional",
    description: "Cuerda ajustable con rodamientos de alta velocidad",
    price: 25000,
    image: productShaker,
    category: "Accesorios",
    inStock: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Cuerda profesional para saltar diseñada para CrossFit, boxing y entrenamientos de alta intensidad. Rodamientos de 360° para rotación ultra-suave.",
    features: [
      "Rodamientos de alta velocidad 360°",
      "Cable de acero recubierto en PVC",
      "Mangos ergonómicos con grip antideslizante",
      "Longitud ajustable (2.4m a 3m)",
      "Peso ideal para doble saltos",
      "Contador digital integrado (opcional)"
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Kit completo de bandas elásticas para entrenamiento de resistencia. Perfecto para fortalecer todo el cuerpo sin necesidad de pesas. Incluye guía de ejercicios ilustrada.",
    features: [
      "5 niveles de resistencia (5-30 lbs)",
      "Material de látex natural de alta calidad",
      "Incluye anclas para puerta y manijas",
      "Correas para tobillos incluidas",
      "Bolsa de transporte",
      "Guía de ejercicios PDF"
    ],
  },
  {
    id: 7,
    name: "Guantes de Entrenamiento",
    description: "Guantes con protección palmar y muñequera ajustable",
    price: 38000,
    image: productDumbbells,
    category: "Accesorios",
    inStock: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Guantes profesionales para gimnasio con protección palmar reforzada. Diseño ergonómico que brinda máximo soporte y protección durante levantamiento de pesas.",
    features: [
      "Protección palmar acolchada",
      "Muñequera ajustable de 30cm",
      "Material transpirable",
      "Sistema de agarre antideslizante",
      "Dedos cortados para mejor sensibilidad",
      "Cierre con velcro de alta resistencia"
    ],
  },
  {
    id: 8,
    name: "Zapatillas CrossFit Elite",
    description: "Diseño para entrenamientos de alta intensidad",
    price: 195000,
    image: productShoes,
    category: "Calzado",
    inStock: false,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Zapatillas especializadas para CrossFit y entrenamientos funcionales. Diseño versátil que combina estabilidad para levantamientos con flexibilidad para movimientos dinámicos.",
    features: [
      "Suela plana para mayor estabilidad",
      "Refuerzo lateral para movimientos laterales",
      "Upper resistente al desgaste",
      "Amortiguación en talón para saltos",
      "Sistema de atadura segura",
      "Ideal para WODs y entrenamientos HIIT"
    ],
  },
];

const categories = ["Todos", "Calzado", "Pesas", "Accesorios", "Ropa", "Nutrición"];

const Store = () => {
  const [products, setProducts] = useState<typeof FALLBACK_PRODUCTS>([]);
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
          setProducts(FALLBACK_PRODUCTS);
          return;
        }

        if (data && data.length > 0) {
          // Mapear los productos de Supabase al formato esperado
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
          // Si no hay productos en Supabase, usar fallback
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (error) {
        console.error("Error inesperado cargando productos:", error);
        setProducts(FALLBACK_PRODUCTS);
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
