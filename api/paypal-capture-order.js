// PayPal - Capturar pago
export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const SECRET = process.env.PAYPAL_SECRET;
    const API = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

    console.log('Capturing order:', orderId);

    // Get access token
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
    
    const tokenRes = await fetch(`${API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token error:', err);
      throw new Error('Auth failed');
    }

    const { access_token } = await tokenRes.json();

    // Capture payment
    const captureRes = await fetch(`${API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureRes.ok) {
      const err = await captureRes.json();
      console.error('Capture error:', JSON.stringify(err));
      return res.status(captureRes.status).json(err);
    }

    const data = await captureRes.json();

    console.log('Payment captured:', data.id);

    res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Capture failed',
      message: error.message
    });
  }
}
