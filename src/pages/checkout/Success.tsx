import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, GraduationCap, Home, ShoppingBag, Loader2, Mail } from "lucide-react";

const Success = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const merchantOrderId = searchParams.get("merchant_order_id");
  const token = searchParams.get("token"); // PayPal order ID
  const payerId = searchParams.get("PayerID"); // PayPal payer ID
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    // Capturar pago de PayPal si viene de PayPal
    if (token && payerId) {
      capturePayPalPayment(token);
    } else {
      // Para MercadoPago, limpiar carrito y enviar email inmediatamente
      localStorage.removeItem("cart");
      sendCourseEmail(paymentId || merchantOrderId || undefined);
    }
  }, [token, payerId]);

  const sendCourseEmail = async (paymentIdParam?: string) => {
    try {
      // Obtener datos de cursos guardados en sessionStorage
      const purchasedCoursesData = sessionStorage.getItem('purchasedCourses');
      
      if (!purchasedCoursesData) {
        console.log('No hay cursos para enviar email');
        return;
      }

      const { courses, userEmail, userName, userDni, userProvincia, userLocalidad, userPais } = JSON.parse(purchasedCoursesData);

      if (!courses || courses.length === 0 || !userEmail) {
        console.log('Datos insuficientes para enviar email');
        return;
      }

      const baseUrl = window.location.origin.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/email/send-course-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          userName,
          userDni,
          userProvincia,
          userLocalidad,
          userPais,
          courses,
          paymentId: paymentIdParam,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar email');
      }

      console.log('Email enviado exitosamente');
      setEmailSent(true);
      
      // Limpiar datos de sessionStorage después de enviar el email
      sessionStorage.removeItem('purchasedCourses');
      
    } catch (error) {
      console.error('Error enviando email:', error);
      setEmailError('No se pudo enviar el email de confirmación, pero tu pago se procesó correctamente.');
    }
  };

  const capturePayPalPayment = async (orderId: string) => {
    setIsCapturing(true);
    try {
      const baseUrl = window.location.origin.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/payments/paypal/capture-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error('Error al capturar el pago');
      }

      const data = await response.json();
      console.log('Pago capturado:', data);
      
      // Limpiar carrito después de captura exitosa
      localStorage.removeItem("cart");
      
      // Enviar email con cursos si hay
      await sendCourseEmail(orderId);
      
    } catch (error) {
      console.error('Error capturando pago:', error);
      setCaptureError('Hubo un problema al procesar tu pago. Contacta con soporte.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isCapturing ? (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl text-green-600">
            {isCapturing ? 'Procesando pago...' : '¡Pago Exitoso!'}
          </CardTitle>
          <CardDescription className="text-lg">
            {isCapturing 
              ? 'Estamos confirmando tu pago con PayPal...'
              : 'Tu pedido ha sido procesado correctamente'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {captureError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600">{captureError}</p>
            </div>
          )}

          {!isCapturing && !captureError && (
            <>
              {/* Payment Details */}
              <div className="bg-accent/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  Detalles del Pago
                </h3>
                {(paymentId || token) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID de Pago:</span>
                    <span className="font-medium">{paymentId || token}</span>
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
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ¡Email enviado exitosamente!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Te hemos enviado un correo con los detalles para acceder a tus capacitaciones.
                    Si no lo encuentras, revisa tu carpeta de spam.
                  </p>
                </div>
              </div>
            </div>
          )}

          {emailError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> {emailError}
              </p>
            </div>
          )}

          {!emailSent && !emailError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm">
                <strong>Importante:</strong> Te enviaremos un correo de confirmación con todos los detalles de tu compra.
                Si no lo recibes, contacta con soporte.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isCapturing && (
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
          )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
