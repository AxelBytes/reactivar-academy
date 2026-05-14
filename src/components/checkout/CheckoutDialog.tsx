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
  KeyRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import paypalLogo from "@/assets/paypal-logo.png";

type PaymentMethod = "paypal" | "ualabis";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema de validación para datos del comprador
const buyerSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nombre muy corto"),
  dni: z.string().optional(),
  pais: z.string().optional(),
  provincia: z.string().optional(),
  localidad: z.string().optional(),
});

// Schema de validación con Zod para tarjeta (legacy, no se usa)
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
type BuyerFormData = z.infer<typeof buyerSchema>;

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ualabis");
  const [isProcessing, setIsProcessing] = useState(false);

  // Formulario para datos del comprador
  const {
    register: registerBuyer,
    handleSubmit: handleSubmitBuyer,
    formState: { errors: buyerErrors },
    watch: watchBuyer,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      dni: user?.dni || "",
      pais: user?.pais || "",
      provincia: user?.provincia || "",
      localidad: user?.localidad || "",
    },
  });

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
  const hasCourses  = items.some((item) => item.type === "course");
  const hasSaas     = items.some((item) => item.type === "saas");

  const handlePayPal = async () => {
    setIsProcessing(true);

    try {
      const allItems = items.map(item => ({
        id:    item.id,
        title: item.type === 'saas' ? item.name : item.type === 'product' ? item.name : item.title,
        type:  item.type,
        price: item.price,
        instructor: item.type === 'course' ? item.instructor : 'N/A',
        subscriptionMonths: item.type === 'saas' ? item.subscriptionMonths : 0,
      }));

      // Obtener datos del formulario del comprador
      const buyerData = watchBuyer();
      
      localStorage.setItem('purchasedCourses', JSON.stringify({
        courses: allItems,
        userEmail: buyerData.email || '',
        userName:  buyerData.name  || '',
        userDni:   buyerData.dni   || '',
        userProvincia: buyerData.provincia || '',
        userLocalidad: buyerData.localidad || '',
        userPais:      buyerData.pais      || '',
        timestamp: Date.now(),
      }));

      const baseUrl = window.location.origin.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/api/payments/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => {
            const n = item.type === 'saas' ? item.name : item.type === 'product' ? item.name : item.title;
            return { id: item.id, name: n, title: n, quantity: item.quantity, price: item.price, type: item.type };
          }),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden de PayPal');
      }

      const data = await response.json();

      if (data.approve_url) {
        // Redirigir a PayPal
        window.location.href = data.approve_url;
      } else {
        throw new Error('No se recibió el link de pago de PayPal');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el pago con PayPal. Intenta nuevamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleUalaBis = async () => {
    setIsProcessing(true);

    try {
      const allItems = items.map(item => ({
        id:    item.id,
        title: item.type === 'saas' ? item.name : item.type === 'product' ? item.name : item.title,
        type:  item.type,
        price: item.price,
        instructor: item.type === 'course' ? item.instructor : 'N/A',
        subscriptionMonths: item.type === 'saas' ? item.subscriptionMonths : 0,
      }));

      // Obtener datos del formulario del comprador
      const buyerData = watchBuyer();
      
      const purchaseData = {
        courses: allItems,
        userEmail: buyerData.email || '',
        userName:  buyerData.name  || '',
        userDni:   buyerData.dni   || '',
        userProvincia: buyerData.provincia || '',
        userLocalidad: buyerData.localidad || '',
        userPais:      buyerData.pais      || '',
        timestamp: Date.now(),
      };

      localStorage.setItem('purchasedCourses', JSON.stringify(purchaseData));

      const baseUrl = window.location.origin.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/api/payments/ualabis/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => {
            const n = item.type === 'saas' ? item.name : item.type === 'product' ? item.name : item.title;
            return {
              id:       item.id?.toString() || '1',
              name:     n,
              title:    n,
              quantity: parseInt(String(item.quantity)) || 1,
              price:    parseFloat(String(item.price))  || 0,
              type:     item.type,
            };
          }),
          payer: {
            email: user?.email || '',
            name:  user?.name  || '',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la orden de Ualá Bis');
      }

      const data = await response.json();

      if (data.checkout_link) {
        window.location.href = data.checkout_link;
      } else {
        throw new Error('No se recibió el link de pago de Ualá Bis');
      }
    } catch (error) {
      console.error('Error Ualá Bis:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el pago con Ualá Bis. Intenta nuevamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    // Validar formulario del comprador primero
    const buyerData = watchBuyer();
    
    if (!buyerData.email || !buyerData.name) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completá tu email y nombre para continuar",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresá un email válido",
        variant: "destructive",
      });
      return;
    }

    // Continuar con el pago
    if (paymentMethod === "paypal") {
      await handlePayPal();
    } else if (paymentMethod === "ualabis") {
      await handleUalaBis();
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
                const itemName = item.type === "saas" ? item.name : item.type === "product" ? item.name : item.title;
                return (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {item.type === "product" ? (
                        <Package className="w-4 h-4 text-primary" />
                      ) : item.type === "saas" ? (
                        <KeyRound className="w-4 h-4 text-primary" />
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

          {/* Datos del Comprador */}
          <div className="space-y-4 border border-border rounded-lg p-4 bg-accent/10">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Datos del Comprador
            </h3>
            <p className="text-sm text-muted-foreground">
              El email es donde recibirás tu compra {hasCourses && "y acceso al curso"}{hasProducts && "y los PDFs"}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email - Obligatorio */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="buyer-email" className="flex items-center gap-1">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="buyer-email"
                  type="email"
                  placeholder="tu@email.com"
                  {...registerBuyer("email")}
                  className={buyerErrors.email ? "border-destructive" : ""}
                />
                {buyerErrors.email && (
                  <p className="text-xs text-destructive">{buyerErrors.email.message}</p>
                )}
              </div>

              {/* Nombre - Obligatorio */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="buyer-name" className="flex items-center gap-1">
                  Nombre Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="buyer-name"
                  type="text"
                  placeholder="Juan Pérez"
                  {...registerBuyer("name")}
                  className={buyerErrors.name ? "border-destructive" : ""}
                />
                {buyerErrors.name && (
                  <p className="text-xs text-destructive">{buyerErrors.name.message}</p>
                )}
              </div>

              {/* DNI - Opcional */}
              <div className="space-y-2">
                <Label htmlFor="buyer-dni">DNI / Documento (opcional)</Label>
                <Input
                  id="buyer-dni"
                  type="text"
                  placeholder="12345678"
                  {...registerBuyer("dni")}
                />
              </div>

              {/* País - Opcional */}
              <div className="space-y-2">
                <Label htmlFor="buyer-pais">País (opcional)</Label>
                <Input
                  id="buyer-pais"
                  type="text"
                  placeholder="Argentina"
                  {...registerBuyer("pais")}
                />
              </div>

              {/* Provincia - Opcional */}
              <div className="space-y-2">
                <Label htmlFor="buyer-provincia">Provincia (opcional)</Label>
                <Input
                  id="buyer-provincia"
                  type="text"
                  placeholder="Buenos Aires"
                  {...registerBuyer("provincia")}
                />
              </div>

              {/* Localidad - Opcional */}
              <div className="space-y-2">
                <Label htmlFor="buyer-localidad">Localidad (opcional)</Label>
                <Input
                  id="buyer-localidad"
                  type="text"
                  placeholder="Mar del Plata"
                  {...registerBuyer("localidad")}
                />
              </div>
            </div>
          </div>

          {/* Selección de método de pago */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Método de Pago</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
              <div className="space-y-3">

                {/* Ualá Bis */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="ualabis" id="ualabis" />
                  <Label htmlFor="ualabis" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="w-14 h-14 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center border border-border">
                      <span className="text-[#8B5CF6] font-bold text-xs text-center leading-tight">Ualá<br/>Bis</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Ualá Bis</p>
                      <p className="text-sm text-muted-foreground">Tarjeta de crédito o débito</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </Label>
                </div>

                {/* PayPal */}
                <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center border border-border">
                      <img src={paypalLogo} alt="PayPal" className="w-12 h-8 object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">PayPal</p>
                      <p className="text-sm text-muted-foreground">Pago seguro internacional</p>
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

          {/* Información de suscripción SaaS */}
          {hasSaas && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <KeyRound className="w-4 h-4 text-yellow-700" />
              <AlertDescription className="text-yellow-800">
                Tu clave de acceso al Buscador de Reglamento se activará automáticamente
                y te llegará por email al completar la compra.
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
                : paymentMethod === "paypal"
                ? "Pagar con PayPal"
                : "Pagar con Ualá Bis"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
