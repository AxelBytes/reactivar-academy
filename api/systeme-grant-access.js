/**
 * Vercel Serverless Function
 * Otorga acceso DIRECTO a productos/cursos en systeme.io cuando alguien compra
 * 
 * SISTEMA SIMPLIFICADO SIN TAGS NI WORKFLOWS
 * - Crea el contacto en systeme.io
 * - Le da acceso directo a los productos comprados
 * - Escalable para múltiples cursos sin configuración adicional
 * 
 * SISTEMA CON REINTENTOS Y MANEJO ROBUSTO DE ERRORES
 */

// Función helper para hacer requests con reintentos
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries} para ${url}`);
      
      const response = await fetch(url, options);
      
      // Si es exitoso, devolver
      if (response.ok) {
        return response;
      }
      
      // Si es 409 (conflicto/ya existe), también es "exitoso"
      if (response.status === 409) {
        console.log('ℹ️ Recurso ya existe (409), continuando...');
        return response;
      }
      
      // Si es otro error, guardar y reintentar
      lastError = new Error(`HTTP ${response.status}: ${await response.text()}`);
      console.error(`❌ Intento ${attempt} falló:`, lastError.message);
      
      // Esperar antes de reintentar (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Intento ${attempt} falló con error:`, error.message);
      
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Falló después de todos los reintentos');
}

export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY;
  const SYSTEME_TAG_ID = process.env.SYSTEME_TAG_ID;
  const SYSTEME_TAG_NAME = process.env.SYSTEME_TAG_NAME; // Alternativa: usar nombre

  // Validación crítica de configuración
  if (!SYSTEME_API_KEY) {
    console.error('❌ CRÍTICO: SYSTEME_API_KEY no está configurada');
    console.error('📝 Agrega SYSTEME_API_KEY a las variables de entorno en Vercel');
    return res.status(500).json({ 
      error: 'Configuración de systeme.io no encontrada',
      critical: true,
      solution: 'Configura SYSTEME_API_KEY en Vercel Environment Variables'
    });
  }

  if (!SYSTEME_TAG_ID && !SYSTEME_TAG_NAME) {
    console.warn('⚠️ ADVERTENCIA: Ni SYSTEME_TAG_ID ni SYSTEME_TAG_NAME están configurados');
    console.warn('📝 El contacto se creará pero no se asignará el tag');
    console.warn('💡 Configura SYSTEME_TAG_NAME=curso-comprado en .env.local');
  } else if (SYSTEME_TAG_NAME) {
    console.log('✅ Usando TAG por NOMBRE:', SYSTEME_TAG_NAME);
  } else {
    console.log('✅ Usando TAG por ID:', SYSTEME_TAG_ID);
  }

  try {
    const { email, firstName, lastName, courses, courseProductIds } = req.body;

    // Validaciones exhaustivas
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('❌ Email inválido:', email);
      return res.status(400).json({ 
        error: 'Email inválido o no proporcionado',
        received: email 
      });
    }

    console.log('='.repeat(80));
    console.log('🚀 INICIANDO INTEGRACIÓN CON SYSTEME.IO - ACCESO DIRECTO A PRODUCTOS');
    console.log('='.repeat(80));
    console.log('📧 Email:', email);
    console.log('👤 Nombre:', firstName || '(no proporcionado)');
    console.log('👤 Apellido:', lastName || '(no proporcionado)');
    console.log('📚 Cursos a dar acceso:', courses?.length || 0);
    console.log('🎯 Product IDs:', courseProductIds || '(no proporcionados)');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('-'.repeat(80));

    // 1. CREAR O ACTUALIZAR CONTACTO EN SYSTEME.IO (CON REINTENTOS)
    console.log('📝 PASO 1: Creando/Actualizando contacto...');
    
    let contactCreated = false;
    try {
      const contactResponse = await fetchWithRetry(
        'https://systeme.io/api/v2/contacts',
        {
          method: 'POST',
          headers: {
            'Authorization': SYSTEME_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            firstName: firstName?.trim() || '',
            lastName: lastName?.trim() || '',
          }),
        },
        3 // 3 reintentos
      );

      if (contactResponse.ok || contactResponse.status === 409) {
        contactCreated = true;
        
        if (contactResponse.status === 409) {
          console.log('✅ Contacto ya existía en systeme.io');
        } else {
          const contactData = await contactResponse.json();
          console.log('✅ Contacto creado exitosamente:', {
            id: contactData.id,
            email: contactData.email
          });
        }
      }
    } catch (contactError) {
      console.error('❌ ERROR CRÍTICO creando contacto:', contactError.message);
      console.error('📊 Stack:', contactError.stack);
      
      // Intentar continuar con la asignación de tag de todas formas
      console.log('⚠️ Intentando continuar de todas formas...');
    }

    // 2. DAR ACCESO DIRECTO A PRODUCTOS/CURSOS (CON REINTENTOS)
    let productsGranted = 0;
    let totalProducts = 0;
    
    // Obtener los product IDs de los cursos comprados
    const productIds = [];
    
    if (courseProductIds && Array.isArray(courseProductIds) && courseProductIds.length > 0) {
      console.log('✅ Product IDs recibidos:', courseProductIds);
      productIds.push(...courseProductIds.filter(id => id)); // Filtrar nulls/undefined
    }
    
    totalProducts = productIds.length;
    
    if (productIds.length > 0) {
      console.log('📝 PASO 2: Dando acceso directo a productos...');
      console.log('🎯 Total de productos:', totalProducts);
      console.log('🎯 Product IDs:', productIds.join(', '));
      
      try {
        // Buscar el contacto para obtener su ID
        console.log('🔍 Buscando contacto por email...');
        const searchResponse = await fetchWithRetry(
          `https://systeme.io/api/v2/contacts?email=${encodeURIComponent(email.trim().toLowerCase())}`,
          {
            method: 'GET',
            headers: {
              'Authorization': SYSTEME_API_KEY,
              'Content-Type': 'application/json',
            },
          },
          3
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          const contact = searchData.items?.[0];

          if (contact && contact.id) {
            console.log('✅ Contacto encontrado, ID:', contact.id);
            
            // Dar acceso a cada producto
            for (const productId of productIds) {
              console.log(`🎯 Dando acceso al producto ${productId}...`);
              
              try {
                // Endpoint para dar acceso directo a un producto
                const productResponse = await fetchWithRetry(
                  `https://systeme.io/api/v2/contacts/${contact.id}/products/${productId}`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': SYSTEME_API_KEY,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      fullAccess: true // Dar acceso total al producto
                    })
                  },
                  3
                );

                if (productResponse.ok || productResponse.status === 409) {
                  productsGranted++;
                  console.log(`✅ Acceso al producto ${productId} otorgado exitosamente`);
                  
                  if (productResponse.status === 409) {
                    console.log(`ℹ️ El contacto ya tenía acceso al producto ${productId}`);
                  }
                } else {
                  const errorText = await productResponse.text();
                  console.error(`❌ Error dando acceso al producto ${productId}:`, productResponse.status, errorText);
                }
              } catch (productError) {
                console.error(`❌ Error dando acceso al producto ${productId}:`, productError.message);
                // Continuar con el siguiente producto
              }
            }
          } else {
            console.error('❌ No se encontró el contacto en la búsqueda');
            console.log('📊 Respuesta de búsqueda:', JSON.stringify(searchData, null, 2));
          }
        }
      } catch (accessError) {
        console.error('❌ ERROR en proceso de dar acceso a productos:', accessError.message);
        console.error('📊 Stack:', accessError.stack);
        
        // No lanzar error, solo registrar
        console.log('⚠️ Continuando a pesar del error...');
      }
    } else {
      console.log('⚠️ No hay productos para dar acceso');
      console.log('📝 El contacto se creará pero NO se dará acceso a productos');
      console.log('💡 Asegúrate de que los cursos tengan systeme_product_id configurado en Supabase');
    }

    // 3. RESULTADO FINAL
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('='.repeat(80));
    console.log('📊 RESULTADO FINAL:');
    console.log('-'.repeat(80));
    console.log('✅ Contacto creado/actualizado:', contactCreated ? 'SÍ' : 'NO');
    console.log('✅ Acceso a productos otorgado:', `${productsGranted}/${totalProducts}`);
    console.log('⏱️ Duración total:', duration + 'ms');
    console.log('='.repeat(80));

    // Si el contacto se creó, considerar éxito
    // (los productos son opcionales si no están configurados)
    if (contactCreated) {
      return res.status(200).json({
        success: true,
        message: 'Acceso otorgado en systeme.io',
        details: {
          email: email,
          contactCreated: contactCreated,
          productsGranted: productsGranted,
          totalProducts: totalProducts,
          productsConfigured: totalProducts > 0,
          duration: duration + 'ms'
        }
      });
    } else {
      // Si falló todo, devolver error pero con detalles
      throw new Error('No se pudo completar ninguna operación en systeme.io');
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('='.repeat(80));
    console.error('❌ ERROR CRÍTICO EN SYSTEME-GRANT-ACCESS');
    console.error('='.repeat(80));
    console.error('📧 Email afectado:', req.body?.email || 'desconocido');
    console.error('❌ Error:', error.message);
    console.error('📊 Stack completo:', error.stack);
    console.error('⏱️ Tiempo transcurrido:', duration + 'ms');
    console.error('🔧 Configuración:');
    console.error('   - SYSTEME_API_KEY:', SYSTEME_API_KEY ? '✅ Configurada' : '❌ NO configurada');
    console.error('   - SYSTEME_TAG_ID:', SYSTEME_TAG_ID ? '✅ Configurada (' + SYSTEME_TAG_ID + ')' : '❌ NO configurada');
    console.error('='.repeat(80));
    
    return res.status(500).json({
      success: false,
      error: 'Error otorgando acceso en systeme.io',
      details: error.message,
      email: req.body?.email,
      timestamp: new Date().toISOString(),
      duration: duration + 'ms',
      recommendation: 'Verifica los logs de Vercel y la configuración de las variables de entorno'
    });
  }
}
