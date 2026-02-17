# ⭐ COMANDOS AVANZADOS - Bot de Telegram

## 🚀 NUEVAS FUNCIONALIDADES PREMIUM

Acabamos de agregar **4 comandos avanzados** super útiles para gestionar tu negocio como un profesional.

---

## 📊 /comparar - COMPARACIONES ENTRE PERÍODOS

### **¿Para qué sirve?**
Compara tus ventas actuales con períodos anteriores para ver tendencias.

### **Ejemplo de uso:**
```
/comparar
```

### **Lo que verás:**

```
📊 COMPARACIONES DE PERÍODOS

━━━━━━━━━━━━━━━━━━━

📅 HOY vs AYER

Hoy: $150,000
Ayer: $120,000
Diferencia: +$30,000
Variación: +25% 📈

━━━━━━━━━━━━━━━━━━━

📆 ESTA SEMANA vs SEMANA PASADA

Esta semana: $850,000
Semana pasada: $720,000
Diferencia: +$130,000
Variación: +18% 📈

━━━━━━━━━━━━━━━━━━━

📊 ESTE MES vs MES ANTERIOR

Este mes: $3,200,000
Mes anterior: $2,800,000
Diferencia: +$400,000
Variación: +14.3% 📈

━━━━━━━━━━━━━━━━━━━

🚀 ¡Vas creciendo! Sigue así
```

### **Casos de uso:**
- ✅ Ver si estás creciendo mes a mes
- ✅ Detectar caídas rápidamente
- ✅ Comparar efecto de campañas publicitarias
- ✅ Identificar tendencias estacionales

---

## 🎯 /objetivos - PROGRESO DE METAS

### **¿Para qué sirve?**
Rastrea tu progreso hacia metas diarias, semanales, mensuales y anuales.

### **Ejemplo de uso:**
```
/objetivos
```

### **Lo que verás:**

```
🎯 PROGRESO DE OBJETIVOS

━━━━━━━━━━━━━━━━━━━

📅 META DIARIA
Objetivo: $10,000
Actual: $6,700
██████░░░░ 67.0%
Faltan: $3,300

━━━━━━━━━━━━━━━━━━━

📆 META SEMANAL
Objetivo: $70,000
Actual: $52,000
███████░░░ 74.3%
Faltan: $18,000

━━━━━━━━━━━━━━━━━━━

📊 META MENSUAL
Objetivo: $300,000
Actual: $187,000
██████░░░░ 62.3%
Faltan: $113,000

━━━━━━━━━━━━━━━━━━━

📈 META ANUAL
Objetivo: $3,600,000
Actual: $1,890,000
█████░░░░░ 52.5%
Faltan: $1,710,000

━━━━━━━━━━━━━━━━━━━

💡 Tip: Edita tus metas en `api/telegram-webhook.js` línea 726
```

### **Personalizar tus metas:**

Edita `api/telegram-webhook.js` línea 726:

```javascript
const GOALS = {
  daily: 10000,      // Tu meta diaria en ARS
  weekly: 70000,     // Tu meta semanal en ARS
  monthly: 300000,   // Tu meta mensual en ARS
  yearly: 3600000,   // Tu meta anual en ARS
};
```

### **Casos de uso:**
- ✅ Gamificación de tu negocio
- ✅ Motivación diaria
- ✅ Saber cuánto falta para alcanzar objetivos
- ✅ Planificación financiera
- ✅ Seguimiento de performance

---

## 📦 /producto [NOMBRE] - STATS POR CURSO

### **¿Para qué sirve?**
Ver el rendimiento de un curso/producto específico.

### **Ejemplo de uso:**
```
/producto NEWCON REGLAS
```

### **Lo que verás:**

```
📦 REPORTE DE PRODUCTO

NEWCON REGLAS

━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS GENERALES

Total vendido: 47 unidades
Ingresos totales: $4,700,000
Precio promedio: $100,000

━━━━━━━━━━━━━━━━━━━

📅 ESTE MES

Ventas: 12 unidades
Ingresos: $1,200,000

━━━━━━━━━━━━━━━━━━━

📈 ÚLTIMOS 7 DÍAS

28/01/2026: 3 ventas
27/01/2026: 1 venta
26/01/2026: 2 ventas
25/01/2026: 0 ventas
24/01/2026: 1 venta
23/01/2026: 4 ventas
22/01/2026: 2 ventas

━━━━━━━━━━━━━━━━━━━

🕐 HISTORIAL

Primera venta: 15/11/2025
Última venta: 28/01/2026

━━━━━━━━━━━━━━━━━━━

🚀 ¡Producto exitoso!
```

### **Casos de uso:**
- ✅ Ver qué cursos se venden mejor
- ✅ Identificar productos con bajo rendimiento
- ✅ Decidir dónde invertir en publicidad
- ✅ Detectar tendencias de compra
- ✅ Planificar lanzamientos similares

### **Tips:**
- Escribe el nombre **completo** o **parcial** del curso
- Ejemplos válidos:
  - `/producto NEWCON`
  - `/producto REGLAS`
  - `/producto NEWCON REGLAS`

---

## 📄 /exportar [periodo] - EXPORTAR A CSV

### **¿Para qué sirve?**
Exportar todas tus ventas a formato CSV para usar en Excel, contabilidad o AFIP.

### **Ejemplo de uso:**
```
/exportar mes
/exportar semana
/exportar año
```

### **Lo que verás:**

```
📊 EXPORTACIÓN A CSV

━━━━━━━━━━━━━━━━━━━

📅 Período: mes
📦 Órdenes: 37
💰 Total: $5,500,000
📈 Ticket promedio: $148,648

━━━━━━━━━━━━━━━━━━━

📄 DATOS CSV:

```
Fecha,Hora,Cliente,Email,Total,Metodo Pago,Productos,Cantidad,ID Orden
15/01/2026,09:30,"Juan Pérez","juan@email.com",100000,mercadopago,"NEWCON REGLAS",1,123
15/01/2026,14:20,"María López","maria@email.com",150000,paypal,"NEWCON ESTRATEGIAS",1,124
16/01/2026,11:45,"Carlos Gómez","carlos@email.com",200000,mercadopago,"NEWCON REGLAS + NEWCON AVANZADO",2,125
...
```

━━━━━━━━━━━━━━━━━━━

💡 Cómo usar:
1. Copia el texto entre ```
2. Pégalo en un archivo .txt
3. Cambia extensión a .csv
4. Abre con Excel/Google Sheets

🎯 Perfecto para contabilidad e impuestos
```

### **Períodos disponibles:**
- `dia` o `hoy` - Ventas del día
- `semana` - Ventas de la semana
- `mes` - Ventas del mes (default)
- `año` o `ano` - Ventas del año completo

### **Columnas incluidas:**
- ✅ Fecha y hora de compra
- ✅ Nombre del cliente
- ✅ Email del cliente
- ✅ Total de la orden
- ✅ Método de pago
- ✅ Lista de productos
- ✅ Cantidad de items
- ✅ ID de orden único

### **Casos de uso:**
- ✅ Declaración de impuestos (AFIP)
- ✅ Contabilidad mensual
- ✅ Análisis en Excel con gráficos
- ✅ Auditorías
- ✅ Reportes para inversores
- ✅ Facturación bulk

### **Pro Tips:**
- Exporta cada mes para tener respaldo
- Usa filtros en Excel para análisis específicos
- Combina con `/producto` para insights más profundos

---

## 📊 COMPARACIÓN: BÁSICOS vs AVANZADOS

### **Comandos Básicos:**
- Dan información general
- Resúmenes de períodos
- Vista de alto nivel

### **Comandos Avanzados:**
- Análisis comparativos
- Seguimiento de metas
- Drill-down por producto
- Exportación de datos

---

## 🎯 FLUJO DE TRABAJO RECOMENDADO

### **Cada Mañana:**
```
/dia
/objetivos
```
Para ver ventas de ayer y tu progreso

### **Cada Lunes:**
```
/comparar
/semana
```
Para review semanal y ver tendencias

### **Fin de Mes:**
```
/mes
/objetivos
/exportar mes
```
Para cierre, contabilidad y planificación

### **Antes de Invertir en Ads:**
```
/producto [TU_MEJOR_CURSO]
/stats
```
Para ver qué funciona y optimizar presupuesto

### **Para Impuestos:**
```
/exportar mes
```
Cada mes, guardar el CSV

---

## ⚙️ CONFIGURACIÓN

### **Editar tus metas:**

En `api/telegram-webhook.js` línea 726:

```javascript
const GOALS = {
  daily: 10000,      // $10k por día
  weekly: 70000,     // $70k por semana
  monthly: 300000,   // $300k por mes
  yearly: 3600000,   // $3.6M por año
};
```

### **Comandos en BotFather:**

Para que aparezcan en el menú de tu bot:

1. Abre `@BotFather` en Telegram
2. Envía `/setcommands`
3. Selecciona tu bot
4. Pega esto:

```
dia - 📊 Reporte del dia
semana - 📅 Reporte de la semana
mes - 📆 Reporte del mes
ano - 📈 Reporte del ano
stats - 💹 Estadisticas generales
comparar - 📊 Comparar periodos
objetivos - 🎯 Ver progreso de metas
producto - 📦 Stats de un curso
exportar - 📄 Exportar a CSV
help - ❓ Lista de comandos
```

---

## 💡 VENTAJAS DE LOS COMANDOS AVANZADOS

### **vs Panel Admin:**
- ⚡ **Más rápido** - 2 segundos vs 30 segundos
- 📱 **Desde cualquier lugar** - No necesitas computadora
- 🎯 **Específico** - Solo el dato que necesitas

### **vs Excel Manual:**
- 🤖 **Automático** - Sin copiar/pegar
- 📊 **Siempre actualizado** - Datos en tiempo real
- 💼 **Formato profesional** - Ya viene listo

### **vs Google Analytics:**
- 💰 **Enfoque en ventas** - No en visitas
- 📈 **Metas personalizadas** - Tus objetivos
- 🎯 **Drill-down rápido** - Por producto

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **Gráficos visuales** - Imágenes con charts
2. **Alertas de meta** - Notificación cuando alcanzas objetivo
3. **Predicciones con IA** - Proyección de ventas
4. **Análisis de clientes** - Top clientes, LTV
5. **Reportes programados** - Envío automático semanal

---

## 🎉 ¡AHORA TIENES UN SISTEMA PROFESIONAL!

### **Antes:**
- ✅ Notificaciones de ventas
- ✅ Reportes básicos por período

### **Ahora:**
- ✅ Notificaciones de ventas
- ✅ Reportes básicos por período
- ✅ **Comparaciones entre períodos**
- ✅ **Seguimiento de metas con progreso visual**
- ✅ **Análisis por producto individual**
- ✅ **Exportación a CSV para contabilidad**

**¡Tu oficina contable + analista de datos en el bolsillo!** 📱💼📊
