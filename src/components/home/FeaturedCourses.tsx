import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    students: 2340,
    rating: 4.9,
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
    students: 1856,
    rating: 4.8,
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
    students: 3120,
    rating: 4.9,
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
              className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border"
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
                    onClick={() => handleBuyCourse(course)}
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
          <Button variant="outline" size="lg">
            Ver Todas las Capacitaciones
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
