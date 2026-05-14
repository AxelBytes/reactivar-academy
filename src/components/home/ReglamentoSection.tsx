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
        <div className="relative max-w-4xl mx-auto mb-14 px-6 md:px-10 py-10 md:py-14 rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-600 shadow-2xl border-4 border-primary/20">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-primary-foreground font-bold text-sm uppercase tracking-widest mb-5 border border-white/30">
              <Search className="w-4 h-4" />
              Herramienta exclusiva
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-primary-foreground mb-5 leading-tight tracking-tight drop-shadow-lg">
              El reglamento en la<br />
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent">palma de tu mano</span>
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium max-w-2xl mx-auto leading-relaxed">
              Accedé al buscador inteligente del Reglamento Oficial de Newcom. Encontrá cualquier artículo, capítulo o regla en segundos desde tu celular.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">

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
