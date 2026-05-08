import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Zap, Shield, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
  { icon: Search,     text: "Buscá cualquier artículo por nombre o palabra clave" },
  { icon: Zap,        text: "Resultados instantáneos, sin esperar" },
  { icon: Shield,     text: "Acceso seguro con tu clave personal" },
  { icon: RefreshCw,  text: "Reglamento siempre actualizado" },
];

const ReglamentoSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6">
            <Search className="w-4 h-4" />
            Herramienta exclusiva
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            El reglamento en la
            <span className="text-primary block mt-1">palma de tu mano</span>
          </h2>

          <p className="text-xl md:text-2xl text-secondary-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            Accedé al buscador inteligente del Reglamento Oficial de Newcom.
            Encontrá cualquier artículo, capítulo o regla en segundos desde tu celular.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto text-left">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-secondary-foreground/5 rounded-xl p-4 border border-secondary-foreground/10">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-base text-secondary-foreground/90 leading-snug pt-1">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 mb-8">
            {[
              "Búsqueda inteligente por artículo o palabra clave",
              "Disponible en celular, tablet o computadora",
              "Suscripción mensual, sin permanencia",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-lg text-secondary-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Button
            size="xl"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate("/saas")}
          >
            Ver Planes y Precios
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReglamentoSection;
