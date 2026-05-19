// API endpoint para enviar emails cuando se compran cursos
import { checkRateLimit, getClientIp } from './_utils/rate-limiter.js';
import { isValidEmail, sanitizeString } from './_utils/validators.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // ⚡ RATE LIMITING - Máximo 5 emails por minuto por IP
  if (!checkRateLimit(req, res, 5, 60000)) {
    console.log(`🚫 Rate limit excedido para IP: ${getClientIp(req)}`);
    return;
  }

  try {
    const { userEmail, userName, courses, paymentId, userDni, userProvincia, userLocalidad, userPais } = req.body;

    console.log('📧 Intentando enviar email a:', userEmail);
    console.log('📚 Cursos:', courses?.length || 0);

    // ✅ VALIDACIÓN DE INPUTS
    if (!userEmail || !isValidEmail(userEmail)) {
      console.error('❌ Email inválido:', userEmail);
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!courses || courses.length === 0) {
      console.error('❌ Sin cursos');
      return res.status(400).json({ error: 'Sin cursos para enviar' });
    }

    // Sanitizar datos
    const sanitizedEmail = userEmail.toLowerCase().trim();
    const sanitizedName = userName ? sanitizeString(userName) : 'Cliente';

    // Usar Gmail + Nodemailer para enviar el email
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('❌ GMAIL_USER o GMAIL_APP_PASSWORD no configuradas');
      return res.status(500).json({ error: 'Servicio de email no configurado' });
    }

    console.log('✅ Credenciales de Gmail encontradas:', GMAIL_USER);

    // Construir el HTML del email
    const hasAccessLinks = courses.some(c => c.accessUrl);
    
    const coursesListHTML = courses.map(course => `
      <li style="margin-bottom: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
        <strong style="font-size: 16px;">${course.title}</strong><br>
        <span style="color: #666;">Instructor: ${course.instructor}</span>
        ${course.accessUrl ? `
          <br><br>
          <a href="${course.accessUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Acceder al Curso
          </a>
        ` : ''}
      </li>
    `).join('');

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Acceso a tus Capacitaciones - REACTIVAR ACADEMY</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎓 REACTIVAR ACADEMY</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">¡Hola ${userName || 'Estudiante'}! 👋</h2>
            
            <p style="font-size: 16px;">
              ¡Felicitaciones por tu compra! Ya tienes acceso completo a tus nuevas capacitaciones.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📚 Tus Capacitaciones:</h3>
              <ul style="list-style: none; padding: 0;">
                ${coursesListHTML}
              </ul>
            </div>

            <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0; font-size: 18px; margin-bottom: 15px;">👤 Datos del Cliente</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                ${userName ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555; width: 40%;">Nombre Completo:</td>
                  <td style="padding: 8px 0; color: #333;">${userName}</td>
                </tr>
                ` : ''}
                ${userEmail ? `
                <tr style="background: #f0f8ff;">
                  <td style="padding: 8px 10px; font-weight: 600; color: #555;">Email:</td>
                  <td style="padding: 8px 10px; color: #333;">${userEmail}</td>
                </tr>
                ` : ''}
                ${userDni ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">DNI / Documento:</td>
                  <td style="padding: 8px 0; color: #333;">${userDni}</td>
                </tr>
                ` : ''}
                ${userPais ? `
                <tr style="background: #f0f8ff;">
                  <td style="padding: 8px 10px; font-weight: 600; color: #555;">País:</td>
                  <td style="padding: 8px 10px; color: #333;">${userPais}</td>
                </tr>
                ` : ''}
                ${userProvincia ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">Provincia / Estado:</td>
                  <td style="padding: 8px 0; color: #333;">${userProvincia}</td>
                </tr>
                ` : ''}
                ${userLocalidad ? `
                <tr style="background: #f0f8ff;">
                  <td style="padding: 8px 10px; font-weight: 600; color: #555;">Localidad / Ciudad:</td>
                  <td style="padding: 8px 10px; color: #333;">${userLocalidad}</td>
                </tr>
                ` : ''}
                ${paymentId ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #555;">ID de Pago:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 12px;">${paymentId}</td>
                </tr>
                ` : ''}
                <tr style="background: #f0f8ff;">
                  <td style="padding: 8px 10px; font-weight: 600; color: #555;">Fecha de Compra:</td>
                  <td style="padding: 8px 10px; color: #333;">${new Date().toLocaleDateString('es-AR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
            </div>

            ${hasAccessLinks ? `
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">🚀 Accede a tus Cursos Ahora</h3>
              <p style="margin: 5px 0; color: #155724;">
                Usa los botones <strong>"Acceder al Curso"</strong> de arriba para ingresar directamente a tus capacitaciones.
              </p>
              <p style="margin: 5px 0; color: #155724; font-size: 14px;">
                Si tienes algún problema con el acceso, escríbenos a 
                <a href="mailto:Profedeeducacionfisica22@gmail.com" style="color: #667eea;">Profedeeducacionfisica22@gmail.com</a>
              </p>
            </div>
            ` : `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">📧 Próximos Pasos</h3>
              <p style="margin: 5px 0; color: #856404;">
                <strong>Para acceder a tus cursos, por favor envía un correo a:</strong>
              </p>
              <p style="margin: 10px 0;">
                <a href="mailto:Profedeeducacionfisica22@gmail.com" style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 16px;">
                  📩 Profedeeducacionfisica22@gmail.com
                </a>
              </p>
              <p style="margin: 5px 0; color: #856404; font-size: 14px;">
                Incluye este email de confirmación y te enviaremos los enlaces de acceso en menos de 24 horas.
              </p>
            </div>
            `}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <p style="text-align: center; color: #666; font-size: 14px;">
                ¿Tienes preguntas? Contáctanos en 
                <a href="mailto:soporte@reactivar.com" style="color: #667eea;">soporte@reactivar.com</a>
              </p>
              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} REACTIVAR ACADEMY - Todos los derechos reservados
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Adjuntar PDFs si hay productos digitales
    const pdfAttachments = [];
    const coursesWithPdf = courses.filter(c => c.pdfUrl);

    if (coursesWithPdf.length > 0) {
      console.log(`📎 Procesando ${coursesWithPdf.length} PDF(s) para adjuntar...`);
      
      for (const course of coursesWithPdf) {
        try {
          console.log(`📥 Descargando PDF desde: ${course.pdfUrl}`);
          
          // Descargar el PDF desde la URL
          const pdfResponse = await fetch(course.pdfUrl);
          
          if (!pdfResponse.ok) {
            console.error(`❌ Error descargando PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
            continue; // Saltar este PDF si falla la descarga
          }
          
          // Convertir a ArrayBuffer
          const pdfBuffer = await pdfResponse.arrayBuffer();
          
          // Convertir a Base64
          const base64Content = Buffer.from(pdfBuffer).toString('base64');
          
          // Generar nombre de archivo limpio
          const fileName = `${(course.title || course.name || 'material').replace(/[^a-zA-Z0-9\s-]/g, '_').replace(/\s+/g, '_')}.pdf`;
          
          pdfAttachments.push({
            content: base64Content,  // Base64 del PDF
            name: fileName
          });
          
          console.log(`✅ PDF convertido exitosamente: ${fileName} (${(pdfBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
          
        } catch (pdfError) {
          console.error(`❌ Error procesando PDF "${course.title}":`, pdfError.message);
          // Continuar con los demás PDFs aunque uno falle
        }
      }
      
      console.log(`📦 Total de PDFs adjuntos: ${pdfAttachments.length} de ${coursesWithPdf.length}`);
    }

    // Enviar email usando Gmail + Nodemailer
    console.log('🚀 Enviando email via Gmail (Nodemailer)...');

    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.replace(/\s/g, ''), // Eliminar espacios por si acaso
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión antes de enviar
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');

    // Preparar adjuntos para Nodemailer
    const attachments = pdfAttachments.map(pdf => ({
      filename: pdf.name,
      content: pdf.content,
      encoding: 'base64',
    }));

    const mailOptions = {
      from: `REACTIVAR ACADEMY <${GMAIL_USER}>`,
      to: userEmail,
      subject: '🎓 Acceso a tus Capacitaciones - REACTIVAR ACADEMY',
      html: emailHTML,
      ...(attachments.length > 0 && { attachments }),
    };

    console.log('📤 Enviando a:', userEmail);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email enviado exitosamente via Gmail:', info.messageId);
    console.log('📬 Destinatario:', userEmail);

    return res.status(200).json({ 
      success: true, 
      message: 'Email enviado exitosamente via Gmail',
      emailId: info.messageId,
      recipient: userEmail
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ 
      error: 'Error al enviar el email',
      details: error.message 
    });
  }
}
