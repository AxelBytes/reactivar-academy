-- ============================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- Para imágenes de cursos y productos
-- ============================================

-- 1. CREAR BUCKET PARA IMÁGENES (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true,  -- Público para que las imágenes sean accesibles
  10485760,  -- 10MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE ACCESO PARA COURSE-IMAGES

-- Permitir a todos ver las imágenes (lectura pública)
CREATE POLICY IF NOT EXISTS "Imágenes públicas visibles para todos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

-- Permitir a usuarios autenticados subir imágenes
CREATE POLICY IF NOT EXISTS "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');

-- Permitir a usuarios autenticados actualizar sus imágenes
CREATE POLICY IF NOT EXISTS "Usuarios autenticados pueden actualizar imágenes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-images')
WITH CHECK (bucket_id = 'course-images');

-- Permitir a usuarios autenticados eliminar imágenes
CREATE POLICY IF NOT EXISTS "Usuarios autenticados pueden eliminar imágenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images');

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver buckets creados
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'course-images';

-- Ver políticas creadas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' 
AND schemaname = 'storage';
