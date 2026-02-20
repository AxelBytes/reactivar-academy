// API endpoint para enviar emails cuando se compran cursos
import { checkRateLimit, getClientIp } from './rate-limiter.js';
import { isValidEmail, sanitizeString } from './validators.js';

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

    // Aquí usaremos Brevo para enviar el email
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY no configurada en variables de entorno');
      return res.status(500).json({ error: 'Servicio de email no configurado' });
    }

    console.log('✅ BREVO_API_KEY encontrada');

    // Construir el HTML del email
    const coursesListHTML = courses.map(course => `
      <li style="margin-bottom: 10px;">
        <strong>${course.title}</strong><br>
        <span style="color: #666;">Instructor: ${course.instructor}</span>
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

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">📧 Próximos Pasos</h3>
              <p style="margin: 5px 0; color: #856404;">
                <strong>Para acceder a tus cursos, por favor envía un correo a:</strong>
              </p>
              <p style="margin: 10px 0;">
                <a href="mailto:soporte@reactivar.com" style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 16px;">
                  📩 soporte@reactivar.com
                </a>
              </p>
              <p style="margin: 5px 0; color: #856404; font-size: 14px;">
                Incluye este email de confirmación y te enviaremos los enlaces de acceso en menos de 24 horas.
              </p>
            </div>

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

    // Enviar email usando Brevo (antes Sendinblue)
    console.log('🚀 Enviando email a Brevo API...');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'REACTIVAR ACADEMY',
          email: 'newcomreactivar22@gmail.com' // Email verificado en Brevo
        },
        to: [
          {
            email: userEmail,
            name: userName || 'Estudiante'
          }
        ],
        subject: '🎓 Acceso a tus Capacitaciones - REACTIVAR ACADEMY',
        htmlContent: emailHTML
      }),
    });

    console.log('📡 Respuesta de Brevo - Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Brevo:', JSON.stringify(errorData, null, 2));
      throw new Error(`Error al enviar email: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ Email enviado exitosamente via Brevo:', data.messageId);
    console.log('📬 Destinatario:', userEmail);

    return res.status(200).json({ 
      success: true, 
      message: 'Email enviado exitosamente via Brevo',
      emailId: data.messageId,
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
