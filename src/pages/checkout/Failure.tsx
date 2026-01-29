import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, ShoppingCart, HelpCircle } from "lucide-react";

const Failure = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-red-600">Pago Rechazado</CardTitle>
          <CardDescription className="text-lg">
            No se pudo procesar tu pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Details */}
          {(paymentId || status) && (
            <div className="bg-accent/30 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                Detalles del Intento
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
            </div>
          )}

          {/* Reasons */}
          <div className="space-y-3">
            <h3 className="font-semibold">Posibles causas:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Fondos insuficientes en la tarjeta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Datos de la tarjeta incorrectos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>La tarjeta está vencida o bloqueada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Se superó el límite de compra de la tarjeta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Problemas de conexión durante el pago</span>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">¿Necesitas ayuda?</p>
                <p className="text-sm text-muted-foreground">
                  Contacta con tu banco para verificar el estado de tu tarjeta o intenta con otro método de pago.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link to="/">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Intentar Nuevamente
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Failure;
