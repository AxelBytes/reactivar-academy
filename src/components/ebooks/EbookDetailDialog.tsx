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
import { ShoppingCart, Check, Download, FileText, Mail, Smartphone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface EbookDetailDialogProps {
  ebook: {
    id: number;
    name: string;
    description: string;
    price: number;
    original_price?: number;
    image_url?: string;
    category: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EbookDetailDialog = ({ ebook, open, onOpenChange }: EbookDetailDialogProps) => {
  const { addProduct, isInCart } = useCart();
  const { toast } = useToast();

  if (!ebook) return null;

  const handleAddToCart = () => {
    addProduct({
      id: ebook.id,
      name: ebook.name,
      price: ebook.price,
      image: ebook.image_url || "",
      category: ebook.category,
    });

    toast({
      title: "Ebook agregado",
      description: `${ebook.name} se agregó a tu carrito`,
    });

    onOpenChange(false);
  };

  const isEbookInCart = isInCart(ebook.id, "product");

  const ebookFeatures = [
    "Descarga instantánea después de la compra",
    "Formato PDF de alta calidad",
    "Acceso desde cualquier dispositivo",
    "Compatible con celulares, tablets y PC",
    "Sin límite de descargas",
    "Enviado por email automáticamente",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogTitle className="text-2xl flex-1">{ebook.name}</DialogTitle>
            <Badge className="bg-blue-600 text-white">
              <FileText className="w-3 h-3 mr-1" />
              PDF Digital
            </Badge>
          </div>
          <DialogDescription>Material educativo digital en formato PDF</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section - Sin recortes */}
          {ebook.image_url ? (
            <div className="relative w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden p-8">
              <img
                src={ebook.image_url}
                alt={ebook.name}
                className="w-full h-auto max-h-96 object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden flex items-center justify-center">
              <FileText className="w-32 h-32 text-blue-200" />
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-700">
                ${ebook.price.toLocaleString("es-AR")}
              </span>
              {ebook.original_price && ebook.original_price > ebook.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${ebook.original_price.toLocaleString("es-AR")}
                </span>
              )}
            </div>
            {ebook.original_price && ebook.original_price > ebook.price && (
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                {Math.round((1 - ebook.price / ebook.original_price) * 100)}% OFF
              </Badge>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Sobre este Ebook</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {ebook.description}
            </p>
          </div>

          {/* What you get */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Qué incluye este material</h3>
            <ul className="space-y-2">
              {ebookFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Download className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-center">Descarga Instantánea</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Mail className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-center">Enviado por Email</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Smartphone className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-center">Multiplataforma</span>
            </div>
          </div>

          {/* Access Info */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Acceso inmediato - Descarga después de la compra</span>
            </div>
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleAddToCart}
              disabled={isEbookInCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isEbookInCart ? "Ya está en el carrito" : "Agregar al Carrito"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EbookDetailDialog;
