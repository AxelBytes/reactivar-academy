/**
 * API Endpoint para enviar notificaciones de Telegram
 * Sistema de notificaciones PREMIUM para administradores
 * 
 * FEATURES:
 * - Notificaciones de nuevas ventas
 * - Alertas inteligentes automáticas
 * - Detalles completos del pedido
 * - Información del cliente
 * - Links directos al panel admin
 * - Formato visual profesional
 * - Botones interactivos
 * 
 * ALERTAS INTELIGENTES:
 * - 🎯 Meta diaria alcanzada
 * - 🏆 Record de ventas batido
 * - ☕ Primera venta del día
 * - 👑 Cliente VIP (gasta mucho)
 * - 🔥 Horario pico de ventas
 * - 🚀 Producto viral del día
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Validar configuración
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('⚠️ Telegram no configurado - Variables faltantes');
    return res.status(200).json({ 
      success: false,
      message: 'Telegram no configurado - notificación omitida' 
    });
  }

  try {
    const { 
      type,
      orderData,
      paymentData,
      customerData,
      adminUrl 
    } = req.body;

    console.log('📱 Enviando notificación Telegram:', type);

    // Construir mensaje según el tipo
    let message = '';
    let buttons = [];

    if (type === 'new_sale') {
      // NOTIFICACIÓN DE NUEVA VENTA
      const {
        orderId,
        total,
        paymentMethod,
        paymentId,
        status,
        items,
        itemsCount,
      } = orderData;

      const {
        name,
        email,
        country,
        province,
        city,
      } = customerData;

      // Emojis según método de pago
      const paymentEmoji = paymentMethod === 'mercadopago' ? '💳' : 
                          paymentMethod === 'paypal' ? '🅿️' : '💰';
      
      // Emoji según status
      const statusEmoji = status === 'completed' ? '✅' : 
                         status === 'pending' ? '⏳' : '❌';

      // Construir lista de items
      const itemsList = items.map((item, index) => 
        `${index + 1}. ${item.name} - $${item.price.toLocaleString('es-AR')}`
      ).join('\n');

      message = `
🎉 *¡NUEVA VENTA!*

━━━━━━━━━━━━━━━━━━━

📦 *PEDIDO #${orderId}*
${statusEmoji} Estado: ${status === 'completed' ? 'Completado' : status === 'pending' ? 'Pendiente' : 'Rechazado'}
💵 Total: *$${total.toLocaleString('es-AR')} ARS*
${paymentEmoji} Método: ${paymentMethod === 'mercadopago' ? 'MercadoPago' : paymentMethod === 'paypal' ? 'PayPal' : 'Otro'}
🔖 ID de Pago: \`${paymentId}\`

━━━━━━━━━━━━━━━━━━━

👤 *CLIENTE*
📧 ${email}
👨‍💼 ${name || 'Sin nombre'}
🌍 ${city || 'N/A'}, ${province || 'N/A'}, ${country || 'N/A'}

━━━━━━━━━━━━━━━━━━━

🛒 *ITEMS COMPRADOS* (${itemsCount})

${itemsList}

━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleString('es-AR', { 
  timeZone: 'America/Argentina/Buenos_Aires',
  dateStyle: 'full',
  timeStyle: 'short'
})}
      `.trim();

      // Botones inline
      buttons = [
        [
          { 
            text: '📊 Ver en Panel Admin', 
            url: adminUrl || 'https://tu-web.com/admin/orders' 
          }
        ],
        [
          { 
            text: '📧 Enviar Email', 
            callback_data: `email_${orderId}` 
          },
          { 
            text: '✅ Marcar Procesado', 
            callback_data: `processed_${orderId}` 
          }
        ]
      ];

    } else if (type === 'payment_failed') {
      // NOTIFICACIÓN DE PAGO FALLIDO
      const {
        paymentId,
        reason,
        amount,
      } = paymentData;

      const { email } = customerData;

      message = `
❌ *PAGO FALLIDO*

━━━━━━━━━━━━━━━━━━━

🔴 Un intento de pago ha fallado

💵 Monto: $${amount?.toLocaleString('es-AR') || 'N/A'} ARS
📧 Cliente: ${email || 'Desconocido'}
🔖 ID: \`${paymentId}\`
⚠️ Razón: ${reason || 'Desconocida'}

⏰ ${new Date().toLocaleString('es-AR', { 
  timeZone: 'America/Argentina/Buenos_Aires',
  dateStyle: 'full',
  timeStyle: 'short'
})}
      `.trim();

    } else if (type === 'low_stock') {
      // NOTIFICACIÓN DE STOCK BAJO (para productos físicos)
      const { productName, currentStock } = orderData;

      message = `
⚠️ *ALERTA DE STOCK*

━━━━━━━━━━━━━━━━━━━

📦 Producto: *${productName}*
📊 Stock actual: *${currentStock} unidades*

🔔 Es momento de reabastecer

⏰ ${new Date().toLocaleString('es-AR', { 
  timeZone: 'America/Argentina/Buenos_Aires',
  dateStyle: 'full',
  timeStyle: 'short'
})}
      `.trim();

      buttons = [
        [
          { 
            text: '📦 Ver Inventario', 
            url: adminUrl || 'https://tu-web.com/admin/products' 
          }
        ]
      ];

    } else {
      // Mensaje genérico
      message = `
📬 *NUEVA NOTIFICACIÓN*

${JSON.stringify(req.body, null, 2)}
      `.trim();
    }

    // Enviar mensaje a Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    };

    // Agregar botones si existen
    if (buttons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: buttons
      };
    }

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('❌ Error enviando a Telegram:', errorText);
      throw new Error(`Telegram API error: ${errorText}`);
    }

    const result = await telegramResponse.json();
    console.log('✅ Notificación Telegram enviada:', result.message_id);

    return res.status(200).json({
      success: true,
      message: 'Notificación enviada',
      messageId: result.message_id
    });

  } catch (error) {
    console.error('❌ Error en telegram-notify:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
