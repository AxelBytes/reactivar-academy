-- Script para implementar sistema de acceso directo a productos de systeme.io
-- SIN necesidad de tags ni workflows por cada curso

-- 1. Renombrar la columna systeme_tag_id a systeme_product_id (si existe)
ALTER TABLE courses 
RENAME COLUMN systeme_tag_id TO systeme_product_id;

-- Si la columna no existe, crearla:
-- ALTER TABLE courses 
-- ADD COLUMN IF NOT EXISTS systeme_product_id VARCHAR(50);

-- 2. Actualizar comentario
COMMENT ON COLUMN courses.systeme_product_id IS 'ID del producto/curso en systeme.io para dar acceso directo al comprar';

-- 3. Limpiar datos de ejemplo anterior (tags)
UPDATE courses 
SET systeme_product_id = NULL;

-- 4. Ver todos los cursos (necesitarás agregar los IDs de systeme.io manualmente)
SELECT 
  id,
  title,
  systeme_product_id,
  CASE 
    WHEN systeme_product_id IS NOT NULL THEN '✅ Configurado'
    ELSE '⚠️ Falta configurar - Agregar ID del producto de systeme.io'
  END as estado
FROM courses
ORDER BY created_at ASC;

-- =========================================
-- CÓMO OBTENER EL ID DEL PRODUCTO EN SYSTEME.IO:
-- =========================================
-- 1. Ve a systeme.io → Productos/Cursos
-- 2. Click en el curso que quieres
-- 3. Mira la URL del navegador:
--    Ejemplo: https://systeme.io/courses/12345/edit
--    El ID es: 12345
-- 4. Copia ese ID

-- =========================================
-- EJEMPLO: ACTUALIZAR UN CURSO CON SU ID DE SYSTEME.IO:
-- =========================================
-- Opción 1: Por nombre del curso
-- UPDATE courses 
-- SET systeme_product_id = '12345'
-- WHERE title ILIKE '%NEWCON REGLAS%';

-- Opción 2: Por ID del curso
-- UPDATE courses 
-- SET systeme_product_id = '12345'
-- WHERE id = 1;

-- Opción 3: Actualizar varios cursos a la vez
-- UPDATE courses 
-- SET systeme_product_id = CASE 
--   WHEN title ILIKE '%NEWCON REGLAS%' THEN '12345'
--   WHEN title ILIKE '%NEWCON ESTRATEGIAS%' THEN '67890'
--   WHEN title ILIKE '%NEWCON AVANZADO%' THEN '54321'
--   ELSE systeme_product_id
-- END;

-- =========================================
-- VERIFICAR CONFIGURACIÓN:
-- =========================================
SELECT 
  id,
  title,
  price,
  systeme_product_id,
  CASE 
    WHEN systeme_product_id IS NOT NULL THEN '✅ Listo para vender'
    ELSE '⚠️ Necesita ID de systeme.io'
  END as estado
FROM courses
ORDER BY title;
