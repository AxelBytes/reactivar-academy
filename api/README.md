# API - Vercel Serverless Functions

Funciones serverless para integración con MercadoPago.

## Endpoints

- `GET /api/health` - Health check
- `POST /api/payments/mercadopago/create-preference` - Crear preferencia de pago
- `POST /api/payments/mercadopago/webhook` - Webhook de MercadoPago

## Variables de Entorno Necesarias en Vercel

```
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
VITE_FRONTEND_URL=https://tu-app.vercel.app
```

## Notas

- Las funciones serverless en Vercel tienen un timeout de 10 segundos en el plan gratuito
- Los webhooks se procesan de forma asíncrona
