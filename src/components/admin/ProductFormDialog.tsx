import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PdfUpload } from "@/components/admin/PdfUpload";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export interface ProductData {
  id?: number;
  name: string;
  description: string;
  detailed_description?: string | null;
  price: number;
  original_price?: number | null;
  category: string;
  stock: number;
  image_url?: string | null;
  video_url?: string | null;
  features?: string[] | null;
  pdf_url?: string | null;
  subscription_months?: number;
  status?: string;
  is_new?: boolean;
  sales?: number;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (product: any) => void;
  editProduct?: ProductData | null;
  lockedCategory?: string; // Si se pasa, la categoría queda fija y no se puede cambiar
  excludeCategories?: string[]; // Categorías que no se pueden seleccionar
}

const EMPTY_FORM = {
  name: "",
  description: "",
  detailedDescription: "",
  price: "",
  originalPrice: "",
  category: "",
  stock: "",
  image: "",
  videoUrl: "",
  features: "",
  pdfUrl: "",
  subscriptionMonths: "1",
};

const ProductFormDialog = ({ open, onOpenChange, onSave, editProduct, lockedCategory, excludeCategories = [] }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const isEditing = !!editProduct;

  // Pre-rellenar el formulario cuando se abre en modo edición
  useEffect(() => {
    if (open) {
      if (editProduct) {
        setFormData({
          name:                editProduct.name                      || "",
          description:         editProduct.description               || "",
          detailedDescription: editProduct.detailed_description      || "",
          price:               editProduct.price?.toString()         || "",
          originalPrice:       editProduct.original_price?.toString() || "",
          category:            lockedCategory || editProduct.category || "",
          stock:               editProduct.stock?.toString()         || "",
          image:               editProduct.image_url                 || "",
          videoUrl:            editProduct.video_url                 || "",
          features:            editProduct.features?.join("\n")      || "",
          pdfUrl:              editProduct.pdf_url                   || "",
          subscriptionMonths:  editProduct.subscription_months?.toString() || "1",
        });
      } else {
        setFormData({ ...EMPTY_FORM, category: lockedCategory || "" });
      }
    }
  }, [open, editProduct, lockedCategory]);

  const handleImageChange = (imageUrl: string) => setFormData(f => ({ ...f, image: imageUrl }));
  const handlePdfChange   = (pdfUrl: string)   => setFormData(f => ({ ...f, pdfUrl }));

  const isDigital     = formData.category === "Digital" || formData.category === "Books";
  const isSuscripcion = formData.category === "Suscripcion";
  const isFisico      = formData.category === "Fisico";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        toast({
          title: "Error",
          description: "Por favor completá todos los campos obligatorios",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const featuresArray = formData.features
        .split("\n")
        .filter(f => f.trim() !== "")
        .map(f => f.trim());

      const productPayload: Record<string, any> = {
        name:                 formData.name,
        description:          formData.description,
        detailed_description: formData.detailedDescription || null,
        price:                parseInt(formData.price),
        original_price:       formData.originalPrice ? parseInt(formData.originalPrice) : null,
        category:             formData.category,
        stock:                parseInt(formData.stock) || 0,
        image_url:            formData.image || null,
        video_url:            formData.videoUrl || null,
        features:             featuresArray.length > 0 ? featuresArray : null,
        pdf_url:              formData.pdfUrl || null,
        status:               "active",
      };

      if (!isEditing) {
        productPayload.is_new = true;
        productPayload.sales  = 0;
      }

      if (isSuscripcion) {
        productPayload.subscription_months = parseInt(formData.subscriptionMonths);
      }

      if (onSave) {
        await onSave({ ...productPayload, id: editProduct?.id });
      }

      setFormData(EMPTY_FORM);
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: `Hubo un error al ${isEditing ? "editar" : "crear"} el producto`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar: ${editProduct?.name}` : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modificá los campos que querés actualizar"
              : "Completá el formulario para agregar un nuevo producto a la tienda"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del Producto {!isEditing && <span className="text-red-500">*</span>}</Label>
            <ImageUpload
              onImageUploaded={handleImageChange}
              currentImageUrl={formData.image}
              folder="products"
              maxSizeMB={10}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Ej: Zapatillas Running Pro"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          {/* Descripción Corta */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción Corta <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder="Descripción breve que aparecerá en las tarjetas"
              value={formData.description}
              onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              rows={2}
              required
            />
          </div>

          {/* Descripción Detallada */}
          <div className="space-y-2">
            <Label htmlFor="detailedDescription">Descripción Detallada</Label>
            <Textarea
              id="detailedDescription"
              placeholder="Descripción completa que aparecerá en el modal de detalles"
              value={formData.detailedDescription}
              onChange={e => setFormData(f => ({ ...f, detailedDescription: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría <span className="text-red-500">*</span></Label>
            {lockedCategory ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground cursor-not-allowed">
                📄 {lockedCategory === "Digital" ? "Producto Digital (PDF)" : lockedCategory}
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">fija</span>
              </div>
            ) : (
            <Select
              value={formData.category}
              onValueChange={value => setFormData(f => ({ ...f, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {!excludeCategories.includes("Suscripcion") && (
                  <SelectItem value="Suscripcion">🔑 Suscripción (clave de acceso)</SelectItem>
                )}
                {!excludeCategories.includes("Digital") && (
                  <SelectItem value="Digital">📄 Ebook Educativo (PDF)</SelectItem>
                )}
                {!excludeCategories.includes("Books") && (
                  <SelectItem value="Books">📚 Mini Ebook (PDF)</SelectItem>
                )}
                {!excludeCategories.includes("Fisico") && (
                  <SelectItem value="Fisico">🏐 Artículo Deportivo Físico</SelectItem>
                )}
                <SelectItem value="Calzado">👟 Calzado</SelectItem>
                <SelectItem value="Pesas">🏋️ Pesas</SelectItem>
                <SelectItem value="Accesorios">🎽 Accesorios</SelectItem>
                <SelectItem value="Ropa">👕 Ropa Deportiva</SelectItem>
                <SelectItem value="Suplementos">💊 Suplementos</SelectItem>
                <SelectItem value="Equipamiento">⚽ Equipamiento</SelectItem>
              </SelectContent>
            </Select>
            )}
          </div>

          {/* Precio y Precio Original */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (ARS) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                type="number"
                placeholder="150000"
                value={formData.price}
                onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Precio Original (opcional)</Label>
              <Input
                id="originalPrice"
                type="number"
                placeholder="200000"
                value={formData.originalPrice}
                onChange={e => setFormData(f => ({ ...f, originalPrice: e.target.value }))}
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Disponible <span className="text-red-500">*</span></Label>
            <Input
              id="stock"
              type="number"
              placeholder="50"
              value={formData.stock}
              onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
              required
            />
          </div>

          {/* Información de Envío - Solo para productos físicos */}
          {isFisico && (
            <div className="space-y-2 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  📦
                </div>
                <div className="flex-1">
                  <Label className="text-cyan-800 font-semibold">Información de Envío</Label>
                  <p className="text-sm text-cyan-700 mt-1">
                    <strong>Envío: Acordar por WhatsApp</strong>
                  </p>
                  <p className="text-xs text-cyan-600 mt-1">
                    ⏳ Próximamente: Calculador automático de envíos
                  </p>
                  <p className="text-xs text-cyan-600 mt-2">
                    El cliente deberá coordinar el envío directamente por WhatsApp después de la compra.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL del Video (opcional)</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/embed/..."
              value={formData.videoUrl}
              onChange={e => setFormData(f => ({ ...f, videoUrl: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              URL de YouTube (formato embed). Aparecerá en el modal de detalles.
            </p>
          </div>

          {/* Meses - Solo para suscripciones */}
          {isSuscripcion && (
            <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Label className="text-yellow-800 font-semibold">🔑 Duración de la suscripción</Label>
              <p className="text-xs text-yellow-700">
                Al comprar este producto, se asignará automáticamente una clave de acceso
                con la duración seleccionada. El cliente la recibirá por email.
              </p>
              <Select
                value={formData.subscriptionMonths}
                onValueChange={v => setFormData(f => ({ ...f, subscriptionMonths: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mes</SelectItem>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses (1 año)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* PDF - Solo para productos digitales */}
          {isDigital && (
            <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Label className="text-blue-800 font-semibold">
                📄 Archivo PDF del Producto <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-blue-600">
                Este PDF se enviará automáticamente al email del comprador después de la compra.
              </p>
              <PdfUpload
                onPdfUploaded={handlePdfChange}
                currentPdfUrl={formData.pdfUrl}
                folder="pdfs"
              />
            </div>
          )}

          {/* Características */}
          <div className="space-y-2">
            <Label htmlFor="features">Características (opcional)</Label>
            <Textarea
              id="features"
              placeholder={"Una característica por línea\nAmortiguación avanzada\nPeso ultra-ligero\nDiseño ergonómico"}
              value={formData.features}
              onChange={e => setFormData(f => ({ ...f, features: e.target.value }))}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Escribe una característica por línea. Aparecerán como bullets en el modal.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
