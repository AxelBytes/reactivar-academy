import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CourseDetailDialog from "@/components/courses/CourseDetailDialog";
import { Star, Clock, Users, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import courseFitness from "@/assets/course-fitness.jpg";
import courseNutrition from "@/assets/course-nutrition.jpg";
import courseMental from "@/assets/course-mental.jpg";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  image: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  duration: string;
  students: number;
  rating: number;
  lessons: number;
  videoUrl?: string;
  detailedDescription?: string;
  topics?: string[];
  includes?: string[];
}

const courses: Course[] = [
  {
    id: 1,
    title: "Entrenamiento Funcional Completo",
    description: "Domina las técnicas de entrenamiento funcional con ejercicios prácticos y rutinas efectivas.",
    instructor: "Carlos Mendoza",
    price: 150000,
    originalPrice: 250000,
    image: courseFitness,
    level: "Intermedio",
    duration: "12 horas",
    lessons: 45,
    students: 2340,
    rating: 4.9,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Este curso completo de entrenamiento funcional te enseñará todo lo necesario para dominar ejercicios con peso corporal, movimientos multiarticulares y rutinas de alta intensidad.\n\nAprenderás progresiones desde nivel principiante hasta avanzado, programación de entrenamientos efectivos y cómo adaptar ejercicios según tus objetivos específicos.",
    topics: [
      "Fundamentos del entrenamiento funcional",
      "Técnicas de ejercicios con peso corporal",
      "Progresiones de movimientos complejos",
      "Programación de rutinas personalizadas",
      "Prevención de lesiones",
      "Nutrición para rendimiento funcional"
    ],
    includes: [
      "45 videos en HD",
      "Material descargable",
      "Certificado de finalización",
      "Acceso de por vida",
      "Grupo privado de estudiantes",
      "Actualizaciones gratuitas"
    ],
  },
  {
    id: 2,
    title: "Nutrición para Atletas",
    description: "Aprende a optimizar tu alimentación para maximizar el rendimiento deportivo.",
    instructor: "Ana García",
    price: 110000,
    image: courseNutrition,
    level: "Básico",
    duration: "8 horas",
    lessons: 32,
    students: 1856,
    rating: 4.8,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Descubre cómo la nutrición correcta puede transformar tu rendimiento deportivo. Este curso te enseña los principios científicos de la nutrición deportiva aplicados a casos reales.\n\nAprenderás a calcular macros, timing de nutrientes, suplementación inteligente y cómo adaptar tu alimentación según tu deporte y objetivos.",
    topics: [
      "Macronutrientes y su función en el deporte",
      "Cálculo de requerimientos calóricos",
      "Timing de nutrientes pre y post entreno",
      "Hidratación óptima para atletas",
      "Suplementación basada en evidencia",
      "Planes de comidas prácticos"
    ],
    includes: [
      "32 lecciones en video",
      "Calculadoras de macros",
      "Recetarios deportivos",
      "Guías de suplementos",
      "Certificado profesional",
      "Soporte del instructor"
    ],
  },
  {
    id: 3,
    title: "Mentalidad Ganadora",
    description: "Desarrolla la fortaleza mental que necesitas para alcanzar tus objetivos deportivos.",
    instructor: "Roberto Díaz",
    price: 190000,
    originalPrice: 300000,
    image: courseMental,
    level: "Avanzado",
    duration: "15 horas",
    lessons: 52,
    students: 3120,
    rating: 4.9,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "La diferencia entre el éxito y el fracaso muchas veces está en la mente. Este curso avanzado te enseña técnicas de psicología deportiva utilizadas por atletas de élite mundial.\n\nAprenderás gestión del estrés competitivo, visualización, manejo de la presión, recuperación mental y cómo desarrollar rutinas mentales ganadoras.",
    topics: [
      "Psicología del alto rendimiento",
      "Técnicas de visualización avanzada",
      "Gestión de estrés competitivo",
      "Rutinas mentales pre-competencia",
      "Recuperación psicológica post-derrota",
      "Construcción de confianza inquebrantable",
      "Meditación para atletas",
      "Manejo de diálogo interno"
    ],
    includes: [
      "52 lecciones magistrales",
      "Audios de meditación guiada",
      "Workbooks interactivos",
      "Sesión 1-1 con el instructor",
      "Certificación profesional",
      "Comunidad privada de élite"
    ],
  },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Básico":
      return "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]";
    case "Intermedio":
      return "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]";
    case "Avanzado":
      return "bg-primary text-primary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const FeaturedCourses = () => {
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);

  const handleBuyCourse = (course: Course) => {
    addCourse({
      id: course.id,
      title: course.title,
      price: course.price,
      image: course.image,
      instructor: course.instructor,
    });

    toast({
      title: "¡Curso agregado!",
      description: `${course.title} se agregó al carrito.`,
    });
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Aprende de los mejores
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Capacitaciones Destacadas
          </h2>
          <p className="text-muted-foreground">
            Cursos diseñados por expertos para llevar tu rendimiento al siguiente nivel
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <article
              key={course.id}
              className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
                {course.originalPrice && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="font-medium">
                      -{Math.round((1 - course.price / course.originalPrice) * 100)}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                {/* Instructor */}
                <p className="text-sm text-muted-foreground mb-4">
                  Por <span className="text-foreground font-medium">{course.instructor}</span>
                </p>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">${course.price.toLocaleString("es-AR")}</span>
                    {course.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${course.originalPrice.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyCourse(course);
                    }}
                    disabled={isInCart(course.id, "course")}
                  >
                    {isInCart(course.id, "course") ? "En el Carrito" : "Comprar"}
                    {!isInCart(course.id, "course") && (
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/courses">
              Ver Todas las Capacitaciones
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>

      <CourseDetailDialog
        course={selectedCourse}
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
      />
    </section>
  );
};

export default FeaturedCourses;
