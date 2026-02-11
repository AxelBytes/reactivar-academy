# 🔧 Solución al problema de Login

## ❌ Problema:
El navegador guardó credenciales antiguas que ya no funcionan con el sistema actual.

## ✅ Solución:

### 1. **Limpiar localStorage:**
Abrí la **Consola del Navegador** (F12) y ejecutá:
```javascript
localStorage.clear()
location.reload()
```

### 2. **Borrar credenciales guardadas:**
- **Chrome/Edge:** 
  - Settings → Autofill → Password Manager
  - Buscá "reactivar-academy" o tu URL
  - Eliminá las credenciales guardadas

- **Firefox:**
  - Settings → Privacy & Security → Logins and Passwords
  - Buscá y eliminá las credenciales

### 3. **Volver a registrarte:**
Si seguís teniendo problemas, registrate de nuevo con:
- **Nuevo email** (puede ser uno temporal)
- **Nueva contraseña**

---

## 🔍 Verificar en Supabase:

Si querés verificar qué usuario existe:
1. Ve a Supabase → Table Editor → `users`
2. Buscá tu email
3. Verificá que exista y tenga `password_hash` (no `password`)
