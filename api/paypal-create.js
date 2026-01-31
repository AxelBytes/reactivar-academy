// PayPal - Crear orden de pago
export default async function handler(req, res) {
  // Habilitar CORS
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
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
    const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

    // Obtener access token de PayPal
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const { access_token } = await tokenResponse.json();

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Convertir ARS a USD (tasa aproximada, idealmente usar una API de cambio)
    const totalUSD = (total / 1000).toFixed(2); // Ajusta según tasa real

    // Crear orden de PayPal
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: totalUSD,
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: totalUSD
            }
          }
        },
        items: items.map(item => ({
          name: item.name || item.title || 'Producto',
          description: `${item.type === 'product' ? 'Producto' : 'Curso'}: ${item.name || item.title}`,
          unit_amount: {
            currency_code: 'USD',
            value: ((item.price / 1000) / item.quantity).toFixed(2)
          },
          quantity: item.quantity.toString()
        }))
      }],
      application_context: {
        brand_name: 'Reactivar Academy',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.VITE_FRONTEND_URL}/checkout/success`,
        cancel_url: `${process.env.VITE_FRONTEND_URL}/checkout/failure`
      }
    };

    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      console.error('PayPal order creation error:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();
    
    // Buscar el link de aprobación
    const approveLink = order.links.find(link => link.rel === 'approve');

    console.log('PayPal order created:', order.id);

    res.status(200).json({
      id: order.id,
      approve_url: approveLink?.href,
      status: order.status
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ 
      error: 'Error creating PayPal order',
      message: error.message
    });
  }
}
