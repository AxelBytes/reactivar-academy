# 🏋️ REACTIVAR ACADEMY

> Academia de fitness y entrenamiento profesional online con sistema de pagos, automatización de cursos y notificaciones inteligentes.

---

## 📋 TABLA DE CONTENIDOS

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Instalación y Configuración](#-instalación-y-configuración)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Funcionalidades Principales](#-funcionalidades-principales)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Deploy a Producción](#-deploy-a-producción)
9. [Documentación Adicional](#-documentación-adicional)
10. [Mantenimiento](#-mantenimiento)

---

## 🎯 DESCRIPCIÓN DEL PROYECTO

**Reactivar Academy** es una plataforma completa de e-learning para fitness que incluye:

- 🛒 **Tienda de cursos y productos** con carrito de compras
- 💳 **Sistema de pagos** integrado con Mercado Pago
- 🤖 **Automatización de acceso a cursos** vía systeme.io API
- 📧 **Envío automático de emails** con credenciales de acceso
- 📱 **Bot de Telegram** con reportes financieros y alertas inteligentes
- 🖼️ **Sistema de gestión de imágenes** con optimización automática
- 📊 **Panel de administración** para gestionar cursos y productos
- 🔐 **Autenticación segura** con Supabase
- 🚀 **SEO optimizado** con meta tags dinámicos y structured data

---

## 🛠️ STACK TECNOLÓGICO

### **Frontend**
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** + **shadcn/ui** (componentes)
- **React Router** (navegación)
- **React Helmet Async** (SEO)
- **Lucide React** (iconos)

### **Backend (Serverless)**
- **Vercel Serverless Functions** (`/api`)
- **Node.js**

### **Base de Datos**
- **Supabase** (PostgreSQL + Storage + Auth)

### **Integraciones Externas**
- **Mercado Pago** (pagos)
- **systeme.io** (gestión de cursos)
- **Brevo (Sendinblue)** (emails transaccionales)
- **Telegram Bot API** (notificaciones)

### **Deploy & Hosting**
- **Vercel** (frontend + API)
- **GitHub** (control de versiones)

---

## 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                     REACTIVAR ACADEMY                        │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
     ┌──────────┐      ┌──────────┐     ┌──────────┐
     │ FRONTEND │      │ VERCEL   │     │ SUPABASE │
     │ (React)  │◄────►│ API      │◄───►│ Database │
     └──────────┘      └──────────┘     └──────────┘
            │                 │                 │
            │                 │                 │
            ▼                 ▼                 ▼
     ┌──────────┐      ┌──────────┐     ┌──────────┐
     │ Mercado  │      │systeme.io│     │ Telegram │
     │ Pago     │      │   API    │     │   Bot    │
     └──────────┘      └──────────┘     └──────────┘
```

### **Flujo de Compra:**

1. **Usuario** selecciona curso/producto → Carrito
2. **Frontend** envía datos a `/api/create-preference` (Mercado Pago)
3. Usuario completa pago en Mercado Pago
4. Mercado Pago redirige a `/checkout/success`
5. **Frontend** ejecuta:
   - Guarda pedido en Supabase
   - Llama `/api/systeme-grant-access` (otorga acceso al curso)
   - Llama `/api/send-course-email` (envía credenciales)
   - Llama `/api/telegram-notify` (notifica al admin)
   - Llama `/api/telegram-smart-alerts` (alertas inteligentes)

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN

### **Requisitos Previos**

- Node.js 18+ y npm
- Cuenta en Supabase
- Cuenta en Vercel
- API Keys de: Mercado Pago, systeme.io, Brevo, Telegram

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/AxelBytes/reactivar-academy.git
cd reactivar-academy
```

### **2. Instalar Dependencias**

```bash
npm install
```

### **3. Configurar Variables de Entorno**

Copia el archivo de ejemplo y completa con tus credenciales:

```bash
cp .env.example .env.local
```

Ver sección [Variables de Entorno](#-variables-de-entorno) para detalles.

### **4. Configurar Base de Datos**

Ejecuta los scripts SQL en Supabase:

1. `supabase-systeme-product-id.sql` - Agrega columna para IDs de systeme.io
2. `supabase-storage-setup.sql` - Configura Storage para imágenes
3. `supabase-add-systeme-tag.sql` - Agrega columna para tags (opcional)

Ver: `SUPABASE-STORAGE-SETUP.md`

### **5. Configurar systeme.io**

1. Crea productos/cursos en systeme.io
2. Copia los `systeme_product_id` de cada uno
3. Agrégalos a la tabla `courses` en Supabase

Ver: `SYSTEME-IO-CONFIGURACION-FINAL.md` y `SYSTEME-IO-SISTEMA-FINAL.md`

### **6. Configurar Telegram Bot**

1. Crea bot con @BotFather
2. Obtén `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`
3. Configura webhook y comandos

Ver: `TELEGRAM-BOT-SETUP.md`, `TELEGRAM-COMANDOS-SETUP.md`

### **7. Iniciar en Desarrollo**

```bash
npm run dev
```

La app estará en: `http://localhost:5173`

---

## 📁 ESTRUCTURA DEL PROYECTO

```
reactivar-academy/
├── api/                          # Serverless functions (Vercel)
│   ├── create-preference.js      # Crear orden de Mercado Pago
│   ├── systeme-grant-access.js   # Otorgar acceso a curso en systeme.io
│   ├── send-course-email.js      # Enviar email con credenciales
│   ├── telegram-notify.js        # Notificación de venta a Telegram
│   ├── telegram-webhook.js       # Comandos del bot (reportes)
│   ├── telegram-smart-alerts.js  # Alertas inteligentes automáticas
│   ├── upload-image.js           # Subir imágenes a Supabase Storage
│   ├── README.md                 # Documentación de APIs
│   └── EMAIL_SETUP.md            # Setup de Brevo
│
├── public/                       # Archivos estáticos
│   ├── manifest.json             # PWA manifest
│   └── logo.svg, og-image.jpg    # Assets
│
├── src/
│   ├── assets/                   # Imágenes del proyecto
│   ├── components/               # Componentes React
│   │   ├── admin/                # Panel admin (cursos, productos, órdenes)
│   │   ├── cart/                 # Carrito de compras
│   │   ├── checkout/             # Proceso de pago
│   │   ├── courses/              # Catálogo de cursos
│   │   ├── home/                 # Página principal
│   │   ├── layout/               # Header, Footer
│   │   ├── products/             # Catálogo de productos
│   │   ├── ui/                   # Componentes shadcn/ui
│   │   ├── SEO.tsx               # Componente de SEO
│   │   ├── Analytics.tsx         # Google Analytics + Meta Pixel
│   │   └── ConversionOptimization.tsx  # CRO components
│   │
│   ├── contexts/                 # React Contexts
│   │   ├── AuthContext.tsx       # Autenticación
│   │   └── CartContext.tsx       # Estado del carrito
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── use-toast.ts          # Toast notifications
│   │   └── usePerformance.tsx    # Performance hooks (lazy load, etc.)
│   │
│   ├── lib/                      # Utilidades
│   │   ├── supabase.ts           # Cliente de Supabase
│   │   ├── imageOptimizer.ts     # Optimización de imágenes
│   │   └── utils.ts              # Helpers
│   │
│   ├── pages/                    # Páginas principales
│   │   ├── Index.tsx             # Home
│   │   ├── Courses.tsx           # Catálogo de cursos
│   │   ├── Store.tsx             # Tienda de productos
│   │   ├── Login.tsx             # Login/Registro
│   │   ├── About.tsx             # Sobre nosotros
│   │   ├── NotFound.tsx          # 404
│   │   └── checkout/
│   │       ├── Success.tsx       # Post-compra (automatización)
│   │       └── Failure.tsx       # Error en pago
│   │
│   ├── styles/
│   │   ├── index.css             # Estilos globales
│   │   └── optimizations.css     # Animaciones y optimizaciones
│   │
│   ├── App.tsx                   # Componente raíz
│   └── main.tsx                  # Entry point
│
├── backend/                      # (No usado, reservado para futuro)
│
├── docs/                         # 📚 Documentación
│   ├── DEPLOY-PRODUCCION.md      # Guía de deploy
│   ├── IMAGENES-SISTEMA-COMPLETO.md      # Sistema de imágenes
│   ├── OPTIMIZACIONES-COMPLETAS.md       # SEO, Performance, CRO
│   ├── SUPABASE-STORAGE-SETUP.md         # Setup de Storage
│   ├── SYSTEME-IO-CONFIGURACION-FINAL.md # Config systeme.io
│   ├── SYSTEME-IO-SISTEMA-FINAL.md       # Integración completa
│   ├── TELEGRAM-ALERTAS-INTELIGENTES.md  # Alertas automáticas
│   ├── TELEGRAM-BOT-SETUP.md             # Setup del bot
│   ├── TELEGRAM-COMANDOS-SETUP.md        # Comandos del bot
│   ├── TELEGRAM-COMANDOS-AVANZADOS.md    # Comandos premium
│   └── TELEGRAM-SISTEMA-COMPLETO.md      # Sistema completo
│
├── supabase-*.sql                # Scripts SQL para Supabase
├── .env.example                  # Ejemplo de variables
├── .env.local                    # Variables locales (NO COMMITEAR)
├── .env.production               # Variables de producción
├── vercel.json                   # Config de Vercel
├── package.json                  # Dependencias
└── README.md                     # 👈 Este archivo
```

---

## ⚙️ FUNCIONALIDADES PRINCIPALES

### **1. Sistema de Cursos y Productos**

- Catálogo completo con filtros y búsqueda
- Carrito de compras persistente (localStorage)
- Integración con Mercado Pago
- Automatización de acceso post-compra

### **2. Panel de Administración** (`/admin`)

- Gestión de cursos (CRUD completo)
- Gestión de productos (CRUD completo)
- Historial de órdenes en tiempo real
- Upload de imágenes con optimización automática

### **3. Bot de Telegram**

**Comandos de reportes:**
- `/dia` - Reporte del día
- `/semana` - Reporte semanal
- `/mes` - Reporte mensual
- `/anio` - Reporte anual
- `/stats` - Estadísticas generales
- `/comparar` - Comparar períodos
- `/objetivos` - Ver progreso de metas
- `/producto [NOMBRE]` - Stats de un curso
- `/exportar [periodo]` - Exportar a CSV

**Alertas inteligentes automáticas:**
- 🎯 Meta diaria alcanzada
- 🏆 Record de ventas batido
- ☕ Primera venta del día
- 👑 Cliente VIP detectado (alta compra)
- 🔥 Horario pico (3+ ventas en 10 min)
- 🚀 Producto viral (10+ ventas del mismo producto)

### **4. SEO y Optimizaciones**

- Meta tags dinámicos por página
- Open Graph (Facebook/LinkedIn)
- Twitter Cards
- Structured Data (JSON-LD)
- PWA (Progressive Web App)
- Lazy loading de imágenes
- Animaciones CSS optimizadas
- Performance monitoring

### **5. Sistema de Imágenes**

- Upload desde panel admin
- Optimización automática (resize + compress)
- Almacenamiento en Supabase Storage
- Conversión a WebP
- Límite de 10MB por imagen

---

## 🔐 VARIABLES DE ENTORNO

### **Archivo: `.env.local`**

```bash
# ========================================
# SUPABASE (Base de datos + Storage + Auth)
# ========================================
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# ========================================
# MERCADO PAGO (Pagos)
# ========================================
VITE_MERCADO_PAGO_PUBLIC_KEY=tu-public-key
MERCADO_PAGO_ACCESS_TOKEN=tu-access-token

# ========================================
# SYSTEME.IO (Gestión de cursos)
# ========================================
SYSTEME_API_KEY=tu-api-key

# ========================================
# BREVO / SENDINBLUE (Emails)
# ========================================
BREVO_API_KEY=tu-api-key

# ========================================
# TELEGRAM BOT (Notificaciones)
# ========================================
TELEGRAM_BOT_TOKEN=123456:ABC-DEF-tu-token
TELEGRAM_CHAT_ID=tu-chat-id
```

### **¿Dónde obtener las keys?**

| Servicio | Dónde obtenerla |
|----------|-----------------|
| **Supabase** | https://app.supabase.com → Settings → API |
| **Mercado Pago** | https://www.mercadopago.com.ar/developers → Credenciales |
| **systeme.io** | https://app.systeme.io → Settings → API |
| **Brevo** | https://app.brevo.com → SMTP & API → API Keys |
| **Telegram** | @BotFather (crear bot) + @userinfobot (obtener chat_id) |

---

## 🚀 DEPLOY A PRODUCCIÓN

### **1. Deploy en Vercel**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### **2. Configurar Variables en Vercel**

1. Ve a: https://vercel.com/tu-proyecto/settings/environment-variables
2. Agrega **TODAS** las variables de `.env.local`
3. Marca: Production, Preview, Development
4. Guarda y redeploy

### **3. Configurar Webhook de Telegram**

```bash
curl -X POST "https://api.telegram.org/bot<TU_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://tu-dominio.vercel.app/api/telegram-webhook"}'
```

### **4. Verificar Deploy**

- ✅ Página carga correctamente
- ✅ Cursos se muestran desde Supabase
- ✅ Carrito funciona
- ✅ Pagos redirigen a Mercado Pago
- ✅ Post-compra otorga acceso y envía email
- ✅ Telegram bot responde a comandos

Ver: `DEPLOY-PRODUCCION.md` para más detalles.

---

## 📚 DOCUMENTACIÓN ADICIONAL

| Documento | Descripción |
|-----------|-------------|
| `DEPLOY-PRODUCCION.md` | Guía completa de deployment |
| `SUPABASE-STORAGE-SETUP.md` | Setup de Storage para imágenes |
| `SYSTEME-IO-CONFIGURACION-FINAL.md` | Configuración de systeme.io |
| `SYSTEME-IO-SISTEMA-FINAL.md` | Integración completa |
| `TELEGRAM-BOT-SETUP.md` | Setup del bot de Telegram |
| `TELEGRAM-COMANDOS-SETUP.md` | Configurar comandos en BotFather |
| `TELEGRAM-COMANDOS-AVANZADOS.md` | Comandos premium (/comparar, /objetivos, etc.) |
| `TELEGRAM-ALERTAS-INTELIGENTES.md` | Sistema de alertas automáticas |
| `TELEGRAM-SISTEMA-COMPLETO.md` | Sistema Telegram completo |
| `IMAGENES-SISTEMA-COMPLETO.md` | Sistema de gestión de imágenes |
| `OPTIMIZACIONES-COMPLETAS.md` | SEO, Performance, Conversión |
| `api/README.md` | Documentación de endpoints |
| `api/EMAIL_SETUP.md` | Configurar Brevo |

---

## 🔧 MANTENIMIENTO

### **Actualizar Dependencias**

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas
npm update

# Actualizar una específica
npm install react@latest
```

### **Logs y Debugging**

**Ver logs de Vercel:**
```bash
vercel logs
```

**Ver logs de Telegram Bot:**
- Los comandos loguean en consola de Vercel
- Ver en: https://vercel.com/tu-proyecto/logs

**Ver logs de Supabase:**
- Dashboard → Logs → API Logs

### **Backup de Base de Datos**

1. Ve a: https://app.supabase.com/project/tu-proyecto/database/backups
2. Click en "Download backup"
3. Guarda el archivo `.sql`

### **Comandos Útiles**

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview de build
npm run preview

# Tests
npm run test

# Linter
npm run lint
```

---

## 👥 EQUIPO DE DESARROLLO

- **Desarrollador Principal:** Diego Machado
- **Plataforma:** Reactivar Academy
- **Stack:** React + Supabase + Vercel

---

## 📄 LICENCIA

Este proyecto es privado y confidencial. Todos los derechos reservados.

---

## 🆘 SOPORTE

Si tienes problemas:

1. **Revisa la documentación** en la carpeta `docs/`
2. **Verifica las variables de entorno** en Vercel
3. **Consulta los logs** de Vercel/Supabase
4. **Lee los README** de cada carpeta (`api/`, `backend/`)

---

## 🎉 ¡LISTO PARA USAR!

Tu plataforma está completamente configurada y lista para producción.

**Próximos pasos sugeridos:**

1. ✅ Deploy a producción (Vercel)
2. ✅ Agregar cursos reales en Supabase
3. ✅ Configurar Mercado Pago con cuenta real
4. ✅ Personalizar imágenes y contenido
5. ✅ Configurar Google Analytics (opcional)
6. ✅ Configurar Meta Pixel para ads (opcional)
7. ✅ Registrar en Google Search Console

**¡Éxito con tu academia!** 🚀💪
