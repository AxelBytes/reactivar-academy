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

// Logos de métodos de pago (puedes reemplazar con imágenes reales)
const PaymentLogos = {
  card: "💳",
  mercadopago: "🔵", // Logo de MercadoPago
  paypal: "🅿️", // Logo de PayPal
};

type PaymentMethod = "card" | "mercadopago" | "paypal";

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

  const handleCardPayment = async (data: CardFormData) => {
    setIsProcessing(true);

    // Simular procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Procesando pago con tarjeta:", data);

    toast({
      title: "¡Pago exitoso!",
      description: "Tu pedido ha sido procesado correctamente.",
    });

    clearCart();
    reset();
    onOpenChange(false);
    setIsProcessing(false);
  };

  const handleMercadoPago = async () => {
    setIsProcessing(true);

    // Aquí se integrará con MercadoPago SDK
    // Por ahora simulamos el proceso
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Iniciando checkout de MercadoPago");
    
    // En producción, esto redirigirá a la página de MercadoPago
    toast({
      title: "Redirigiendo a MercadoPago",
      description: "Serás redirigido al checkout seguro de MercadoPago...",
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

  const handlePayment = async (data?: CardFormData) => {
    if (paymentMethod === "card" && data) {
      await handleCardPayment(data);
    } else if (paymentMethod === "mercadopago") {
      await handleMercadoPago();
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
              
              {/* MercadoPago */}
              <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="mercadopago" id="mercadopago" />
                <Label htmlFor="mercadopago" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-[#00b1ea]/10 flex items-center justify-center text-2xl">
                    🔵
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

              {/* PayPal */}
              <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-[#0070ba]/10 flex items-center justify-center text-2xl">
                    🅿️
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">PayPal</p>
                    <p className="text-sm text-muted-foreground">
                      PayPal o tarjeta de crédito/débito
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </Label>
              </div>

              {/* Tarjeta de Crédito/Débito */}
              <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Tarjeta de Crédito/Débito</p>
                    <p className="text-sm text-muted-foreground">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Formulario de tarjeta (solo si se selecciona tarjeta) */}
          {paymentMethod === "card" && (
            <form onSubmit={handleSubmit(handlePayment)} className="space-y-4">
              <Alert>
                <ShieldCheck className="w-4 h-4" />
                <AlertDescription>
                  Tus datos están protegidos con encriptación SSL
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  {...register("cardNumber")}
                  className={errors.cardNumber ? "border-red-500" : ""}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Nombre del Titular</Label>
                <Input
                  id="cardName"
                  placeholder="JUAN PEREZ"
                  {...register("cardName")}
                  className={errors.cardName ? "border-red-500" : ""}
                />
                {errors.cardName && (
                  <p className="text-sm text-red-500">{errors.cardName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    maxLength={5}
                    {...register("expiryDate")}
                    className={errors.expiryDate ? "border-red-500" : ""}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    {...register("cvv")}
                    className={errors.cvv ? "border-red-500" : ""}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-red-500">{errors.cvv.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email para Confirmación</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </form>
          )}

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
              onClick={paymentMethod === "card" ? handleSubmit(handlePayment) : () => handlePayment()}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isProcessing
                ? "Procesando..."
                : `Pagar $${getTotal().toLocaleString("es-AR")}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
