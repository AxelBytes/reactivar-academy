import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Check, Clock, Users, Star, BookOpen, Award, PlayCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface CourseDetailDialogProps {
  course: {
    id: number;
    title: string;
    description: string;
    instructor: string;
    price: number;
    originalPrice?: number;
    image: string;
    level: string;
    duration: string;
    lessons: number;
    students: number;
    rating: number;
    videoUrl?: string;
    detailedDescription?: string;
    topics?: string[];
    includes?: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case "Básico":
      return "bg-green-500 text-white";
    case "Intermedio":
      return "bg-yellow-500 text-white";
    case "Avanzado":
      return "bg-red-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const CourseDetailDialog = ({ course, open, onOpenChange }: CourseDetailDialogProps) => {
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();

  if (!course) return null;

  const handleAddToCart = () => {
    addCourse({
      id: course.id,
      title: course.title,
      price: course.price,
      image: course.image,
      instructor: course.instructor,
    });

    toast({
      title: "Curso agregado",
      description: `${course.title} se agregó a tu carrito`,
    });

    onOpenChange(false);
  };

  const isCourseInCart = isInCart(course.id, "course");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogTitle className="text-2xl flex-1">{course.title}</DialogTitle>
            <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
          </div>
          <DialogDescription>{course.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          {course.videoUrl && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={course.videoUrl}
                title={`Video de ${course.title}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Image if no video */}
          {!course.videoUrl && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-white/80" />
              </div>
            </div>
          )}

          {/* Instructor & Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Por</span>
              <span className="font-medium">{course.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{course.lessons} lecciones</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{course.students.toLocaleString()} estudiantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{course.rating}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${course.price.toLocaleString("es-AR")}
              </span>
              {course.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${course.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
            </div>
            {course.originalPrice && (
              <Badge variant="secondary" className="text-green-600 bg-green-100">
                {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          <Separator />

          {/* Detailed Description */}
          {course.detailedDescription && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Sobre este curso</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {course.detailedDescription}
              </p>
            </div>
          )}

          {/* Topics Covered */}
          {course.topics && course.topics.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Qué aprenderás</h3>
              <ul className="space-y-2">
                {course.topics.map((topic, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Includes */}
          {course.includes && course.includes.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Este curso incluye</h3>
              <div className="grid grid-cols-2 gap-3">
                {course.includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Access Info */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">Acceso inmediato - Aprende a tu ritmo</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isCourseInCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isCourseInCart ? "Ya está en el carrito" : "Agregar al Carrito"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailDialog;
