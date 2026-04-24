import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';

interface PdfUploadProps {
  onPdfUploaded: (url: string) => void;
  currentPdfUrl?: string;
  folder?: string;
}

export function PdfUpload({ onPdfUploaded, currentPdfUrl, folder = 'pdfs' }: PdfUploadProps) {
  const [pdfUrl, setPdfUrl] = useState<string>(currentPdfUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El PDF no puede superar ${maxSizeMB}MB`);
      return;
    }

    setFileName(file.name);
    await uploadPdf(file);
  };

  const uploadPdf = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64File = await base64Promise;

      // Nombre único para el archivo
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${safeName}`;

      const baseUrl = import.meta.env.DEV
        ? 'http://localhost:8080'
        : window.location.origin;

      const response = await fetch(`${baseUrl}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64File,
          fileName: uniqueFileName,
          folder,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el PDF');
      }

      const data = await response.json();
      setPdfUrl(data.url);
      onPdfUploaded(data.url);
      console.log('✅ PDF subido:', data.url);
    } catch (err: any) {
      console.error('❌ Error subiendo PDF:', err);
      setError(err.message || 'Error al subir el PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPdfUrl('');
    setFileName('');
    setError(null);
    onPdfUploaded('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {pdfUrl ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">PDF cargado correctamente</p>
            <p className="text-xs text-green-600 truncate">{fileName || 'archivo.pdf'}</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline hover:text-blue-800"
            >
              Ver PDF
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-full rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center p-8 cursor-pointer
            ${uploading
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 hover:border-blue-500 bg-gray-50'
            }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-3" />
              <p className="text-sm text-blue-600 font-medium">Subiendo PDF...</p>
            </>
          ) : (
            <>
              <FileText size={40} className="text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold text-blue-500">Click para subir</span> o arrastrá aquí
              </p>
              <p className="text-xs text-gray-400 mt-1">Solo PDF · Máx. 20MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
