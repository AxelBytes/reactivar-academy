# PROMPT PARA CURSOR — Sección "Gestión de Suscripciones" en el panel admin

Pegá este prompt completo en Cursor cuando estés trabajando en el proyecto de la página web.

---

## PROMPT

Actúa como un Senior Full Stack Developer especializado en React + TypeScript.

Tengo un proyecto web con este stack:
- TypeScript + React
- Vite como bundler
- Tailwind CSS para estilos
- shadcn/ui para componentes (Button, Table, Dialog, Badge, Input, Select, Card, Toast)
- React Router para navegación

Ya tengo un panel de administración funcionando. Necesito que agregues una nueva sección
llamada **"Gestión de Suscripciones"** que se conecte con un backend de Google Apps Script.

---

### BACKEND: Google Apps Script (ya existe y funciona)

La URL base del backend es:
```
VITE_GAS_URL=https://script.google.com/macros/s/AKfycbwdj-SWii1BxrLX3omHKBt3nVhIripP2PffWVnAJHRcR7iC1ie0w2ZoVZSw_IDJWzA-/exec
```
(guardarla en el archivo .env del proyecto)

El admin secret para autenticar las llamadas al backend es:
```
LionelAdmin1984$##
```
(también en .env, nunca hardcodeado)

Todas las llamadas son HTTP GET con estos parámetros:

#### Endpoints disponibles:

**1. Listar todas las claves**
```
?accion=listarClaves&adminSecret=XXX
```
Respuesta:
```json
{
  "ok": true,
  "total": 400,
  "activas": 12,
  "inactivas": 3,
  "disponibles": 385,
  "claves": [
    { "clave": "REG-AbCdEf", "nombre": "Juan García", "email": "juan@mail.com",
      "estado": "Activa", "vence": "27/05/2026" }
  ]
}
```

**2. Obtener próxima clave disponible**
```
?accion=claveDisponible&adminSecret=XXX
```
Respuesta:
```json
{ "ok": true, "clave": "REG-XkMnPq", "fila": 14 }
```

**3. Activar clave para un cliente (cuando paga)**
```
?accion=activarClave&adminSecret=XXX&clave=REG-xxx&nombre=Juan&email=juan@mail.com&meses=1
```
Respuesta:
```json
{ "ok": true, "clave": "REG-xxx", "vencimiento": "27/05/2026", "diasOtorgados": 30 }
```
El backend envía automáticamente un email al cliente con su clave y el link de acceso.

**4. Desactivar clave (cuando no renueva)**
```
?accion=desactivarClave&adminSecret=XXX&clave=REG-xxx
```
Respuesta:
```json
{ "ok": true, "mensaje": "Clave desactivada correctamente." }
```

**5. Consultar estado de una clave específica**
```
?accion=consultarClave&adminSecret=XXX&clave=REG-xxx
```
Respuesta:
```json
{ "ok": true, "nombre": "Juan", "email": "juan@mail.com",
  "estado": "Activa", "alta": "27/04/2026", "vence": "27/05/2026", "meses": 1 }
```

---

### LO QUE TENÉS QUE CONSTRUIR

#### 1. Servicio de API (`src/services/suscripciones.ts`)
Un módulo TypeScript con funciones tipadas para cada endpoint:
- `listarClaves()`
- `obtenerClaveDisponible()`
- `activarClave(params: ActivarClaveParams)`
- `desactivarClave(clave: string)`
- `consultarClave(clave: string)`

Todas las funciones deben:
- Leer la URL base y el adminSecret desde `import.meta.env`
- Retornar tipos definidos (crear interfaces TypeScript para cada respuesta)
- Manejar errores con try/catch y lanzar mensajes claros

#### 2. Página principal (`src/pages/admin/GestionSuscripciones.tsx`)

Debe tener:

**A. Tarjetas de resumen en la parte superior (4 Cards de shadcn):**
- Total de claves
- Claves activas (verde)
- Claves inactivas (rojo)
- Claves disponibles (azul)

**B. Formulario "Activar nueva suscripción" (Card con formulario):**
Campos:
- Nombre del cliente (Input)
- Email del cliente (Input type email)
- Meses de suscripción (Select: 1, 3, 6, 12 meses)
- La clave se obtiene automáticamente con `obtenerClaveDisponible()` al hacer submit
- Botón "Activar suscripción" (Button verde)
- Al completarse: mostrar Toast de éxito con la clave asignada y la fecha de vencimiento

**C. Tabla de suscripciones activas (Table de shadcn):**
Columnas: Clave | Nombre | Email | Estado (Badge) | Vence | Acciones

- Badge coloreado por estado: Activa=verde, Inactiva=rojo, Disponible=gris
- Columna Acciones con dos botones por fila:
  - "Desactivar" (Button rojo, solo visible si estado=Activa) → llama `desactivarClave`
  - "Ver detalles" (Button outline) → abre Dialog con todos los datos del cliente
- Buscador/filtro por nombre, email o clave encima de la tabla
- Filtro por estado (Select: Todos / Activa / Inactiva / Disponible)
- Paginación de 20 registros por página

**D. Dialog de confirmación:**
Antes de desactivar una clave, mostrar un Dialog de confirmación de shadcn con:
- Mensaje: "¿Desactivar acceso de [nombre]? Esta acción bloquea su acceso inmediatamente."
- Botones: "Cancelar" y "Sí, desactivar" (rojo)

#### 3. Ruta en React Router
Agregar la ruta `/admin/suscripciones` apuntando al componente `GestionSuscripciones`.
Agregar el ítem "Gestión de Suscripciones" en el menú lateral del panel admin existente.

---

### COMPORTAMIENTO ESPERADO

- Al cargar la página → llama `listarClaves()` y muestra los datos
- Botón "Actualizar" para refrescar la tabla manualmente
- Loading states con Skeleton de shadcn mientras cargan los datos
- Todos los errores de API mostrados con Toast destructive (rojo)
- Los éxitos mostrados con Toast verde
- La tabla debe estar ordenada: primero Activas, luego Inactivas, luego Disponibles

---

### VARIABLES DE ENTORNO (.env)
```
VITE_GAS_URL=https://script.google.com/macros/s/AKfycbwdj-SWii1BxrLX3omHKBt3nVhIripP2PffWVnAJHRcR7iC1ie0w2ZoVZSw_IDJWzA-/exec
VITE_ADMIN_SECRET=LionelAdmin1984$##
```

Entregame:
1. El archivo de tipos TypeScript
2. El servicio de API
3. El componente de página completo
4. La actualización de rutas en React Router
Todo listo para producción, sin comentarios obvios, con manejo de errores completo.
