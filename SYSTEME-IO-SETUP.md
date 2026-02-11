# 🔑 Configuración de systeme.io - Acceso Automático a Cursos

## 📋 Resumen

Cuando alguien compra un curso en tu plataforma, **automáticamente**:
1. ✅ Se crea/actualiza el contacto en systeme.io
2. ✅ Se asigna un tag que activa una automatización
3. ✅ La automatización de systeme.io da acceso al curso

---

## 🚀 Paso 1: Configurar Variables de Entorno

### API Key de systeme.io

Ya tienes tu API Key: `bn3r7ut2y7rytezrgdt2v050zwl4cjxqtnyzajh0n73ikwab092f7vfeehpqrvhy`

### Agregar a `.env.local` (desarrollo)

```bash
# Agregar esta línea al archivo .env.local
SYSTEME_API_KEY=bn3r7ut2y7rytezrgdt2v050zwl4cjxqtnyzajh0n73ikwab092f7vfeehpqrvhy
SYSTEME_TAG_ID=   # Ver paso 2 para obtener este ID
```

### Agregar a Vercel (producción)

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Agrega:
   - **Name:** `SYSTEME_API_KEY`
   - **Value:** `bn3r7ut2y7rytezrgdt2v050zwl4cjxqtnyzajh0n73ikwab092f7vfeehpqrvhy`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
4. Agrega:
   - **Name:** `SYSTEME_TAG_ID`
   - **Value:** (ver paso 2)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**
6. **Redeploy** tu proyecto

---

## 🏷️ Paso 2: Crear Tag y Automatización en systeme.io

### 2.1 Crear el Tag

1. Ve a tu dashboard de systeme.io
2. **Contacts** → **Tags**
3. Click en **Create a tag**
4. Nombre del tag: `curso-comprado` (o el nombre que prefieras)
5. Guarda el tag
6. **Copia el ID del tag** (lo verás en la URL o en la lista)
   - Ejemplo: si la URL es `https://systeme.io/dashboard/tags/12345`, el ID es `12345`

### 2.2 Crear la Automatización

1. Ve a **Automations** en systeme.io
2. Click en **Create an automation**
3. Configura así:

```
TRIGGER: "Tag assigned"
  └─ Tag: "curso-comprado" (el que creaste)

ACTION: "Grant access to product"
  └─ Product/Course: Selecciona tu curso
  └─ Grant immediately: ✅ Activado
```

4. Activa la automatización

### 2.3 Agregar el Tag ID a las Variables

Una vez que tengas el ID del tag, agrégalo:

**En `.env.local`:**
```bash
SYSTEME_TAG_ID=12345  # Reemplaza con tu ID real
```

**En Vercel:**
- Agrega la variable `SYSTEME_TAG_ID` con el valor del ID

---

## 🔄 Flujo Completo

### Cuando alguien compra:

1. **Usuario completa el pago** (MercadoPago/PayPal/Prex)
2. **Redirección a página de éxito** (`/success`)
3. **Se guarda la orden en Supabase**
4. **Se envía email de confirmación** (Brevo)
5. **🆕 Se crea contacto en systeme.io** con:
   - Email del comprador
   - Nombre y apellido
   - Información de cursos comprados
6. **🆕 Se asigna el tag** `curso-comprado` al contacto
7. **🤖 Automatización de systeme.io se activa**
8. **✅ Usuario obtiene acceso al curso** en systeme.io

---

## 🧪 Cómo Probar

### Prueba Local

1. Asegúrate de que `.env.local` tenga las variables configuradas
2. Inicia el servidor: `npm run dev`
3. Compra un curso de prueba (usa el curso GRATIS si existe)
4. Revisa la consola del navegador:
   ```
   🔑 Otorgando acceso en systeme.io...
   ✅ Acceso otorgado en systeme.io: { success: true, ... }
   ```
5. Ve a systeme.io → Contacts
6. Busca el email del comprador
7. Verifica que tenga el tag `curso-comprado`
8. Verifica que tenga acceso al curso

### Prueba en Producción

1. Configura las variables en Vercel
2. Haz un redeploy
3. Compra un curso desde la web en producción
4. Verifica en systeme.io que:
   - El contacto fue creado
   - El tag fue asignado
   - El acceso fue otorgado

---

## 📊 Verificar en systeme.io

### Ver Contactos
```
Dashboard → Contacts → Search by email
```

### Ver Tags Asignados
```
Dashboard → Contacts → [Select contact] → Tags
```

### Ver Accesos a Cursos
```
Dashboard → Products → [Select course] → Members
```

### Ver Automatizaciones Activadas
```
Dashboard → Automations → [Select automation] → Activity log
```

---

## 🔍 Debugging

### Si el contacto no se crea:

1. **Verifica la API Key:**
   ```bash
   # Prueba desde terminal
   curl -X POST "https://systeme.io/api/v2/contacts" \
     -H "Authorization: bn3r7ut2y7rytezrgdt2v050zwl4cjxqtnyzajh0n73ikwab092f7vfeehpqrvhy" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}'
   ```

2. **Revisa logs de Vercel:**
   - Ve a tu proyecto → Deployments → [Latest] → Functions
   - Busca `systeme-grant-access`
   - Revisa los logs

3. **Revisa consola del navegador:**
   - F12 → Console
   - Busca errores después de comprar

### Si el tag no se asigna:

1. **Verifica el Tag ID:**
   - Dashboard systeme.io → Tags
   - El ID debe ser numérico (ej: 12345)

2. **Verifica que el contacto existe:**
   - Primero debe crearse el contacto
   - Luego se asigna el tag

3. **Revisa permisos de la API Key:**
   - Debe tener permisos para crear contactos y asignar tags

### Si la automatización no se ejecuta:

1. **Verifica que esté activada:**
   - Dashboard → Automations
   - Debe estar en verde (Active)

2. **Verifica el trigger:**
   - Trigger debe ser "Tag assigned"
   - Tag debe coincidir con el configurado

3. **Revisa el log de actividad:**
   - Dashboard → Automations → [Tu automatización] → Activity
   - Verifica si se disparó y qué pasó

---

## 🎯 Casos de Uso Avanzados

### Múltiples Cursos

Si tienes varios cursos, puedes:

**Opción 1: Un tag por curso**
```bash
SYSTEME_TAG_CURSO_1=12345
SYSTEME_TAG_CURSO_2=67890
```

**Opción 2: Tag genérico + automatización condicional**
- Usa un solo tag `curso-comprado`
- En systeme.io, crea múltiples automatizaciones con diferentes condiciones

### Niveles de Acceso

Puedes crear tags para diferentes niveles:
```bash
SYSTEME_TAG_BASICO=11111
SYSTEME_TAG_PRO=22222
SYSTEME_TAG_PREMIUM=33333
```

---

## 📝 Archivos Creados/Modificados

```
✅ api/systeme-grant-access.js (nuevo)
   └─ Función serverless que crea contactos y asigna tags

✅ src/pages/checkout/Success.tsx (modificado)
   └─ Llama a systeme.io después de confirmar la compra

✅ .env.local (debes actualizar)
   └─ Agregar SYSTEME_API_KEY y SYSTEME_TAG_ID

✅ Vercel Environment Variables (debes configurar)
   └─ Agregar las mismas variables para producción
```

---

## ✅ Checklist de Configuración

- [ ] API Key agregada a `.env.local`
- [ ] Tag creado en systeme.io
- [ ] Tag ID copiado
- [ ] Tag ID agregado a `.env.local`
- [ ] Automatización creada en systeme.io
- [ ] Automatización activada
- [ ] Variables agregadas en Vercel
- [ ] Proyecto redeployado en Vercel
- [ ] Prueba local realizada
- [ ] Prueba en producción realizada
- [ ] Verificado en systeme.io que funciona

---

## 🎉 ¡Listo!

Una vez configurado, cada compra automáticamente dará acceso al curso en systeme.io. El comprador:
1. Recibirá un email de confirmación (Brevo)
2. Será agregado a systeme.io
3. Recibirá acceso al curso automáticamente
4. Podrá ingresar a la plataforma de systeme.io con su email

---

## 💡 Notas Importantes

- **Tiempo de procesamiento:** Generalmente 1-2 segundos
- **Emails duplicados:** Si un contacto ya existe, solo se actualiza
- **Acceso inmediato:** La automatización se ejecuta instantáneamente
- **Sin intervención manual:** Todo es automático
- **Logs completos:** Puedes ver cada paso en la consola y en Vercel

---

## 📞 Soporte

Si algo no funciona:
1. Revisa la sección de Debugging
2. Verifica los logs en Vercel
3. Revisa la consola del navegador
4. Verifica el Activity log de la automatización en systeme.io
