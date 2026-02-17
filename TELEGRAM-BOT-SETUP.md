# 🤖 Configuración Bot de Telegram PREMIUM

## ✨ CARACTERÍSTICAS

Tu bot de Telegram incluye:

- ✅ **Notificaciones de ventas en tiempo real**
- ✅ **Información completa del pedido**
- ✅ **Datos del cliente** (nombre, email, ubicación)
- ✅ **Detalles del pago** (método, monto, ID)
- ✅ **Lista de productos/cursos comprados**
- ✅ **Botones interactivos** para acceder al panel admin
- ✅ **Formato visual profesional** con emojis
- ✅ **Timestamp en hora argentina**
- ✅ **100% GRATIS** - Sin límites de mensajes

---

## 📋 SETUP (10 minutos)

### **PASO 1: Crear el Bot de Telegram** (3 min)

1. **Abre Telegram** (app o web)

2. **Busca a BotFather:**
   - Escribe en el buscador: `@BotFather`
   - Es el bot oficial de Telegram (tiene verificación azul ✓)

3. **Crea tu bot:**
   - Envía el comando: `/newbot`
   - BotFather te preguntará:

   ```
   BotFather: Alright, a new bot. How are we going to call it? 
              Please choose a name for your bot.
   
   Tú: Reactivar Academy Ventas
   (o el nombre que quieras)
   ```

   ```
   BotFather: Good. Now let's choose a username for your bot. 
              It must end in `bot`.
   
   Tú: reactivar_ventas_bot
   (debe ser único, si está tomado prueba otro)
   ```

4. **¡Listo!** BotFather te dará:
   ```
   Done! Congratulations on your new bot. 
   You will find it at t.me/reactivar_ventas_bot
   
   Use this token to access the HTTP API:
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   
   Keep your token secure and store it safely...
   ```

5. **COPIA Y GUARDA EL TOKEN** ← Muy importante
   ```
   Ejemplo: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

---

### **PASO 2: Obtener tu Chat ID** (2 min)

1. **Busca tu bot** en Telegram:
   - Busca: `@reactivar_ventas_bot` (el nombre que elegiste)
   - O usa el link que te dio BotFather

2. **Inicia conversación:**
   - Click en **"START"** o **"INICIAR"**
   - Envía cualquier mensaje, por ejemplo: "Hola"

3. **Obtén tu Chat ID:**
   - **Opción A:** Usar un bot helper
     - Busca: `@userinfobot`
     - Click START
     - Te dirá tu ID: `Your ID: 123456789`
   
   - **Opción B:** Usar la API
     - Abre tu navegador
     - Ve a:
       ```
       https://api.telegram.org/bot<TU_TOKEN>/getUpdates
       ```
     - Reemplaza `<TU_TOKEN>` con el token que te dio BotFather
     - Busca en el JSON: `"chat":{"id":123456789`
     - Ese número es tu Chat ID

4. **GUARDA TU CHAT ID**
   ```
   Ejemplo: 123456789
   ```

---

### **PASO 3: Configurar Variables de Entorno** (2 min)

#### **A) En Local (`.env.local`):**

Abre tu archivo `.env.local` y agrega estas dos líneas al final:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

**Reemplaza con tus valores reales:**
- `TELEGRAM_BOT_TOKEN` = El token que te dio BotFather
- `TELEGRAM_CHAT_ID` = Tu ID de chat

#### **B) En Producción (Vercel):**

1. Ve a [Vercel Dashboard](https://vercel.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas 2 variables:

   **Variable 1:**
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Value:** `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
   - ✅ Production
   - ✅ Preview
   - ✅ Development

   **Variable 2:**
   - **Name:** `TELEGRAM_CHAT_ID`
   - **Value:** `123456789`
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **"Save"**
6. **Redeploy** el proyecto (Deployments → ... → Redeploy)

---

### **PASO 4: Probar el Bot** (3 min)

1. **Reinicia tu servidor local:**
   ```bash
   # Detener (Ctrl + C)
   # Volver a iniciar:
   npm run dev
   ```

2. **Haz una compra de prueba:**
   - Agrega un curso al carrito
   - Completa el checkout
   - Usa tarjeta de prueba de MercadoPago

3. **Verifica en Telegram:**
   - Deberías recibir un mensaje como este:

   ```
   🎉 ¡NUEVA VENTA!

   ━━━━━━━━━━━━━━━━━━━

   📦 PEDIDO #12345
   ✅ Estado: Completado
   💵 Total: $150,000 ARS
   💳 Método: MercadoPago
   🔖 ID de Pago: `1234567890`

   ━━━━━━━━━━━━━━━━━━━

   👤 CLIENTE
   📧 cliente@ejemplo.com
   👨‍💼 Juan Pérez
   🌍 Buenos Aires, CABA, Argentina

   ━━━━━━━━━━━━━━━━━━━

   🛒 ITEMS COMPRADOS (1)

   1. Curso de Entrenamiento - $150,000

   ━━━━━━━━━━━━━━━━━━━

   ⏰ miércoles, 29 de enero de 2026, 14:30
   ```

4. **Haz click en el botón** "📊 Ver en Panel Admin" para abrir tu panel

---

## 🎯 TIPOS DE NOTIFICACIONES

Tu bot enviará notificaciones para:

### **1. Nueva Venta** 🎉
- Cuando alguien completa una compra
- Con todos los detalles del pedido
- Botones para ver en panel admin

### **2. Pago Fallido** ❌
- Cuando un pago es rechazado
- Con información del intento
- Para que puedas hacer seguimiento

### **3. Stock Bajo** ⚠️
- Cuando un producto físico tiene poco stock
- Para que puedas reordenar

---

## 🎨 PERSONALIZACIÓN

### **Cambiar el mensaje de venta:**

Edita el archivo `api/telegram-notify.js` línea ~60:

```javascript
message = `
🎉 *¡TU MENSAJE PERSONALIZADO!*

[... resto del mensaje ...]
`;
```

### **Agregar más botones:**

En `api/telegram-notify.js` línea ~100:

```javascript
buttons = [
  [
    { text: '📊 Ver en Panel', url: adminUrl }
  ],
  [
    { text: '✅ Tu Botón', callback_data: 'tu_accion' }
  ]
];
```

### **Enviar a múltiples personas:**

En `.env.local` puedes usar IDs separados por coma:

```env
TELEGRAM_CHAT_ID=123456789,987654321,555555555
```

Y modificar el código para enviar a todos.

---

## 🔧 TROUBLESHOOTING

### ❌ **"No recibo notificaciones"**

**Solución:**
1. Verifica que iniciaste el bot (enviaste START)
2. Verifica las variables en `.env.local`
3. Reinicia el servidor: `Ctrl+C` y `npm run dev`
4. Revisa la consola del navegador (F12)
5. Revisa logs del terminal

### ❌ **"Error: Chat not found"**

**Solución:**
1. Asegúrate de haber enviado START al bot
2. Verifica que el Chat ID sea correcto
3. El Chat ID es un número, no debe tener comillas en el código

### ❌ **"Error: Unauthorized"**

**Solución:**
1. Verifica que el token sea correcto
2. No debe tener espacios antes/después
3. Debe incluir los dos puntos (:) en el token

---

## 📱 COMANDOS ÚTILES PARA TU BOT

Puedes agregar comandos personalizados:

1. **Habla con BotFather:**
   - `/setcommands`
   - Selecciona tu bot
   - Envía:
   ```
   stats - Ver estadísticas de ventas
   orders - Ver últimos pedidos
   help - Ayuda
   ```

2. **Implementa los comandos** en el código (opcional)

---

## 🚀 PRÓXIMOS PASOS

Una vez que funcione:

1. ✅ **Personaliza el mensaje** con tu marca
2. ✅ **Agrega emojis** personalizados
3. ✅ **Configura alertas** adicionales (stock bajo, etc.)
4. ✅ **Invita a tu equipo** agregando sus Chat IDs

---

## 💡 EXTRAS PREMIUM

### **Enviar imágenes con la notificación:**

```javascript
// En lugar de sendMessage, usa sendPhoto
const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

const payload = {
  chat_id: TELEGRAM_CHAT_ID,
  photo: 'URL_DE_LA_IMAGEN',
  caption: message,
  parse_mode: 'Markdown'
};
```

### **Enviar documentos (factura PDF):**

```javascript
const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
```

---

## 🎉 ¡LISTO!

Tu bot de Telegram está configurado y funcionando.

**Cada vez que alguien compre:**
- 🔔 Recibirás notificación instantánea
- 📊 Con todos los detalles
- 🎯 Con botones para acceder rápido
- 💯 100% gratis y sin límites

**¿Preguntas?** Revisa la sección de Troubleshooting o consulta los logs.
