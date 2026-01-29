# Reactivar Academy - Backend

Backend para integración con MercadoPago.

## 🚀 Deploy en Railway

1. Crear cuenta en Railway: https://railway.app
2. New Project → Deploy from GitHub repo
3. Seleccionar este repositorio (carpeta backend)
4. Agregar variables de entorno

## 🔐 Variables de Entorno Necesarias

```env
FRONTEND_URL=https://tu-app.vercel.app
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
NODE_ENV=production
```

## 📝 Desarrollo Local

```bash
npm install
npm run dev
```

## 🔗 Endpoints

- `GET /` - Info de la API
- `GET /health` - Health check
- `POST /api/payments/mercadopago/create-preference` - Crear preferencia de pago
- `POST /api/payments/mercadopago/webhook` - Webhook de MercadoPago
