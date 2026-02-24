import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseDetailDialog from "@/components/courses/CourseDetailDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Clock, Users, Search, Filter, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";
import courseFitness from "@/assets/course-fitness.jpg";

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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);

  // Cargar cursos desde Supabase
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error cargando cursos:", error);
          setCourses([]);
          return;
        }

        if (data && data.length > 0) {
          const mappedCourses = data.map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            price: course.price,
            originalPrice: course.original_price || undefined,
            image: course.image_url || courseFitness,
            level: course.level,
            duration: course.duration,
            lessons: course.lessons,
            students: course.students,
            rating: course.rating,
            videoUrl: course.video_url || undefined,
            detailedDescription: course.detailed_description || undefined,
            topics: course.topics || [],
            includes: course.includes || [],
          }));
          setCourses(mappedCourses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Error inesperado cargando cursos:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

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
      <SEO 
        title="Cursos de Fitness y Entrenamiento Online - Reactivar Academy"
        description="Explora nuestro catálogo completo de cursos de fitness y entrenamiento profesional. Aprende con expertos certificados. Certificado incluido. Acceso de por vida."
        keywords={[
          'cursos fitness online',
          'entrenamiento profesional',
          'capacitación deportiva',
          'cursos certificados fitness',
          'entrenamiento online Argentina',
          'academia fitness',
          'cursos deportivos'
        ]}
        type="website"
      />
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando cursos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                <article
                  key={course.id}
                  className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-video bg-muted">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyCourse(course);
                        }}
                        disabled={isInCart(course.id, "course")}
                      >
                        {isInCart(course.id, "course") ? "En el Carrito" : "Comprar"}
                      </Button>
                    </div>
                  </div>
                </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <CourseDetailDialog
        course={selectedCourse}
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
      />

      <Footer />
    </div>
  );
};

export default Courses;
