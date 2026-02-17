# 🛠️ GUÍA PARA DESARROLLADORES

> Guía completa para desarrolladores que trabajen en Reactivar Academy

---

## 📋 ANTES DE EMPEZAR

### **1. Lee el README.md**
Lee completamente el `README.md` para entender:
- La arquitectura del sistema
- Las tecnologías usadas
- El flujo de compra
- La estructura del proyecto

### **2. Configura tu Entorno Local**

```bash
# 1. Clonar el repo
git clone https://github.com/AxelBytes/reactivar-academy.git
cd reactivar-academy

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Completar las variables (pedir al admin si no las tienes)
# Edita .env.local con tus credenciales

# 5. Iniciar servidor de desarrollo
npm run dev
```

### **3. Familiarízate con el Código**

Explora estas carpetas en orden:

1. `src/pages/` - Páginas principales
2. `src/components/` - Componentes reutilizables
3. `api/` - Serverless functions (backend)
4. `docs/` - Documentación detallada

---

## 🏗️ ARQUITECTURA

### **Frontend (React)**
- **Ubicación:** `src/`
- **Tecnología:** React 18 + TypeScript + Vite
- **UI:** TailwindCSS + shadcn/ui
- **Estado:** React Context API (AuthContext, CartContext)
- **Routing:** React Router v6

### **Backend (Serverless)**
- **Ubicación:** `api/`
- **Tecnología:** Vercel Serverless Functions (Node.js)
- **Base de datos:** Supabase (PostgreSQL)
- **APIs externas:** Mercado Pago, systeme.io, Brevo, Telegram

### **Database Schema (Supabase)**

```sql
-- Tabla: courses
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  price NUMERIC,
  image TEXT,
  systeme_product_id TEXT,  -- ID del producto en systeme.io
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: products
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  image TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: orders
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: order_items
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  item_type TEXT, -- 'course' o 'product'
  item_id BIGINT,
  item_name TEXT,
  price NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 FLUJO DE DATOS

### **Flujo de Compra (Curso)**

```
1. Usuario → Agrega curso al carrito (CartContext)
2. Usuario → Click "Comprar" → /checkout
3. Frontend → POST /api/create-preference
4. Mercado Pago → Muestra pantalla de pago
5. Usuario → Completa pago
6. Mercado Pago → Redirige a /checkout/success?courseIds=[...]&email=...
7. Frontend → Ejecuta automatización:
   
   a) Guarda order en Supabase
      ↓
   b) POST /api/systeme-grant-access
      → Crea contacto en systeme.io
      → Otorga acceso al curso
      ↓
   c) POST /api/send-course-email
      → Envía email con credenciales vía Brevo
      ↓
   d) POST /api/telegram-notify
      → Notifica al admin en Telegram
      ↓
   e) POST /api/telegram-smart-alerts
      → Verifica y envía alertas inteligentes
```

---

## 📂 ESTRUCTURA DE CARPETAS DETALLADA

### **`api/` - Serverless Functions**

| Archivo | Descripción | Request | Response |
|---------|-------------|---------|----------|
| `create-preference.js` | Crear orden de Mercado Pago | `{ items: [...], payer: {...} }` | `{ id, init_point }` |
| `systeme-grant-access.js` | Otorgar acceso a curso | `{ email, firstName, courseId, systemeProductId }` | `{ success, contactId }` |
| `send-course-email.js` | Enviar email con credenciales | `{ email, courseName, credentials }` | `{ success }` |
| `telegram-notify.js` | Notificación de venta | `{ customerEmail, courseTitle, orderTotal }` | `{ success }` |
| `telegram-webhook.js` | Procesar comandos del bot | Telegram webhook | `{ ok: true }` |
| `telegram-smart-alerts.js` | Alertas inteligentes | `{ orderTotal, courseName }` | `{ success, alerts: [...] }` |
| `upload-image.js` | Subir imagen a Storage | `{ file: base64, fileName, folder }` | `{ url }` |

### **`src/pages/` - Páginas**

| Página | Ruta | Descripción |
|--------|------|-------------|
| `Index.tsx` | `/` | Home con hero, cursos destacados, testimonios |
| `Courses.tsx` | `/cursos` | Catálogo completo de cursos |
| `Store.tsx` | `/tienda` | Catálogo de productos |
| `Login.tsx` | `/login` | Login/Registro (Supabase Auth) |
| `About.tsx` | `/nosotros` | Sobre la academia |
| `checkout/Success.tsx` | `/checkout/success` | Post-compra (automatización) |
| `checkout/Failure.tsx` | `/checkout/failure` | Error en pago |
| `NotFound.tsx` | `*` | 404 |

### **`src/components/` - Componentes**

```
components/
├── admin/                    # Panel de administración
│   ├── CourseFormDialog.tsx  # Formulario CRUD de cursos
│   ├── ProductFormDialog.tsx # Formulario CRUD de productos
│   ├── OrdersTable.tsx       # Tabla de órdenes
│   └── ImageUpload.tsx       # Upload de imágenes
│
├── cart/                     # Carrito de compras
│   └── CartDrawer.tsx        # Drawer del carrito
│
├── checkout/                 # Checkout y pagos
│   └── CheckoutForm.tsx      # Formulario de checkout
│
├── courses/                  # Cursos
│   ├── CourseCard.tsx        # Card de curso
│   └── CourseDetailDialog.tsx # Modal de detalles
│
├── home/                     # Home page
│   ├── Hero.tsx              # Hero section
│   ├── FeaturedCourses.tsx   # Cursos destacados
│   ├── Features.tsx          # Features
│   ├── Testimonials.tsx      # Testimonios
│   └── CTA.tsx               # Call to action
│
├── layout/                   # Layout
│   ├── Header.tsx            # Header con nav
│   └── Footer.tsx            # Footer
│
├── products/                 # Productos
│   ├── ProductCard.tsx       # Card de producto
│   └── ProductDetailDialog.tsx # Modal de detalles
│
├── ui/                       # shadcn/ui components
│   └── ... (40+ componentes base)
│
├── SEO.tsx                   # Componente de SEO
├── Analytics.tsx             # Google Analytics + Meta Pixel
└── ConversionOptimization.tsx # CRO components
```

---

## 🛠️ COMANDOS ÚTILES

### **Desarrollo**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# Tests
npm run test

# Tests en watch mode
npm run test:watch
```

### **Git**

```bash
# Crear rama para nueva feature
git checkout -b feature/nombre-feature

# Commits semánticos
git commit -m "feat: agregar nueva funcionalidad"
git commit -m "fix: corregir bug en carrito"
git commit -m "docs: actualizar README"
git commit -m "style: mejorar estilos de header"
git commit -m "refactor: reorganizar componentes"

# Push y crear PR
git push origin feature/nombre-feature
```

### **Vercel**

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Ver variables de entorno
vercel env ls
```

---

## 🐛 DEBUGGING

### **Frontend**

```typescript
// Activar logs de Supabase
const supabase = createClient(url, key, {
  auth: { debug: true }
});

// Logs de React Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools initialIsOpen={false} />
```

### **Backend (API)**

```javascript
// Logs en Vercel Functions
console.log('🔍 Debug:', data);
console.error('❌ Error:', error);

// Ver logs en tiempo real
vercel logs --follow
```

### **Telegram Bot**

```bash
# Verificar webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Ver updates pendientes
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

---

## ✅ CHECKLIST ANTES DE HACER COMMIT

- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de TypeScript
- [ ] Los tests pasan (`npm run test`)
- [ ] El código está formateado (prettier/eslint)
- [ ] Las variables de entorno están documentadas
- [ ] Actualicé el README si agregué features
- [ ] Probé la funcionalidad en local
- [ ] No commitee archivos sensibles (`.env.local`, API keys)

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### **Error: "Cannot find module 'X'"**
```bash
npm install
```

### **Error: "Supabase RLS policy violation"**
- Revisa las políticas RLS en Supabase
- Usa `SUPABASE_SERVICE_ROLE_KEY` para operaciones admin

### **Error: "CORS policy blocked"**
- Agrega headers CORS en `/api` functions:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
```

### **Error: "Telegram webhook not responding"**
```bash
# Verificar webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Resetear webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://tu-dominio.vercel.app/api/telegram-webhook"
```

---

## 📚 RECURSOS

### **Documentación Externa**
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Mercado Pago Docs](https://www.mercadopago.com.ar/developers)
- [systeme.io API Docs](https://docs.systeme.io/api)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### **Documentación Interna**
- `README.md` - Overview del proyecto
- `docs/` - Documentación detallada de features
- `api/README.md` - Documentación de endpoints

---

## 🔐 SEGURIDAD

### **NUNCA COMMITEAR:**
- `.env.local` (variables de entorno)
- API keys o tokens
- Credenciales de base de datos
- Passwords o secrets

### **Buenas Prácticas:**
- Siempre usa variables de entorno para secrets
- Valida inputs del usuario
- Usa HTTPS en producción
- Implementa rate limiting en APIs críticas
- Revisa logs regularmente

---

## 🎯 PRÓXIMOS PASOS PARA NUEVOS DEVS

1. **Día 1-2:** Lee toda la documentación
2. **Día 3-4:** Configura entorno local y familiarízate con el código
3. **Día 5-7:** Haz cambios pequeños (fix typos, mejorar estilos)
4. **Día 8-14:** Implementa tu primera feature
5. **Día 15+:** Trabaja en features complejas

---

## 💬 CONTACTO

Si tienes dudas:
1. Revisa la documentación en `docs/`
2. Busca en el código (usa grep/buscar en archivos)
3. Consulta con el equipo

---

**¡Bienvenido al equipo!** 🚀
