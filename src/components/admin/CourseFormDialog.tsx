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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video } from "lucide-react";

const SYSTEME_BASE_URL = "https://profedeeducacionfisica22.systeme.io/school/course/";

function extractSlugFromAccessUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith(SYSTEME_BASE_URL)) {
    return url.replace(SYSTEME_BASE_URL, "");
  }
  return url;
}

const emptyForm = {
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
  accessUrl: "",
};

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (course: any) => void;
  editingCourse?: any;
}

const CourseFormDialog = ({ open, onOpenChange, onSave, editingCourse }: CourseFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!editingCourse;

  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || "",
        description: editingCourse.description || "",
        detailedDescription: editingCourse.detailed_description || "",
        price: editingCourse.price?.toString() || "",
        originalPrice: editingCourse.original_price?.toString() || "",
        level: editingCourse.level || "",
        duration: editingCourse.duration || "",
        lessons: editingCourse.lessons?.toString() || "",
        image: editingCourse.image_url || "",
        videoUrl: editingCourse.video_url || "",
        topics: Array.isArray(editingCourse.topics) ? editingCourse.topics.join("\n") : "",
        includes: Array.isArray(editingCourse.includes) ? editingCourse.includes.join("\n") : "",
        instructor: editingCourse.instructor || "Diego Machado",
        category: editingCourse.category || "Capacitaciones",
        systemeProductId: editingCourse.systeme_product_id || "",
        accessUrl: extractSlugFromAccessUrl(editingCourse.access_url),
      });
    } else {
      setFormData({ ...emptyForm });
    }
  }, [editingCourse, open]);

  const handleImageChange = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.price || !formData.level || !formData.duration) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const topicsArray = formData.topics
        .split("\n")
        .filter(t => t.trim() !== "")
        .map(t => t.trim());

      const includesArray = formData.includes
        .split("\n")
        .filter(i => i.trim() !== "")
        .map(i => i.trim());

      const courseData: any = {
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
        systeme_product_id: formData.systemeProductId.trim() || null,
        access_url: formData.accessUrl.trim()
          ? `${SYSTEME_BASE_URL}${formData.accessUrl.trim()}`
          : null,
      };

      if (!isEditing) {
        courseData.students = 0;
        courseData.rating = 5.0;
        courseData.status = "active";
        courseData.is_new = true;
      }

      if (onSave) {
        await onSave(courseData);
      }

      setFormData({ ...emptyForm });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Hubo un error al ${isEditing ? 'actualizar' : 'crear'} el curso`,
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
          <DialogTitle>
            {isEditing ? `Editando: ${editingCourse.title}` : "Nueva Capacitación"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los campos que necesites y guarda los cambios"
              : "Completa el formulario para agregar una nueva capacitación"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen de Portada */}
          <div className="space-y-2">
            <Label>Imagen de Portada <span className="text-red-500">*</span></Label>
            <ImageUpload
              onImageUploaded={handleImageChange}
              currentImageUrl={formData.image}
              folder="courses"
              maxSizeMB={10}
            />
          </div>

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

          {/* URL de Acceso al Curso */}
          <div className="space-y-2 bg-green-50 dark:bg-green-950 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
            <Label htmlFor="accessUrl" className="text-green-900 dark:text-green-100 font-semibold">
              Slug del Curso en systeme.io (para link de acceso)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-700 dark:text-green-300 whitespace-nowrap font-mono">
                .systeme.io/school/course/
              </span>
              <Input
                id="accessUrl"
                placeholder="reactivar"
                value={formData.accessUrl}
                onChange={(e) => setFormData({ ...formData, accessUrl: e.target.value.toLowerCase().trim() })}
                className="font-mono bg-white dark:bg-gray-900"
              />
            </div>
            {formData.accessUrl && (
              <p className="text-xs text-green-600 dark:text-green-400 font-mono break-all">
                URL final: https://profedeeducacionfisica22.systeme.io/school/course/{formData.accessUrl}
              </p>
            )}
            <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
              <p className="font-medium">Como encontrar el slug sin registrarte como alumno:</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Anda a systeme.io → tu curso → <strong>Paginas del curso</strong></li>
                <li>Mira la URL de la pagina de acceso/registro del curso</li>
                <li>El slug es la ultima parte de la URL (ej: <strong>reactivar</strong>)</li>
              </ol>
              <p className="mt-1">Para tu curso actual el slug es: <code className="bg-green-100 dark:bg-green-900 px-1 rounded font-bold">reactivar</code></p>
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
              {isEditing ? "Guardar Cambios" : "Crear Curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormDialog;
