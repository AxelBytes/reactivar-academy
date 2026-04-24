/**
 * API endpoint para subir imágenes a Supabase Storage
 * Usa SERVICE_ROLE_KEY para evitar problemas con RLS
 */

import { createClient } from '@supabase/supabase-js';

// Cliente con SERVICE_ROLE_KEY (tiene todos los permisos)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  // CORS
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

  try {
    const { file, fileName, folder = 'courses' } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'Faltan datos: file y fileName son requeridos' });
    }

    // Detectar si es PDF o imagen
    const isPdf = file.startsWith('data:application/pdf') || fileName.toLowerCase().endsWith('.pdf');
    const contentType = isPdf ? 'application/pdf' : 'image/jpeg';
    const base64Data = isPdf
      ? file.replace(/^data:application\/pdf;base64,/, '')
      : file.replace(/^data:image\/\w+;base64,/, '');

    console.log(`📤 Subiendo ${isPdf ? 'PDF' : 'imagen'} via API:`, `${folder}/${fileName}`);

    const buffer = Buffer.from(base64Data, 'base64');

    // Subir a Supabase Storage
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('course-images')
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: true,
      });

    if (error) {
      console.error('❌ Error subiendo:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`✅ ${isPdf ? 'PDF' : 'Imagen'} subido:`, data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('course-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('🌐 URL pública:', publicUrl);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: filePath,
    });

  } catch (error) {
    console.error('❌ Error en upload-image:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al subir imagen' 
    });
  }
}
