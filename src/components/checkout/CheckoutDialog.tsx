import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Loader2,
  ShieldCheck,
  Package,
  GraduationCap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mercadopagoLogo from "@/assets/mercadopago-logo.png";
import prexLogo from "@/assets/prex-logo.png";
import paypalLogo from "@/assets/paypal-logo.png";

type PaymentMethod = "mercadopago" | "prex" | "paypal";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema de validación con Zod
const cardSchema = z.object({
  cardNumber: z.string()
    .min(16, "Número de tarjeta incompleto")
    .max(19, "Número de tarjeta inválido")
    .regex(/^[\d\s]+$/, "Solo números"),
  cardName: z.string()
    .min(3, "Nombre muy corto")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo letras"),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato: MM/YY"),
  cvv: z.string()
    .min(3, "CVV incompleto")
    .max(4, "CVV inválido")
    .regex(/^\d+$/, "Solo números"),
  email: z.string().email("Email inválido"),
});

type CardFormData = z.infer<typeof cardSchema>;

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mercadopago");
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const hasProducts = items.some((item) => item.type === "product");
  const hasCourses = items.some((item) => item.type === "course");

  const handlePrex = async () => {
    setIsProcessing(true);

    // Simulación de Prex - En producción, aquí integrarías con la API de Prex
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Procesando pago con Prex");

    toast({
      title: "Redirigiendo a Prex",
      description: "Serás redirigido al checkout seguro de Prex...",
    });

    // Simulación de pago exitoso
    setTimeout(() => {
      toast({
        title: "¡Pago exitoso!",
        description: "Tu pedido ha sido procesado correctamente.",
      });
      clearCart();
      onOpenChange(false);
      setIsProcessing(false);
    }, 2000);
  };

  const handleMercadoPago = async () => {
    setIsProcessing(true);

    try {
      // Siempre usar la URL del sitio actual (sin barra final)
      const baseUrl = window.location.origin.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/api/payments/mercadopago/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.type === 'product' ? item.name : item.title,
            title: item.type === 'product' ? item.name : item.title,
            quantity: item.quantity,
            price: item.price,
            type: item.type,
          })),
          payer: {
            email: user?.email || 'test@test.com',
            name: user?.name || 'Usuario',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago');
      }

      const data = await response.json();

      if (data.init_point) {
        // Redirigir a MercadoPago
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió el link de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePayPal = async () => {
    setIsProcessing(true);

    // Aquí se integrará con PayPal SDK
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Iniciando checkout de PayPal");

    toast({
      title: "Redirigiendo a PayPal",
      description: "Serás redirigido al checkout seguro de PayPal...",
    });

    // Simulación de pago exitoso
    setTimeout(() => {
      toast({
        title: "¡Pago exitoso!",
        description: "Tu pedido ha sido procesado correctamente.",
      });
      clearCart();
      onOpenChange(false);
      setIsProcessing(false);
    }, 2000);
  };

  const handlePayment = async () => {
    if (paymentMethod === "mercadopago") {
      await handleMercadoPago();
    } else if (paymentMethod === "prex") {
      await handlePrex();
    } else if (paymentMethod === "paypal") {
      await handlePayPal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
          <DialogDescription>
            Elige tu método de pago preferido y completa la compra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen del pedido */}
          <div className="bg-accent/30 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Resumen del Pedido
            </h3>
            <div className="space-y-2">
              {items.map((item) => {
                const itemName = item.type === "product" ? item.name : item.title;
                return (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {item.type === "product" ? (
                        <Package className="w-4 h-4 text-primary" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-primary" />
                      )}
                      <span>
                        {itemName} {item.quantity > 1 && `x${item.quantity}`}
                      </span>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toLocaleString("es-AR")}
                    </span>
                  </div>
                );
              })}
            </div>
            <Separator />
            <div className="flex items-center justify-between font-bold">
              <span>Total</span>
              <span className="text-lg text-primary">${getTotal().toLocaleString("es-AR")}</span>
            </div>
          </div>

          {/* Selección de método de pago */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Método de Pago</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              
              {/* Pagos Nacionales */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Pagos Nacionales</p>
                
                {/* MercadoPago */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="mercadopago" id="mercadopago" />
                  <Label htmlFor="mercadopago" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center border border-border">
                      <img 
                        src={mercadopagoLogo} 
                        alt="MercadoPago" 
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">MercadoPago</p>
                      <p className="text-sm text-muted-foreground">
                        Tarjetas, efectivo, transferencia
                      </p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </Label>
                </div>

                {/* Prex */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="prex" id="prex" />
                  <Label htmlFor="prex" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="w-14 h-14 rounded-lg bg-[#00D632]/10 flex items-center justify-center border border-border">
                      <img 
                        src={prexLogo} 
                        alt="Prex" 
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Prex</p>
                      <p className="text-sm text-muted-foreground">
                        Paga con tu tarjeta Prex
                      </p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </Label>
                </div>
              </div>

              {/* Pago Internacional */}
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Pago Internacional</p>
                
                {/* PayPal */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center border border-border">
                      <img 
                        src={paypalLogo} 
                        alt="PayPal" 
                        className="w-12 h-8 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">PayPal</p>
                      <p className="text-sm text-muted-foreground">
                        Pago seguro internacional
                      </p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>


          {/* Información de envío para productos */}
          {hasProducts && (
            <Alert>
              <Package className="w-4 h-4" />
              <AlertDescription>
                Tu pedido incluye productos físicos. El envío será coordinado después de la compra.
              </AlertDescription>
            </Alert>
          )}

          {/* Información de cursos */}
          {hasCourses && (
            <Alert>
              <GraduationCap className="w-4 h-4" />
              <AlertDescription>
                Tendrás acceso inmediato a tus cursos después de completar la compra.
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={isProcessing}
              onClick={() => handlePayment()}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isProcessing
                ? "Procesando..."
                : paymentMethod === "mercadopago"
                ? "Procesar con MercadoPago"
                : paymentMethod === "prex"
                ? "Procesar con Prex"
                : paymentMethod === "paypal"
                ? "Procesar con PayPal"
                : `Pagar $${getTotal().toLocaleString("es-AR")}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
