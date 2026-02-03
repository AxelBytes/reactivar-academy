# 🗄️ CONFIGURACIÓN DE SUPABASE

## ✅ Base de Datos Configurada

Las tablas ya están creadas en Supabase con el siguiente schema:

### 📊 Tablas:
- **users** - Usuarios registrados con autenticación
- **products** - Productos de la tienda
- **courses** - Capacitaciones y cursos
- **orders** - Órdenes de compra
- **order_items** - Items individuales de cada orden

---

## 🔐 Variables de Entorno

El archivo `.env.local` ya está configurado con:

```bash
VITE_SUPABASE_URL=https://lhjzxwthuqpqsvqpvsxw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (clave pública)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (clave privada - solo backend)
BREVO_API_KEY=xkeysib-... (para emails)
```

---

## 🚀 Configuración en Vercel

Para que funcione en producción, debés agregar estas variables en Vercel:

1. **Ve a tu proyecto en Vercel**
2. **Settings → Environment Variables**
3. **Agregá estas 4 variables:**

| Variable | Valor | Environments |
|----------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://lhjzxwthuqpqsvqpvsxw.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key | Production, Preview, Development |
| `BREVO_API_KEY` | Tu Brevo API key | Production, Preview, Development |

4. **Redeploy** tu proyecto para que las variables surtan efecto

---

## 📝 Próximos Pasos

1. ✅ Supabase instalado
2. ✅ Cliente configurado (`src/lib/supabase.ts`)
3. ✅ Variables de entorno creadas
4. ⏳ Migrar el sistema de autenticación a Supabase
5. ⏳ Conectar productos y cursos a la base de datos
6. ⏳ Implementar el flujo de órdenes
7. ⏳ Configurar storage para imágenes

---

## 🔒 Seguridad

- ✅ `.env.local` está en `.gitignore` (NO se sube a Git)
- ✅ Row Level Security (RLS) activado en todas las tablas
- ✅ `service_role` key solo para backend
- ✅ `anon` key para frontend (segura para exponer)

---

## 📚 Documentación Oficial

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Auth](https://supabase.com/docs/guides/auth)
- [Storage](https://supabase.com/docs/guides/storage)
