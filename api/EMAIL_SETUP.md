# Configuración del Servicio de Email con Resend

Este proyecto utiliza [Resend](https://resend.com) para enviar emails automáticos cuando se compran capacitaciones.

## ¿Por qué Resend?

- ✅ **Gratuito**: 100 emails/día gratis (3,000/mes)
- ✅ **Fácil integración**: API simple y directa
- ✅ **Perfecto para Vercel**: Diseñado específicamente para serverless
- ✅ **Sin configuración SMTP**: No necesitas configurar servidores de correo

## Paso 1: Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Haz click en "Sign Up" (puedes usar GitHub)
3. Confirma tu email

## Paso 2: Obtener API Key

1. Una vez dentro del dashboard de Resend
2. Ve a "API Keys" en el menú lateral
3. Click en "Create API Key"
4. Dale un nombre descriptivo (ej: "REACTIVAR-ACADEMY-PROD")
5. Copia la API Key (guárdala en un lugar seguro)

## Paso 3: Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en "Settings"
3. Click en "Environment Variables"
4. Agrega una nueva variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: Pega la API Key que copiaste
   - **Environments**: Marca "Production" y "Preview"
5. Click en "Save"

## Paso 4: Verificar dominio (Opcional pero recomendado)

Por defecto, Resend usa el dominio `onboarding@resend.dev` para enviar emails, pero estos pueden caer en spam.

### Para usar tu propio dominio:

1. En Resend Dashboard, ve a "Domains"
2. Click en "Add Domain"
3. Ingresa tu dominio (ej: `reactivar.com`)
4. Agrega los registros DNS que Resend te indica:
   - SPF
   - DKIM
   - DMARC (opcional)
5. Espera la verificación (puede tomar hasta 48 horas)
6. Una vez verificado, actualiza el código en `api/send-course-email.js`:
   ```javascript
   from: 'REACTIVAR ACADEMY <noreply@tudominio.com>', // Cambia esto
   ```

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

### "RESEND_API_KEY no configurada"

- Verifica que agregaste la variable en Vercel
- Asegúrate de haber hecho redeploy después de agregarla

### "Failed to send email"

- Verifica que la API Key sea válida
- Revisa los logs en Vercel (ve a Deployments → Function Logs)
- Asegúrate de no haber excedido el límite de 100 emails/día

### Los emails llegan a spam

- Verifica tu propio dominio en Resend
- Configura SPF, DKIM y DMARC
- Evita palabras como "gratis", "urgente" en el asunto

## Alternativas a Resend

Si prefieres otro servicio:

- **SendGrid**: Hasta 100 emails/día gratis
- **Mailgun**: Hasta 5,000 emails/mes gratis (primeros 3 meses)
- **Amazon SES**: $0.10 por 1,000 emails

Solo necesitas cambiar el código en `api/send-course-email.js` para usar la API del servicio elegido.

## Soporte

Si tienes problemas, contacta a soporte de Resend en support@resend.com o revisa su [documentación oficial](https://resend.com/docs).
