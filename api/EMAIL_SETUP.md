# Configuración del Servicio de Email con Brevo

Este proyecto utiliza [Brevo](https://www.brevo.com) (antes Sendinblue) para enviar emails automáticos cuando se compran capacitaciones.

## ¿Por qué Brevo?

- ✅ **Más generoso**: 300 emails/día gratis (9,000/mes) 🎯
- ✅ **Sin tarjeta de crédito**: Totalmente gratis para empezar
- ✅ **Features adicionales**: CRM, SMS (20 gratis), Marketing Automation
- ✅ **Perfecto para Vercel**: API RESTful serverless-friendly
- ✅ **Dashboard completo**: Analytics y estadísticas detalladas

## Paso 1: Crear cuenta en Brevo

1. Ve a [app.brevo.com/account/register](https://app.brevo.com/account/register)
2. Completa el formulario de registro:
   - Nombre
   - Email
   - Contraseña
3. Confirma tu email (revisa spam si no llega)
4. Completa el perfil inicial (nombre de empresa, uso previsto, etc.)

## Paso 2: Obtener API Key

1. Una vez dentro del dashboard de Brevo
2. Click en tu nombre arriba a la derecha
3. Selecciona "SMTP & API"
4. Baja hasta la sección "API Keys"
5. Click en "Generate a new API key"
6. Dale un nombre descriptivo (ej: "REACTIVAR-ACADEMY-PRODUCTION")
7. **¡IMPORTANTE!** Copia la API Key inmediatamente (solo se muestra una vez)

## Paso 3: Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Settings"
3. Click en "Environment Variables"
4. Agrega una nueva variable:
   - **Key**: `BREVO_API_KEY`
   - **Value**: Pega la API Key que copiaste de Brevo
   - **Environments**: Marca "Production", "Preview" y "Development"
5. Click en "Save"

## Paso 4: Verificar dominio (Opcional pero recomendado)

Por defecto, puedes usar cualquier email de remitente, pero para mejor deliverability (evitar spam), verifica tu dominio.

### Para usar tu propio dominio:

1. En Brevo Dashboard, ve a "Senders, Domains & Dedicated IPs"
2. Click en la pestaña "Domains"
3. Click en "Add a Domain"
4. Ingresa tu dominio (ej: `reactivar.com`)
5. Agrega los registros DNS que Brevo te indica en tu proveedor de dominios:
   - **SPF** (TXT record)
   - **DKIM** (CNAME records - 2 registros)
   - **DMARC** (TXT record - opcional)
6. Click en "Verify domain"
7. Espera la verificación (puede tomar de minutos a 48 horas)
8. Una vez verificado, actualiza el código en `api/send-course-email.js`:
   ```javascript
   sender: {
     name: 'REACTIVAR ACADEMY',
     email: 'noreply@tudominio.com' // Cambia por tu dominio verificado
   }
   ```

**Nota**: Mientras no verifiques dominio, puedes usar cualquier email y Brevo lo enviará igual, pero puede caer en spam.

## Paso 5: Redeploy

1. Una vez agregada la variable de entorno, haz un redeploy
2. En Vercel Dashboard, ve a "Deployments"
3. Click en los "..." del último deployment
4. Click en "Redeploy"

## Pruebas

Para probar que el email funciona:

1. Inicia sesión en la web (usa `admin@reactivar.com` / `admin123`)
2. Agrega al menos un curso al carrito
3. Procede al checkout y completa el pago con MercadoPago o PayPal
4. En la página de éxito, deberías ver "¡Email enviado exitosamente!"
5. Revisa tu bandeja de entrada (y spam)

## Troubleshooting

### "BREVO_API_KEY no configurada"

- Verifica que agregaste la variable `BREVO_API_KEY` en Vercel (no `RESEND_API_KEY`)
- Asegúrate de haber hecho redeploy después de agregarla
- Revisa que la API Key esté copiada correctamente (sin espacios)

### "Failed to send email" o Error 401

- Verifica que la API Key sea válida en Brevo Dashboard
- Asegúrate de que la API Key tenga permisos para enviar emails
- Revisa los logs en Vercel (ve a Deployments → Function Logs)

### "Account not activated" o límites de envío

- Completa la verificación de tu cuenta en Brevo
- Asegúrate de no haber excedido el límite de **300 emails/día** (9,000/mes)
- Revisa tu cuota en Brevo Dashboard → Account → Plan

### Los emails llegan a spam

- **Verifica tu dominio** en Brevo (Paso 4 arriba)
- Configura correctamente **SPF**, **DKIM** y **DMARC**
- Evita palabras spam en el asunto: "gratis", "urgente", "promoción"
- Agrega un link de "unsubscribe" si envías newsletters
- Usa un remitente consistente

### Error "Sender email not authorized"

- Si usás dominio propio sin verificar, puede dar error
- Solución temporal: usa un email genérico como `noreply@reactivaracademy.com`
- Solución permanente: verifica tu dominio (Paso 4)

## Ventajas de Brevo vs Otros Servicios

| Servicio | Emails Gratis | Marketing | CRM | SMS | Tarjeta |
|----------|---------------|-----------|-----|-----|---------|
| **Brevo** | **300/día (9,000/mes)** | ✅ | ✅ | ✅ 20 gratis | ❌ No |
| Resend | 100/día (3,000/mes) | ❌ | ❌ | ❌ | ❌ No |
| SendGrid | 100/día (3,000/mes) | ❌ | ❌ | ❌ | ✅ Sí |
| Mailgun | 100/mes después trial | ❌ | ❌ | ❌ | ✅ Sí |

## Características Adicionales de Brevo

### 📊 Analytics Dashboard
- Tasa de apertura
- Clicks en enlaces
- Bounces y spam reports
- Métricas en tiempo real

### 🤖 Marketing Automation
- Workflows automáticos
- Emails basados en eventos
- Segmentación de contactos

### 📱 SMS (20 gratis/mes)
- Envío de SMS transaccionales
- Perfecto para 2FA o notificaciones urgentes

### 📇 CRM Integrado
- Gestión de contactos
- Historial de interacciones
- Listas y segmentos

## Soporte

- **Documentación oficial**: [developers.brevo.com](https://developers.brevo.com)
- **API Reference**: [developers.brevo.com/reference](https://developers.brevo.com/reference/sendtransacemail)
- **Soporte**: contact@brevo.com
- **Status**: [status.brevo.com](https://status.brevo.com)
