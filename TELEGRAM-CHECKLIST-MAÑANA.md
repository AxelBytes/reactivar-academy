# ✅ CHECKLIST: ACTIVAR BOT DE TELEGRAM MAÑANA

**Tiempo total:** 15 minutos
**Fecha:** [Mañana]

---

## 📱 PARTE 1: CREAR EL BOT (5 minutos)

### ✅ **Paso 1.1: Abrir BotFather**
1. Abre **Telegram** (app o web)
2. En el buscador escribe: `@BotFather`
3. Click en el bot oficial (tiene check azul ✓)
4. Click **START** o **INICIAR**

### ✅ **Paso 1.2: Crear el Bot**
1. Envía el comando: `/newbot`
2. BotFather pregunta el nombre, envía:
   ```
   Reactivar Academy Ventas
   ```
3. BotFather pide el username, envía:
   ```
   reactivar_ventas_bot
   ```
   *(Si está ocupado, prueba: reactivar_ventas_2026_bot)*

### ✅ **Paso 1.3: COPIAR EL TOKEN** ⚠️ IMPORTANTE
BotFather te dará un mensaje como:
```
Done! Congratulations on your new bot.

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**COPIA ESE TOKEN Y GUÁRDALO EN UN ARCHIVO**

📝 Tu Token:
```
_________________________________
(Pégalo aquí para no perderlo)
```

---

## 🆔 PARTE 2: OBTENER TU CHAT ID (3 minutos)

### ✅ **Paso 2.1: Iniciar tu Bot**
1. En Telegram, busca tu bot: `@reactivar_ventas_bot`
2. Click **START**
3. Envía cualquier mensaje: "Hola"

### ✅ **Paso 2.2: Obtener el Chat ID**
1. En Telegram, busca: `@userinfobot`
2. Click **START**
3. El bot te dirá tu ID:
   ```
   Your ID: 123456789
   ```

**COPIA ESE NÚMERO**

📝 Tu Chat ID:
```
_________________________________
(Pégalo aquí)
```

---

## ⚙️ PARTE 3: CONFIGURAR EN TU PROYECTO (2 minutos)

### ✅ **Paso 3.1: Editar .env.local**
1. Abre el archivo: `.env.local` en tu proyecto
2. Al final del archivo, **REEMPLAZA** estas líneas:

**ANTES:**
```env
TELEGRAM_BOT_TOKEN=TU_TOKEN_AQUI
TELEGRAM_CHAT_ID=TU_CHAT_ID_AQUI
```

**DESPUÉS:** (con tus datos reales)
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHI
TELEGRAM_CHAT_ID=123456789
```

3. **GUARDA EL ARCHIVO** (Ctrl+S)

### ✅ **Paso 3.2: Reiniciar el Servidor**
1. En tu terminal donde corre `npm run dev`:
   - Presiona **Ctrl + C** (para detener)
2. Vuelve a ejecutar:
   ```bash
   npm run dev
   ```

---

## 🧪 PARTE 4: PROBAR LOCALMENTE (2 minutos)

### ✅ **Paso 4.1: Hacer una Compra de Prueba**
1. Ve a tu web local: `http://localhost:8080`
2. Agrega un curso al carrito
3. Haz checkout con una tarjeta de prueba de MercadoPago:
   - **Tarjeta:** 5031 7557 3453 0604
   - **Vencimiento:** 11/25
   - **CVV:** 123
   - **Nombre:** APRO
4. Completa la compra

### ✅ **Paso 4.2: Verificar Notificación**
1. Abre Telegram
2. **Deberías recibir la notificación de venta** 🎉

**Si NO recibes notificación:**
- Revisa la consola del navegador (F12)
- Revisa el terminal donde corre npm run dev
- Verifica que los tokens estén correctos en .env.local

---

## 🌐 PARTE 5: CONFIGURAR EN VERCEL (3 minutos)

### ✅ **Paso 5.1: Agregar Variables en Vercel**
1. Ve a: https://vercel.com
2. Click en tu proyecto
3. **Settings** → **Environment Variables**

4. **Agregar Variable 1:**
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: (pega tu token)
   - ✅ Production
   - ✅ Preview
   - Click **Save**

5. **Agregar Variable 2:**
   - Name: `TELEGRAM_CHAT_ID`
   - Value: (pega tu chat ID)
   - ✅ Production
   - Click **Save**

### ✅ **Paso 5.2: Redeploy**
1. En Vercel, ve a **Deployments**
2. Click en los **3 puntos (...)** del último deployment
3. Click **Redeploy**
4. Espera 1-2 minutos

---

## 🔗 PARTE 6: CONFIGURAR WEBHOOK (2 minutos)

### ✅ **Paso 6.1: Abrir Terminal/CMD**

### ✅ **Paso 6.2: Configurar el Webhook**
Copia este comando y **REEMPLAZA** con tus datos:

```bash
curl https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://<TU_WEB>.vercel.app/api/telegram-webhook
```

**EJEMPLO REAL:**
```bash
curl https://api.telegram.org/bot1234567890:ABCdefGHI/setWebhook?url=https://reactivar-academy.vercel.app/api/telegram-webhook
```

Presiona **Enter**

**Deberías ver:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

## 🎯 PARTE 7: CONFIGURAR COMANDOS (2 minutos)

### ✅ **Paso 7.1: Abrir BotFather de Nuevo**
1. Telegram → `@BotFather`
2. Envía: `/setcommands`
3. Selecciona tu bot

### ✅ **Paso 7.2: Enviar Lista de Comandos**
**COPIA Y PEGA EXACTAMENTE ESTO:**

```
dia - 📊 Reporte del día
semana - 📅 Reporte de la semana
mes - 📆 Reporte del mes
año - 📈 Reporte del año
stats - 💹 Estadísticas generales
help - ❓ Lista de comandos
```

**BotFather responderá:**
```
Success! Command list updated.
```

---

## ✅ PARTE 8: PROBAR TODO (2 minutos)

### ✅ **Paso 8.1: Probar Comandos**
1. Abre tu bot en Telegram
2. Escribe: `/help`
3. **Deberías ver la lista de comandos**

4. Escribe: `/stats`
5. **Deberías ver estadísticas**

### ✅ **Paso 8.2: Probar Compra Real**
1. Ve a tu web en producción: `https://tu-web.vercel.app`
2. Haz una compra de prueba
3. **Deberías recibir notificación en Telegram** 🎉

---

## 🎉 ¡LISTO!

Si todo funcionó, ahora tienes:
- ✅ Notificaciones automáticas de ventas
- ✅ Comandos de reportes funcionando
- ✅ Bot activo 24/7

---

## 🆘 SI ALGO NO FUNCIONA

### **Problema: No recibo notificaciones de ventas**

**Solución:**
1. Verifica en Vercel que las variables estén bien
2. Verifica que iniciaste el bot (START)
3. Revisa logs de Vercel:
   - Vercel → Tu proyecto → Logs
   - Busca errores con "telegram"

### **Problema: Comandos no responden**

**Solución:**
1. Verifica el webhook:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```
2. Debe mostrar tu URL de Vercel
3. Si no, repite Paso 6

### **Problema: "Token inválido"**

**Solución:**
1. Verifica que copiaste el token COMPLETO (incluye los :)
2. No debe tener espacios antes/después
3. Debe incluir el número Y las letras

---

## 📝 RESUMEN DE LO QUE NECESITAS

Para mañana ten a mano:
- 📱 Telegram instalado
- 💻 Acceso a tu proyecto
- 🌐 Acceso a Vercel
- ⏰ 15 minutos libres

---

## 🎯 ORDEN RECOMENDADO PARA MAÑANA

```
☐ 1. Crear bot en BotFather (5 min)
☐ 2. Obtener Chat ID (3 min)
☐ 3. Actualizar .env.local (2 min)
☐ 4. Probar localmente (2 min)
☐ 5. Configurar Vercel (3 min)
☐ 6. Configurar webhook (2 min)
☐ 7. Configurar comandos (2 min)
☐ 8. Probar todo (2 min)

TOTAL: 21 minutos (con margen)
```

---

## 💡 TIP

Imprime o guarda esta página para tenerla a mano mañana.

**¡Suerte! En 15-20 minutos tu bot estará funcionando perfectamente** 🚀
