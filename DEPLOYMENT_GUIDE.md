# Guía de Deployment - Hosting Gratuito

## 🚀 Deploy Frontend en Vercel (RECOMENDADO)

### Ventajas de Vercel:
- ✅ Deploy en menos de 5 minutos
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Dominio gratis: `tu-app.vercel.app`
- ✅ Build automático de Vite/React
- ✅ Variables de entorno
- ✅ Preview deployments para cada commit

---

## 📋 Paso 1: Preparar el Proyecto

### 1.1. Inicializar Git (si no lo has hecho)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1.2. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un repositorio (ej: `reactivar-academy`)
3. No inicialices con README (ya tienes código)
4. Copia la URL del repositorio

### 1.3. Subir código a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/reactivar-academy.git
git branch -M main
git push -u origin main
```

---

## 📋 Paso 2: Deploy en Vercel

### 2.1. Crear cuenta en Vercel

1. Ve a https://vercel.com
2. Click en "Sign Up"
3. Registrate con tu cuenta de GitHub (más fácil)

### 2.2. Importar proyecto

1. En el dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Vite

### 2.3. Configurar proyecto

Vercel detectará automáticamente estas configuraciones:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**No cambies nada**, Vercel ya sabe cómo hacer el build.

### 2.4. Variables de Entorno (Opcional por ahora)

Si necesitas variables de entorno:

1. Click en "Environment Variables"
2. Agrega:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx
   ```

### 2.5. Deploy

1. Click en **"Deploy"**
2. Espera 1-2 minutos mientras hace el build
3. ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

---

## 🔧 Configuración Post-Deploy

### Configurar dominio personalizado (Opcional)

1. En el dashboard de tu proyecto en Vercel
2. Ve a "Settings" → "Domains"
3. Agrega tu dominio personalizado si tienes uno

### Configurar redirects para React Router

Vercel maneja esto automáticamente, pero si tienes problemas, crea:

**`vercel.json`** en la raíz del proyecto:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🖥️ Deploy Backend en Railway (GRATIS)

Para MercadoPago necesitas un backend que maneje webhooks.

### Ventajas de Railway:
- ✅ $5 de crédito gratis por mes
- ✅ Suficiente para tu app
- ✅ HTTPS automático
- ✅ Base de datos PostgreSQL incluida
- ✅ Variables de entorno
- ✅ Deploy desde GitHub

### Paso 1: Crear Backend

Primero necesitas crear un backend básico. Aquí un ejemplo con Express:

**Estructura del backend:**
```
backend/
├── package.json
├── server.js
├── routes/
│   └── payments.js
└── .env
```

**`backend/package.json`:**
```json
{
  "name": "reactivar-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mercadopago": "^2.0.1"
  }
}
```

**`backend/server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/payments', require('./routes/payments'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**`backend/routes/payments.js`:**
```javascript
const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

// Configurar MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Crear preferencia de pago
router.post('/mercadopago/create-preference', async (req, res) => {
  try {
    const { items, payer } = req.body;

    const preference = {
      items: items.map(item => ({
        id: item.id.toString(),
        title: item.name || item.title,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'ARS'
      })),
      payer: {
        email: payer.email,
        name: payer.name
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/success`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL}/checkout/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/mercadopago/webhook`,
      statement_descriptor: 'Reactivar Academy'
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      id: response.body.id,
      init_point: response.body.init_point
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
});

// Webhook de MercadoPago
router.post('/mercadopago/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await mercadopago.payment.findById(paymentId);
      
      console.log('Payment received:', payment.body);

      if (payment.body.status === 'approved') {
        // Aquí: Guardar en BD, enviar email, dar acceso a cursos
        console.log('Payment approved!');
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
```

**`backend/.env`:**
```env
PORT=3000
FRONTEND_URL=https://tu-proyecto.vercel.app
BACKEND_URL=https://tu-backend.railway.app
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx-xxxxx
```

### Paso 2: Subir Backend a Railway

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Sign up con GitHub

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio del backend

3. **Configurar variables de entorno**
   - En el dashboard del proyecto, click en "Variables"
   - Agrega:
     ```
     FRONTEND_URL=https://tu-proyecto.vercel.app
     MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx
     NODE_ENV=production
     ```

4. **Deploy automático**
   - Railway detectará Node.js y hará el deploy automáticamente
   - Tu backend estará en: `https://tu-backend.railway.app`

---

## 🔗 Conectar Frontend con Backend

### Actualizar Frontend

**Crear `.env.production` en la raíz del frontend:**

```env
VITE_API_URL=https://tu-backend.railway.app
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx
```

**Actualizar `CheckoutDialog.tsx`:**

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const handleMercadoPago = async () => {
  setIsProcessing(true);

  try {
    const response = await fetch(`${API_URL}/api/payments/mercadopago/create-preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          id: item.id,
          name: item.type === 'product' ? item.name : item.title,
          quantity: item.quantity,
          price: item.price,
        })),
        payer: {
          email: user?.email || 'test@email.com',
          name: user?.name || 'Usuario',
        },
      }),
    });

    const data = await response.json();

    if (data.init_point) {
      // Redirigir a MercadoPago
      window.location.href = data.init_point;
    }
  } catch (error) {
    console.error('Error:', error);
    toast({
      title: "Error",
      description: "No se pudo iniciar el pago.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};
```

**Commit y push:**
```bash
git add .
git commit -m "Add production API URL"
git push
```

Vercel redesplegará automáticamente con los cambios.

---

## 🔑 Obtener Credenciales de MercadoPago

### Modo TEST (Para probar)

1. Ve a https://www.mercadopago.com.ar/developers
2. Crea una cuenta o inicia sesión
3. Ve a "Tus aplicaciones" → "Crear aplicación"
4. Obtén tus credenciales de TEST:
   - **Public Key**: `TEST-xxxxx` (para el frontend)
   - **Access Token**: `TEST-xxxxx` (para el backend)

### Configurar en Vercel y Railway

**Vercel (Frontend):**
1. Dashboard → Settings → Environment Variables
2. Agregar:
   ```
   VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx
   VITE_API_URL=https://tu-backend.railway.app
   ```

**Railway (Backend):**
1. Dashboard → Variables
2. Agregar:
   ```
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx
   FRONTEND_URL=https://tu-proyecto.vercel.app
   ```

---

## ✅ Checklist de Deploy

### Frontend (Vercel)
- [ ] Código subido a GitHub
- [ ] Proyecto creado en Vercel
- [ ] Deploy exitoso
- [ ] Variables de entorno configuradas
- [ ] URL funcionando: `https://tu-proyecto.vercel.app`

### Backend (Railway)
- [ ] Backend creado con Express
- [ ] Código subido a GitHub (repo separado o monorepo)
- [ ] Proyecto creado en Railway
- [ ] Variables de entorno configuradas
- [ ] Endpoint de health check funcionando
- [ ] URL del backend: `https://tu-backend.railway.app`

### MercadoPago
- [ ] Cuenta creada en MercadoPago Developers
- [ ] Aplicación creada
- [ ] Credenciales TEST obtenidas
- [ ] Public Key en Vercel
- [ ] Access Token en Railway
- [ ] URLs de retorno configuradas
- [ ] Webhook URL configurada

---

## 🧪 Testing en Producción

### Tarjetas de Prueba MercadoPago

**Tarjeta Aprobada:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: APRO
```

**Tarjeta Rechazada:**
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha: 11/25
Nombre: OTHE
```

### Flujo de Prueba Completo:

1. Ve a tu app en producción
2. Agrega productos/cursos al carrito
3. Click en "Finalizar Compra"
4. Selecciona "MercadoPago"
5. Serás redirigido a la página de MercadoPago
6. Usa tarjeta de prueba
7. Completa el pago
8. Serás redirigido a tu app
9. Verifica en el dashboard de MercadoPago que el pago se registró

---

## 🔄 Deploy Continuo

Cada vez que hagas push a GitHub:
- **Vercel** redesplegará automáticamente el frontend
- **Railway** redesplegará automáticamente el backend

```bash
git add .
git commit -m "Feature: nuevo cambio"
git push
```

¡Y listo! Los cambios estarán en producción en 1-2 minutos.

---

## 🆘 Problemas Comunes

### Error: "Cannot GET /"
- Vercel no configurado para SPA
- Solución: Crear `vercel.json` con rewrites

### Error: CORS
- Backend no permite origen del frontend
- Solución: Agregar URL de Vercel en CORS del backend

### Error: 404 en API
- URL del backend incorrecta
- Solución: Verificar `VITE_API_URL` en Vercel

### Webhook no funciona
- URL del webhook incorrecta en MercadoPago
- Solución: Debe ser `https://tu-backend.railway.app/api/payments/mercadopago/webhook`

---

## 📞 Soporte

- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **MercadoPago**: https://www.mercadopago.com.ar/developers/es/docs

---

¡Tu app estará en producción en menos de 30 minutos! 🚀
