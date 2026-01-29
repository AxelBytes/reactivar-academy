import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Home, Mail, AlertCircle } from "lucide-react";

const Pending = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-yellow-600">Pago Pendiente</CardTitle>
          <CardDescription className="text-lg">
            Tu pago está siendo procesado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details */}
          {(paymentId || status) && (
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
            </div>
          )}

          {/* Information */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-sm">Tu pago está en revisión</p>
                <p className="text-sm text-muted-foreground">
                  Algunos métodos de pago requieren verificación adicional. Esto puede tomar desde unos minutos hasta 48 horas.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Métodos de pago con revisión:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Transferencia bancaria</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Pago en efectivo (hasta que se acredite)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>Algunos pagos con tarjeta que requieren validación</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Email Notification */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Te mantendremos informado</p>
                <p className="text-sm text-muted-foreground">
                  Recibirás un correo electrónico cuando tu pago sea confirmado y tu pedido esté listo.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-accent/30 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">¿Qué hacer ahora?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">1.</span>
                <span>Guarda el ID de tu pago para futuras consultas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">2.</span>
                <span>Revisa tu correo electrónico regularmente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">3.</span>
                <span>Si pagaste en efectivo, asegúrate de que se haya acreditado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-foreground">4.</span>
                <span>Si tienes dudas, contacta con nuestro soporte</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
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

export default Pending;
