import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Clock, Users, Search, Filter } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import courseFitness from "@/assets/course-fitness.jpg";
import courseNutrition from "@/assets/course-nutrition.jpg";
import courseMental from "@/assets/course-mental.jpg";

const courses = [
  {
    id: 1,
    title: "Entrenamiento Funcional Completo",
    description: "Domina las técnicas de entrenamiento funcional con ejercicios prácticos y rutinas efectivas para todo tipo de atletas.",
    instructor: "Carlos Mendoza",
    price: 150000,
    originalPrice: 250000,
    image: courseFitness,
    level: "Intermedio",
    duration: "12 horas",
    lessons: 45,
    students: 2340,
    rating: 4.9,
  },
  {
    id: 2,
    title: "Nutrición para Atletas",
    description: "Aprende a optimizar tu alimentación para maximizar el rendimiento deportivo y acelerar la recuperación.",
    instructor: "Ana García",
    price: 110000,
    image: courseNutrition,
    level: "Básico",
    duration: "8 horas",
    lessons: 32,
    students: 1856,
    rating: 4.8,
  },
  {
    id: 3,
    title: "Mentalidad Ganadora",
    description: "Desarrolla la fortaleza mental que necesitas para alcanzar tus objetivos deportivos y superar cualquier obstáculo.",
    instructor: "Roberto Díaz",
    price: 190000,
    originalPrice: 300000,
    image: courseMental,
    level: "Avanzado",
    duration: "15 horas",
    lessons: 52,
    students: 3120,
    rating: 4.9,
  },
  {
    id: 4,
    title: "Preparación Física Integral",
    description: "Programa completo de acondicionamiento físico para mejorar fuerza, resistencia, velocidad y flexibilidad.",
    instructor: "Carlos Mendoza",
    price: 170000,
    image: courseFitness,
    level: "Intermedio",
    duration: "20 horas",
    lessons: 68,
    students: 1540,
    rating: 4.7,
  },
  {
    id: 5,
    title: "Suplementación Deportiva",
    description: "Guía completa sobre suplementos deportivos: cuáles usar, cuándo y cómo para maximizar resultados.",
    instructor: "Ana García",
    price: 95000,
    originalPrice: 150000,
    image: courseNutrition,
    level: "Básico",
    duration: "6 horas",
    lessons: 24,
    students: 980,
    rating: 4.6,
  },
  {
    id: 6,
    title: "Gestión del Estrés Competitivo",
    description: "Técnicas avanzadas para manejar la presión y el estrés en competiciones de alto nivel.",
    instructor: "Roberto Díaz",
    price: 140000,
    image: courseMental,
    level: "Avanzado",
    duration: "10 horas",
    lessons: 38,
    students: 760,
    rating: 4.8,
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

const Courses = () => {
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();

  const handleBuyCourse = (course: typeof courses[0]) => {
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-secondary text-secondary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Todas las Capacitaciones
            </h1>
            <p className="text-secondary-foreground/80 max-w-2xl">
              Explora nuestro catálogo completo de cursos diseñados por expertos 
              para llevar tu rendimiento deportivo al siguiente nivel.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar capacitaciones..."
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <select className="h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option>Más populares</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Mejor valorados</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
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
                        onClick={() => handleBuyCourse(course)}
                        disabled={isInCart(course.id, "course")}
                      >
                        {isInCart(course.id, "course") ? "En el Carrito" : "Comprar"}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
