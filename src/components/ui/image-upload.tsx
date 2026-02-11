import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  folder?: string; // Carpeta dentro del bucket (ej: "courses", "products")
}

export const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  label = "Imagen",
  folder = "general"
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes JPG, PNG, WEBP o GIF",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen no debe superar los 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      console.log('📸 Imagen original:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });

      // Opciones de compresión
      const options = {
        maxSizeMB: 1, // Tamaño máximo del archivo (1MB)
        maxWidthOrHeight: 1920, // Resolución máxima (ancho o alto)
        useWebWorker: true, // Usar Web Worker para mejor performance
        fileType: 'image/webp', // Convertir a WebP para mejor compresión
      };

      // Comprimir la imagen
      let compressedFile = file;
      try {
        compressedFile = await imageCompression(file, options);
        console.log('🗜️ Imagen comprimida:', {
          size: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
          reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
        });
      } catch (compressionError) {
        console.warn('⚠️ No se pudo comprimir, usando imagen original:', compressionError);
        // Si falla la compresión, usamos el archivo original
      }

      // Generar nombre único para el archivo
      const fileExt = 'webp'; // Siempre guardamos como webp
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('📤 Subiendo imagen:', fileName);

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp'
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        throw error;
      }

      console.log('✅ Imagen subida:', data.path);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('course-images')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 URL pública:', publicUrl);

      // Actualizar preview y notificar al componente padre
      setPreview(publicUrl);
      onImageChange(publicUrl);

      toast({
        title: "Imagen subida",
        description: "La imagen se ha optimizado y subido exitosamente",
      });

    } catch (error: any) {
      console.error('Error en upload:', error);
      toast({
        title: "Error al subir imagen",
        description: error.message || "Ocurrió un error al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative">
          <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border-2 border-border bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4 mr-2" />
            Eliminar imagen
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            className="relative aspect-video w-full max-w-md rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="text-sm">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-12 h-12" />
                <div className="text-center">
                  <p className="text-sm font-medium">Click para subir imagen</p>
                  <p className="text-xs mt-1">JPG, PNG, WEBP o GIF (máx. 10MB)</p>
                </div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Seleccionar imagen
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        La imagen se ajustará automáticamente para verse completa. Recomendado: 1200x675px (16:9)
      </p>
    </div>
  );
};
