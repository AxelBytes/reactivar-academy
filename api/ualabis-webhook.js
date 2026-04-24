// Ualá Bis - Webhook para notificaciones de pago (API v2)

async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (e) {
    console.error('Error enviando alerta Telegram:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    console.log('=== WEBHOOK UALABIS ===');
    console.log('Body:', JSON.stringify(body, null, 2));

    // Responder inmediatamente a Ualá Bis
    res.status(200).json({ received: true });

    // Procesar la notificación
    const { uuid, status, amount, external_reference } = body;

    if (!uuid) {
      console.log('⚠️ Webhook sin UUID, ignorando...');
      return;
    }

    console.log(`📦 Orden UUID: ${uuid}`);
    console.log(`💰 Monto: $${amount}`);
    console.log(`📋 Estado: ${status}`);
    console.log(`🔗 Referencia externa: ${external_reference}`);

    if (status === 'PAID' || status === 'APPROVED') {
      console.log('✅ PAGO APROBADO - Ualá Bis');
      await sendTelegramAlert(
        `✅ <b>PAGO APROBADO - UALÁ BIS</b>\n\n` +
        `💰 Monto: $${amount}\n` +
        `🆔 UUID Orden: ${uuid}\n` +
        `🔗 Ref: ${external_reference || 'N/A'}\n` +
        `📋 Estado: ${status}`
      );
    } else if (status === 'FAILED' || status === 'REJECTED') {
      console.log('❌ PAGO RECHAZADO - Ualá Bis');
      await sendTelegramAlert(
        `❌ <b>PAGO RECHAZADO - UALÁ BIS</b>\n\n` +
        `💰 Monto: $${amount}\n` +
        `🆔 UUID Orden: ${uuid}\n` +
        `📋 Estado: ${status}`
      );
    } else if (status === 'PENDING') {
      console.log('⏳ PAGO PENDIENTE - Ualá Bis');
    } else {
      console.log(`ℹ️ Estado desconocido: ${status}`);
    }

  } catch (error) {
    console.error('Error en webhook Ualá Bis:', error.message);
    res.status(200).json({ received: true });
  }
}
