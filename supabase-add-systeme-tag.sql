-- Script para agregar soporte de múltiples tags de systeme.io
-- Cada curso tendrá su propio tag ID para dar acceso específico

-- 1. Agregar columna systeme_tag_id a la tabla courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS systeme_tag_id VARCHAR(50);

-- 2. Agregar comentario para documentar
COMMENT ON COLUMN courses.systeme_tag_id IS 'ID del tag en systeme.io que se asigna cuando alguien compra este curso';

-- 3. Actualizar el primer curso con el tag que ya creamos (ID: 1865534)
-- IMPORTANTE: Ajusta el WHERE según el curso que corresponda al tag "Compra-cursos"
-- Puedes ver tus cursos ejecutando: SELECT id, title FROM courses;

-- Ejemplo: Si tu primer curso se llama "Curso Básico" o similar:
UPDATE courses 
SET systeme_tag_id = '1865534'
WHERE id = (SELECT id FROM courses ORDER BY created_at ASC LIMIT 1);

-- O si prefieres actualizar por nombre:
-- UPDATE courses 
-- SET systeme_tag_id = '1865534'
-- WHERE title ILIKE '%básico%' OR title ILIKE '%fundamentos%';

-- 4. Ver los cursos actualizados
SELECT 
  id,
  title,
  systeme_tag_id,
  CASE 
    WHEN systeme_tag_id IS NOT NULL THEN '✅ Configurado'
    ELSE '⚠️ Falta configurar tag'
  END as estado
FROM courses
ORDER BY created_at ASC;
