import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Atleta Amateur",
    content: "Las capacitaciones de SportEduPro transformaron mi entrenamiento. El contenido es claro, práctico y los resultados se notan desde la primera semana.",
    rating: 5,
    avatar: "MG",
  },
  {
    id: 2,
    name: "Juan Rodríguez",
    role: "Entrenador Personal",
    content: "Como profesional, recomiendo esta plataforma a todos mis clientes. La calidad del contenido y el material descargable son excepcionales.",
    rating: 5,
    avatar: "JR",
  },
  {
    id: 3,
    name: "Laura Martínez",
    role: "Deportista de Élite",
    content: "El curso de mentalidad ganadora me ayudó a superar mis límites mentales. Ahora compito con más confianza y mejores resultados.",
    rating: 5,
    avatar: "LM",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Lo que Dicen Nuestros Estudiantes
          </h2>
          <p className="text-muted-foreground">
            Miles de deportistas ya han transformado su rendimiento con nosotros
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-card-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
