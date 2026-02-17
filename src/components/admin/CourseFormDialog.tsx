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
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video } from "lucide-react";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (course: any) => void;
}

const CourseFormDialog = ({ open, onOpenChange, onSave }: CourseFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    detailedDescription: "",
    price: "",
    originalPrice: "",
    level: "",
    duration: "",
    lessons: "",
    image: "",
    videoUrl: "",
    topics: "",
    includes: "",
    instructor: "Diego Machado", // Predeterminado
    category: "Capacitaciones",
    systemeProductId: "", // ID del producto en systeme.io
  });

  const handleImageChange = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.title || !formData.description || !formData.price || !formData.level || !formData.duration) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Convertir topics de texto a array
      const topicsArray = formData.topics
        .split("\n")
        .filter(t => t.trim() !== "")
        .map(t => t.trim());

      // Convertir includes de texto a array
      const includesArray = formData.includes
        .split("\n")
        .filter(i => i.trim() !== "")
        .map(i => i.trim());

      // Crear objeto del curso para Supabase
      const newCourse = {
        title: formData.title,
        description: formData.description,
        detailed_description: formData.detailedDescription || null,
        price: parseInt(formData.price),
        original_price: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        level: formData.level as "Básico" | "Intermedio" | "Avanzado",
        duration: formData.duration,
        lessons: parseInt(formData.lessons) || 0,
        image_url: formData.image || null,
        video_url: formData.videoUrl || null,
        topics: topicsArray.length > 0 ? topicsArray : null,
        includes: includesArray.length > 0 ? includesArray : null,
        instructor: formData.instructor,
        category: formData.category,
        students: 0,
        rating: 5.0,
        status: "active",
        is_new: true,
        systeme_product_id: formData.systemeProductId.trim() || null, // ID de systeme.io
      };

      // Enviar al handler de guardado (que guardará en Supabase)
      if (onSave) {
        await onSave(newCourse);
      }

      // Resetear formulario
      setFormData({
        title: "",
        description: "",
        detailedDescription: "",
        price: "",
        originalPrice: "",
        level: "",
        duration: "",
        lessons: "",
        image: "",
        videoUrl: "",
        topics: "",
        includes: "",
        instructor: "Diego Machado",
        category: "Capacitaciones",
        systemeProductId: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear el curso",
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
          <DialogTitle>Nueva Capacitación</DialogTitle>
          <DialogDescription>
            Completa el formulario para agregar una nueva capacitación
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen de Portada */}
          <ImageUpload
            currentImage={formData.image}
            onImageChange={handleImageChange}
            label="Imagen de Portada *"
            folder="courses"
          />

          {/* Video de Presentación */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl">
              Video de Presentación <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                className="pl-10"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              URL de YouTube en formato embed. Este video se mostrará en el modal de detalles.
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título del Curso <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Entrenamiento Funcional Completo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          {/* Instructor (Predeterminado) */}
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="bg-muted"
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Por defecto: Diego Machado (puedes cambiarlo si necesitas)
            </p>
          </div>

          {/* Nivel y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">
                Nivel <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Intermedio">Intermedio</SelectItem>
                  <SelectItem value="Avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duración <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                placeholder="Ej: 12 horas, 8 semanas"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Lecciones */}
          <div className="space-y-2">
            <Label htmlFor="lessons">Cantidad de Lecciones</Label>
            <Input
              id="lessons"
              type="number"
              placeholder="24"
              value={formData.lessons}
              onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
            />
          </div>

          {/* Precio */}
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

          {/* ID de systeme.io */}
          <div className="space-y-2 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <Label htmlFor="systemeProductId" className="text-blue-900 dark:text-blue-100 font-semibold">
              🎯 ID del Curso en systeme.io (Acceso Automático)
            </Label>
            <Input
              id="systemeProductId"
              placeholder="Ej: 12345"
              value={formData.systemeProductId}
              onChange={(e) => setFormData({ ...formData, systemeProductId: e.target.value })}
              className="font-mono bg-white dark:bg-gray-900"
            />
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium">📋 ¿Cómo obtener el ID?</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Ve a systeme.io → Productos/Cursos</li>
                <li>Click en tu curso para editarlo</li>
                <li>Copia el número de la URL: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">https://systeme.io/courses/12345/edit</code></li>
                <li>Pega ese número aquí: <strong>12345</strong></li>
              </ol>
              <p className="mt-2 font-medium text-green-700 dark:text-green-400">
                ✨ Con este ID, cuando alguien compre el curso, automáticamente recibirá acceso en systeme.io
              </p>
            </div>
          </div>

          {/* Temas del Curso */}
          <div className="space-y-2">
            <Label htmlFor="topics">Temas que Aprenderás (opcional)</Label>
            <Textarea
              id="topics"
              placeholder="Un tema por línea&#10;Fundamentos del entrenamiento&#10;Técnicas avanzadas&#10;Nutrición deportiva"
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Escribe un tema por línea. Aparecerán como bullets en el modal.
            </p>
          </div>

          {/* Qué Incluye */}
          <div className="space-y-2">
            <Label htmlFor="includes">Qué Incluye el Curso (opcional)</Label>
            <Textarea
              id="includes"
              placeholder="Un item por línea&#10;Acceso de por vida&#10;Certificado digital&#10;Soporte por WhatsApp"
              value={formData.includes}
              onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Escribe un item por línea. Aparecerán con íconos en el modal.
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
              Crear Curso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormDialog;
