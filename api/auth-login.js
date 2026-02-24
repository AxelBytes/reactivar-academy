import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verificar si es admin (credenciales en variables de entorno)
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (normalizedEmail === adminEmail && password === adminPassword) {
      return res.status(200).json({
        success: true,
        user: {
          id: 'admin',
          email: adminEmail,
          name: process.env.ADMIN_NAME || 'Administrador',
          role: 'admin',
        }
      });
    }

    // Si no es admin, buscar en la tabla users de Supabase
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !dbUser) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }

    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || 'Usuario',
        dni: dbUser.dni || null,
        provincia: dbUser.provincia || null,
        localidad: dbUser.localidad || null,
        pais: dbUser.pais || null,
        role: dbUser.role || 'user',
      }
    });

  } catch (error) {
    console.error('Error en auth-login:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}
