# Guía de Integración con Backend

## 📧 Sistema de Envío de Correos para Pedidos

### Descripción General
Este documento describe cómo integrar el sistema de pedidos con un backend para enviar correos electrónicos automáticos cuando se realiza una compra.

---

## 🎯 Flujo de Trabajo

### 1. Cuando un usuario completa una compra:
```
Usuario → Carrito → Finalizar Compra → Backend API → Base de Datos + Email
```

### 2. Tipos de correos a enviar:

#### A. **Confirmación de Compra de Producto**
- **Destinatario**: Cliente
- **Contenido**:
  - Número de pedido
  - Lista de productos comprados
  - Total pagado
  - Dirección de envío
  - Método de pago
  - Tiempo estimado de entrega
  - Número de seguimiento (cuando esté disponible)

#### B. **Confirmación de Compra de Curso**
- **Destinatario**: Cliente
- **Contenido**:
  - Número de pedido
  - Lista de cursos comprados
  - Total pagado
  - **Link de acceso al curso**
  - Credenciales de acceso (si aplica)
  - Instrucciones de inicio

#### C. **Notificación al Admin**
- **Destinatario**: Administrador
- **Contenido**:
  - Nuevo pedido recibido
  - Datos del cliente
  - Productos/Cursos solicitados
  - Total de la venta

---

## 🔧 Implementación

### Archivos a modificar:

#### 1. **`src/components/layout/Cart.tsx`**
```typescript
// En la función handleCheckout(), reemplazar:

const handleCheckout = async () => {
  if (items.length === 0) {
    toast({
      title: "Carrito vacío",
      description: "Agrega productos antes de realizar la compra.",
      variant: "destructive",
    });
    return;
  }

  // AGREGAR: Llamada al backend
  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // Token de autenticación
      },
      body: JSON.stringify({
        items: items,
        total: getTotal(),
        customerEmail: user?.email,
        customerName: user?.name,
        // Agregar más datos necesarios
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast({
        title: "¡Compra exitosa!",
        description: `Pedido ${data.orderId} creado. Revisa tu correo.`,
      });

      clearCart();
      onClose?.();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudo procesar la compra. Intenta nuevamente.",
      variant: "destructive",
    });
  }
};
```

#### 2. **`src/pages/admin/Orders.tsx`**
```typescript
// En la función handleSendEmail(), reemplazar:

const handleSendEmail = async (order: Order) => {
  try {
    const response = await fetch(`/api/orders/${order.id}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      toast({
        title: "Correo enviado",
        description: `Se ha enviado un correo de confirmación a ${order.customerEmail}`,
      });
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudo enviar el correo.",
      variant: "destructive",
    });
  }
};
```

---

## 🖥️ Backend - Endpoints Necesarios

### **POST /api/orders/create**
Crear un nuevo pedido y enviar correo de confirmación.

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Zapatillas Running Pro",
      "type": "product",
      "quantity": 1,
      "price": 180000
    }
  ],
  "total": 180000,
  "customerEmail": "cliente@email.com",
  "customerName": "Juan Pérez",
  "shippingAddress": "Calle 123, Ciudad",
  "paymentMethod": "Tarjeta de Crédito"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ORD-001",
  "message": "Pedido creado exitosamente"
}
```

**Acciones del Backend:**
1. Guardar pedido en la base de datos
2. Enviar correo al cliente con confirmación
3. Enviar correo al admin con notificación
4. Si incluye cursos, dar acceso automático
5. Retornar respuesta

---

### **POST /api/orders/:orderId/send-email**
Reenviar correo de confirmación de un pedido específico.

**Response:**
```json
{
  "success": true,
  "message": "Correo enviado exitosamente"
}
```

---

### **GET /api/orders**
Obtener lista de todos los pedidos (para el panel admin).

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "ORD-001",
      "customerName": "Juan Pérez",
      "customerEmail": "juan@email.com",
      "items": [...],
      "total": 180000,
      "status": "completed",
      "date": "2024-01-25"
    }
  ]
}
```

---

### **PATCH /api/orders/:orderId/status**
Actualizar el estado de un pedido.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Acciones del Backend:**
- Si el estado cambia a "completed", enviar correo de confirmación
- Si incluye cursos, dar acceso al usuario

---

## 📬 Servicio de Email

### Opciones de servicios recomendados:

1. **SendGrid** (Recomendado)
   - Fácil integración
   - 100 emails gratis por día
   - Templates personalizables
   - Analytics incluido

2. **Resend**
   - API moderna
   - React Email para templates
   - 3,000 emails gratis por mes

3. **NodeMailer** (Para desarrollo local)
   - Gratis
   - Requiere SMTP server

### Ejemplo con SendGrid (Node.js):

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOrderConfirmation(order) {
  const msg = {
    to: order.customerEmail,
    from: 'no-reply@reactivaracademy.com',
    subject: `Confirmación de Pedido ${order.id}`,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Hola ${order.customerName},</p>
      <p>Tu pedido ${order.id} ha sido confirmado.</p>
      
      <h2>Detalles del Pedido:</h2>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} - $${item.price.toLocaleString('es-AR')}</li>
        `).join('')}
      </ul>
      
      <p><strong>Total: $${order.total.toLocaleString('es-AR')}</strong></p>
      
      ${order.items.some(item => item.type === 'course') ? `
        <h2>Acceso a tus Cursos:</h2>
        <p>Puedes acceder a tus cursos desde tu perfil en:</p>
        <a href="https://reactivaracademy.com/mis-cursos">Ver Mis Cursos</a>
      ` : ''}
      
      ${order.shippingAddress ? `
        <h2>Dirección de Envío:</h2>
        <p>${order.shippingAddress}</p>
      ` : ''}
      
      <p>¡Gracias por confiar en Reactivar Academy!</p>
    `,
  };
  
  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
```

---

## 📊 Base de Datos - Esquema Sugerido

### Tabla: `orders`
```sql
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id INT REFERENCES users(id),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  total DECIMAL(10, 2),
  status ENUM('pending', 'processing', 'completed', 'cancelled'),
  payment_method VARCHAR(100),
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: `order_items`
```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(id),
  item_id INT,
  item_name VARCHAR(255),
  item_type ENUM('product', 'course'),
  quantity INT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `user_courses` (Para dar acceso a cursos)
```sql
CREATE TABLE user_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  course_id INT REFERENCES courses(id),
  order_id VARCHAR(50) REFERENCES orders(id),
  access_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL
);
```

---

## 🔐 Seguridad

1. **Validar el token de usuario** en cada request
2. **Verificar permisos** (solo admins pueden ver todos los pedidos)
3. **Sanitizar datos** antes de guardar en BD
4. **Usar HTTPS** en producción
5. **Rate limiting** en endpoints de email
6. **Logs de auditoría** para pedidos y cambios de estado

---

## ✅ Checklist de Implementación

- [ ] Configurar servicio de email (SendGrid/Resend)
- [ ] Crear endpoints en el backend
- [ ] Configurar base de datos con esquema
- [ ] Implementar sistema de autenticación con tokens
- [ ] Crear templates de correo
- [ ] Modificar `Cart.tsx` para llamar al backend
- [ ] Modificar `Orders.tsx` para llamar al backend
- [ ] Implementar sistema de acceso a cursos
- [ ] Agregar notificaciones push (opcional)
- [ ] Testing de flujo completo
- [ ] Configurar logs y monitoreo

---

## 📝 Notas Adicionales

### Variables de Entorno (.env)
```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/reactivar_db
JWT_SECRET=tu_secret_key_aqui

# Email Service
SENDGRID_API_KEY=tu_api_key_aqui
EMAIL_FROM=no-reply@reactivaracademy.com

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

### Testing
- Usar cuentas de prueba de email para testing
- Verificar que los correos no vayan a spam
- Probar con diferentes tipos de pedidos (solo productos, solo cursos, mixtos)

---

## 🚀 Próximos Pasos

1. Implementar el backend con los endpoints mencionados
2. Configurar servicio de email
3. Conectar frontend con backend
4. Agregar sistema de notificaciones en tiempo real
5. Implementar dashboard de analytics de ventas
