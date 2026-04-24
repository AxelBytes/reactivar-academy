import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, GraduationCap, Home, ShoppingBag, Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Success = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const merchantOrderId = searchParams.get("merchant_order_id");
  const token = searchParams.get("token"); // PayPal order ID
  const payerId = searchParams.get("PayerID"); // PayPal payer ID
  const gateway = searchParams.get("gateway"); // Para identificar la pasarela (ualabis, etc.)
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    // Capturar pago de PayPal si viene de PayPal
    if (token && payerId) {
      capturePayPalPayment(token);
    } else {
      // Para MercadoPago, Ualá Bis y otros, limpiar carrito y enviar email
      localStorage.removeItem("cart");
      const refId = paymentId || merchantOrderId || searchParams.get("uuid") || undefined;
      sendCourseEmail(refId);
    }
  }, [token, payerId]);

  const sendCourseEmail = async (paymentIdParam?: string) => {
    try {
      console.log('🔍 INICIANDO sendCourseEmail');
      console.log('📋 Payment ID:', paymentIdParam);
      console.log('📋 Search params:', Object.fromEntries(searchParams.entries()));
      
      // Intentar obtener datos de localStorage primero
      let purchasedCoursesData = localStorage.getItem('purchasedCourses');
      console.log('📦 localStorage.purchasedCourses:', purchasedCoursesData);
      
      // Si no hay en localStorage, intentar obtener del external_reference de MercadoPago
      if (!purchasedCoursesData) {
        const externalRef = searchParams.get('external_reference');
        console.log('🔗 external_reference:', externalRef);
        
        if (externalRef) {
          try {
            // Decodificar el base64
            const decoded = atob(externalRef);
            console.log('🔓 Decodificado:', decoded);
            purchasedCoursesData = decoded;
            console.log('✅ Datos obtenidos de external_reference');
          } catch (e) {
            console.error('❌ Error decodificando external_reference:', e);
          }
        }
      } else {
        console.log('✅ Datos obtenidos de localStorage');
      }
      
      if (!purchasedCoursesData) {
        console.log('❌ NO HAY DATOS - No se puede enviar email');
        console.log('🔍 Todas las fuentes están vacías:');
        console.log('  - localStorage: null');
        console.log('  - external_reference: null');
        console.log('⚠️ PROBLEMA: Los datos no se guardaron antes de MercadoPago');
        return;
      }

      const { courses, userEmail, userName, userDni, userProvincia, userLocalidad, userPais, items } = JSON.parse(purchasedCoursesData);
      
      // Usar items si courses no existe (para compatibilidad)
      const finalCourses = courses || items || [];

      if (!finalCourses || finalCourses.length === 0 || !userEmail) {
        console.log('❌ Datos insuficientes para enviar email');
        console.log('Datos:', { courses: finalCourses, userEmail });
        return;
      }
      
      console.log('✅ Datos válidos, enviando email...');
      console.log('📧 Email destino:', userEmail);
      console.log('📚 Cursos:', finalCourses.length);

      // 1. GUARDAR LA ORDEN EN SUPABASE
      try {
        // Calcular total
        const total = finalCourses.reduce((sum: number, course: any) => sum + (course.price || 0), 0);

        // Crear la orden
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_email: userEmail,
            user_name: userName || null,
            user_dni: userDni || null,
            user_pais: userPais || null,
            user_provincia: userProvincia || null,
            user_localidad: userLocalidad || null,
            total: total,
            status: 'completed',
            payment_id: paymentIdParam || null,
            payment_method: paymentIdParam?.includes('PAYID') ? 'paypal' : gateway === 'ualabis' ? 'ualabis' : 'mercadopago',
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creando orden:', orderError);
        } else if (orderData) {
          // Crear los items de la orden
          const orderItems = finalCourses.map((course: any) => ({
            order_id: orderData.id,
            course_id: course.id,
            item_type: 'course',
            item_name: course.title,
            quantity: 1,
            price: course.price || 0,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('Error creando order_items:', itemsError);
          } else {
            console.log('✅ Orden guardada en Supabase:', orderData.id);
          }
        }
      } catch (dbError) {
        console.error('Error guardando en base de datos:', dbError);
        // Continuar con el email aunque falle la BD
      }

      // 2. OBTENER URLs DE ACCESO DE LOS CURSOS
      const baseUrl = window.location.origin.replace(/\/$/, '');
      let coursesWithAccess = finalCourses;
      try {
        const courseIds = finalCourses.map((c: any) => c.id).filter((id: any) => id);
        if (courseIds.length > 0) {
          const { data: accessData } = await supabase
            .from('courses')
            .select('id, access_url')
            .in('id', courseIds);
          
          if (accessData) {
            coursesWithAccess = finalCourses.map((course: any) => {
              const found = accessData.find((a: any) => a.id === course.id);
              return { ...course, accessUrl: found?.access_url || null };
            });
          }
        }
      } catch (accessErr) {
        console.error('Error obteniendo URLs de acceso:', accessErr);
      }

      // 3. ENVIAR EMAIL DE CONFIRMACIÓN
      const response = await fetch(`${baseUrl}/api/send-course-email`, {
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
          courses: coursesWithAccess,
          paymentId: paymentIdParam,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar email');
      }

      console.log('✅ Email enviado exitosamente');
      setEmailSent(true);

      // 3. ASIGNAR TAG EN SYSTEME.IO PARA ACTIVAR AUTOMATIZACIÓN
      try {
        console.log('🔑 Creando contacto y asignando tag en systeme.io...');
        
        // Separar nombre completo en firstName y lastName
        const nameParts = (userName || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const systemeResponse = await fetch(`${baseUrl}/api/systeme-grant-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            firstName: firstName,
            lastName: lastName,
            courses: finalCourses,
          }),
        });

        if (systemeResponse.ok) {
          const systemeData = await systemeResponse.json();
          console.log('✅ Contacto registrado y tag asignado en systeme.io:', systemeData);
          
          if (systemeData.details) {
            console.log(`📊 Tag asignado: ${systemeData.details.tagAssigned ? 'SÍ' : 'NO'}`);
            console.log(`💡 ${systemeData.details.note}`);
          }
        } else {
          const systemeError = await systemeResponse.text();
          console.error('⚠️ Error creando contacto en systeme.io:', systemeError);
          // No lanzar error, continuar aunque falle systeme.io
        }
      } catch (systemeError) {
        console.error('⚠️ Error al conectar con systeme.io:', systemeError);
        // No detener el flujo si falla systeme.io
      }

      // 4. ENVIAR NOTIFICACIÓN TELEGRAM AL ADMIN 🔔
      try {
        console.log('📱 Enviando notificación Telegram al admin...');

        // Obtener el primer curso/producto para las alertas
        const firstItem = finalCourses[0];
        const itemName = firstItem?.title || '';

        // Enviar notificación de venta + alertas inteligentes (endpoint unificado)
        await fetch(`${baseUrl}/api/telegram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'new_sale',
            orderData: {
              orderId: paymentIdParam || 'N/A',
              total: finalCourses.reduce((sum: number, course: any) => sum + (course.price || 0), 0),
              paymentMethod: paymentIdParam?.includes('PAYID') ? 'paypal' : gateway === 'ualabis' ? 'ualabis' : 'mercadopago',
              paymentId: paymentIdParam || 'N/A',
              status: 'completed',
              items: finalCourses.map((course: any) => ({
                name: course.title,
                price: course.price || 0,
                type: 'course'
              })),
              itemsCount: finalCourses.length,
            },
            customerData: {
              name: userName || 'Sin nombre',
              email: userEmail,
              country: userPais || 'N/A',
              province: userProvincia || 'N/A',
              city: userLocalidad || 'N/A',
            },
            adminUrl: `${baseUrl}/admin/orders`,
          }),
        });

        console.log('✅ Notificación y alertas inteligentes enviadas');

      } catch (telegramError) {
        console.error('⚠️ Error enviando notificación Telegram:', telegramError);
        // No detener el flujo si falla Telegram
      }
      
      // Limpiar datos de localStorage después de todo
      localStorage.removeItem('purchasedCourses');
      
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
