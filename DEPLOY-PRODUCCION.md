# 🚀 Guía de Deploy a PRODUCCIÓN

## ✅ Cambios realizados para producción:

1. ✅ **API de emails actualizada** - Usa remitente verificado (`newcomreactivar22@gmail.com`)
2. ✅ **Backend configurado** con rutas de email
3. ✅ **Brevo verificado** y listo para enviar

---

## 📋 Pasos para desplegar a PRODUCCIÓN:

### **PASO 1: Configurar Variables de Entorno en Vercel**

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Entra a tu proyecto de Ascend Academy
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://lhjzxwthuqpqsvqpvsxw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoanp4d3RodXFwcXN2cXB2c3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDM0MDAsImV4cCI6MjA4NTcxOTQwMH0.wIbgZgFqvZXB0T-pF01TwHak-m3ZcDFa2LTBOdhim3E

# Brevo (IMPORTANTE para emails)
BREVO_API_KEY=tu_brevo_api_key_aqui
# Copia el valor de tu archivo .env.local

# Supabase Service Role (para backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoanp4d3RodXFwcXN2cXB2c3h3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MzQwMCwiZXhwIjoyMDg1NzE5NDAwfQ.r0Oh7B9IsIhpxC8op5yldvCXh9WNIZuUIzjAvKVZiWc
```

**IMPORTANTE:** Asegúrate de agregar `BREVO_API_KEY` en Vercel, sin esto los emails NO funcionarán.

---

### **PASO 2: Subir cambios a GitHub**

```bash
git add .
git commit -m "Fix: Actualizar remitente de emails a newcomreactivar22@gmail.com verificado en Brevo"
git push origin main
```

---

### **PASO 3: Vercel deployará automáticamente**

Vercel detectará el push y desplegará automáticamente. Verás:
- ✅ Build exitoso
- ✅ Deploy en producción
- ✅ URL de producción lista

---

### **PASO 4: Verificar que funcione en producción**

1. **Abre tu sitio en producción**: `https://tu-sitio.vercel.app`
2. **Registrate** con un email real
3. **Compra un curso** (usa el curso gratis para probar)
4. **Revisa tu email** - Deberías recibir el email de confirmación

---

## 🔍 Verificación de Variables de Entorno en Vercel

Para verificar que las variables estén configuradas correctamente:

1. Ve a: `https://vercel.com/[tu-usuario]/[tu-proyecto]/settings/environment-variables`
2. Verifica que exista: `BREVO_API_KEY`
3. Si no existe, agrégala con el valor de arriba

---

## 🎯 Checklist Final:

- [ ] ✅ Variables de entorno configuradas en Vercel
- [ ] ✅ BREVO_API_KEY agregada en Vercel
- [ ] ✅ Cambios pusheados a GitHub (git push)
- [ ] ✅ Deploy exitoso en Vercel
- [ ] ✅ Probar compra de curso en producción
- [ ] ✅ Verificar que llegue el email

---

## 📧 ¿Qué pasará en producción?

Cuando alguien compre un curso en tu sitio:

1. ✅ La función `/api/send-course-email` se ejecutará en Vercel
2. ✅ Tomará `BREVO_API_KEY` de las variables de entorno
3. ✅ Enviará el email desde `newcomreactivar22@gmail.com` (verificado)
4. ✅ El email llegará al comprador con todos los detalles

---

## ⚠️ IMPORTANTE: Dominio personalizado (Futuro)

Para mejor deliverability en producción, eventualmente deberías:

1. **Comprar un dominio**: ejemplo `reactivaracademy.com`
2. **Verificar el dominio en Brevo**:
   - Ve a: https://app.brevo.com/settings/senders
   - Agrega tu dominio
   - Configura registros DNS (SPF, DKIM, DMARC)
3. **Cambiar el remitente a**: `noreply@reactivaracademy.com`

Esto mejorará significativamente la tasa de entrega de emails.

---

## 🆘 ¿Problemas?

Si los emails no llegan en producción:

1. **Verifica logs en Vercel**:
   - Ve a Functions → Logs
   - Busca errores en `/api/send-course-email`

2. **Verifica Brevo**:
   - https://app.brevo.com/email/activity
   - Revisa el estado de los emails enviados

3. **Verifica variables de entorno**:
   - Asegúrate de que `BREVO_API_KEY` exista en Vercel
   - Debe ser la misma que funciona en local

---

## 🎉 ¡Listo para Producción!

Con estos cambios, tu sistema de emails funcionará perfectamente en producción.
Los usuarios recibirán sus emails de confirmación automáticamente al comprar cursos.
