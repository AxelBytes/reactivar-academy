# Guía de Integración de Pasarelas de Pago

## 🎯 Opciones de Pago Disponibles

1. **MercadoPago** (Recomendado para LATAM)
2. **PayPal** (Internacional)
3. **Tarjeta de Crédito/Débito** (Procesamiento directo)

---

## 💳 1. MercadoPago

### ¿Qué incluye MercadoPago?
- ✅ Tarjetas de crédito (todas las marcas)
- ✅ Tarjetas de débito
- ✅ Efectivo (Rapipago, Pago Fácil, etc.)
- ✅ Transferencia bancaria
- ✅ Billeteras digitales
- ✅ Cuotas sin interés

### Paso 1: Crear Cuenta en MercadoPago
1. Registrarse en https://www.mercadopago.com.ar/developers
2. Crear una aplicación
3. Obtener credenciales:
   - **Public Key**: Para el frontend
   - **Access Token**: Para el backend

### Paso 2: Instalar SDK

```bash
npm install @mercadopago/sdk-react
```

### Paso 3: Configurar en el Frontend

#### A. Configurar MercadoPago Provider

```tsx
// src/main.tsx
import { initMercadoPago } from '@mercadopago/sdk-react';

// Inicializar con tu Public Key
initMercadoPago('TU_PUBLIC_KEY');

// ... resto del código
```

#### B. Actualizar CheckoutDialog.tsx

```tsx
import { Payment } from '@mercadopago/sdk-react';

// Dentro del componente CheckoutDialog
const handleMercadoPago = async () => {
  setIsProcessing(true);

  try {
    // Crear preferencia de pago en el backend
    const response = await fetch('/api/payments/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        items: items.map(item => ({
          id: item.id,
          title: item.type === 'product' ? item.name : item.title,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'ARS', // o tu moneda
        })),
        payer: {
          name: user?.name,
          email: user?.email,
        },
      }),
    });

    const data = await response.json();

    if (data.preferenceId) {
      // Redirigir al checkout de MercadoPago
      window.location.href = data.initPoint;
    }
  } catch (error) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    toast({
      title: "Error",
      description: "No se pudo iniciar el pago. Intenta nuevamente.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};
```

### Paso 4: Configurar Backend (Ejemplo Node.js)

```javascript
// backend/routes/payments.js
const mercadopago = require('mercadopago');

// Configurar con Access Token
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

// Endpoint para crear preferencia
app.post('/api/payments/mercadopago/create-preference', async (req, res) => {
  try {
    const { items, payer } = req.body;

    const preference = {
      items: items,
      payer: {
        name: payer.name,
        email: payer.email,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/success`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/mercadopago/webhook`,
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
    });
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
});

// Webhook para notificaciones de pago
app.post('/api/payments/mercadopago/webhook', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const paymentId = data.id;
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === 'approved') {
        // Pago aprobado - Actualizar orden en BD
        // Enviar email de confirmación
        // Dar acceso a cursos si aplica
        
        console.log('Pago aprobado:', payment.body);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.sendStatus(200);
});
```

### Variables de Entorno (.env)

```env
# MercadoPago
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 💰 2. PayPal

### ¿Qué incluye PayPal?
- ✅ Cuenta PayPal
- ✅ Tarjetas de crédito (sin cuenta PayPal)
- ✅ Tarjetas de débito
- ✅ Pago en cuotas (según país)

### Paso 1: Crear Cuenta en PayPal
1. Registrarse en https://developer.paypal.com
2. Crear una aplicación
3. Obtener credenciales:
   - **Client ID**: Para el frontend
   - **Secret**: Para el backend

### Paso 2: Instalar SDK

```bash
npm install @paypal/react-paypal-js
```

### Paso 3: Configurar en el Frontend

#### A. Configurar PayPal Provider

```tsx
// src/main.tsx o src/App.tsx
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const paypalOptions = {
  'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: 'USD', // o tu moneda
  intent: 'capture',
};

const App = () => (
  <PayPalScriptProvider options={paypalOptions}>
    {/* Resto de tu app */}
  </PayPalScriptProvider>
);
```

#### B. Crear componente PayPal Button

```tsx
// src/components/checkout/PayPalButton.tsx
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  onSuccess: () => void;
}

const PayPalButton = ({ onSuccess }: PayPalButtonProps) => {
  const { items, getTotal } = useCart();
  const { toast } = useToast();

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          total: getTotal(),
        }),
      });

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      });

      const details = await response.json();

      if (details.status === 'COMPLETED') {
        toast({
          title: '¡Pago exitoso!',
          description: 'Tu pedido ha sido procesado correctamente.',
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar el pago.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
      }}
    />
  );
};

export default PayPalButton;
```

#### C. Usar en CheckoutDialog

```tsx
// En CheckoutDialog.tsx, cuando se selecciona PayPal:
{paymentMethod === 'paypal' && (
  <PayPalButton 
    onSuccess={() => {
      clearCart();
      onOpenChange(false);
    }} 
  />
)}
```

### Paso 4: Configurar Backend

```javascript
// backend/routes/payments.js
const paypal = require('@paypal/checkout-server-sdk');

// Configurar PayPal
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  // En producción: return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

const client = new paypal.core.PayPalHttpClient(environment());

// Crear orden
app.post('/api/payments/paypal/create-order', async (req, res) => {
  try {
    const { items, total } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (total / 1000).toFixed(2), // Convertir según tu moneda
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: (total / 1000).toFixed(2),
            },
          },
        },
        items: items.map(item => ({
          name: item.type === 'product' ? item.name : item.title,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: 'USD',
            value: (item.price / 1000).toFixed(2),
          },
        })),
      }],
    });

    const order = await client.execute(request);
    res.json({ orderId: order.result.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Error al crear orden de PayPal' });
  }
});

// Capturar pago
app.post('/api/payments/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await client.execute(request);

    // Guardar en BD, enviar email, etc.
    console.log('PayPal payment captured:', capture.result);

    res.json(capture.result);
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: 'Error al capturar pago de PayPal' });
  }
});
```

### Variables de Entorno (.env)

```env
# PayPal
PAYPAL_CLIENT_ID=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxT
PAYPAL_CLIENT_SECRET=ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxP
```

---

## 💳 3. Tarjeta de Crédito Directa

### Opciones de Procesamiento:

#### A. **Stripe** (Recomendado)
- Fácil integración
- Mejor UX
- Fees competitivos

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### B. **Implementación Actual**
El formulario de tarjeta actual es solo UI. Para hacerlo funcional:

1. **NO proceses tarjetas en tu backend** (requiere PCI compliance)
2. **USA un procesador certificado** (Stripe, MercadoPago, etc.)
3. **Tokeniza los datos** antes de enviar

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE

1. **NUNCA guardes información de tarjetas** en tu base de datos
2. **USA HTTPS** en producción
3. **Valida en el backend** todos los pagos
4. **Implementa webhooks** para notificaciones
5. **Rate limiting** en endpoints de pago
6. **Logs de auditoría** para todas las transacciones

---

## 📋 Flujo Completo Recomendado

```
1. Usuario agrega items al carrito
2. Click en "Finalizar Compra"
3. Selecciona método de pago:
   
   A. MercadoPago:
      - Frontend crea preferencia → Backend
      - Backend crea preferencia con MercadoPago API
      - Usuario redirigido a checkout de MercadoPago
      - MercadoPago procesa pago
      - Webhook notifica al backend
      - Backend actualiza orden y envía email
      - Usuario redirigido a página de éxito
   
   B. PayPal:
      - Frontend crea orden → Backend
      - Backend crea orden con PayPal API
      - PayPal muestra botones de pago
      - Usuario paga con PayPal o tarjeta
      - Frontend captura pago → Backend
      - Backend confirma con PayPal API
      - Backend actualiza orden y envía email
      
   C. Tarjeta (con Stripe):
      - Frontend tokeniza tarjeta con Stripe.js
      - Token enviado al backend
      - Backend crea cargo con Stripe API
      - Respuesta procesada
      - Backend actualiza orden y envía email
```

---

## 🧪 Testing

### MercadoPago - Tarjetas de Prueba
```
Tarjeta aprobada:
- Número: 5031 7557 3453 0604
- CVV: 123
- Fecha: 11/25

Tarjeta rechazada:
- Número: 5031 4332 1540 6351
- CVV: 123
- Fecha: 11/25
```

### PayPal - Cuentas de Prueba
Usa las cuentas sandbox que creas en el Developer Dashboard de PayPal.

---

## 📊 Comparación de Pasarelas

| Característica | MercadoPago | PayPal | Stripe |
|----------------|-------------|---------|---------|
| Mejor para | LATAM | Internacional | Global |
| Comisión | 3.99% + $2 | 3.4% + fee fijo | 2.9% + $0.30 |
| Métodos de pago | Muchos | Medio | Solo tarjetas |
| Integración | Media | Fácil | Fácil |
| Documentación | Buena | Excelente | Excelente |
| Soporte | Español | Multi-idioma | Inglés |

---

## ✅ Próximos Pasos

1. ✅ Interfaz de checkout creada
2. ⏳ Elegir pasarela(s) según tu mercado
3. ⏳ Crear cuenta en la pasarela elegida
4. ⏳ Obtener credenciales (sandbox/test)
5. ⏳ Implementar integración en backend
6. ⏳ Configurar webhooks
7. ⏳ Testing exhaustivo
8. ⏳ Pasar a producción

---

## 📞 Recursos Adicionales

- **MercadoPago**: https://www.mercadopago.com.ar/developers
- **PayPal**: https://developer.paypal.com
- **Stripe**: https://stripe.com/docs

---

¿Necesitas ayuda con la implementación? Consulta la documentación oficial de cada pasarela o contacta con su soporte técnico.
