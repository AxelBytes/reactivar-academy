import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Entrenamiento deportivo profesional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6 backdrop-blur-sm">
            🏆 Plataforma #1 en Capacitación Deportiva
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground leading-tight mb-6">
            Crea tu mejor versión como
            <span className="text-primary block mt-2">Entrenador/formador de deportistas Newconeros.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8 leading-relaxed">
            Accede a capacitaciones en video y materiales específicos del deporte; todo el paso a paso para fortalecer las bases integrales de tus practicantes y crear deportistas Newconeros que perduran en el tiempo evitando todo tipo de lesiones y frustraciones en el proceso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl" className="group">
              Explorar Cursos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl" className="group">
              <Play className="w-5 h-5" />
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-secondary-foreground/10">
            {[
              { value: "50+", label: "Cursos" },
              { value: "10K+", label: "Estudiantes" },
              { value: "4.9", label: "Valoración" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-secondary-foreground/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
