/**
 * Webhook de Telegram - Maneja comandos del bot
 * Sistema de reportes financieros profesional
 * 
 * COMANDOS:
 * /dia - Resumen de ventas del día
 * /semana - Resumen de la semana
 * /mes - Resumen del mes
 * /año - Resumen del año
 * /stats - Estadísticas generales
 * /help - Lista de comandos
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  // CORS y headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Aceptar tanto POST como GET para testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(200).json({ ok: true });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ TELEGRAM_BOT_TOKEN no configurado');
    return res.status(200).json({ ok: true });
  }

  try {
    const update = req.body;
    
    // Si es GET, es solo un health check
    if (req.method === 'GET') {
      return res.status(200).json({ 
        ok: true, 
        status: 'Telegram webhook active',
        botConfigured: !!TELEGRAM_BOT_TOKEN 
      });
    }

    const message = update.message;

    if (!message || !message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();
    const command = text.split(' ')[0];

    console.log(`📱 Comando recibido: ${command}`);

    let responseText = '';

    switch (command) {
      case '/dia':
      case '/día':
        responseText = await generateDayReport();
        break;

      case '/semana':
        responseText = await generateWeekReport();
        break;

      case '/mes':
        responseText = await generateMonthReport();
        break;

      case '/año':
      case '/ano':
        responseText = await generateYearReport();
        break;

      case '/stats':
        responseText = await generateStatsReport();
        break;

      case '/help':
      case '/start':
        responseText = generateHelpMessage();
        break;

      default:
        responseText = '❓ Comando no reconocido. Usa /help para ver comandos disponibles.';
    }

    // Enviar respuesta
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseText,
        parse_mode: 'Markdown',
      }),
    });

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Error en webhook:', error);
    return res.status(200).json({ ok: true });
  }
}

// ============================================
// REPORTES
// ============================================

async function generateDayReport() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)
    .eq('status', 'completed');

  if (error) {
    console.error('Error obteniendo órdenes:', error);
    return '❌ Error al generar reporte';
  }

  const stats = calculateStats(orders || []);
  const dateStr = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
📊 *REPORTE DEL DÍA*
${dateStr}

━━━━━━━━━━━━━━━━━━━

💰 *VENTAS*
📈 Total vendido: *$${stats.totalSales.toLocaleString('es-AR')} ARS*
🛒 Órdenes completadas: *${stats.ordersCount}*
📦 Productos vendidos: *${stats.itemsCount}*

💵 *TICKET PROMEDIO*
${stats.ordersCount > 0 ? `$${stats.avgTicket.toLocaleString('es-AR')} ARS` : 'N/A'}

━━━━━━━━━━━━━━━━━━━

📦 *TOP PRODUCTOS*
${stats.topProducts.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name} (${p.count}x) - $${p.total.toLocaleString('es-AR')}`
).join('\n') || 'Sin ventas'}

━━━━━━━━━━━━━━━━━━━

💳 *MÉTODOS DE PAGO*
${stats.paymentMethods.map(m => 
  `${m.emoji} ${m.name}: ${m.count} (${m.percentage}%)`
).join('\n') || 'N/A'}

━━━━━━━━━━━━━━━━━━━

👥 *CLIENTES*
Nuevos clientes: ${stats.newCustomers}
Clientes recurrentes: ${stats.returningCustomers}

━━━━━━━━━━━━━━━━━━━

⏰ Actualizado: ${new Date().toLocaleTimeString('es-AR')}
  `.trim();
}

async function generateWeekReport() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('created_at', startOfWeek.toISOString())
    .eq('status', 'completed');

  if (error) {
    return '❌ Error al generar reporte';
  }

  const stats = calculateStats(orders || []);
  const dailyBreakdown = getDailyBreakdown(orders || []);

  return `
📊 *REPORTE SEMANAL*
Semana del ${startOfWeek.toLocaleDateString('es-AR')}

━━━━━━━━━━━━━━━━━━━

💰 *RESUMEN GENERAL*
📈 Total vendido: *$${stats.totalSales.toLocaleString('es-AR')} ARS*
🛒 Órdenes: *${stats.ordersCount}*
📦 Items vendidos: *${stats.itemsCount}*
💵 Ticket promedio: *$${stats.avgTicket.toLocaleString('es-AR')} ARS*

━━━━━━━━━━━━━━━━━━━

📅 *VENTAS POR DÍA*
${dailyBreakdown.map(d => 
  `${d.day}: $${d.sales.toLocaleString('es-AR')} (${d.orders} orden${d.orders !== 1 ? 'es' : ''})`
).join('\n')}

━━━━━━━━━━━━━━━━━━━

📊 *GRÁFICO DE BARRAS*
${generateBarChart(dailyBreakdown)}

━━━━━━━━━━━━━━━━━━━

🏆 *TOP 5 PRODUCTOS*
${stats.topProducts.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name}\n   ${p.count}x | $${p.total.toLocaleString('es-AR')}`
).join('\n\n') || 'Sin ventas'}

━━━━━━━━━━━━━━━━━━━

💳 *MÉTODOS DE PAGO*
${stats.paymentMethods.map(m => 
  `${m.emoji} ${m.name}: $${m.amount.toLocaleString('es-AR')} (${m.percentage}%)`
).join('\n')}

━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleString('es-AR')}
  `.trim();
}

async function generateMonthReport() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString())
    .eq('status', 'completed');

  if (error) {
    return '❌ Error al generar reporte';
  }

  const stats = calculateStats(orders || []);
  const monthName = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const daysInMonth = endOfMonth.getDate();
  const daysPassed = today.getDate();
  const dailyAverage = stats.totalSales / daysPassed;
  const projection = dailyAverage * daysInMonth;

  return `
📊 *REPORTE MENSUAL*
${monthName.toUpperCase()}

━━━━━━━━━━━━━━━━━━━

💰 *VENTAS DEL MES*
📈 Total acumulado: *$${stats.totalSales.toLocaleString('es-AR')} ARS*
📊 Progreso: ${daysPassed}/${daysInMonth} días (${Math.round(daysPassed/daysInMonth*100)}%)

📉 Promedio diario: $${Math.round(dailyAverage).toLocaleString('es-AR')}
🎯 Proyección del mes: $${Math.round(projection).toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

🛒 *ÓRDENES Y PRODUCTOS*
Total órdenes: ${stats.ordersCount}
Total items: ${stats.itemsCount}
Ticket promedio: $${stats.avgTicket.toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

🏆 *PRODUCTOS MÁS VENDIDOS*
${stats.topProducts.slice(0, 10).map((p, i) => 
  `${i + 1}. ${p.name}\n   📦 ${p.count} unid. | 💰 $${p.total.toLocaleString('es-AR')}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━

💳 *DESGLOSE POR MÉTODO DE PAGO*
${stats.paymentMethods.map(m => 
  `${m.emoji} *${m.name}*\n   Ventas: $${m.amount.toLocaleString('es-AR')} (${m.percentage}%)\n   Transacciones: ${m.count}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━

👥 *CLIENTES*
🆕 Nuevos: ${stats.newCustomers}
🔄 Recurrentes: ${stats.returningCustomers}
📊 Total únicos: ${stats.uniqueCustomers}

━━━━━━━━━━━━━━━━━━━

📈 *COMPARACIÓN*
vs. Mes anterior: ${stats.vsLastMonth > 0 ? '+' : ''}${stats.vsLastMonth}%
${stats.vsLastMonth > 0 ? '🟢 Crecimiento' : stats.vsLastMonth < 0 ? '🔴 Decrecimiento' : '⚪ Sin cambios'}

━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleString('es-AR')}
  `.trim();
}

async function generateYearReport() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('created_at', startOfYear.toISOString())
    .eq('status', 'completed');

  if (error) {
    return '❌ Error al generar reporte';
  }

  const stats = calculateStats(orders || []);
  const monthlyBreakdown = getMonthlyBreakdown(orders || []);

  return `
📊 *REPORTE ANUAL*
AÑO ${today.getFullYear()}

━━━━━━━━━━━━━━━━━━━

💰 *RESUMEN FINANCIERO*
📈 Ventas totales: *$${stats.totalSales.toLocaleString('es-AR')} ARS*
📊 Promedio mensual: $${Math.round(stats.totalSales/12).toLocaleString('es-AR')}
💵 Ticket promedio: $${stats.avgTicket.toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

🛒 *VOLUMEN DE VENTAS*
Total órdenes: ${stats.ordersCount}
Total items: ${stats.itemsCount}
Promedio diario: ${Math.round(stats.ordersCount/365)} órdenes

━━━━━━━━━━━━━━━━━━━

📅 *VENTAS POR MES*
${monthlyBreakdown.map(m => 
  `${m.month}: $${m.sales.toLocaleString('es-AR')} (${m.orders} orden${m.orders !== 1 ? 'es' : ''})`
).join('\n')}

━━━━━━━━━━━━━━━━━━━

🏆 *TOP 10 PRODUCTOS DEL AÑO*
${stats.topProducts.slice(0, 10).map((p, i) => 
  `${i + 1}. ${p.name}\n   📦 ${p.count} unidades\n   💰 $${p.total.toLocaleString('es-AR')}\n   📊 ${((p.total/stats.totalSales)*100).toFixed(1)}% del total`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━

💳 *MÉTODOS DE PAGO (AÑO)*
${stats.paymentMethods.map(m => 
  `${m.emoji} *${m.name}*\n   💰 $${m.amount.toLocaleString('es-AR')}\n   📊 ${m.percentage}% del total\n   🔢 ${m.count} transacciones`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━

👥 *BASE DE CLIENTES*
Total clientes: ${stats.uniqueCustomers}
Nuevos este año: ${stats.newCustomers}
Tasa de retención: ${stats.retentionRate}%

━━━━━━━━━━━━━━━━━━━

🎯 *MEJOR MES DEL AÑO*
${monthlyBreakdown[0]?.month || 'N/A'}: $${monthlyBreakdown[0]?.sales.toLocaleString('es-AR') || '0'}

━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleString('es-AR')}
  `.trim();
}

async function generateStatsReport() {
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', 'completed');

  const { data: courses } = await supabase
    .from('courses')
    .select('*');

  const { data: products } = await supabase
    .from('products')
    .select('*');

  const stats = calculateStats(orders || []);

  return `
📊 *ESTADÍSTICAS GENERALES*

━━━━━━━━━━━━━━━━━━━

💰 *VENTAS TOTALES*
Todo el tiempo: *$${stats.totalSales.toLocaleString('es-AR')} ARS*
Órdenes: ${stats.ordersCount}
Items vendidos: ${stats.itemsCount}

━━━━━━━━━━━━━━━━━━━

📚 *CATÁLOGO*
Cursos activos: ${courses?.length || 0}
Productos activos: ${products?.length || 0}

━━━━━━━━━━━━━━━━━━━

👥 *CLIENTES*
Total únicos: ${stats.uniqueCustomers}
Compra promedio: $${stats.avgTicket.toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

🏆 *TOP 5 BEST-SELLERS*
${stats.topProducts.slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.name} (${p.count}x)`
).join('\n')}

━━━━━━━━━━━━━━━━━━━

⏰ ${new Date().toLocaleString('es-AR')}
  `.trim();
}

function generateHelpMessage() {
  return `
🤖 *COMANDOS DISPONIBLES*

━━━━━━━━━━━━━━━━━━━

📊 *REPORTES DE VENTAS*

/dia - Reporte del día actual
/semana - Reporte de la semana
/mes - Reporte del mes
/año - Reporte del año completo
/stats - Estadísticas generales

━━━━━━━━━━━━━━━━━━━

💡 *TIPS*

• Los reportes se generan en tiempo real
• Incluyen gráficos y desglose detallado
• Formato profesional contable
• Todos los montos en ARS

━━━━━━━━━━━━━━━━━━━

❓ *AYUDA*
/help - Ver este mensaje

━━━━━━━━━━━━━━━━━━━

🔔 Recibirás notificaciones automáticas cuando haya nuevas ventas.

⏰ ${new Date().toLocaleString('es-AR')}
  `.trim();
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function calculateStats(orders) {
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const ordersCount = orders.length;
  const itemsCount = orders.reduce((sum, o) => 
    sum + (o.order_items?.length || 0), 0);
  const avgTicket = ordersCount > 0 ? totalSales / ordersCount : 0;

  // Top productos
  const productMap = new Map();
  orders.forEach(order => {
    order.order_items?.forEach(item => {
      const key = item.item_name;
      if (productMap.has(key)) {
        const existing = productMap.get(key);
        productMap.set(key, {
          name: key,
          count: existing.count + (item.quantity || 1),
          total: existing.total + (item.price * (item.quantity || 1))
        });
      } else {
        productMap.set(key, {
          name: key,
          count: item.quantity || 1,
          total: item.price * (item.quantity || 1)
        });
      }
    });
  });
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.total - a.total);

  // Métodos de pago
  const paymentMap = new Map();
  orders.forEach(order => {
    const method = order.payment_method || 'otro';
    if (paymentMap.has(method)) {
      const existing = paymentMap.get(method);
      paymentMap.set(method, {
        count: existing.count + 1,
        amount: existing.amount + order.total
      });
    } else {
      paymentMap.set(method, { count: 1, amount: order.total });
    }
  });

  const paymentMethods = Array.from(paymentMap.entries()).map(([name, data]) => ({
    name: name === 'mercadopago' ? 'MercadoPago' : name === 'paypal' ? 'PayPal' : 'Otro',
    emoji: name === 'mercadopago' ? '💳' : name === 'paypal' ? '🅿️' : '💰',
    count: data.count,
    amount: data.amount,
    percentage: Math.round((data.amount / totalSales) * 100)
  }));

  // Clientes
  const uniqueEmails = new Set(orders.map(o => o.user_email));
  const uniqueCustomers = uniqueEmails.size;

  return {
    totalSales,
    ordersCount,
    itemsCount,
    avgTicket,
    topProducts,
    paymentMethods,
    uniqueCustomers,
    newCustomers: uniqueCustomers, // TODO: calcular real
    returningCustomers: 0, // TODO: calcular real
    retentionRate: 0, // TODO: calcular real
    vsLastMonth: 0 // TODO: calcular real
  };
}

function getDailyBreakdown(orders) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dailyMap = new Map();

  orders.forEach(order => {
    const date = new Date(order.created_at);
    const dayName = days[date.getDay()];
    
    if (dailyMap.has(dayName)) {
      const existing = dailyMap.get(dayName);
      dailyMap.set(dayName, {
        sales: existing.sales + order.total,
        orders: existing.orders + 1
      });
    } else {
      dailyMap.set(dayName, { sales: order.total, orders: 1 });
    }
  });

  return days.map(day => ({
    day,
    sales: dailyMap.get(day)?.sales || 0,
    orders: dailyMap.get(day)?.orders || 0
  }));
}

function getMonthlyBreakdown(orders) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlyMap = new Map();

  orders.forEach(order => {
    const date = new Date(order.created_at);
    const monthName = months[date.getMonth()];
    
    if (monthlyMap.has(monthName)) {
      const existing = monthlyMap.get(monthName);
      monthlyMap.set(monthName, {
        sales: existing.sales + order.total,
        orders: existing.orders + 1
      });
    } else {
      monthlyMap.set(monthName, { sales: order.total, orders: 1 });
    }
  });

  return months
    .map(month => ({
      month,
      sales: monthlyMap.get(month)?.sales || 0,
      orders: monthlyMap.get(month)?.orders || 0
    }))
    .filter(m => m.sales > 0)
    .sort((a, b) => b.sales - a.sales);
}

function generateBarChart(data) {
  const maxSales = Math.max(...data.map(d => d.sales));
  const maxBars = 20;

  return data.map(d => {
    const bars = Math.round((d.sales / maxSales) * maxBars) || 1;
    const bar = '█'.repeat(bars);
    return `${d.day} ${bar} $${Math.round(d.sales/1000)}k`;
  }).join('\n');
}
