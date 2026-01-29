# 🚀 Deploy Rápido - 5 Minutos

## Opción 1: Solo Frontend (Sin Backend todavía)

### Paso 1: Subir a GitHub

```bash
# Si no tienes Git inicializado
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/reactivar-academy.git
git branch -M main
git push -u origin main
```

### Paso 2: Deploy en Vercel

1. Ve a https://vercel.com
2. Sign up con GitHub
3. Click en "Add New Project"
4. Selecciona tu repositorio
5. Click en "Deploy"

✅ **¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`**

---

## Opción 2: Frontend + Backend (Para MercadoPago)

### Necesitas:
1. Frontend en Vercel (gratis)
2. Backend en Railway (gratis)
3. Cuenta en MercadoPago

### 📋 Checklist Rápido:

#### Frontend
- [ ] Subir código a GitHub
- [ ] Deploy en Vercel (automático)
- [ ] Anotar URL: `https://_____.vercel.app`

#### Backend
- [ ] Crear carpeta `backend/` aparte
- [ ] Copiar código de `DEPLOYMENT_GUIDE.md`
- [ ] Subir a GitHub (repo separado o mismo)
- [ ] Deploy en Railway
- [ ] Anotar URL: `https://_____.railway.app`

#### MercadoPago
- [ ] Crear cuenta en https://mercadopago.com.ar/developers
- [ ] Crear aplicación
- [ ] Copiar credenciales TEST

#### Variables de Entorno

**En Vercel:**
```
VITE_API_URL=https://tu-backend.railway.app
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx
```

**En Railway:**
```
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx
FRONTEND_URL=https://tu-proyecto.vercel.app
```

---

## 🧪 Probar MercadoPago

**Tarjeta de prueba:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: APRO
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- `DEPLOYMENT_GUIDE.md` - Guía paso a paso completa
- `PAYMENT_INTEGRATION.md` - Integración de MercadoPago/PayPal

---

## ⚡ Comandos Útiles

```bash
# Ver logs en Railway
railway logs

# Redeploy en Vercel
vercel --prod

# Ver el build localmente
npm run build
npm run preview
```

---

## 🆘 Ayuda Rápida

**Frontend no carga:**
- Verifica que el build terminó sin errores en Vercel
- Revisa los logs en el dashboard de Vercel

**Backend no responde:**
- Verifica que Railway haya terminado el deploy
- Prueba el endpoint de health: `https://tu-backend.railway.app/health`

**MercadoPago no funciona:**
- Verifica las credenciales en las variables de entorno
- Asegúrate de usar credenciales TEST primero
- Revisa los logs del webhook en Railway

---

¡Todo listo para producción! 🎉
