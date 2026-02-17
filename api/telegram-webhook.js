/**
 * Webhook de Telegram - Maneja comandos del bot
 * Sistema de reportes financieros profesional
 * 
 * COMANDOS BÁSICOS:
 * /dia - Resumen de ventas del día
 * /semana - Resumen de la semana
 * /mes - Resumen del mes
 * /año - Resumen del año
 * /stats - Estadísticas generales
 * 
 * COMANDOS AVANZADOS:
 * /comparar - Comparaciones entre períodos
 * /objetivos - Progreso de metas configurables
 * /producto [NOMBRE] - Estadísticas de curso específico
 * /exportar [periodo] - Exportar datos a CSV
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
    const commandParts = text.split(' ');
    const command = commandParts[0];
    const args = commandParts.slice(1);

    console.log(`📱 Comando recibido: ${command}`, args.length > 0 ? `con args: ${args.join(' ')}` : '');

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

      case '/comparar':
        responseText = await generateComparisonReport();
        break;

      case '/objetivos':
        responseText = await generateGoalsReport();
        break;

      case '/producto':
        const productName = args.join(' ');
        if (!productName) {
          responseText = '❌ Por favor especifica el nombre del producto.\n\nEjemplo: `/producto NEWCON REGLAS`';
        } else {
          responseText = await generateProductReport(productName);
        }
        break;

      case '/exportar':
        const period = args[0] || 'mes';
        responseText = await generateCSVExport(period, chatId);
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

📊 *REPORTES BÁSICOS*

/dia - Resumen del día actual
/semana - Resumen de la semana
/mes - Resumen del mes
/año - Resumen del año completo
/stats - Estadísticas generales

━━━━━━━━━━━━━━━━━━━

⭐ *COMANDOS AVANZADOS*

/comparar - Comparar períodos
  📈 Hoy vs ayer, mes vs mes anterior, etc.

/objetivos - Ver progreso de metas
  🎯 Diarias, semanales, mensuales, anuales

/producto [NOMBRE] - Stats de un curso
  📦 Ejemplo: \`/producto NEWCON REGLAS\`

/exportar [periodo] - Exportar a CSV
  📄 Períodos: dia, semana, mes, año
  💼 Perfecto para contabilidad e impuestos

━━━━━━━━━━━━━━━━━━━

💡 *TIPS*

• Los reportes se generan en tiempo real
• Incluyen gráficos y análisis detallados
• Formato profesional contable
• Todos los montos en ARS
• Edita tus metas en el código

━━━━━━━━━━━━━━━━━━━

❓ *AYUDA*
/help - Ver este mensaje

━━━━━━━━━━━━━━━━━━━

🔔 También recibirás alertas automáticas:
• 📊 Nueva venta registrada
• 🎯 Meta diaria alcanzada
• 🏆 Record de ventas batido
• 👑 Cliente VIP detectado
• 🔥 Horario pico de ventas
• 🚀 Producto viral del día
• ☕ Primera venta del día

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

// ============================================
// NUEVOS COMANDOS AVANZADOS
// ============================================

/**
 * /comparar - Comparaciones entre períodos
 */
async function generateComparisonReport() {
  try {
    const now = new Date();
    
    // HOY vs AYER
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
    
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)
      .eq('status', 'completed');
    
    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', yesterdayStart)
      .lte('created_at', yesterdayEnd)
      .eq('status', 'completed');
    
    const todayTotal = todayOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const yesterdayTotal = yesterdayOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const dayDiff = todayTotal - yesterdayTotal;
    const dayPercent = yesterdayTotal > 0 ? ((dayDiff / yesterdayTotal) * 100).toFixed(1) : 0;
    const dayTrend = dayDiff > 0 ? '📈' : dayDiff < 0 ? '📉' : '➡️';
    
    // MES ACTUAL vs MES ANTERIOR
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    
    const { data: thisMonthOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', thisMonthStart)
      .lte('created_at', thisMonthEnd)
      .eq('status', 'completed');
    
    const { data: lastMonthOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', lastMonthStart)
      .lte('created_at', lastMonthEnd)
      .eq('status', 'completed');
    
    const thisMonthTotal = thisMonthOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const lastMonthTotal = lastMonthOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const monthDiff = thisMonthTotal - lastMonthTotal;
    const monthPercent = lastMonthTotal > 0 ? ((monthDiff / lastMonthTotal) * 100).toFixed(1) : 0;
    const monthTrend = monthDiff > 0 ? '📈' : monthDiff < 0 ? '📉' : '➡️';
    
    // SEMANA ACTUAL vs SEMANA ANTERIOR
    const getWeekStart = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };
    
    const thisWeekStart = getWeekStart(now);
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    const { data: thisWeekOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', thisWeekStart.toISOString())
      .eq('status', 'completed');
    
    const { data: lastWeekOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString())
      .eq('status', 'completed');
    
    const thisWeekTotal = thisWeekOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const lastWeekTotal = lastWeekOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const weekDiff = thisWeekTotal - lastWeekTotal;
    const weekPercent = lastWeekTotal > 0 ? ((weekDiff / lastWeekTotal) * 100).toFixed(1) : 0;
    const weekTrend = weekDiff > 0 ? '📈' : weekDiff < 0 ? '📉' : '➡️';

    return `
📊 *COMPARACIONES DE PERÍODOS*

━━━━━━━━━━━━━━━━━━━

📅 *HOY vs AYER*

Hoy: $${todayTotal.toLocaleString('es-AR')}
Ayer: $${yesterdayTotal.toLocaleString('es-AR')}
Diferencia: ${dayDiff >= 0 ? '+' : ''}$${Math.abs(dayDiff).toLocaleString('es-AR')}
Variación: ${dayPercent >= 0 ? '+' : ''}${dayPercent}% ${dayTrend}

━━━━━━━━━━━━━━━━━━━

📆 *ESTA SEMANA vs SEMANA PASADA*

Esta semana: $${thisWeekTotal.toLocaleString('es-AR')}
Semana pasada: $${lastWeekTotal.toLocaleString('es-AR')}
Diferencia: ${weekDiff >= 0 ? '+' : ''}$${Math.abs(weekDiff).toLocaleString('es-AR')}
Variación: ${weekPercent >= 0 ? '+' : ''}${weekPercent}% ${weekTrend}

━━━━━━━━━━━━━━━━━━━

📊 *ESTE MES vs MES ANTERIOR*

Este mes: $${thisMonthTotal.toLocaleString('es-AR')}
Mes anterior: $${lastMonthTotal.toLocaleString('es-AR')}
Diferencia: ${monthDiff >= 0 ? '+' : ''}$${Math.abs(monthDiff).toLocaleString('es-AR')}
Variación: ${monthPercent >= 0 ? '+' : ''}${monthPercent}% ${monthTrend}

━━━━━━━━━━━━━━━━━━━

${monthDiff > 0 ? '🚀 ¡Vas creciendo! Sigue así' : monthDiff < 0 ? '💪 Hay que ajustar estrategia' : '➡️ Manteniendo el ritmo'}
    `.trim();

  } catch (error) {
    console.error('Error en generateComparisonReport:', error);
    return '❌ Error generando comparación';
  }
}

/**
 * /objetivos - Sistema de metas configurables
 */
async function generateGoalsReport() {
  try {
    // METAS CONFIGURABLES (puedes editarlas aquí)
    const GOALS = {
      daily: 10000,      // Meta diaria en ARS
      weekly: 70000,     // Meta semanal en ARS
      monthly: 300000,   // Meta mensual en ARS
      yearly: 3600000,   // Meta anual en ARS
    };

    const now = new Date();
    
    // VENTAS DEL DÍA
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', todayStart)
      .eq('status', 'completed');
    
    const todayTotal = todayOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const dailyPercent = (todayTotal / GOALS.daily * 100).toFixed(1);
    const dailyRemaining = GOALS.daily - todayTotal;
    const dailyBar = generateProgressBar(todayTotal, GOALS.daily);
    
    // VENTAS DE LA SEMANA
    const weekStart = getWeekStart(now);
    weekStart.setHours(0, 0, 0, 0);
    const { data: weekOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', weekStart.toISOString())
      .eq('status', 'completed');
    
    const weekTotal = weekOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const weeklyPercent = (weekTotal / GOALS.weekly * 100).toFixed(1);
    const weeklyRemaining = GOALS.weekly - weekTotal;
    const weeklyBar = generateProgressBar(weekTotal, GOALS.weekly);
    
    // VENTAS DEL MES
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: monthOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', monthStart)
      .eq('status', 'completed');
    
    const monthTotal = monthOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const monthlyPercent = (monthTotal / GOALS.monthly * 100).toFixed(1);
    const monthlyRemaining = GOALS.monthly - monthTotal;
    const monthlyBar = generateProgressBar(monthTotal, GOALS.monthly);
    
    // VENTAS DEL AÑO
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const { data: yearOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', yearStart)
      .eq('status', 'completed');
    
    const yearTotal = yearOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
    const yearlyPercent = (yearTotal / GOALS.yearly * 100).toFixed(1);
    const yearlyRemaining = GOALS.yearly - yearTotal;
    const yearlyBar = generateProgressBar(yearTotal, GOALS.yearly);

    return `
🎯 *PROGRESO DE OBJETIVOS*

━━━━━━━━━━━━━━━━━━━

📅 *META DIARIA*
Objetivo: $${GOALS.daily.toLocaleString('es-AR')}
Actual: $${todayTotal.toLocaleString('es-AR')}
${dailyBar} ${dailyPercent}%
${dailyRemaining > 0 ? `Faltan: $${dailyRemaining.toLocaleString('es-AR')}` : `✅ ¡META ALCANZADA! +$${Math.abs(dailyRemaining).toLocaleString('es-AR')}`}

━━━━━━━━━━━━━━━━━━━

📆 *META SEMANAL*
Objetivo: $${GOALS.weekly.toLocaleString('es-AR')}
Actual: $${weekTotal.toLocaleString('es-AR')}
${weeklyBar} ${weeklyPercent}%
${weeklyRemaining > 0 ? `Faltan: $${weeklyRemaining.toLocaleString('es-AR')}` : `✅ ¡META ALCANZADA! +$${Math.abs(weeklyRemaining).toLocaleString('es-AR')}`}

━━━━━━━━━━━━━━━━━━━

📊 *META MENSUAL*
Objetivo: $${GOALS.monthly.toLocaleString('es-AR')}
Actual: $${monthTotal.toLocaleString('es-AR')}
${monthlyBar} ${monthlyPercent}%
${monthlyRemaining > 0 ? `Faltan: $${monthlyRemaining.toLocaleString('es-AR')}` : `✅ ¡META ALCANZADA! +$${Math.abs(monthlyRemaining).toLocaleString('es-AR')}`}

━━━━━━━━━━━━━━━━━━━

📈 *META ANUAL*
Objetivo: $${GOALS.yearly.toLocaleString('es-AR')}
Actual: $${yearTotal.toLocaleString('es-AR')}
${yearlyBar} ${yearlyPercent}%
${yearlyRemaining > 0 ? `Faltan: $${yearlyRemaining.toLocaleString('es-AR')}` : `✅ ¡META ALCANZADA! +$${Math.abs(yearlyRemaining).toLocaleString('es-AR')}`}

━━━━━━━━━━━━━━━━━━━

💡 *Tip:* Edita tus metas en \`api/telegram-webhook.js\` línea 726
    `.trim();

  } catch (error) {
    console.error('Error en generateGoalsReport:', error);
    return '❌ Error generando reporte de objetivos';
  }
}

/**
 * /producto [NOMBRE] - Estadísticas de curso específico
 */
async function generateProductReport(productName) {
  try {
    // Buscar en order_items (contiene item_name)
    const { data: items, error } = await supabase
      .from('order_items')
      .select('*, orders!inner(*)')
      .ilike('item_name', `%${productName}%`)
      .eq('orders.status', 'completed');

    if (error) {
      console.error('Error obteniendo items:', error);
      return '❌ Error obteniendo datos del producto';
    }

    if (!items || items.length === 0) {
      return `❌ No se encontraron ventas para: *${productName}*\n\n💡 Verifica el nombre del curso.`;
    }

    // Estadísticas del producto
    const totalSales = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalRevenue = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const avgPrice = totalRevenue / totalSales;
    
    // Agrupar por día
    const salesByDay = new Map();
    items.forEach(item => {
      const date = new Date(item.orders.created_at);
      const dayKey = date.toLocaleDateString('es-AR');
      salesByDay.set(dayKey, (salesByDay.get(dayKey) || 0) + (item.quantity || 1));
    });
    
    // Último 7 días
    const last7Days = Array.from(salesByDay.entries())
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, 7);
    
    // Ventas este mes
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthItems = items.filter(item => 
      new Date(item.orders.created_at) >= monthStart
    );
    const thisMonthSales = thisMonthItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const thisMonthRevenue = thisMonthItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Primer y última venta
    const sortedByDate = [...items].sort((a, b) => 
      new Date(a.orders.created_at) - new Date(b.orders.created_at)
    );
    const firstSale = sortedByDate[0];
    const lastSale = sortedByDate[sortedByDate.length - 1];

    return `
📦 *REPORTE DE PRODUCTO*

*${items[0].item_name}*

━━━━━━━━━━━━━━━━━━━

📊 *ESTADÍSTICAS GENERALES*

Total vendido: ${totalSales} unidades
Ingresos totales: $${totalRevenue.toLocaleString('es-AR')}
Precio promedio: $${avgPrice.toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

📅 *ESTE MES*

Ventas: ${thisMonthSales} unidades
Ingresos: $${thisMonthRevenue.toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

📈 *ÚLTIMOS 7 DÍAS*

${last7Days.length > 0 
  ? last7Days.map(([date, count]) => `${date}: ${count} ventas`).join('\n')
  : 'Sin ventas recientes'}

━━━━━━━━━━━━━━━━━━━

🕐 *HISTORIAL*

Primera venta: ${new Date(firstSale.orders.created_at).toLocaleDateString('es-AR')}
Última venta: ${new Date(lastSale.orders.created_at).toLocaleDateString('es-AR')}

━━━━━━━━━━━━━━━━━━━

${totalSales >= 10 ? '🚀 ¡Producto exitoso!' : totalSales >= 5 ? '📈 Buenas ventas' : '💡 Potencial de crecimiento'}
    `.trim();

  } catch (error) {
    console.error('Error en generateProductReport:', error);
    return '❌ Error generando reporte del producto';
  }
}

/**
 * /exportar [periodo] - Exportar a CSV
 */
async function generateCSVExport(period, chatId) {
  try {
    let startDate;
    const now = new Date();
    
    switch (period.toLowerCase()) {
      case 'dia':
      case 'día':
      case 'hoy':
        startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'semana':
        startDate = getWeekStart(now).toISOString();
        break;
      case 'año':
      case 'ano':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
        break;
      case 'mes':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        break;
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('created_at', startDate)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo órdenes:', error);
      return '❌ Error generando CSV';
    }

    if (!orders || orders.length === 0) {
      return `❌ No hay datos para exportar del período: *${period}*`;
    }

    // Generar CSV
    let csv = 'Fecha,Hora,Cliente,Email,Total,Metodo Pago,Productos,Cantidad,ID Orden\n';
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const dateStr = date.toLocaleDateString('es-AR');
      const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      
      const items = order.order_items || [];
      const itemNames = items.map(i => i.item_name).join(' + ');
      const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      
      // Escapar comas en strings
      const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      
      csv += `${dateStr},${timeStr},${escape(order.customer_name)},${escape(order.customer_email)},${order.total},${order.payment_method},${escape(itemNames)},${itemCount},${order.id}\n`;
    });

    // Calcular totales
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgTicket = totalSales / totalOrders;

    return `
📊 *EXPORTACIÓN A CSV*

━━━━━━━━━━━━━━━━━━━

📅 Período: *${period}*
📦 Órdenes: ${totalOrders}
💰 Total: $${totalSales.toLocaleString('es-AR')}
📈 Ticket promedio: $${avgTicket.toLocaleString('es-AR')}

━━━━━━━━━━━━━━━━━━━

📄 *DATOS CSV:*

\`\`\`
${csv}
\`\`\`

━━━━━━━━━━━━━━━━━━━

💡 *Cómo usar:*
1. Copia el texto entre \`\`\`
2. Pégalo en un archivo .txt
3. Cambia extensión a .csv
4. Abre con Excel/Google Sheets

🎯 Perfecto para contabilidad e impuestos
    `.trim();

  } catch (error) {
    console.error('Error en generateCSVExport:', error);
    return '❌ Error generando CSV';
  }
}

// ============================================
// HELPERS
// ============================================

function generateProgressBar(current, goal) {
  const percent = Math.min(current / goal, 1);
  const filled = Math.round(percent * 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
