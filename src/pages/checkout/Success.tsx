import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, GraduationCap, Home, ShoppingBag } from "lucide-react";

const Success = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const merchantOrderId = searchParams.get("merchant_order_id");

  useEffect(() => {
    // Limpiar el carrito del localStorage
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-green-600">¡Pago Exitoso!</CardTitle>
          <CardDescription className="text-lg">
            Tu pedido ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-accent/30 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
              Detalles del Pago
            </h3>
            {paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID de Pago:</span>
                <span className="font-medium">{paymentId}</span>
              </div>
            )}
            {status && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium capitalize">{status}</span>
              </div>
            )}
            {merchantOrderId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orden:</span>
                <span className="font-medium">{merchantOrderId}</span>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">Próximos Pasos:</h3>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Productos Físicos</p>
                <p className="text-sm text-muted-foreground">
                  Recibirás un email con la información de envío en las próximas 24 horas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Cursos Online</p>
                <p className="text-sm text-muted-foreground">
                  Ya tienes acceso inmediato. Ve a "Mis Cursos" para comenzar.
                </p>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm">
              <strong>Importante:</strong> Te hemos enviado un correo de confirmación con todos los detalles de tu compra.
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/tienda">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Seguir Comprando
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
