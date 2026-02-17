# 📚 ÍNDICE DE DOCUMENTACIÓN

> Guía rápida para encontrar la documentación que necesitas

---

## 🚀 INICIO RÁPIDO

| Documento | Cuándo usarlo |
|-----------|---------------|
| `../README.md` | **Primero que debes leer** - Overview completo del proyecto |
| `../CONTRIBUTING.md` | **Para nuevos desarrolladores** - Guía para empezar a desarrollar |

---

## 📖 DOCUMENTACIÓN POR TEMA

### **🚀 DEPLOYMENT Y PRODUCCIÓN**

- **`DEPLOY-PRODUCCION.md`** - Guía completa para deployar a Vercel
  - Configurar variables de entorno
  - Configurar dominios
  - Troubleshooting de deploy

---

### **🗄️ BASE DE DATOS**

- **`SUPABASE-STORAGE-SETUP.md`** - Configurar Storage para imágenes
  - Crear bucket público
  - Políticas RLS
  - SQL de configuración rápida

**SQL Scripts (en carpeta raíz):**
- `supabase-systeme-product-id.sql` - Agregar columna para IDs de systeme.io
- `supabase-storage-setup.sql` - Setup completo de Storage
- `supabase-add-systeme-tag.sql` - Agregar columna para tags

---

### **🎓 INTEGRACIÓN CON SYSTEME.IO**

- **`SYSTEME-IO-SISTEMA-FINAL.md`** - **LEER PRIMERO** - Guía completa de integración
  - Cómo funciona el sistema
  - Configuración paso a paso
  - Flujo completo de automatización

- **`SYSTEME-IO-CONFIGURACION-FINAL.md`** - Configuración detallada
  - Obtener API Key
  - Obtener Product IDs
  - Agregar IDs a Supabase

---

### **🖼️ SISTEMA DE IMÁGENES**

- **`IMAGENES-SISTEMA-COMPLETO.md`** - Sistema de gestión de imágenes
  - Upload desde panel admin
  - Optimización automática
  - Almacenamiento en Supabase Storage

---

### **📱 BOT DE TELEGRAM**

**Setup inicial:**
- **`TELEGRAM-BOT-SETUP.md`** - **LEER PRIMERO** - Setup completo del bot
  - Crear bot con BotFather
  - Obtener tokens
  - Configurar webhook

- **`TELEGRAM-COMANDOS-SETUP.md`** - Configurar comandos en BotFather
  - Lista de comandos para copy-paste
  - Cómo actualizar comandos

**Features:**
- **`TELEGRAM-SISTEMA-COMPLETO.md`** - Sistema completo de notificaciones
  - Notificaciones de ventas
  - Comandos de reportes
  - Alertas inteligentes

- **`TELEGRAM-COMANDOS-AVANZADOS.md`** - Comandos premium
  - `/comparar` - Comparar períodos
  - `/objetivos` - Progreso de metas
  - `/producto` - Stats por curso
  - `/exportar` - Exportar a CSV

- **`TELEGRAM-ALERTAS-INTELIGENTES.md`** - Alertas automáticas
  - 🎯 Meta diaria alcanzada
  - 🏆 Record de ventas
  - ☕ Primera venta del día
  - 👑 Cliente VIP
  - 🔥 Horario pico
  - 🚀 Producto viral

---

### **⚡ OPTIMIZACIONES**

- **`OPTIMIZACIONES-COMPLETAS.md`** - SEO, Performance, Conversión
  - SEO (meta tags, Open Graph, structured data)
  - Performance (lazy loading, code splitting)
  - Conversión (CTAs, urgencia, prueba social)
  - Analytics (Google Analytics, Meta Pixel)
  - Animaciones CSS
  - Accesibilidad
  - PWA

---

## 🔍 BUSCAR POR TAREA

### **"Quiero deployar a producción"**
→ Lee: `DEPLOY-PRODUCCION.md`

### **"Quiero agregar un nuevo curso"**
1. Crea el curso en systeme.io
2. Copia el `systeme_product_id`
3. Agrégalo en el panel admin (`/admin`)
4. Ver: `SYSTEME-IO-SISTEMA-FINAL.md` para detalles

### **"Quiero configurar el bot de Telegram"**
1. Lee: `TELEGRAM-BOT-SETUP.md`
2. Luego: `TELEGRAM-COMANDOS-SETUP.md`
3. Test con `/help` en Telegram

### **"Quiero subir imágenes de cursos"**
1. Lee: `IMAGENES-SISTEMA-COMPLETO.md`
2. Ve a `/admin` → Edita curso → Upload imagen

### **"Quiero optimizar el SEO"**
→ Lee: `OPTIMIZACIONES-COMPLETAS.md` (Sección 1: SEO)
→ Ya está implementado, solo configurar Analytics IDs

### **"Algo no funciona en producción"**
1. Ve a Vercel → Logs
2. Lee: `DEPLOY-PRODUCCION.md` (Sección: Verificar Deploy)
3. Revisa variables de entorno en Vercel

---

## 📁 ESTRUCTURA DE DOCUMENTOS

```
reactivar-academy/
├── README.md                    # 👈 Overview del proyecto
├── CONTRIBUTING.md              # 👈 Guía para desarrolladores
│
├── docs/                        # 📚 Documentación detallada
│   ├── INDEX.md                 # 👈 Este archivo
│   ├── DEPLOY-PRODUCCION.md
│   ├── IMAGENES-SISTEMA-COMPLETO.md
│   ├── OPTIMIZACIONES-COMPLETAS.md
│   ├── SUPABASE-STORAGE-SETUP.md
│   ├── SYSTEME-IO-CONFIGURACION-FINAL.md
│   ├── SYSTEME-IO-SISTEMA-FINAL.md
│   ├── TELEGRAM-ALERTAS-INTELIGENTES.md
│   ├── TELEGRAM-BOT-SETUP.md
│   ├── TELEGRAM-COMANDOS-AVANZADOS.md
│   ├── TELEGRAM-COMANDOS-SETUP.md
│   └── TELEGRAM-SISTEMA-COMPLETO.md
│
├── api/
│   ├── README.md                # Documentación de endpoints
│   └── EMAIL_SETUP.md           # Setup de Brevo
│
└── backend/
    └── README.md                # (No usado actualmente)
```

---

## 🆘 AYUDA RÁPIDA

| Problema | Dónde buscar |
|----------|--------------|
| Error en deploy | `DEPLOY-PRODUCCION.md` |
| Bot no responde | `TELEGRAM-BOT-SETUP.md` → Sección "Troubleshooting" |
| Curso no se asigna | `SYSTEME-IO-SISTEMA-FINAL.md` → Sección "Problemas Comunes" |
| Imagen no sube | `IMAGENES-SISTEMA-COMPLETO.md` → Sección "Troubleshooting" |
| SEO no funciona | `OPTIMIZACIONES-COMPLETAS.md` → Sección "Verificar SEO" |

---

## 📝 NOTAS

- Todos los documentos están en **español**
- Los documentos con "FINAL" o "COMPLETO" son las versiones más actualizadas
- Si encuentras información contradictoria, confía en los documentos más recientes
- Cuando hagas cambios importantes, actualiza la documentación correspondiente

---

**¿No encuentras lo que buscas?**
1. Busca en todos los archivos: `grep -r "palabra clave" docs/`
2. Revisa el `README.md` principal
3. Consulta con el equipo

---

**Última actualización:** Febrero 2026
