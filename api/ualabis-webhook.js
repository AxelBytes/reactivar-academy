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

      // Enviar email al comprador
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
        );

        // Obtener datos del comprador guardados al crear la orden
        const { data: pendingOrder, error: fetchError } = await supabase
          .from('pending_orders')
          .select('*')
          .eq('uuid', uuid)
          .single();

        if (fetchError || !pendingOrder) {
          console.error('⚠️ No se encontraron datos del comprador para UUID:', uuid);
        } else {
          console.log('✅ Datos del comprador encontrados:', pendingOrder.user_email);

          const items = JSON.parse(pendingOrder.items || '[]');

          // Obtener pdf_url de cada producto desde Supabase
          const itemIds = items.map(i => i.id).filter(Boolean);
          let coursesWithPdf = items.map(i => ({
            id: i.id,
            title: i.name || i.title,
            instructor: 'Reactivar Academy',
            price: i.price || 0,
            type: i.type,
            pdfUrl: null,
            accessUrl: null,
          }));

          if (itemIds.length > 0) {
            const { data: productsData } = await supabase
              .from('products')
              .select('id, pdf_url, name')
              .in('id', itemIds);

            const { data: coursesData } = await supabase
              .from('courses')
              .select('id, access_url, title')
              .in('id', itemIds);

            coursesWithPdf = coursesWithPdf.map(item => {
              const product = productsData?.find(p => String(p.id) === String(item.id));
              const course = coursesData?.find(c => String(c.id) === String(item.id));
              return {
                ...item,
                pdfUrl: product?.pdf_url || null,
                accessUrl: course?.access_url || null,
              };
            });
          }

          // Llamar al endpoint de envío de email
          const baseUrl = process.env.VITE_FRONTEND_URL || 'https://reactivar-academy.vercel.app';
          const emailResponse = await fetch(`${baseUrl}/api/send-course-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: pendingOrder.user_email,
              userName: pendingOrder.user_name,
              courses: coursesWithPdf,
              paymentId: uuid,
            }),
          });

          if (emailResponse.ok) {
            console.log('✅ Email enviado exitosamente a:', pendingOrder.user_email);
            // Limpiar la orden pendiente
            await supabase.from('pending_orders').delete().eq('uuid', uuid);
          } else {
            const emailError = await emailResponse.text();
            console.error('❌ Error enviando email:', emailError);
          }
        }
      } catch (emailErr) {
        console.error('❌ Error en proceso de email:', emailErr.message);
      }

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
