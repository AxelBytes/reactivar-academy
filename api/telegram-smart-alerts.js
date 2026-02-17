/**
 * Helper para detectar y enviar alertas inteligentes automáticas
 * Se llama desde Success.tsx después de cada venta
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
    return res.status(200).json({ success: false, message: 'Telegram no configurado' });
  }

  try {
    const { 
      orderTotal,
      productName,
      courseName,
      adminUrl 
    } = req.body;

    const alerts = [];

    // ============================================
    // 🎯 META DIARIA ALCANZADA
    // ============================================
    const DAILY_GOAL = 10000; // Configurable: meta diaria en ARS
    const todaySales = await getTodayTotalSales();
    
    if (todaySales >= DAILY_GOAL) {
      const prevTotal = todaySales - (orderTotal || 0);
      // Solo enviar si esta venta hizo que se alcance la meta
      if (prevTotal < DAILY_GOAL) {
        alerts.push({
          type: 'daily_goal',
          message: `
🎯 *¡META DEL DÍA CUMPLIDA!*

━━━━━━━━━━━━━━━━━━━

💰 Meta: $${DAILY_GOAL.toLocaleString('es-AR')} ARS
✅ Alcanzado: $${todaySales.toLocaleString('es-AR')} ARS
📈 Superado en: $${(todaySales - DAILY_GOAL).toLocaleString('es-AR')}

🎉 ¡Felicitaciones! Ya cumpliste tu objetivo diario

⏰ ${new Date().toLocaleTimeString('es-AR')}
          `.trim()
        });
      }
    }

    // ============================================
    // 🏆 RECORD DE VENTAS
    // ============================================
    const recordToday = await checkIfTodayIsRecord();
    if (recordToday.isRecord) {
      alerts.push({
        type: 'sales_record',
        message: `
🏆 *¡NUEVO RÉCORD DE VENTAS!*

━━━━━━━━━━━━━━━━━━━

🎉 ¡Hoy es el MEJOR día del mes!

💰 Ventas de hoy: $${recordToday.todaySales.toLocaleString('es-AR')} ARS
📊 Récord anterior: $${recordToday.previousRecord.toLocaleString('es-AR')} ARS
📈 Superado en: ${recordToday.percentage}%

🔥 ¡Sigue así, campeón!

⏰ ${new Date().toLocaleString('es-AR')}
        `.trim()
      });
    }

    // ============================================
    // ☕ PRIMERA VENTA DEL DÍA
    // ============================================
    const isFirstSale = await checkIfFirstSaleOfDay();
    if (isFirstSale) {
      alerts.push({
        type: 'first_sale',
        message: `
☕ *¡PRIMERA VENTA DEL DÍA!*

━━━━━━━━━━━━━━━━━━━

🌅 Buenos días, ¡arrancamos con todo!

💵 Venta: $${(orderTotal || 0).toLocaleString('es-AR')} ARS
${productName ? `📦 Producto: ${productName}` : ''}
${courseName ? `📚 Curso: ${courseName}` : ''}

☕ El café funcionó 😉

⏰ ${new Date().toLocaleTimeString('es-AR')}
        `.trim()
      });
    }

    // ============================================
    // 👑 CLIENTE VIP
    // ============================================
    const VIP_THRESHOLD = 500000; // Configurable: monto para ser VIP
    if (orderTotal && orderTotal >= VIP_THRESHOLD) {
      alerts.push({
        type: 'vip_customer',
        message: `
👑 *¡CLIENTE VIP DETECTADO!*

━━━━━━━━━━━━━━━━━━━

💎 Compra de alto valor detectada

💵 Monto: *$${orderTotal.toLocaleString('es-AR')} ARS*
${productName ? `📦 Producto: ${productName}` : ''}
${courseName ? `📚 Curso: ${courseName}` : ''}

⭐ Considera enviarle un mensaje de agradecimiento personalizado

⏰ ${new Date().toLocaleString('es-AR')}
        `.trim()
      });
    }

    // ============================================
    // 🔥 HORARIO PICO (3+ ventas en 10 minutos)
    // ============================================
    const recentSales = await getSalesInLastMinutes(10);
    if (recentSales >= 3) {
      alerts.push({
        type: 'peak_hour',
        message: `
🔥 *¡HORARIO PICO DE VENTAS!*

━━━━━━━━━━━━━━━━━━━

⚡ ¡Está explotando todo!

📊 Ventas en los últimos 10 minutos: *${recentSales}*
💰 Total del día hasta ahora: $${todaySales.toLocaleString('es-AR')} ARS

🎯 Momento ideal para promocionar en redes

⏰ ${new Date().toLocaleTimeString('es-AR')}
        `.trim()
      });
    }

    // ============================================
    // 🚀 PRODUCTO VIRAL (10+ ventas del mismo producto hoy)
    // ============================================
    if (courseName || productName) {
      const itemName = courseName || productName;
      const itemSalesToday = await getItemSalesToday(itemName);
      
      const VIRAL_THRESHOLD = 10;
      if (itemSalesToday >= VIRAL_THRESHOLD) {
        const prevCount = itemSalesToday - 1;
        // Solo enviar cuando alcanza el threshold
        if (prevCount < VIRAL_THRESHOLD) {
          alerts.push({
            type: 'viral_product',
            message: `
🚀 *¡PRODUCTO VIRAL DETECTADO!*

━━━━━━━━━━━━━━━━━━━

🔥 Un producto se está vendiendo como pan caliente

${courseName ? '📚' : '📦'} *${itemName}*
📊 Vendido hoy: *${itemSalesToday} veces*

💡 Sugerencias:
• Aumentar stock (si es producto físico)
• Crear contenido viral sobre este producto
• Preparar oferta relacionada

⏰ ${new Date().toLocaleString('es-AR')}
            `.trim()
          });
        }
      }
    }

    // ============================================
    // ENVIAR TODAS LAS ALERTAS
    // ============================================
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    for (const alert of alerts) {
      try {
        await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: alert.message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        });
        console.log(`✅ Alerta enviada: ${alert.type}`);
      } catch (error) {
        console.error(`❌ Error enviando alerta ${alert.type}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      alertsSent: alerts.length,
      types: alerts.map(a => a.type)
    });

  } catch (error) {
    console.error('❌ Error en telegram-smart-alerts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

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
  
  // Ventas de hoy
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', startOfDay)
    .eq('status', 'completed');
  
  const todaySales = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  
  // Ventas por día del mes
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('total, created_at')
    .gte('created_at', startOfMonth)
    .lt('created_at', startOfDay)
    .eq('status', 'completed');
  
  if (!monthOrders || monthOrders.length === 0) {
    return { isRecord: false, todaySales: 0, previousRecord: 0, percentage: 0 };
  }
  
  // Agrupar por día
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
  
  return count === 1; // Es la primera si solo hay 1
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
