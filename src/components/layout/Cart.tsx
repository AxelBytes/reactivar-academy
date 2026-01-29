import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CheckoutDialog from "@/components/checkout/CheckoutDialog";

interface CartProps {
  onClose?: () => void;
}

const Cart = ({ onClose }: CartProps) => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de realizar la compra.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handleRemoveItem = (id: number, type: "product" | "course", name: string) => {
    removeItem(id, type);
    toast({
      title: "Producto eliminado",
      description: `${name} fue eliminado del carrito.`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tu carrito está vacío
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          Agrega productos para comenzar tu compra
        </p>
        <Button onClick={onClose}>Explorar Productos</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Items List */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 py-4">
          {items.map((item) => {
            const itemName = item.type === "product" ? item.name : item.title;
            const itemImage = item.image;
            const itemPrice = item.price;

            return (
              <div key={`${item.type}-${item.id}`} className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                  <img
                    src={itemImage}
                    alt={itemName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {itemName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.type === "product" ? item.category : `Curso - ${item.instructor}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-foreground">
                      ${itemPrice.toLocaleString("es-AR")}
                    </span>
                    {item.type === "product" && (
                      <span className="text-xs text-muted-foreground">
                        x {item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveItem(item.id, item.type, itemName)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  {/* Quantity Controls (only for products) */}
                  {item.type === "product" && (
                    <div className="flex items-center gap-1 border border-border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border pt-4 mt-4 space-y-4">
        {/* Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${getTotal().toLocaleString("es-AR")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-medium text-primary">Gratis</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">${getTotal().toLocaleString("es-AR")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full" size="lg" onClick={handleCheckout}>
            Finalizar Compra
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => {
              clearCart();
              toast({
                title: "Carrito vaciado",
                description: "Se eliminaron todos los productos del carrito.",
              });
            }}
          >
            Vaciar Carrito
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog 
        open={isCheckoutOpen} 
        onOpenChange={(open) => {
          setIsCheckoutOpen(open);
          if (!open) {
            onClose?.();
          }
        }} 
      />
    </div>
  );
};

export default Cart;
