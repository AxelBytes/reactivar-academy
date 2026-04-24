// Ualá Bis - Crear orden de pago (API v2)
// Docs: https://developers.ualabis.com.ar/v2/orders/create

const UALABIS_AUTH_URL = 'https://auth.developers.ar.ua.la/v2/api/auth/token';
const UALABIS_CHECKOUT_URL = 'https://checkout.developers.ar.ua.la/v2/api/checkout';

async function getUalaBisToken(username, clientId, clientSecretId) {
  const response = await fetch(UALABIS_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      client_id: clientId,
      client_secret_id: clientSecretId,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error obteniendo token Ualá Bis: HTTP ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('No se recibió access_token de Ualá Bis');
  }
  return data.access_token;
}

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
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const UALABIS_USERNAME = process.env.UALABIS_USERNAME;
  const UALABIS_CLIENT_ID = process.env.UALABIS_CLIENT_ID;
  const UALABIS_CLIENT_SECRET_ID = process.env.UALABIS_CLIENT_SECRET_ID;

  if (!UALABIS_USERNAME || !UALABIS_CLIENT_ID || !UALABIS_CLIENT_SECRET_ID) {
    console.error('❌ Credenciales de Ualá Bis no configuradas');
    return res.status(500).json({
      error: 'Ualá Bis no configurado',
      detail: 'Faltan UALABIS_USERNAME, UALABIS_CLIENT_ID o UALABIS_CLIENT_SECRET_ID',
    });
  }

  try {
    const { items, payer } = req.body;

    console.log('=== UALABIS CREATE ORDER ===');
    console.log('Items recibidos:', JSON.stringify(items, null, 2));
    console.log('Payer:', JSON.stringify(payer, null, 2));

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Se requieren items para crear el pago' });
    }

    // Calcular monto total
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * (parseInt(item.quantity) || 1));
    }, 0);

    if (total <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://reactivar-academy.vercel.app';
    const externalRef = `ualabis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Descripción del pedido (resumen de items)
    const description = items.map(i => i.name || i.title).join(', ').substring(0, 100);

    // 1. Obtener token de acceso
    console.log('🔑 Obteniendo token de acceso Ualá Bis...');
    const accessToken = await getUalaBisToken(UALABIS_USERNAME, UALABIS_CLIENT_ID, UALABIS_CLIENT_SECRET_ID);
    console.log('✅ Token obtenido correctamente');

    // 2. Crear orden de pago
    console.log('📦 Creando orden de pago...');
    const orderResponse = await fetch(UALABIS_CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: total.toFixed(2),
        description: description || 'Compra en Reactivar Academy',
        callback_fail: `${FRONTEND_URL}/failure?gateway=ualabis`,
        callback_success: `${FRONTEND_URL}/success?gateway=ualabis`,
        notification_url: `${FRONTEND_URL}/api/payments/ualabis/webhook`,
        external_reference: externalRef,
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      throw new Error(`Error creando orden Ualá Bis: HTTP ${orderResponse.status} - ${errorText}`);
    }

    const orderData = await orderResponse.json();
    console.log('✅ Orden creada OK:', {
      uuid: orderData.uuid,
      amount: orderData.amount,
      status: orderData.status,
      checkout_link: orderData.links?.checkout_link ? 'SI' : 'NO',
    });

    return res.status(200).json({
      uuid: orderData.uuid,
      checkout_link: orderData.links?.checkout_link,
      external_reference: externalRef,
      amount: orderData.amount,
    });

  } catch (error) {
    console.error('=== ERROR UALABIS ===');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      error: 'Error al crear el pago con Ualá Bis',
      message: error.message,
    });
  }
}
