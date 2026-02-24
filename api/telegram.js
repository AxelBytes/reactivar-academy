/**
 * API Endpoint UNIFICADO de Telegram
 * Combina notificaciones de venta + alertas inteligentes en 1 función
 * 
 * FUNCIONALIDADES:
 * - Notificación de nueva venta con detalles completos
 * - 🎯 Meta diaria alcanzada
 * - 🏆 Record de ventas batido
 * - ☕ Primera venta del día
 * - 👑 Cliente VIP detectado
 * - 🔥 Horario pico de ventas
 * - 🚀 Producto viral del día
 * - ❌ Pago fallido
 * - ⚠️ Stock bajo
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
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

    console.log('📱 Telegram unificado - tipo:', type);

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const sentMessages = [];

    // ==============================================
    // PARTE 1: NOTIFICACIÓN PRINCIPAL DE VENTA
    // ==============================================

    if (type === 'new_sale' && orderData) {
      const {
        orderId, total, paymentMethod, paymentId,
        status, items, itemsCount,
      } = orderData;

      const { name, email, country, province, city } = customerData || {};

      const paymentEmoji = paymentMethod === 'mercadopago' ? '💳' : 
                          paymentMethod === 'paypal' ? '🅿️' : '💰';
      const statusEmoji = status === 'completed' ? '✅' : 
                         status === 'pending' ? '⏳' : '❌';

      const itemsList = (items || []).map((item, index) => 
        `${index + 1}. ${item.name} - $${item.price.toLocaleString('es-AR')}`
      ).join('\n');

      const saleMessage = `
🎉 *¡NUEVA VENTA!*

━━━━━━━━━━━━━━━━━━━

📦 *PEDIDO #${orderId}*
${statusEmoji} Estado: ${status === 'completed' ? 'Completado' : status === 'pending' ? 'Pendiente' : 'Rechazado'}
💵 Total: *$${total.toLocaleString('es-AR')} ARS*
${paymentEmoji} Método: ${paymentMethod === 'mercadopago' ? 'MercadoPago' : paymentMethod === 'paypal' ? 'PayPal' : 'Otro'}
🔖 ID de Pago: \`${paymentId}\`

━━━━━━━━━━━━━━━━━━━

👤 *CLIENTE*
📧 ${email || 'N/A'}
👨‍💼 ${name || 'Sin nombre'}
🌍 ${city || 'N/A'}, ${province || 'N/A'}, ${country || 'N/A'}

━━━━━━━━━━━━━━━━━━━

🛒 *ITEMS COMPRADOS* (${itemsCount || 0})

${itemsList || 'Sin items'}

━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleString('es-AR', { 
  timeZone: 'America/Argentina/Buenos_Aires',
  dateStyle: 'full',
  timeStyle: 'short'
})}
      `.trim();

      const buttons = [
        [{ text: '📊 Ver en Panel Admin', url: adminUrl || 'https://tu-web.com/admin/orders' }],
        [
          { text: '📧 Enviar Email', callback_data: `email_${orderId}` },
          { text: '✅ Marcar Procesado', callback_data: `processed_${orderId}` }
        ]
      ];

      const saleResult = await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, saleMessage, buttons);
      if (saleResult) sentMessages.push('sale_notification');

      // ==============================================
      // PARTE 2: ALERTAS INTELIGENTES AUTOMÁTICAS
      // ==============================================

      const orderTotal = total || 0;
      const courseName = items?.[0]?.name || '';
      const productName = courseName;

      // 🎯 META DIARIA ALCANZADA
      const DAILY_GOAL = 10000;
      const todaySales = await getTodayTotalSales();
      
      if (todaySales >= DAILY_GOAL) {
        const prevTotal = todaySales - orderTotal;
        if (prevTotal < DAILY_GOAL) {
          await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
🎯 *¡META DEL DÍA CUMPLIDA!*

━━━━━━━━━━━━━━━━━━━

💰 Meta: $${DAILY_GOAL.toLocaleString('es-AR')} ARS
✅ Alcanzado: $${todaySales.toLocaleString('es-AR')} ARS
📈 Superado en: $${(todaySales - DAILY_GOAL).toLocaleString('es-AR')}

🎉 ¡Felicitaciones! Ya cumpliste tu objetivo diario

⏰ ${new Date().toLocaleTimeString('es-AR')}
          `.trim());
          sentMessages.push('daily_goal');
        }
      }

      // 🏆 RECORD DE VENTAS
      const recordToday = await checkIfTodayIsRecord();
      if (recordToday.isRecord) {
        await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
🏆 *¡NUEVO RÉCORD DE VENTAS!*

━━━━━━━━━━━━━━━━━━━

🎉 ¡Hoy es el MEJOR día del mes!

💰 Ventas de hoy: $${recordToday.todaySales.toLocaleString('es-AR')} ARS
📊 Récord anterior: $${recordToday.previousRecord.toLocaleString('es-AR')} ARS
📈 Superado en: ${recordToday.percentage}%

🔥 ¡Sigue así, campeón!

⏰ ${new Date().toLocaleString('es-AR')}
        `.trim());
        sentMessages.push('sales_record');
      }

      // ☕ PRIMERA VENTA DEL DÍA
      const isFirstSale = await checkIfFirstSaleOfDay();
      if (isFirstSale) {
        await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
☕ *¡PRIMERA VENTA DEL DÍA!*

━━━━━━━━━━━━━━━━━━━

🌅 Buenos días, ¡arrancamos con todo!

💵 Venta: $${orderTotal.toLocaleString('es-AR')} ARS
${productName ? `📦 Producto: ${productName}` : ''}

☕ El café funcionó 😉

⏰ ${new Date().toLocaleTimeString('es-AR')}
        `.trim());
        sentMessages.push('first_sale');
      }

      // 👑 CLIENTE VIP
      const VIP_THRESHOLD = 500000;
      if (orderTotal >= VIP_THRESHOLD) {
        await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
👑 *¡CLIENTE VIP DETECTADO!*

━━━━━━━━━━━━━━━━━━━

💎 Compra de alto valor detectada

💵 Monto: *$${orderTotal.toLocaleString('es-AR')} ARS*
${productName ? `📦 Producto: ${productName}` : ''}

⭐ Considera enviarle un mensaje de agradecimiento personalizado

⏰ ${new Date().toLocaleString('es-AR')}
        `.trim());
        sentMessages.push('vip_customer');
      }

      // 🔥 HORARIO PICO (3+ ventas en 10 minutos)
      const recentSales = await getSalesInLastMinutes(10);
      if (recentSales >= 3) {
        await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
🔥 *¡HORARIO PICO DE VENTAS!*

━━━━━━━━━━━━━━━━━━━

⚡ ¡Está explotando todo!

📊 Ventas en los últimos 10 minutos: *${recentSales}*
💰 Total del día hasta ahora: $${todaySales.toLocaleString('es-AR')} ARS

🎯 Momento ideal para promocionar en redes

⏰ ${new Date().toLocaleTimeString('es-AR')}
        `.trim());
        sentMessages.push('peak_hour');
      }

      // 🚀 PRODUCTO VIRAL (10+ ventas del mismo producto hoy)
      if (courseName || productName) {
        const itemName = courseName || productName;
        const itemSalesToday = await getItemSalesToday(itemName);
        const VIRAL_THRESHOLD = 10;
        if (itemSalesToday >= VIRAL_THRESHOLD) {
          const prevCount = itemSalesToday - 1;
          if (prevCount < VIRAL_THRESHOLD) {
            await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
🚀 *¡PRODUCTO VIRAL DETECTADO!*

━━━━━━━━━━━━━━━━━━━

🔥 Un producto se está vendiendo como pan caliente

📦 *${itemName}*
📊 Vendido hoy: *${itemSalesToday} veces*

💡 Sugerencias:
• Aumentar stock (si es producto físico)
• Crear contenido viral sobre este producto
• Preparar oferta relacionada

⏰ ${new Date().toLocaleString('es-AR')}
            `.trim());
            sentMessages.push('viral_product');
          }
        }
      }

    } else if (type === 'payment_failed' && paymentData) {
      // ❌ PAGO FALLIDO
      const { paymentId, reason, amount } = paymentData;
      const { email } = customerData || {};

      await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
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
      `.trim());
      sentMessages.push('payment_failed');

    } else if (type === 'low_stock' && orderData) {
      // ⚠️ STOCK BAJO
      const { productName, currentStock } = orderData;
      const buttons = [
        [{ text: '📦 Ver Inventario', url: adminUrl || 'https://tu-web.com/admin/products' }]
      ];

      await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
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
      `.trim(), buttons);
      sentMessages.push('low_stock');

    } else {
      // Mensaje genérico
      await sendTelegramMessage(telegramUrl, TELEGRAM_CHAT_ID, `
📬 *NUEVA NOTIFICACIÓN*

${JSON.stringify(req.body, null, 2)}
      `.trim());
      sentMessages.push('generic');
    }

    return res.status(200).json({
      success: true,
      messagesSent: sentMessages.length,
      types: sentMessages
    });

  } catch (error) {
    console.error('❌ Error en telegram:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ==============================================
// HELPER: Enviar mensaje a Telegram
// ==============================================

async function sendTelegramMessage(url, chatId, text, buttons = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    };

    if (buttons && buttons.length > 0) {
      payload.reply_markup = { inline_keyboard: buttons };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Telegram:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Mensaje enviado:', result.message_id);
    return true;
  } catch (error) {
    console.error('❌ Error enviando a Telegram:', error);
    return false;
  }
}

// ==============================================
// FUNCIONES AUXILIARES PARA ALERTAS INTELIGENTES
// ==============================================

async function getTodayTotalSales() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  
  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', startOfDay)
    .eq('status', 'completed');
  
  if (error || !data) return 0;
  return data.reduce((sum, order) => sum + (order.total || 0), 0);
}

async function checkIfTodayIsRecord() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', startOfDay)
    .eq('status', 'completed');
  
  const todaySales = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfDay)
    .eq('status', 'completed');
  
  if (!monthOrders || monthOrders.length === 0) {
    return { isRecord: false, todaySales: 0, previousRecord: 0, percentage: 0 };
  }
  
  const dailySales = new Map();
  monthOrders.forEach(order => {
    const day = new Date(order.created_at).toDateString();
    dailySales.set(day, (dailySales.get(day) || 0) + (order.total || 0));
  });
  
  const previousRecord = Math.max(...Array.from(dailySales.values()));
  const isRecord = todaySales > previousRecord;
  const percentage = previousRecord > 0 
    ? Math.round(((todaySales - previousRecord) / previousRecord) * 100)
    : 100;
  
  return { isRecord, todaySales, previousRecord, percentage };
}

async function checkIfFirstSaleOfDay() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay)
    .eq('status', 'completed');
  
  if (error) return false;
  return count === 1;
}

async function getSalesInLastMinutes(minutes) {
  const now = new Date();
  const minutesAgo = new Date(now.getTime() - minutes * 60000).toISOString();
  
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', minutesAgo)
    .eq('status', 'completed');
  
  if (error) return 0;
  return count || 0;
}

async function getItemSalesToday(itemName) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  
  const { data, error } = await supabase
    .from('order_items')
    .select('*, orders!inner(*)')
    .eq('item_name', itemName)
    .gte('orders.created_at', startOfDay)
    .eq('orders.status', 'completed');
  
  if (error || !data) return 0;
  return data.reduce((sum, item) => sum + (item.quantity || 1), 0);
}
