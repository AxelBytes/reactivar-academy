/**
 * Utilidades para optimizar imágenes antes de subirlas a Supabase
 * - Redimensiona imágenes grandes
 * - Comprime para reducir tamaño
 * - Convierte a formato optimizado
 */

interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Redimensiona y optimiza una imagen
 */
export async function optimizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo el aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'));
          return;
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('✅ Imagen optimizada:', {
                original: `${(file.size / 1024).toFixed(2)}KB`,
                optimized: `${(blob.size / 1024).toFixed(2)}KB`,
                reduction: `${(((file.size - blob.size) / file.size) * 100).toFixed(1)}%`,
                dimensions: `${width}x${height}px`,
              });
              resolve(blob);
            } else {
              reject(new Error('Error al convertir imagen'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Valida si un archivo es una imagen válida
 */
export function validateImage(file: File, maxSizeMB: number = 10): string | null {
  // Validar tipo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return 'Formato no válido. Usa JPG, PNG, WEBP o GIF.';
  }

  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `La imagen es muy grande. Máximo ${maxSizeMB}MB.`;
  }

  return null; // Sin errores
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convierte File a Blob optimizado
 */
export async function fileToOptimizedBlob(
  file: File,
  options?: ResizeOptions
): Promise<{ blob: Blob; fileName: string }> {
  const optimizedBlob = await optimizeImage(file, options);
  
  // Generar nombre único
  const timestamp = Date.now();
  const ext = options?.format || 'jpg';
  const fileName = `${timestamp}.${ext}`;

  return { blob: optimizedBlob, fileName };
}
