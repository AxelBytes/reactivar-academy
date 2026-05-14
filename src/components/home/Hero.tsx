import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, ArrowRight, UserPlus, CreditCard, BookOpen, Mail, CheckCircle2 } from "lucide-react";
import heroBanner from "@/assets/hero-voleibol.png";
import profesorImg from "@/assets/profesor.png";
import { motion, useScroll, useTransform } from "framer-motion";

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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src={heroBanner}
          alt="Entrenamiento deportivo profesional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/98 via-secondary/90 to-secondary/40" />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <motion.div 
            className="max-w-2xl flex-1"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative p-8 md:p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-white/95 via-white/90 to-white/85 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85 shadow-2xl border-4 border-white/40 dark:border-gray-700/40 backdrop-blur-md">
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230ea5e9' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 text-primary font-bold text-sm mb-6 backdrop-blur-sm border border-primary/30 shadow-lg">
                  Plataforma #1 en Capacitación Deportiva especializada en el Deporte Newcom
                </span>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">
                  Crea tu mejor versión como:
                  <span className="block mt-3 bg-gradient-to-r from-primary via-blue-600 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
                    Formador / Entrenador
                  </span>
                  <span className="block mt-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                    Deportista autodidacta
                  </span>
                  <span className="block mt-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
                    Autoridad en este deporte
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed font-medium">
                  También encontra todo para practicar el deporte Newcom.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" size="xl" className="group shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    Explorar Cursos
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="xl" 
                    className="group shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gray-800 hover:bg-gray-900 text-white border-2 border-gray-700"
                    onClick={() => setShowGuide(true)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Cómo Comprar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hidden lg:flex flex-shrink-0 flex-col items-center gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative w-72 xl:w-80 h-[420px] xl:h-[460px] rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl backdrop-blur-sm">
              <img
                src={profesorImg}
                alt="Diego Machado - Profesor de Educación Física especializado en Newcom"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
            </div>
            <div className="text-center bg-secondary/40 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20 shadow-lg">
              <p className="text-secondary-foreground font-bold text-lg leading-tight">Machado Diego</p>
              <p className="text-secondary-foreground/90 text-sm mt-1">Profesor de Ed. Física</p>
              <p className="text-primary text-sm font-semibold mt-0.5">Especialización en Newcom</p>
            </div>
          </motion.div>
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
