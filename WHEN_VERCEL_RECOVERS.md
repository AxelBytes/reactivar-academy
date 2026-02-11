# 🚀 Cuando Vercel se recupere - Checklist

## ✅ Pasos a seguir cuando el servicio vuelva:

### 1. **Verificar que Vercel está operativo:**
- Ve a: https://www.vercel-status.com/
- Debe mostrar: ✅ All Systems Operational

### 2. **Verificar/Agregar Environment Variables en Vercel:**

Ve a: https://vercel.com → Tu Proyecto → Settings → Environment Variables

**Verificá que estén estas 4 variables:**

| Variable | Empieza con | Environments |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | `https://lhjzx...` | ✅ Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | ✅ Production, Preview, Development |
| `BREVO_API_KEY` | `xkeysib-0ab...` | ✅ Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | ✅ Production, Preview, Development |

**Si falta alguna:**
1. Click "Add New"
2. Copia el valor desde tu archivo `.env.local`
3. Marca las 3 environments
4. Save

### 3. **Redeploy:**

Si agregaste/modificaste alguna variable:
1. Ve a **Deployments**
2. Click en los "..." del último deployment
3. Click en "Redeploy"
4. Esperá 1-2 minutos

### 4. **Probar el flujo completo:**

#### **A) Login/Registro:**
1. Ve a: https://reactivar-academy.vercel.app/login
2. Registrate con tu email real
3. Deberías poder registrarte exitosamente

#### **B) Admin Panel:**
1. Login con: `admin@reactivar.com` / `admin123`
2. Ve a "Cursos"
3. Agregá un curso gratis (precio $0)
4. Debería guardarse en Supabase

#### **C) Compra y Email:**
1. Logout del admin
2. Login con tu usuario normal
3. Ve a "/cursos"
4. Comprá el curso gratis
5. **IMPORTANTE:** Abrí la consola del navegador (F12) para ver logs
6. Deberías ver en la página: "¡Email enviado exitosamente!"

#### **D) Verificar logs en Vercel:**
1. Ve a: Vercel → Deployments → (último) → Functions
2. Buscá: `send-course-email`
3. Deberías ver:
   ```
   ✅ BREVO_API_KEY encontrada
   🚀 Enviando email a Brevo API...
   📡 Respuesta de Brevo - Status: 201
   ✅ Email enviado exitosamente via Brevo
   📬 Destinatario: tu@email.com
   ```

#### **E) Verificar tu email:**
- ✉️ Inbox
- 🗑️ Spam / Correo no deseado
- 📁 Promotions (Gmail)

**Asunto esperado:**
```
🎓 Acceso a tus Capacitaciones - REACTIVAR ACADEMY
```

---

## 🐛 Si sigue sin funcionar después de que Vercel se recupere:

### Error: "BREVO_API_KEY no configurada"
→ Falta agregar en Vercel → Paso 2

### Error: "401 Unauthorized" de Brevo
→ API Key incorrecta → Verificá que sea la correcta desde tu .env.local

### Error: "406 Not Acceptable" de Supabase
→ Problema con RLS policies → Avisame y lo arreglo

### Email dice "enviado" pero no llega:
→ Revisá SPAM primero
→ Si no está, verificá en Brevo Dashboard: https://app.brevo.com

---

## 📞 Contacto:

Si después de seguir estos pasos algo no funciona, avisame con:
1. Qué paso no funcionó
2. Screenshot del error (si hay)
3. Screenshot de los logs en Vercel Functions
4. Screenshot de las Environment Variables en Vercel (sin mostrar los valores completos)
