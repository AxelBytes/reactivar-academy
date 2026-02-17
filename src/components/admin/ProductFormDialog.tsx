import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (product: any) => void;
}

const ProductFormDialog = ({ open, onOpenChange, onSave }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  const handleImageChange = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Convertir features de texto a array
      const featuresArray = formData.features
        .split("\n")
        .filter(f => f.trim() !== "")
        .map(f => f.trim());

      // Crear objeto del producto para Supabase
      const newProduct = {
        name: formData.name,
        description: formData.description,
        detailed_description: formData.detailedDescription || null,
        price: parseInt(formData.price),
        original_price: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        image_url: formData.image || null,
        video_url: formData.videoUrl || null,
        features: featuresArray.length > 0 ? featuresArray : null,
        status: "active",
        is_new: true,
        sales: 0,
      };

      // Enviar al handler de guardado (que guardará en Supabase)
      if (onSave) {
        await onSave(newProduct);
      }

      // Resetear formulario
      setFormData({
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
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear el producto",
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
          <DialogTitle>Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa el formulario para agregar un nuevo producto a la tienda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del Producto <span className="text-red-500">*</span></Label>
            <ImageUpload
              onImageUploaded={handleImageChange}
              currentImageUrl={formData.image}
              folder="products"
              maxSizeMB={10}
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Producto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Zapatillas Running Pro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Descripción Corta */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción Corta <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descripción breve que aparecerá en las tarjetas"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
              rows={4}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Calzado">Calzado</SelectItem>
                <SelectItem value="Pesas">Pesas</SelectItem>
                <SelectItem value="Accesorios">Accesorios</SelectItem>
                <SelectItem value="Ropa">Ropa Deportiva</SelectItem>
                <SelectItem value="Suplementos">Suplementos</SelectItem>
                <SelectItem value="Equipamiento">Equipamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Precio (ARS) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="150000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">
              Stock Disponible <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              placeholder="50"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL del Video (opcional)</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/embed/..."
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              URL de YouTube (formato embed). Aparecerá en el modal de detalles.
            </p>
          </div>

          {/* Características */}
          <div className="space-y-2">
            <Label htmlFor="features">Características (opcional)</Label>
            <Textarea
              id="features"
              placeholder="Una característica por línea&#10;Amortiguación avanzada&#10;Peso ultra-ligero&#10;Diseño ergonómico"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
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
              Crear Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
