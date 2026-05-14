import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CourseDetailDialog from "@/components/courses/CourseDetailDialog";
import { Star, Clock, Users, ArrowRight, Loader2, Flame } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import courseFitness from "@/assets/course-fitness.jpg";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { motion } from "framer-motion";

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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          const mapped = data.map((course) => ({
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
          setCourses(mapped);
        }
      } catch (err) {
        console.error("Error cargando cursos destacados:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleBuyCourse = (course: any) => {
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

  if (!loading && courses.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal width="100%" duration={0.8}>
          <div className="relative max-w-4xl mx-auto mb-14 px-6 md:px-10 py-10 md:py-14 rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-600 shadow-2xl border-4 border-primary/20">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-primary-foreground font-bold text-sm uppercase tracking-widest mb-5 border border-white/30">
              <Flame className="w-4 h-4" />
              Aprende de los mejores
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary-foreground mb-5 leading-none tracking-tight drop-shadow-lg">
              Capacitaciones<br />
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent">Destacadas</span>
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium max-w-2xl mx-auto leading-relaxed">
              Cursos diseñados por expertos para llevar tu formación al siguiente nivel
            </p>
          </div>
        </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <StaggerContainer 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            staggerDelay={0.15}
          >
            {courses.map((course) => (
              <StaggerItem key={course.id}>
              <motion.article
                whileHover={{ 
                  scale: 1.03,
                  rotateY: 2,
                  rotateX: -2,
                  transition: { duration: 0.3 }
                }}
                className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
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

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Por <span className="text-foreground font-medium">{course.instructor}</span>
                  </p>

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
              </motion.article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/cursos">
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
