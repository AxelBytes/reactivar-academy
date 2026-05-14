# Gestión de Testimonios en Video

## 📋 Descripción

Se ha implementado una funcionalidad completa para gestionar testimonios en video desde el panel de administración. Los testimonios agregados aparecerán automáticamente en la página de inicio.

## ✅ Componentes Implementados

### 1. Página de Administración (`/admin/testimonios`)
- Interfaz completa para agregar y eliminar testimonios en video
- Formulario para ingresar URL de YouTube o ID directo del video
- Vista previa de thumbnails de YouTube
- Lista de testimonios ordenados por fecha (más nuevos primero)

### 2. Tabla en Supabase (`video_testimonials`)
- Almacena todos los testimonios en video
- Campos: `id`, `youtube_id`, `title`, `created_at`
- Políticas RLS (Row Level Security) configuradas
- Solo administradores pueden agregar/eliminar
- Acceso público de lectura

### 3. Componente de Inicio Actualizado
- Carga testimonios dinámicamente desde la base de datos
- Los nuevos testimonios aparecen primero
- Se mantienen todas las animaciones existentes

## 🚀 Cómo Usar

### Paso 1: Crear la Tabla en Supabase

1. **Accede a tu panel de Supabase**: https://supabase.com/dashboard
2. **Ve a tu proyecto**: Selecciona `ascend-academy-gear`
3. **Abre el SQL Editor**: Sidebar → SQL Editor
4. **Ejecuta el script SQL**:
   - Copia el contenido del archivo: `supabase/migrations/create_video_testimonials_table.sql`
   - Pégalo en el editor SQL
   - Haz click en "Run"

Este script creará:
- La tabla `video_testimonials`
- Las políticas de seguridad (RLS)
- Los 7 testimonios que ya tenías (como datos iniciales)

### Paso 2: Acceder al Panel Admin

1. **Inicia sesión como administrador**:
   - Ve a: https://reactivar-academy.vercel.app/login
   - Ingresa tus credenciales de admin

2. **Ve al panel de Testimonios**:
   - En el sidebar, haz click en "Testimonios" (icono de video)
   - O ve directamente a: `/admin/testimonios`

### Paso 3: Agregar un Nuevo Testimonio

1. **Haz click en "Agregar Testimonio"**

2. **Completa el formulario**:
   - **URL o ID de YouTube**: Podés pegar cualquiera de estos formatos:
     - `https://www.youtube.com/watch?v=ABC123DEF456`
     - `https://youtu.be/ABC123DEF456`
     - `ABC123DEF456` (solo el ID)
   
   - **Título del Testimonio**: Un nombre descriptivo, ej: "Testimonio de Juan Pérez"

3. **Haz click en "Guardar Testimonio"**

4. **¡Listo!** El nuevo testimonio aparecerá:
   - En la lista del panel admin
   - En la página de inicio (sección de testimonios)
   - Los más nuevos aparecen primero

### Paso 4: Eliminar un Testimonio

1. Ve a la lista de testimonios en `/admin/testimonios`
2. Busca el testimonio que querés eliminar
3. Haz click en el botón rojo "Eliminar"
4. Confirma la acción
5. El testimonio se elimina de la base de datos y desaparece del inicio

## 📝 Notas Importantes

### Formatos de URL Soportados

El sistema extrae automáticamente el ID del video de estos formatos:
```
https://www.youtube.com/watch?v=VIDEOID
https://youtu.be/VIDEOID
https://www.youtube.com/embed/VIDEOID
VIDEOID (directo)
```

### Orden de Visualización

Los testimonios se muestran ordenados por fecha de creación, con los más recientes primero. Esto significa que cuando agregás un nuevo testimonio:
- Aparece primero en la lista del admin
- Aparece primero en la sección de testimonios del inicio
- Los testimonios antiguos se desplazan hacia abajo

### Seguridad (RLS)

La tabla tiene configuradas políticas de seguridad:
- **Lectura pública**: Cualquiera puede ver los testimonios
- **Escritura restringida**: Solo administradores pueden agregar/eliminar

### Datos Iniciales

El script SQL incluye los 7 testimonios que ya tenías:
1. RIBca2Do-gs - Testimonio 1
2. 3UUojxQvl1I - Testimonio 2
3. wKH41RBxnCU - Testimonio 3
4. pxujtXL4SZE - Testimonio 4
5. dvkBRocbpzU - Testimonio 5
6. dk7j_zmZ1CA - Testimonio 6
7. MxlJoew71XM - Testimonio 7

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos
- `src/pages/admin/Testimonials.tsx` - Página de admin para testimonios
- `supabase/migrations/create_video_testimonials_table.sql` - Script SQL
- `INSTRUCCIONES_TESTIMONIOS.md` - Este archivo

### Archivos Modificados
- `src/App.tsx` - Agregada ruta `/admin/testimonios`
- `src/components/admin/AdminLayout.tsx` - Agregado enlace en menú
- `src/components/home/Testimonials.tsx` - Carga testimonios desde DB

## 🐛 Troubleshooting

### Problema: "No puedo acceder a /admin/testimonios"
**Solución**: Asegurate de estar logueado como administrador.

### Problema: "Error al cargar testimonios"
**Solución**: 
1. Verifica que ejecutaste el script SQL en Supabase
2. Verifica que la tabla `video_testimonials` existe
3. Revisa las políticas RLS en Supabase

### Problema: "No puedo agregar testimonios"
**Solución**:
1. Verifica que tu usuario tiene rol `admin` en la tabla `users`
2. Verifica las políticas RLS de la tabla

### Problema: "Los testimonios no aparecen en el inicio"
**Solución**:
1. Verifica que los testimonios están en la base de datos
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que la política de lectura pública está habilitada

## 💡 Mejoras Futuras (Opcional)

Si querés agregar más funcionalidades en el futuro:
- Ordenar testimonios manualmente (drag & drop)
- Agregar descripción a cada testimonio
- Marcar testimonios como "destacados"
- Agregar categorías o tags
- Establecer fechas de publicación programadas

---

**¿Necesitás ayuda?** Si tenés algún problema, revisá los logs de Supabase o la consola del navegador para ver mensajes de error específicos.
