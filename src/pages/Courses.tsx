import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseDetailDialog from "@/components/courses/CourseDetailDialog";
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
    id: 999,
    title: "🧪 Curso de Prueba GRATIS",
    description: "Curso gratuito para probar el sistema de emails y pagos - No requiere pago real",
    instructor: "Diego Machado",
    price: 0,
    originalPrice: 50000,
    image: courseFitness,
    level: "Básico",
    duration: "1 hora",
    lessons: 5,
    students: 0,
    rating: 5.0,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Este es un curso completamente GRATUITO diseñado específicamente para probar el sistema de notificaciones por email y el flujo de compra completo.\n\nAl 'comprar' este curso (sin costo), recibirás un email de confirmación automático con todos los detalles de tu 'compra'. Esto permite verificar que:\n\n✅ El sistema de emails funciona correctamente\n✅ Los datos del cliente se capturan bien\n✅ La integración con Brevo está activa\n✅ El flujo completo de checkout funciona\n\nEs una herramienta de testing esencial antes de lanzar cursos de pago.",
    topics: [
      "Introducción al sistema de testing",
      "Cómo funciona el flujo de compra",
      "Verificación de emails automáticos",
      "Prueba de integración completa",
      "Testing de checkout sin costo"
    ],
    includes: [
      "Acceso inmediato y gratuito",
      "Email de confirmación automático",
      "Prueba de todo el sistema",
      "Sin cargo real",
      "Ideal para testing"
    ],
  },
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
    description: "Aprende a optimizar tu alimentación para maximizar el rendimiento deportivo y acelerar la recuperación.",
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Programa integral de 12 semanas que cubre todas las cualidades físicas esenciales. Desarrolla fuerza, potencia, resistencia cardiovascular, flexibilidad y movilidad de forma equilibrada.\n\nIdeal para deportistas que buscan una preparación física completa o personas que quieren alcanzar su mejor versión física.",
    topics: [
      "Periodización del entrenamiento",
      "Desarrollo de fuerza máxima",
      "Entrenamiento de potencia explosiva",
      "Acondicionamiento cardiovascular",
      "Movilidad y flexibilidad",
      "Prevención de lesiones"
    ],
    includes: [
      "68 videos instructivos",
      "Plan de 12 semanas",
      "Plantillas de seguimiento",
      "Certificado de logro",
      "Foro de estudiantes",
      "Bonus: Guía de recuperación"
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Navega el confuso mundo de la suplementación deportiva con información basada 100% en ciencia. Aprende qué suplementos realmente funcionan, cuáles son innecesarios y cómo usarlos de forma segura.\n\nAhorra dinero evitando productos ineficaces e invierte inteligentemente en suplementos que realmente marcan diferencia.",
    topics: [
      "Fundamentos de suplementación",
      "Proteínas: tipos y usos",
      "Creatina: la ciencia completa",
      "Pre-entrenos efectivos",
      "Vitaminas y minerales esenciales",
      "Suplementos para recuperación"
    ],
    includes: [
      "24 lecciones concisas",
      "Guía de compra inteligente",
      "Comparativas de productos",
      "Calculadora de dosis",
      "Certificado digital",
      "Actualizaciones anuales"
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    detailedDescription: "Curso especializado en manejo de presión competitiva. Aprende las mismas técnicas que utilizan atletas olímpicos para mantener la calma y el foco bajo máxima presión.\n\nDesarrolla protocolos personalizados para tus competiciones y transforma la ansiedad en energía productiva.",
    topics: [
      "Fisiología del estrés competitivo",
      "Técnicas de respiración avanzada",
      "Anclajes mentales para competencias",
      "Protocolo pre-competencia personalizado",
      "Manejo de expectativas externas",
      "Recuperación mental post-competencia"
    ],
    includes: [
      "38 videos especializados",
      "Ejercicios prácticos diarios",
      "Plantillas de protocolos",
      "Audio de respiración guiada",
      "Certificación avanzada",
      "Mentoría mensual grupal"
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

const Courses = () => {
  const { addCourse, isInCart } = useCart();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);

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
