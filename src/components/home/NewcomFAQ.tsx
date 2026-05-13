import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "¿Qué es el Newcom y por qué es tan popular en Argentina?",
    a: "El Newcom es un deporte de equipo derivado del vóleibol, pensado especialmente para adultos. Se juega con una pelota más liviana y la red se ubica a menor altura, lo que lo hace accesible para personas mayores de 40 años que quieran mantenerse activas físicamente. En Argentina el Newcom se volvió uno de los deportes con mayor crecimiento en los últimos años, especialmente entre adultos mayores y personas que buscan reinsertarse en la actividad física sin las lesiones típicas de otros deportes de impacto.",
  },
  {
    q: "¿Cuáles son las reglas básicas del Newcom?",
    a: "El Newcom se juega entre dos equipos de 6 jugadores cada uno, separados por una red. A diferencia del vóley, la pelota se atrapa y se lanza nuevamente sobre la red (no se golpea). Cada equipo puede dar hasta 3 pases antes de cruzar la pelota al campo contrario. El partido se gana al ganar 2 sets de 25 puntos. El reglamento oficial completo se encuentra disponible en el Buscador del Reglamento de Reactivar Academy.",
  },
  {
    q: "¿Cómo me formo como entrenador o formador de Newcom?",
    a: "Reactivar Academy ofrece capacitaciones online completas para formarte como entrenador de Newcom certificado. Las capacitaciones están a cargo del profesor Diego Machado, referente nacional del Newcom en Argentina. Incluyen videos en HD, materiales descargables, soporte semanal y acceso de por vida al contenido. Podés cursar desde cualquier dispositivo y a tu ritmo.",
  },
  {
    q: "¿Qué necesito saber para ser árbitro de Newcom?",
    a: "Para ser árbitro de Newcom necesitás conocer el reglamento oficial al detalle, dominar las señales arbitrales y practicar la toma de decisiones rápida. Reactivar Academy ofrece capacitación específica para árbitros y planilleros de Newcom, además del Buscador del Reglamento que te permite consultar cualquier artículo en segundos durante un partido.",
  },
  {
    q: "¿Quién es Diego Machado y por qué seguir sus capacitaciones de Newcom?",
    a: "Diego Machado es profesor de Educación Física especializado en Newcom y referente del deporte en Argentina. Tiene más de 29.000 seguidores en Facebook y dirige Reactivar Academy, la plataforma #1 de capacitación en Newcom del país. Su método integra formación física, técnica y reglamentaria, ofreciendo herramientas concretas para entrenadores, profesores y jugadores que quieren elevar su nivel.",
  },
  {
    q: "¿El Newcom es lo mismo que el Vóley o el Cestobol?",
    a: "No, son deportes distintos aunque comparten algunas características. El Vóley se golpea la pelota, el Newcom se atrapa y se lanza. El Cestobol también se atrapa pero se juega en una cancha con cestos. El Newcom está diseñado específicamente para adultos y adultos mayores, por eso tiene menor impacto físico y permite extender la vida deportiva a edades en las que otros deportes ya no son viables.",
  },
  {
    q: "¿Puedo aprender Newcom siendo principiante o solo es para entrenadores?",
    a: "Las capacitaciones de Reactivar Academy son tanto para entrenadores y profesores como para jugadores que quieran aprender el deporte desde cero o mejorar su nivel técnico. Hay material específico para principiantes, intermedios y avanzados. También hay ebooks descargables que sirven como introducción al Newcom de manera autodidacta.",
  },
  {
    q: "¿Dónde puedo consultar el reglamento oficial del Newcom?",
    a: "El reglamento oficial del Newcom está disponible en formato consulta inteligente en el Buscador del Reglamento de Reactivar Academy. Es una herramienta web que permite buscar cualquier artículo del reglamento por palabra clave en segundos, ideal para árbitros, planilleros, entrenadores y jugadores. Funciona en celular, tablet o computadora.",
  },
];

const NewcomFAQ = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section className="py-16 lg:py-24 bg-background" aria-label="Preguntas frecuentes sobre Newcom en Argentina">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-wider mb-4">
              <HelpCircle className="w-4 h-4" />
              Preguntas Frecuentes
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Todo sobre el Newcom en Argentina
            </h2>
            <p className="text-lg text-muted-foreground">
              Resolvé tus dudas sobre el deporte Newcom, sus reglas, capacitaciones y nuestra plataforma
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-xl border border-border shadow-sm overflow-hidden data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-5 py-4 text-left font-semibold text-base md:text-lg text-foreground hover:no-underline hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 text-muted-foreground text-base leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default NewcomFAQ;
