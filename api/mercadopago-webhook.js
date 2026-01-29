// MercadoPago - Webhook para notificaciones
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    console.log('Webhook received:', { type, data });

    // Responder rápido a MercadoPago
    res.status(200).json({ received: true });

    // Configurar cliente de MercadoPago (SDK v2)
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    // Procesar el webhook de manera asíncrona
    if (type === 'payment') {
      const paymentId = data.id;
      
      try {
        const paymentData = await payment.get({ id: paymentId });
        
        console.log('Payment details:', {
          id: paymentData.id,
          status: paymentData.status,
          status_detail: paymentData.status_detail,
          external_reference: paymentData.external_reference,
          payer_email: paymentData.payer?.email
        });

        if (paymentData.status === 'approved') {
          console.log('✅ Payment approved!');
          // Aquí puedes:
          // - Guardar el pedido en la base de datos
          // - Enviar email de confirmación
          // - Dar acceso a los cursos
        } else if (paymentData.status === 'rejected') {
          console.log('❌ Payment rejected');
        } else if (paymentData.status === 'pending') {
          console.log('⏳ Payment pending');
        }
      } catch (error) {
        console.error('Error processing payment webhook:', error);
      }
    }

  } catch (error) {
    console.error('Webhook error:', error);
    // Aún así responder 200 para no saturar a MercadoPago
    res.status(200).json({ received: true });
  }
}
