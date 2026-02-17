# 📊 COMANDOS DE REPORTES - Bot de Telegram

## ✨ NUEVAS FUNCIONALIDADES

Además de recibir notificaciones automáticas de ventas, ahora puedes pedirle reportes al bot usando comandos.

---

## 🎯 COMANDOS DISPONIBLES

### **📅 Reportes Básicos:**

| Comando | Descripción | Info Incluida |
|---------|-------------|---------------|
| `/dia` | Reporte del día actual | Ventas, órdenes, top productos, métodos de pago |
| `/semana` | Reporte de la semana | Ventas diarias, gráfico de barras, comparaciones |
| `/mes` | Reporte del mes | Ventas acumuladas, proyección, top 10 productos |
| `/año` | Reporte del año completo | Ventas mensuales, top productos anuales |
| `/stats` | Estadísticas generales | Totales históricos, catálogo, best-sellers |

### **⭐ Comandos Avanzados:**

| Comando | Descripción | Info Incluida |
|---------|-------------|---------------|
| `/comparar` | Comparaciones entre períodos | Hoy vs ayer, semana vs semana, mes vs mes |
| `/objetivos` | Progreso de metas | Diarias, semanales, mensuales, anuales con % |
| `/producto [NOMBRE]` | Stats de curso específico | Ventas totales, últimos 7 días, tendencias |
| `/exportar [periodo]` | Exportar datos a CSV | Para contabilidad e impuestos (dia/semana/mes/año) |
| `/help` | Lista de comandos | Ayuda completa y descripción |

---

## 📊 EJEMPLO DE REPORTES

### **Reporte del Día** (`/dia`)

```
📊 REPORTE DEL DÍA
miércoles, 29 de enero de 2026

━━━━━━━━━━━━━━━━━━━

💰 VENTAS
📈 Total vendido: $450,000 ARS
🛒 Órdenes completadas: 3
📦 Productos vendidos: 5

💵 TICKET PROMEDIO
$150,000 ARS

━━━━━━━━━━━━━━━━━━━

📦 TOP PRODUCTOS
1. NEWCON REGLAS (2x) - $200,000
2. NEWCON ESTRATEGIAS (1x) - $150,000
3. NEWCON AVANZADO (1x) - $100,000

━━━━━━━━━━━━━━━━━━━

💳 MÉTODOS DE PAGO
💳 MercadoPago: 2 (67%)
🅿️ PayPal: 1 (33%)

━━━━━━━━━━━━━━━━━━━

👥 CLIENTES
Nuevos clientes: 2
Clientes recurrentes: 1

━━━━━━━━━━━━━━━━━━━

⏰ Actualizado: 14:30
```

---

### **Reporte Mensual** (`/mes`)

```
📊 REPORTE MENSUAL
ENERO 2026

━━━━━━━━━━━━━━━━━━━

💰 VENTAS DEL MES
📈 Total acumulado: $5,500,000 ARS
📊 Progreso: 29/31 días (94%)

📉 Promedio diario: $189,655
🎯 Proyección del mes: $5,879,310

━━━━━━━━━━━━━━━━━━━

🛒 ÓRDENES Y PRODUCTOS
Total órdenes: 37
Total items: 52
Ticket promedio: $148,648

━━━━━━━━━━━━━━━━━━━

🏆 PRODUCTOS MÁS VENDIDOS
1. NEWCON REGLAS
   📦 15 unid. | 💰 $1,500,000

2. NEWCON ESTRATEGIAS
   📦 12 unid. | 💰 $1,800,000

3. NEWCON AVANZADO
   📦 10 unid. | 💰 $2,000,000

━━━━━━━━━━━━━━━━━━━

💳 DESGLOSE POR MÉTODO DE PAGO
💳 MercadoPago
   Ventas: $3,850,000 (70%)
   Transacciones: 26

🅿️ PayPal
   Ventas: $1,650,000 (30%)
   Transacciones: 11

━━━━━━━━━━━━━━━━━━━

👥 CLIENTES
🆕 Nuevos: 28
🔄 Recurrentes: 9
📊 Total únicos: 37

━━━━━━━━━━━━━━━━━━━

📈 COMPARACIÓN
vs. Mes anterior: +25%
🟢 Crecimiento

━━━━━━━━━━━━━━━━━━━

⏰ 29/01/2026 14:30
```

---

## ⚙️ CONFIGURACIÓN (5 minutos)

### **PASO 1: Configurar el Webhook**

Una vez que tengas el bot funcionando, necesitas activar el webhook:

1. **Abre tu terminal o navegador**

2. **Ejecuta este comando** (reemplaza con tu token):

```bash
curl https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://tu-web.vercel.app/api/telegram-webhook
```

**Ejemplo:**
```bash
curl https://api.telegram.org/bot1234567890:ABCdefGHI/setWebhook?url=https://reactivar-academy.vercel.app/api/telegram-webhook
```

3. **Verificar que funcionó:**

```bash
curl https://api.telegram.org/bot<TU_TOKEN>/getWebhookInfo
```

Deberías ver:
```json
{
  "ok": true,
  "result": {
    "url": "https://tu-web.vercel.app/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

### **PASO 2: Configurar Comandos en BotFather**

Para que los comandos aparezcan en el menú del bot:

1. **Abre Telegram**
2. **Busca:** `@BotFather`
3. **Envía:** `/setcommands`
4. **Selecciona tu bot**
5. **Envía esta lista:**

```
dia - Reporte del dia
semana - Reporte de la semana
mes - Reporte del mes
anio - Reporte del anio
stats - Estadisticas generales
comparar - Comparar periodos
objetivos - Ver progreso de metas
producto - Stats de un curso
exportar - Exportar a CSV
help - Lista de comandos
```

6. ✅ Listo! Los comandos ahora aparecerán cuando escribas `/`

---

### **PASO 3: Probar los Comandos**

1. **Abre tu bot en Telegram**
2. **Escribe:** `/`
3. **Verás el menú** con todos los comandos
4. **Click en cualquier comando** para ver el reporte

---

## 🎨 CARACTERÍSTICAS DE LOS REPORTES

### **Formato Profesional:**
- ✅ Separadores visuales claros
- ✅ Emojis descriptivos
- ✅ Formato markdown para resaltar totales
- ✅ Fechas en español argentino

### **Información Detallada:**
- ✅ Ventas totales en ARS
- ✅ Cantidad de órdenes
- ✅ Top productos con unidades y montos
- ✅ Métodos de pago con porcentajes
- ✅ Gráficos ASCII de barras (semanal)
- ✅ Proyecciones (mensual)
- ✅ Comparaciones (mensual/anual)

### **Métricas Clave:**
- ✅ Ticket promedio
- ✅ Ventas por día/semana/mes
- ✅ Clientes nuevos vs recurrentes
- ✅ Porcentaje de cada método de pago
- ✅ Progreso mensual
- ✅ Mejores productos

---

## 📱 CÓMO USAR

### **Desde el Móvil:**
1. Abre el chat con tu bot
2. Toca el botón `/` junto al campo de texto
3. Selecciona el comando deseado
4. ¡Recibe el reporte al instante!

### **Desde el Desktop:**
1. Escribe el comando (ej: `/mes`)
2. Presiona Enter
3. El bot responde en segundos

---

## 🔧 PERSONALIZACIÓN

### **Cambiar el formato del reporte:**

Edita `api/telegram-webhook.js` y modifica las funciones:
- `generateDayReport()` - Reporte diario
- `generateWeekReport()` - Reporte semanal
- `generateMonthReport()` - Reporte mensual
- `generateYearReport()` - Reporte anual

### **Agregar nuevos comandos:**

```javascript
case '/tucomando':
  responseText = await generateTuReporte();
  break;
```

### **Cambiar emojis:**

Busca los emojis en el código y reemplázalos:
```javascript
💰 📈 🛒 📦 💳 🅿️ 📊 🏆 👥 🆕 🔄
```

---

## 🚀 VENTAJAS

### **vs Entrar al Panel Admin:**
- ⚡ **Más rápido** - Respuesta en 2 segundos
- 📱 **Desde cualquier lugar** - Solo necesitas Telegram
- 🎯 **Info específica** - Solo lo que necesitas
- 📊 **Formato optimizado** - Fácil de leer en móvil

### **vs Reportes por Email:**
- 🔔 **On-demand** - Cuando tú quieras
- 💬 **Interactivo** - Múltiples comandos
- ⚡ **Instantáneo** - Sin esperas
- 📈 **Siempre actualizado** - Datos en tiempo real

---

## 📊 CASOS DE USO

### **Cada Mañana:**
```
/dia
```
Para ver cómo arrancó el día

### **Reunión de Equipo:**
```
/semana
```
Para review semanal

### **Fin de Mes:**
```
/mes
```
Para cierre contable

### **Planificación Anual:**
```
/año
```
Para análisis de tendencias

### **Antes de Invertir en Ads:**
```
/stats
```
Para ver qué productos funcionan mejor

---

## 💡 TIPS PRO

1. **Crea un grupo de Telegram** con tu equipo y agrega el bot
2. **Programa recordatorios** para pedir reportes automáticos
3. **Usa `/stats`** antes de reuniones importantes
4. **Compara `/mes`** mensualmente para ver crecimiento
5. **Guarda reportes importantes** con "Forward" o captura

---

## 🔍 TROUBLESHOOTING

### ❌ **"El bot no responde a comandos"**

**Solución:**
1. Verifica que el webhook esté configurado:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
   ```
2. Verifica que la URL sea correcta (tu dominio de Vercel)
3. Prueba eliminar y reconfigurar:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   curl https://api.telegram.org/bot<TOKEN>/setWebhook?url=<TU_URL>
   ```

### ❌ **"Recibo 'Error al generar reporte'"**

**Solución:**
1. Verifica las variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Verifica que haya datos en tu base de datos
3. Revisa los logs de Vercel para ver el error específico

### ❌ **"Los comandos no aparecen en el menú"**

**Solución:**
1. Configura los comandos en BotFather (Paso 2 arriba)
2. Reinicia el chat con tu bot
3. Los comandos deberían aparecer al escribir `/`

---

## 🎉 ¡LISTO!

Ahora tienes un **sistema de reportes profesional** directamente en Telegram.

**Funciones:**
- ✅ Notificaciones automáticas de ventas
- ✅ Reportes on-demand por comando
- ✅ Métricas detalladas como un contador
- ✅ Disponible 24/7 desde tu móvil
- ✅ 100% gratis

**¡Tu propia oficina contable en el bolsillo!** 📱💼
