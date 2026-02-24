// Rate Limiting Middleware para Vercel Serverless Functions
// Protege contra ataques DDoS y abuso de APIs

const requestCounts = new Map();

/**
 * Rate Limiter - Limita número de requests por IP
 * 
 * @param {string} ip - IP del cliente
 * @param {number} maxRequests - Máximo de requests permitidos
 * @param {number} windowMs - Ventana de tiempo en ms (default: 1 minuto)
 * @returns {boolean} - true si está permitido, false si excede el límite
 */
export function rateLimit(ip, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = ip;
  
  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }
  
  const requests = requestCounts.get(key);
  
  // Filtrar requests dentro de la ventana de tiempo
  const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  // Limpiar requests antiguos
  requestCounts.set(key, recentRequests);
  
  // Verificar si excede el límite
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  // Agregar este request
  recentRequests.push(now);
  requestCounts.set(key, recentRequests);
  
  return true;
}

/**
 * Obtener IP del cliente (considera proxies)
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

/**
 * Middleware de Rate Limiting para usar en APIs
 * 
 * @example
 * export default async function handler(req, res) {
 *   if (!checkRateLimit(req, res)) return;
 *   // ... rest of your code
 * }
 */
export function checkRateLimit(req, res, maxRequests = 10, windowMs = 60000) {
  const ip = getClientIp(req);
  
  if (!rateLimit(ip, maxRequests, windowMs)) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
    return false;
  }
  
  return true;
}

/**
 * Limpiar memoria cada 5 minutos
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of requestCounts.entries()) {
    const recentRequests = requests.filter(timestamp => now - timestamp < 300000); // 5 min
    if (recentRequests.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, recentRequests);
    }
  }
}, 300000);
