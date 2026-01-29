// MercadoPago - Crear preferencia de pago
const mercadopago = require('mercadopago');

export default async function handler(req, res) {
  // Habilitar CORS - Permitir todos los orígenes
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, payer } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Configurar MercadoPago
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://reactivar-academy.vercel.app';

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
        success: `${FRONTEND_URL}/checkout/success`,
        failure: `${FRONTEND_URL}/checkout/failure`,
        pending: `${FRONTEND_URL}/checkout/pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'REACTIVAR ACADEMY',
      external_reference: `ORDER-${Date.now()}`,
      payment_methods: {
        installments: 12,
        default_installments: 1
      }
    };

    console.log('Creating preference for:', items.length, 'items');

    const response = await mercadopago.preferences.create(preference);

    console.log('Preference created:', response.body.id);

    res.status(200).json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ 
      error: 'Error creating payment preference',
      message: error.message
    });
  }
}
