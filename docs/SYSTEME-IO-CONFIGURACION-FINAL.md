# 🎯 Configuración Final de systeme.io - Multi-Curso

## ✅ ¿QUÉ YA ESTÁ LISTO?

1. ✅ **Tag creado** en systeme.io: `Compra-cursos` (ID: **1865534**)
2. ✅ **Workflow activado** en systeme.io: Inscribir en curso cuando se agrega el tag
3. ✅ **Variables de entorno** configuradas en `.env.local`
4. ✅ **Código actualizado** para soportar múltiples cursos con tags específicos

---

## 📋 PASOS FINALES (5 minutos)

### **Paso 1: Actualizar la Base de Datos** 🗄️

Necesitas ejecutar un script SQL en Supabase para agregar el campo `systeme_tag_id` a los cursos.

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **lhjzxwthuqpqsvqpvsxw**
3. Ve a **SQL Editor** (menú lateral izquierdo)
4. Click en **"New query"**
5. Copia y pega el contenido del archivo: `supabase-add-systeme-tag.sql`
6. Click en **"Run"** ▶️
7. ✅ Verás los cursos con el nuevo campo `systeme_tag_id`

---

### **Paso 2: Configurar el Tag en tu Primer Curso** 🏷️

Después de ejecutar el script SQL, el **primer curso** ya debería tener el tag ID **1865534** configurado.

**Para verificar:**

```sql
SELECT id, title, systeme_tag_id FROM courses ORDER BY created_at ASC;
```

Si necesitas actualizar manualmente:

```sql
UPDATE courses 
SET systeme_tag_id = '1865534'
WHERE id = (SELECT id FROM courses ORDER BY created_at ASC LIMIT 1);
```

O por nombre del curso:

```sql
UPDATE courses 
SET systeme_tag_id = '1865534'
WHERE title ILIKE '%nombre-del-curso%';
```

---

### **Paso 3: Configurar en Vercel (Producción)** ☁️

Si ya desplegaste en Vercel, agrega las variables de entorno:

1. Ve a [Vercel Dashboard](https://vercel.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega:
   - `SYSTEME_API_KEY` = `bn3r7ut2y7rytezrgdt2v050zwl4cjxqtnyzajh0n73ikwab092f7vfeehpqrvhy`
   - `SYSTEME_TAG_ID` = `1865534`
5. Click en **"Save"**
6. **Redeploy** el proyecto

---

## 🚀 CÓMO AGREGAR NUEVOS CURSOS

Cada vez que lances un curso nuevo, sigue estos pasos:

### **En systeme.io:** (2 minutos)

1. **Crear nuevo tag:**
   - Dashboard → Contactos → Tags
   - Click "Crear tag"
   - Nombre: `Compra-Curso-[NombreDelCurso]` (ejemplo: `Compra-Curso-Avanzado`)
   - Guardar y copiar el **ID** desde la URL

2. **Crear workflow:**
   - Automatizaciones → Flujo de trabajo
   - Crear nuevo workflow
   - **Trigger:** "Tag is added" → Selecciona el nuevo tag
   - **Acción:** "Inscribir en un curso" → Selecciona el nuevo curso
   - **Acceso:** Total
   - **Activar** el workflow ✅

### **En Supabase:** (1 minuto)

Ejecuta este SQL para asignar el tag al curso:

```sql
UPDATE courses 
SET systeme_tag_id = 'TU_NUEVO_TAG_ID'
WHERE title = 'Nombre del Nuevo Curso';
```

O si prefieres usar el ID del curso:

```sql
UPDATE courses 
SET systeme_tag_id = 'TU_NUEVO_TAG_ID'
WHERE id = 123;  -- Reemplaza con el ID real del curso
```

**¡Y LISTO!** ✅ El sistema automáticamente usará el tag específico cuando alguien compre ese curso.

---

## 🧪 PROBAR QUE FUNCIONA

### **Opción 1: Test Local (Recomendado)**

1. **Inicia el servidor local:**
   ```bash
   npm run dev
   ```

2. **Abre el archivo de prueba en tu navegador:**
   ```
   http://localhost:8080/test-systeme-integration.html
   ```

3. **Completa el formulario:**
   - Email: `test@ejemplo.com` (o tu email real)
   - Nombre: Test
   - Apellido: Usuario

4. **Click en "Probar Integración"**

5. **Verifica en systeme.io:**
   - Dashboard → Contactos
   - Busca el email de prueba
   - Verifica que tenga el tag "Compra-cursos"
   - Ve a Automatizaciones → Actividad
   - Verifica que se ejecutó el workflow

### **Opción 2: Compra de Prueba Real**

1. Agrega el curso al carrito
2. Ve al checkout
3. Completa el formulario
4. Usa una tarjeta de prueba de MercadoPago
5. Completa el pago
6. Verifica en systeme.io que se creó el contacto y se asignó el tag

---

## 🔧 TROUBLESHOOTING

### ❌ **"No se asignó el tag"**

**Solución:**
1. Verifica que el workflow esté **ACTIVADO** ✅
2. Verifica que el tag ID sea correcto en Supabase
3. Ve a systeme.io → Automatizaciones → Actividad para ver logs

### ❌ **"Error: SYSTEME_API_KEY no está configurada"**

**Solución:**
1. Verifica que `.env.local` tenga `SYSTEME_API_KEY`
2. Reinicia el servidor: `Ctrl+C` y `npm run dev`
3. En producción, verifica variables en Vercel

### ❌ **"El contacto se crea pero no se asigna el tag"**

**Solución:**
1. Verifica que el curso tenga `systeme_tag_id` en Supabase:
   ```sql
   SELECT id, title, systeme_tag_id FROM courses;
   ```
2. Si está NULL, actualízalo manualmente con el SQL del Paso 2

---

## 📊 VERIFICAR CONFIGURACIÓN ACTUAL

Ejecuta este SQL en Supabase para ver todos tus cursos y sus tags:

```sql
SELECT 
  id,
  title,
  systeme_tag_id,
  CASE 
    WHEN systeme_tag_id IS NOT NULL THEN '✅ Configurado'
    ELSE '⚠️ Falta configurar'
  END as estado
FROM courses
ORDER BY created_at ASC;
```

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Una vez que hayas:
- ✅ Ejecutado el script SQL
- ✅ Verificado que el curso tiene el tag ID
- ✅ Probado localmente
- ✅ Configurado las variables en Vercel

**¡Tu sistema está 100% funcional!** 🚀

Cada vez que alguien compre un curso, automáticamente:
1. Se creará el contacto en systeme.io
2. Se le asignará el tag del curso específico
3. El workflow de systeme.io le dará acceso al curso
4. Recibirá un email de confirmación

---

## 📞 SOPORTE

Si algo no funciona:
1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs del servidor (`npm run dev`)
3. Revisa la actividad de workflows en systeme.io
4. Ejecuta el test de integración para diagnosticar

¡Todo debería funcionar perfectamente! 💪
