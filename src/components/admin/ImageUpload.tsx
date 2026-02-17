import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { optimizeImage, validateImage } from '@/lib/imageOptimizer';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  folder?: 'courses' | 'products';
  maxSizeMB?: number;
}

export function ImageUpload({
  onImageUploaded,
  currentImageUrl,
  folder = 'courses',
  maxSizeMB = 10,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resetear error
    setError(null);

    // Validar imagen
    const validationError = validateImage(file, maxSizeMB);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Mostrar preview inmediato
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Optimizar y subir
    await optimizeAndUpload(file);
  };

  const optimizeAndUpload = async (file: File) => {
    setOptimizing(true);
    setError(null);

    try {
      console.log('🎨 Optimizando imagen...');
      
      // Optimizar imagen (resize + compress)
      const optimizedBlob = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.85,
        format: 'jpeg',
      });

      setOptimizing(false);
      setUploading(true);

      // Generar nombre único
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      const filePath = `${folder}/${fileName}`;

      console.log('📤 Subiendo imagen optimizada:', filePath);

      // Subir a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, optimizedBlob, {
          cacheControl: '31536000', // 1 año de cache
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('❌ Error subiendo:', uploadError);
        throw uploadError;
      }

      console.log('✅ Imagen subida:', data);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('🌐 URL pública:', publicUrl);

      // Notificar al componente padre
      onImageUploaded(publicUrl);

      setUploading(false);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al subir la imagen');
      setOptimizing(false);
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing = uploading || optimizing;

  return (
    <div className="space-y-4">
      {/* Preview de la imagen */}
      {preview ? (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-2 mx-auto"></div>
                <p className="text-sm font-medium">
                  {optimizing ? 'Optimizando imagen...' : 'Subiendo imagen...'}
                </p>
                {optimizing && (
                  <p className="text-xs mt-1 opacity-75">
                    Redimensionando y comprimiendo
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Área de drop/click para subir */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800"
        >
          <ImageIcon size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
            <span className="font-semibold text-blue-500">Click para subir</span> o arrastra aquí
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            JPG, PNG, WEBP, GIF (máx. {maxSizeMB}MB)
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
            Recomendado: 1200x800px (ratio 3:2)
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
            ✨ Se optimizará automáticamente
          </p>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Ayuda */}
      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside pl-4 space-y-1">
          <li>Las imágenes se optimizan automáticamente al subirlas</li>
          <li>Se redimensionan a 1200x800px máximo (ratio 3:2)</li>
          <li>Se comprimen manteniendo buena calidad (85%)</li>
          <li>Esto asegura carga rápida en el frontend</li>
        </ul>
      </div>
    </div>
  );
}
