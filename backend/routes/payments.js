const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

// Configurar MercadoPago con Access Token
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Crear preferencia de pago
router.post('/mercadopago/create-preference', async (req, res) => {
  try {
    const { items, payer } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Crear preferencia
    const preference = {
      items: items.map(item => ({
        id: item.id.toString(),
        title: item.name || item.title || 'Producto',
        description: `${item.type === 'product' ? 'Producto' : 'Curso'}: ${item.name || item.title}`,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.price),
        currency_id: 'ARS'
      })),
      payer: {
        email: payer?.email || 'test@test.com',
        name: payer?.name || 'Usuario'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/success`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL}/checkout/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/mercadopago/webhook`,
      statement_descriptor: 'REACTIVAR ACADEMY',
      external_reference: `ORDER-${Date.now()}`,
      payment_methods: {
        installments: 12,
        default_installments: 1
      }
    };

    console.log('Creating preference:', JSON.stringify(preference, null, 2));

    const response = await mercadopago.preferences.create(preference);

    console.log('Preference created:', response.body.id);

    res.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ 
      error: 'Error creating payment preference',
      message: error.message,
      details: error.response?.data || error
    });
  }
});

// Webhook de MercadoPago para notificaciones
router.post('/mercadopago/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Webhook received:', { type, data });

    // Responder rápido a MercadoPago
    res.sendStatus(200);

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
          // - Actualizar inventario
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
    res.sendStatus(200);
  }
});

// Endpoint para verificar estado de pago (opcional)
router.get('/mercadopago/payment/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await mercadopago.payment.findById(paymentId);
    
    res.json({
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      external_reference: payment.body.external_reference
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: 'Error getting payment status' });
  }
});

module.exports = router;
