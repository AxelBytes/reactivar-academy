/**
 * Vercel Serverless Function
 * Otorga acceso a cursos en systeme.io cuando alguien compra
 */

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY;
  const SYSTEME_TAG_ID = process.env.SYSTEME_TAG_ID; // Tag que da acceso al curso

  if (!SYSTEME_API_KEY) {
    console.error('❌ SYSTEME_API_KEY no está configurada');
    return res.status(500).json({ 
      error: 'Configuración de systeme.io no encontrada' 
    });
  }

  try {
    const { email, firstName, lastName, courses } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    console.log('📧 Otorgando acceso en systeme.io:', {
      email,
      firstName,
      lastName,
      coursesCount: courses?.length || 0
    });

    // 1. CREAR O ACTUALIZAR CONTACTO EN SYSTEME.IO
    const contactResponse = await fetch('https://systeme.io/api/v2/contacts', {
      method: 'POST',
      headers: {
        'Authorization': SYSTEME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        firstName: firstName || '',
        lastName: lastName || '',
      }),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('❌ Error creando contacto en systeme.io:', errorText);
      
      // Si el contacto ya existe (409), no es un error crítico
      if (contactResponse.status === 409) {
        console.log('ℹ️ Contacto ya existe en systeme.io, continuando...');
      } else {
        throw new Error(`Error ${contactResponse.status}: ${errorText}`);
      }
    } else {
      const contactData = await contactResponse.json();
      console.log('✅ Contacto creado/actualizado en systeme.io:', contactData);
    }

    // 2. ASIGNAR TAG PARA DAR ACCESO AL CURSO (si está configurado)
    if (SYSTEME_TAG_ID) {
      console.log('🏷️ Asignando tag de acceso:', SYSTEME_TAG_ID);
      
      // Buscar el contacto para obtener su ID
      const searchResponse = await fetch(
        `https://systeme.io/api/v2/contacts?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': SYSTEME_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const contact = searchData.items?.[0];

        if (contact && contact.id) {
          // Asignar tag al contacto
          const tagResponse = await fetch(
            `https://systeme.io/api/v2/contacts/${contact.id}/tags/${SYSTEME_TAG_ID}`,
            {
              method: 'POST',
              headers: {
                'Authorization': SYSTEME_API_KEY,
                'Content-Type': 'application/json',
              },
            }
          );

          if (tagResponse.ok) {
            console.log('✅ Tag asignado correctamente');
          } else {
            const tagError = await tagResponse.text();
            console.error('⚠️ Error asignando tag:', tagError);
          }
        }
      }
    } else {
      console.log('ℹ️ SYSTEME_TAG_ID no configurado, saltando asignación de tag');
    }

    // 3. RESPONDER CON ÉXITO
    return res.status(200).json({
      success: true,
      message: 'Acceso otorgado en systeme.io',
      email: email,
    });

  } catch (error) {
    console.error('❌ Error en systeme-grant-access:', error);
    return res.status(500).json({
      error: 'Error otorgando acceso en systeme.io',
      details: error.message,
    });
  }
}
