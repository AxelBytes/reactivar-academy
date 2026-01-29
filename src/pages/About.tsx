import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Video, Award, ArrowRight } from "lucide-react";

const stats = [
  { value: "50+", label: "Cursos Disponibles", icon: Video },
  { value: "10K+", label: "Estudiantes Activos", icon: Users },
  { value: "25+", label: "Instructores Expertos", icon: Award },
  { value: "98%", label: "Satisfacción", icon: Trophy },
];

const team = [
  {
    name: "Carlos Mendoza",
    role: "Director de Entrenamiento",
    bio: "Ex atleta olímpico con más de 15 años de experiencia en entrenamiento deportivo profesional.",
    initials: "CM",
  },
  {
    name: "Ana García",
    role: "Especialista en Nutrición",
    bio: "Nutricionista deportiva certificada con experiencia en equipos de alto rendimiento.",
    initials: "AG",
  },
  {
    name: "Roberto Díaz",
    role: "Psicólogo Deportivo",
    bio: "Especialista en preparación mental y gestión del rendimiento competitivo.",
    initials: "RD",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-secondary text-secondary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Transformando el <span className="text-primary">Deporte</span> a Través de la Educación
              </h1>
              <p className="text-lg text-secondary-foreground/80 leading-relaxed">
                En SportEduPro, creemos que el conocimiento es la base del éxito deportivo. 
                Nuestra misión es hacer accesible la formación de élite para todos los atletas, 
                sin importar su nivel o ubicación.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-accent/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Nuestra Misión
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                  Democratizar el Acceso a la Formación Deportiva de Élite
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Fundamos SportEduPro con una visión clara: que cualquier persona apasionada 
                  por el deporte tenga acceso a las mismas herramientas de formación que utilizan 
                  los atletas profesionales.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Nuestro equipo de instructores está compuesto por atletas de élite, entrenadores 
                  certificados y especialistas en diversas disciplinas deportivas, todos comprometidos 
                  con tu desarrollo.
                </p>
                <Button>
                  Conocer Nuestros Cursos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="relative">
                <div className="bg-primary/10 rounded-2xl p-8 lg:p-12">
                  <blockquote className="text-lg lg:text-xl text-foreground italic leading-relaxed">
                    "El verdadero potencial de un atleta se desbloquea cuando combina 
                    el entrenamiento físico con el conocimiento y la preparación mental."
                  </blockquote>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      CM
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Carlos Mendoza</p>
                      <p className="text-sm text-muted-foreground">Fundador y Director</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Nuestro Equipo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                Expertos que Te Guiarán
              </h2>
              <p className="text-muted-foreground">
                Conoce a los profesionales detrás de nuestras capacitaciones
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-6 text-center border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
                    {member.initials}
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para Comenzar tu Transformación?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Únete a nuestra comunidad de atletas comprometidos con su desarrollo personal y deportivo.
            </p>
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Explorar Capacitaciones
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
