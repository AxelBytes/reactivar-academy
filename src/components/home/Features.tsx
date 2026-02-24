import { Video, Download, Trophy, Shield, Headphones, Zap } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Videos de Alta Calidad",
    description: "Contenido grabado en HD con producción profesional y explicaciones claras.",
  },
  {
    icon: Download,
    title: "Material Descargable",
    description: "PDFs, plantillas y recursos complementarios para reforzar tu aprendizaje.",
  },
  {
    icon: Trophy,
    title: "Instructores Expertos",
    description: "Aprende de profesionales con años de experiencia en el deporte.",
  },
  {
    icon: Shield,
    title: "Acceso de por Vida",
    description: "Compra una vez y accede al contenido para siempre, sin límites. (Luego de cruzar los 4 meses de capacitación tendrás la opción de continuar con el acceso a esta herramienta que es la plataforma Reactivar; la misma se actualiza continuamente y podrás mantenerla de por vida abonando una suscripción mensual mínima.)",
  },
  {
    icon: Headphones,
    title: "Soporte Semanal",
    description: "Nuestro equipo está disponible para resolver todas tus dudas. Durante todo el cursado e incluso al finalizar si seguís con la suscripción tendrás acceso a una videoconferencia semanal para evacuar todo tipo de dudas!",
  },
  {
    icon: Zap,
    title: "Actualizaciones Continuas",
    description: "Contenido nuevo y actualizado regularmente sin costo adicional.",
  },
];

const Features = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Por qué elegirnos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Todo lo que Necesitas para Triunfar
          </h2>
          <p className="text-secondary-foreground/70">
            Una plataforma completa diseñada para tu desarrollo deportivo integral
          </p>
          <p className="text-secondary-foreground/60 text-sm mt-2">
            Una plataforma diseñada para tu desarrollo integral como entrenador/formador en el deporte Newcom.
            <br />
            La mejor herramienta que existe en la actualidad para los formadores de deportistas Newconeros.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-secondary-foreground/5 hover:bg-secondary-foreground/10 border border-secondary-foreground/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-secondary-foreground/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
