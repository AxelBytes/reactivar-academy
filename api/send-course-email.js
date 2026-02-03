// API endpoint para enviar emails cuando se compran cursos
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

  try {
    const { userEmail, userName, courses, paymentId, userDni, userProvincia, userLocalidad, userPais } = req.body;

    if (!userEmail || !courses || courses.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Aquí usaremos Brevo para enviar el email
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY no configurada');
      return res.status(500).json({ error: 'Servicio de email no configurado' });
    }

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

            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">📋 Datos del Cliente:</h3>
              ${userName ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Nombre:</strong> ${userName}</p>` : ''}
              ${userDni ? `<p style="margin: 5px 0; font-size: 14px;"><strong>DNI:</strong> ${userDni}</p>` : ''}
              ${userPais ? `<p style="margin: 5px 0; font-size: 14px;"><strong>País:</strong> ${userPais}</p>` : ''}
              ${userProvincia ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Provincia:</strong> ${userProvincia}</p>` : ''}
              ${userLocalidad ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Localidad:</strong> ${userLocalidad}</p>` : ''}
              ${paymentId ? `<p style="margin: 5px 0; font-size: 14px;"><strong>ID de Pago:</strong> ${paymentId}</p>` : ''}
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
          email: 'noreply@reactivaracademy.com' // Brevo te permite usar cualquier email hasta verificar dominio
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Brevo:', errorData);
      throw new Error(`Error al enviar email: ${response.status}`);
    }

    const data = await response.json();
    console.log('Email enviado exitosamente via Brevo:', data.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'Email enviado exitosamente via Brevo',
      emailId: data.messageId 
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ 
      error: 'Error al enviar el email',
      details: error.message 
    });
  }
}
