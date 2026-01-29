// MercadoPago - Webhook para notificaciones
const mercadopago = require('mercadopago');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    console.log('Webhook received:', { type, data });

    // Responder rápido a MercadoPago
    res.status(200).json({ received: true });

    // Configurar MercadoPago
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    // Procesar el webhook de manera asíncrona
    if (type === 'payment') {
      const paymentId = data.id;
      
      try {
        const payment = await mercadopago.payment.findById(paymentId);
        
        console.log('Payment details:', {
          id: payment.body.id,
          status: payment.body.status,
          status_detail: payment.body.status_detail,
          external_reference: payment.body.external_reference,
          payer_email: payment.body.payer?.email
        });

        if (payment.body.status === 'approved') {
          console.log('✅ Payment approved!');
          // Aquí puedes:
          // - Guardar el pedido en la base de datos
          // - Enviar email de confirmación
          // - Dar acceso a los cursos
        } else if (payment.body.status === 'rejected') {
          console.log('❌ Payment rejected');
        } else if (payment.body.status === 'pending') {
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
