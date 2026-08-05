import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Loader2, Users, Clock, BarChart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";
import { SEO } from "@/components/SEO";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCourse = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCourse(data);
      } catch (error) {
        console.error("Error cargando curso:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el curso",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadCourse();
  }, [id, isAuthenticated]);

  // Si el usuario llega desde un link compartido sin estar registrado,
  // lo mandamos a crear cuenta y luego lo traemos de vuelta a este curso
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(`/curso/${id}`)}&tab=register`} replace />;
  }

  const handleAddToCart = () => {
    if (!course) return;
    addCourse({
      id: course.id,
      name: course.name,
      price: course.price,
      image: course.image_url || "",
    });
    toast({
      title: "Curso agregado",
      description: `${course.name} fue agregado al carrito`,
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Curso no encontrado</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${course.name} | Reactivar Academy`}
        description={course.description}
        type="article"
        image={course.image_url}
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del curso */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 shadow-xl">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-24 h-24 text-primary/30" />
                  </div>
                )}
                {course.is_new && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                      NUEVO
                    </Badge>
                  </div>
                )}
              </div>

              {/* Estadísticas del curso */}
              <div className="grid grid-cols-3 gap-4">
                {course.level && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-border text-center">
                    <BarChart className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Nivel</p>
                    <p className="font-semibold">{course.level}</p>
                  </div>
                )}
                {course.duration && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-border text-center">
                    <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Duración</p>
                    <p className="font-semibold">{course.duration}</p>
                  </div>
                )}
                {course.students_count !== undefined && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-border text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Estudiantes</p>
                    <p className="font-semibold">{course.students_count}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del curso */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4" variant="default">
                  Capacitación
                </Badge>
                <h1 className="text-4xl font-bold text-foreground mb-4">{course.name}</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
              </div>

              {course.instructor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-semibold mb-1">Instructor</p>
                  <p className="text-blue-900">{course.instructor}</p>
                </div>
              )}

              {course.modules && course.modules.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contenido del Curso</h3>
                  <ul className="space-y-2">
                    {course.modules.map((module: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        {module}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-5xl font-bold text-primary">
                    ${course.price.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    size="lg"
                    className="flex-1 text-lg py-6"
                    onClick={handleAddToCart}
                    disabled={isInCart(course.id, "course")}
                  >
                    {isInCart(course.id, "course") ? (
                      "En el carrito ✓"
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Inscribirme Ahora
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-semibold mb-3">Compartir este curso</h3>
                  <ShareButtons
                    url={`/curso/${course.id}`}
                    title={course.name}
                    description={course.description}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CourseDetail;
