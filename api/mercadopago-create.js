// MercadoPago - Crear preferencia de pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, payer } = req.body;

    console.log('=== MERCADOPAGO CREATE PREFERENCE ===');
    console.log('Items recibidos:', JSON.stringify(items, null, 2));
    console.log('Payer recibido:', JSON.stringify(payer, null, 2));
    console.log('Access Token configurado:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'SI (' + process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 20) + '...)' : 'NO');

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no esta configurado');
      return res.status(500).json({ error: 'MercadoPago no configurado', detail: 'Falta MERCADOPAGO_ACCESS_TOKEN' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    const preference = new Preference(client);

    const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://reactivar-academy.vercel.app';

    const purchaseData = {
      items: items.map(i => ({
        id: i.id,
        title: i.title || i.name,
        type: i.type,
        price: i.price,
        instructor: i.instructor || 'N/A'
      })),
      userEmail: payer?.email || '',
      userName: payer?.name || '',
      timestamp: Date.now()
    };

    const mappedItems = items.map(item => ({
      id: String(item.id || '1'),
      title: String(item.name || item.title || 'Producto'),
      description: `${item.type === 'product' ? 'Producto' : 'Curso'}: ${item.name || item.title}`,
      quantity: parseInt(item.quantity) || 1,
      unit_price: Number(parseFloat(item.price).toFixed(2)),
      currency_id: 'ARS'
    }));

    console.log('Items mapeados para MP:', JSON.stringify(mappedItems, null, 2));

    const preferenceData = {
      items: mappedItems,
      payer: payer?.email ? {
        email: payer.email,
        name: payer?.name || 'Cliente'
      } : undefined,
      back_urls: {
        success: `${FRONTEND_URL}/success`,
        failure: `${FRONTEND_URL}/failure`,
        pending: `${FRONTEND_URL}/pending`
      },
      auto_return: 'approved',
      notification_url: `${FRONTEND_URL}/api/payments/mercadopago/webhook`,
      statement_descriptor: 'REACTIVAR ACADEMY',
      external_reference: `order-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      metadata: purchaseData,
      payment_methods: {
        installments: 12,
        default_installments: 1
      }
    };

    console.log('Creando preferencia...');
    const response = await preference.create({ body: preferenceData });

    console.log('Preferencia creada OK:', {
      id: response.id,
      init_point: response.init_point ? 'SI' : 'NO',
    });

    res.status(200).json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });

  } catch (error) {
    console.error('=== ERROR CREANDO PREFERENCIA ===');
    console.error('Mensaje:', error.message);
    console.error('Status:', error.status);
    console.error('Causa:', error.cause);
    console.error('Stack:', error.stack);
    
    try {
      console.error('Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (e) {
      console.error('Error raw:', error);
    }
    
    res.status(500).json({ 
      error: 'Error creating payment preference',
      message: error.message,
      status: error.status,
      cause: error.cause || null
    });
  }
}
