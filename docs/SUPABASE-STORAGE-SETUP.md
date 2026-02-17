# 📸 CONFIGURACIÓN DE SUPABASE STORAGE PARA IMÁGENES

## 🎯 OBJETIVO

Permitir subir imágenes de portada para cursos y productos desde el panel admin.

---

## 📋 PASOS DE CONFIGURACIÓN

### **PASO 1: Crear el Bucket en Supabase**

1. **Abre tu proyecto en Supabase:**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ve a Storage:**
   - En el menú lateral, click en **Storage**

3. **Crear nuevo bucket:**
   - Click en **"New bucket"**
   - Nombre: `course-images`
   - **IMPORTANTE:** Marca como **Public** (para que las imágenes sean visibles)
   - Click en **"Create bucket"**

---

### **PASO 2: Configurar Políticas de Seguridad (RLS)**

Las políticas controlan quién puede subir/ver/eliminar imágenes.

#### **2.1 Permitir que TODOS vean las imágenes (lectura pública):**

1. En la página de Storage, selecciona el bucket `course-images`
2. Ve a la pestaña **"Policies"**
3. Click en **"New policy"**
4. Selecciona **"For full customization"**
5. Configura:
   - **Policy name:** `Public Access`
   - **Allowed operation:** `SELECT`
   - **Policy definition:**
     ```sql
     true
     ```
6. Click **"Review"** y luego **"Save policy"**

#### **2.2 Permitir que usuarios autenticados suban imágenes:**

1. Click en **"New policy"** nuevamente
2. Configura:
   - **Policy name:** `Authenticated users can upload`
   - **Allowed operation:** `INSERT`
   - **Policy definition:**
     ```sql
     (auth.role() = 'authenticated')
     ```
3. Click **"Review"** y luego **"Save policy"**

#### **2.3 Permitir que usuarios autenticados actualicen imágenes:**

1. Click en **"New policy"** nuevamente
2. Configura:
   - **Policy name:** `Authenticated users can update`
   - **Allowed operation:** `UPDATE`
   - **Policy definition:**
     ```sql
     (auth.role() = 'authenticated')
     ```
3. Click **"Review"** y luego **"Save policy"**

#### **2.4 Permitir que usuarios autenticados eliminen imágenes:**

1. Click en **"New policy"** nuevamente
2. Configura:
   - **Policy name:** `Authenticated users can delete`
   - **Allowed operation:** `DELETE`
   - **Policy definition:**
     ```sql
     (auth.role() = 'authenticated')
     ```
3. Click **"Review"** y luego **"Save policy"**

---

### **PASO 3: Verificar Configuración**

Deberías tener 4 políticas activas en el bucket `course-images`:

| Policy Name | Operation | Target Roles |
|-------------|-----------|--------------|
| Public Access | SELECT | public |
| Authenticated users can upload | INSERT | authenticated |
| Authenticated users can update | UPDATE | authenticated |
| Authenticated users can delete | DELETE | authenticated |

---

## 🔧 CONFIGURACIÓN ALTERNATIVA (Usando SQL)

Si prefieres hacerlo más rápido, puedes ejecutar este SQL en Supabase:

### **Ve a SQL Editor:**
1. En Supabase, click en **SQL Editor**
2. Click en **"New query"**
3. Pega este código:

```sql
-- Crear bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Todos pueden VER las imágenes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'course-images' );

-- Política: Usuarios autenticados pueden SUBIR imágenes
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'course-images' );

-- Política: Usuarios autenticados pueden ACTUALIZAR imágenes
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'course-images' );

-- Política: Usuarios autenticados pueden ELIMINAR imágenes
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'course-images' );
```

4. Click en **"Run"**
5. Deberías ver: `Success. No rows returned`

---

## 📊 ESTRUCTURA DE CARPETAS RECOMENDADA

Dentro del bucket `course-images`, organizaremos así:

```
course-images/
├── courses/
│   ├── {course-id}-{timestamp}.jpg
│   ├── {course-id}-{timestamp}.webp
│   └── ...
└── products/
    ├── {product-id}-{timestamp}.jpg
    ├── {product-id}-{timestamp}.webp
    └── ...
```

**Ventajas:**
- ✅ Fácil de organizar
- ✅ Evita colisiones de nombres
- ✅ Fácil de limpiar imágenes antiguas

---

## 🔒 LÍMITES Y RESTRICCIONES

### **Límites recomendados:**
- **Tamaño máximo por imagen:** 10 MB
- **Formatos permitidos:** JPG, PNG, WEBP, GIF
- **Dimensiones recomendadas:** 1200x800px (ratio 3:2)

### **Implementación en código:**
Estos límites se validarán en el componente de upload del frontend.

---

## 🧪 PROBAR QUE FUNCIONA

### **Opción 1: Interfaz de Supabase**

1. Ve a **Storage** → `course-images`
2. Click en **"Upload file"**
3. Sube una imagen de prueba
4. Si se sube correctamente, ¡está funcionando! ✅

### **Opción 2: Obtener URL pública**

1. Después de subir la imagen, click derecho sobre ella
2. Click en **"Copy URL"**
3. Pega la URL en tu navegador
4. Deberías ver la imagen (acceso público funcionando) ✅

---

## 🚨 TROUBLESHOOTING

### ❌ "new row violates row-level security policy"

**Problema:** Las políticas RLS están mal configuradas.

**Solución:**
1. Verifica que el bucket sea **público** (`public = true`)
2. Verifica que las políticas estén activas
3. Refresca la página de Storage

### ❌ "The resource you are looking for has been deleted"

**Problema:** El bucket no existe o fue eliminado.

**Solución:**
1. Crea el bucket nuevamente siguiendo el PASO 1
2. Verifica el nombre: debe ser exactamente `course-images`

### ❌ No puedo ver la imagen en el navegador

**Problema:** El bucket no es público.

**Solución:**
1. Ve a Storage → `course-images` → Settings
2. Marca la opción **"Public bucket"**
3. Click en **"Save"**

---

## ✅ CHECKLIST FINAL

Antes de continuar con el código, verifica:

- [ ] Bucket `course-images` creado
- [ ] Bucket configurado como **público**
- [ ] 4 políticas RLS creadas y activas
- [ ] Imagen de prueba subida correctamente
- [ ] URL pública funciona en el navegador

---

## 🔜 PRÓXIMO PASO

Una vez completada esta configuración, continuaremos con:

1. ✅ **Supabase Storage configurado** (este paso)
2. ⏭️ **Crear componente de upload en React**
3. ⏭️ **Integrar en panel admin de cursos**
4. ⏭️ **Mostrar imágenes en el frontend**

---

**¿Listo para continuar?** 🚀

Avísame cuando hayas completado la configuración en Supabase y seguimos con el código.
