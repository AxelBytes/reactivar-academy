// MercadoPago - Webhook para notificaciones
import { MercadoPagoConfig, Payment } from 'mercadopago';

const REJECTION_REASONS = {
  cc_rejected_bad_filled_card_number: 'Número de tarjeta incorrecto',
  cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
  cc_rejected_bad_filled_other: 'Datos de tarjeta incorrectos',
  cc_rejected_bad_filled_security_code: 'Código de seguridad incorrecto',
  cc_rejected_blacklist: 'Tarjeta en lista negra',
  cc_rejected_call_for_authorize: 'El banco requiere autorización telefónica',
  cc_rejected_card_disabled: 'Tarjeta deshabilitada',
  cc_rejected_card_error: 'Error de la tarjeta',
  cc_rejected_duplicated_payment: 'Pago duplicado',
  cc_rejected_high_risk: 'Rechazado por alto riesgo de fraude',
  cc_rejected_insufficient_amount: 'Fondos insuficientes',
  cc_rejected_invalid_installments: 'Cuotas no válidas',
  cc_rejected_max_attempts: 'Máximo de intentos alcanzado',
  cc_rejected_other_reason: 'Rechazado por otra razón',
  cc_rejected_card_type_not_allowed: 'Tipo de tarjeta no permitido',
  rejected_high_risk: 'Rechazado por alto riesgo',
  rejected_by_bank: 'Rechazado por el banco',
  rejected_by_regulations: 'Rechazado por regulaciones',
  rejected_insufficient_data: 'Datos insuficientes',
  rejected_other_reason: 'Rechazado por otra razón',
  accredited: 'Pago acreditado',
  pending_contingency: 'Pago pendiente por contingencia',
  pending_review_manual: 'Pago en revisión manual',
};

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
    const { type, data, action } = req.body;

    console.log('=== WEBHOOK MERCADOPAGO ===');
    console.log('Type:', type);
    console.log('Action:', action);
    console.log('Data:', JSON.stringify(data));

    res.status(200).json({ received: true });

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    if (type === 'payment' && data?.id) {
      const paymentId = data.id;
      
      try {
        const p = await payment.get({ id: paymentId });
        
        console.log('=== DETALLE DEL PAGO ===');
        console.log('ID:', p.id);
        console.log('Status:', p.status);
        console.log('Status Detail:', p.status_detail);
        console.log('Monto:', p.transaction_amount, p.currency_id);
        console.log('Metodo:', p.payment_type_id);
        console.log('Email pagador:', p.payer?.email);
        console.log('Descripcion:', p.description);
        console.log('External Ref:', p.external_reference);

        const reasonText = REJECTION_REASONS[p.status_detail] || p.status_detail || 'Sin detalle';

        if (p.status === 'approved') {
          console.log('PAGO APROBADO');
          await sendTelegramAlert(
            `✅ <b>PAGO APROBADO</b>\n\n` +
            `💰 Monto: $${p.transaction_amount?.toLocaleString('es-AR')} ${p.currency_id}\n` +
            `📧 Email: ${p.payer?.email || 'N/A'}\n` +
            `💳 Método: ${p.payment_type_id}\n` +
            `🆔 Payment ID: ${p.id}`
          );
        } else if (p.status === 'rejected') {
          console.log('PAGO RECHAZADO');
          console.log('MOTIVO:', reasonText);
          await sendTelegramAlert(
            `❌ <b>PAGO RECHAZADO</b>\n\n` +
            `💰 Monto: $${p.transaction_amount?.toLocaleString('es-AR')} ${p.currency_id}\n` +
            `📧 Email: ${p.payer?.email || 'N/A'}\n` +
            `💳 Método: ${p.payment_type_id}\n` +
            `🚫 Motivo: <b>${reasonText}</b>\n` +
            `📋 Código: ${p.status_detail}\n` +
            `🆔 Payment ID: ${p.id}`
          );
        } else if (p.status === 'pending') {
          console.log('PAGO PENDIENTE');
          await sendTelegramAlert(
            `⏳ <b>PAGO PENDIENTE</b>\n\n` +
            `💰 Monto: $${p.transaction_amount?.toLocaleString('es-AR')} ${p.currency_id}\n` +
            `📧 Email: ${p.payer?.email || 'N/A'}\n` +
            `📋 Detalle: ${reasonText}\n` +
            `🆔 Payment ID: ${p.id}`
          );
        }
      } catch (error) {
        console.error('Error obteniendo detalle del pago:', error.message);
      }
    }

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true });
  }
}
