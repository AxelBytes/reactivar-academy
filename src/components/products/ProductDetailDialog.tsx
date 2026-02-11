import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Check, Package, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailDialogProps {
  product: {
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
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailDialog = ({ product, open, onOpenChange }: ProductDetailDialogProps) => {
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó a tu carrito`,
    });

    onOpenChange(false);
  };

  const isProductInCart = isInCart(product.id, "product");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogTitle className="text-2xl flex-1">{product.name}</DialogTitle>
            {product.isNew && (
              <Badge className="bg-primary">Nuevo</Badge>
            )}
          </div>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          {product.videoUrl && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={product.videoUrl}
                title={`Video de ${product.name}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Image if no video */}
          {!product.videoUrl && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toLocaleString("es-AR")}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          <Separator />

          {/* Detailed Description */}
          {product.detailedDescription && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Descripción Detallada</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.detailedDescription}
              </p>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Características</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Product Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Categoría:</span>
              <Badge variant="outline">{product.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">Calificación:</span>
              <span className="font-medium">4.8/5</span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="bg-accent/50 rounded-lg p-4">
            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">En Stock - Envío inmediato</span>
              </div>
            ) : (
              <div className="text-red-600">
                <span className="font-medium">Sin Stock - Disponible próximamente</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.inStock || isProductInCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isProductInCart ? "Ya está en el carrito" : "Agregar al Carrito"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
