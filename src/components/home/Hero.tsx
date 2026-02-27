import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, ArrowRight, UserPlus, CreditCard, BookOpen, Mail, CheckCircle2 } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const steps = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    description: "Hace click en \"Iniciar Sesión\" arriba a la derecha. Si no tenés cuenta, registrate con tu nombre, email y una contraseña. Es gratis y tarda menos de 1 minuto.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: BookOpen,
    title: "Elegí tu capacitación",
    description: "Anda a la sección \"Capacitaciones\" y explorá los cursos disponibles. Hace click en el que te interese para ver todos los detalles, el contenido y el precio.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: CreditCard,
    title: "Realizá el pago",
    description: "Hace click en \"Comprar\" y completá tus datos. Podés pagar con tarjeta de crédito/débito, MercadoPago o PayPal. El pago es 100% seguro.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    icon: Mail,
    title: "Recibí el acceso por email",
    description: "Inmediatamente después de pagar, te llega un email con un botón de acceso directo a tu curso. También se te da acceso automático en la plataforma.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
  },
  {
    icon: CheckCircle2,
    title: "Empezá a capacitarte",
    description: "Ingresá al curso con el link del email y empezá a aprender a tu ritmo. Tenés acceso al contenido, videos y materiales desde cualquier dispositivo.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
];

const Hero = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Entrenamiento deportivo profesional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-medium text-sm mb-6 backdrop-blur-sm">
            Plataforma #1 en Capacitación Deportiva
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
            <Button variant="heroOutline" size="xl" className="group" onClick={() => setShowGuide(true)}>
              <ShoppingCart className="w-5 h-5" />
              Cómo Comprar
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Cómo comprar tu capacitación
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm mt-1">
              Seguí estos simples pasos y en minutos ya estás capacitándote
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {steps.map((step, index) => (
              <div key={index} className={`flex gap-4 p-4 rounded-xl ${step.bg} border`}>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border`}>
                    <span className={`font-bold text-lg ${step.color}`}>{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full mt-2 bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
            <p className="text-sm font-medium text-foreground">
              ¿Tenés dudas? Escribinos a{" "}
              <a href="mailto:Profedeeducacionfisica22@gmail.com" className="text-primary underline">
                Profedeeducacionfisica22@gmail.com
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
