// Input Validation Utilities
// Protege contra XSS, SQL Injection y otros ataques

/**
 * Sanitizar string - Remueve caracteres peligrosos
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < y > (anti-XSS básico)
    .substring(0, 500); // Límite de 500 caracteres
}

/**
 * Validar email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
}

/**
 * Validar nombre
 */
export function isValidName(name) {
  return (
    typeof name === 'string' &&
    name.trim().length >= 2 &&
    name.trim().length <= 100 &&
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(name)
  );
}

/**
 * Validar precio
 */
export function isValidPrice(price) {
  const num = Number(price);
  return !isNaN(num) && num >= 0 && num <= 10000000;
}

/**
 * Validar ID numérico
 */
export function isValidId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0 && num < Number.MAX_SAFE_INTEGER;
}

/**
 * Validar URL
 */
export function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizar objeto - Valida todos los campos
 * 
 * @example
 * const cleaned = sanitizeObject(req.body, {
 *   email: 'email',
 *   name: 'string',
 *   price: 'number'
 * });
 */
export function sanitizeObject(obj, schema) {
  const result = {};
  
  for (const [key, type] of Object.entries(schema)) {
    const value = obj[key];
    
    switch (type) {
      case 'email':
        if (isValidEmail(value)) {
          result[key] = value.toLowerCase().trim();
        }
        break;
        
      case 'string':
        if (typeof value === 'string') {
          result[key] = sanitizeString(value);
        }
        break;
        
      case 'number':
        const num = Number(value);
        if (!isNaN(num)) {
          result[key] = num;
        }
        break;
        
      case 'id':
        if (isValidId(value)) {
          result[key] = Number(value);
        }
        break;
        
      case 'url':
        if (isValidUrl(value)) {
          result[key] = value;
        }
        break;
        
      default:
        result[key] = value;
    }
  }
  
  return result;
}

/**
 * Validar y sanitizar datos de curso
 */
export function validateCourseData(data) {
  const errors = [];
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Título debe tener al menos 3 caracteres');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Descripción debe tener al menos 10 caracteres');
  }
  
  if (!isValidPrice(data.price)) {
    errors.push('Precio inválido');
  }
  
  if (data.image && !isValidUrl(data.image)) {
    errors.push('URL de imagen inválida');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    data: {
      title: sanitizeString(data.title),
      description: sanitizeString(data.description),
      instructor: sanitizeString(data.instructor || 'Diego Machado'),
      price: Number(data.price),
      image: data.image,
      systeme_product_id: sanitizeString(data.systeme_product_id || ''),
      status: data.status === 'inactive' ? 'inactive' : 'active'
    }
  };
}

/**
 * Validar datos de producto
 */
export function validateProductData(data) {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Nombre debe tener al menos 3 caracteres');
  }
  
  if (!isValidPrice(data.price)) {
    errors.push('Precio inválido');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    data: {
      name: sanitizeString(data.name),
      description: sanitizeString(data.description || ''),
      price: Number(data.price),
      image: data.image,
      category: sanitizeString(data.category || 'General'),
      status: data.status === 'inactive' ? 'inactive' : 'active'
    }
  };
}

/**
 * Detectar posibles ataques en input
 */
export function detectMaliciousInput(input) {
  if (typeof input !== 'string') return false;
  
  const patterns = [
    /<script/i,                    // XSS
    /javascript:/i,                // XSS
    /on\w+\s*=/i,                  // Event handlers
    /(\bOR\b|\bAND\b).*=.*['"]?/i, // SQL Injection
    /UNION.*SELECT/i,              // SQL Injection
    /DROP\s+TABLE/i,               // SQL Injection
    /--/,                          // SQL Comment
    /../i,                         // Path traversal
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Middleware de validación para APIs
 */
export function validateRequest(req, res, schema) {
  const body = req.body;
  
  // Detectar inputs maliciosos
  for (const value of Object.values(body)) {
    if (typeof value === 'string' && detectMaliciousInput(value)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Input potencialmente malicioso detectado'
      });
      return false;
    }
  }
  
  // Validar según schema
  const sanitized = sanitizeObject(body, schema);
  
  // Verificar campos requeridos
  for (const key of Object.keys(schema)) {
    if (!(key in sanitized)) {
      res.status(400).json({
        error: 'Bad Request',
        message: `Campo requerido faltante: ${key}`
      });
      return false;
    }
  }
  
  return sanitized;
}
