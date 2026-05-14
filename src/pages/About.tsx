import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";

const team = [
  {
    name: "Diego Machado",
    role: "Fundador y Director",
    bio: "Profesor de Educación Física especializado en Newcom. Pionero en la formación deportiva especializada en este deporte en Argentina.",
    initials: "DM",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sobre Nosotros - Reactivar Academy Newcom | Diego Machado"
        description="Conocé a Diego Machado y el equipo de Reactivar Academy. Profesores especializados en Newcom que forman entrenadores y deportistas en toda Argentina."
        keywords={[
          'diego machado newcom',
          'sobre reactivar academy',
          'profesor de newcom',
          'historia newcom argentina',
          'equipo reactivar academy',
          'entrenadores de newcom',
          'formacion deportiva newcom',
        ]}
      />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-secondary text-secondary-foreground py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Transformando el <span className="text-primary">Newcom</span> a Través de la Educación
              </h1>
              <p className="text-lg text-secondary-foreground/80 leading-relaxed">
                En Reactivar Academy, creemos que el conocimiento es la base del éxito deportivo. 
                Nuestra misión es hacer accesible la formación especializada en Newcom para todos los atletas, 
                entrenadores y apasionados del deporte, sin importar su nivel o ubicación.
              </p>
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
                  Formación Especializada en Newcom al Alcance de Todos
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Fundamos Reactivar Academy con una visión clara: que cualquier persona apasionada 
                  por el Newcom tenga acceso a las mejores herramientas de formación, ya sea para 
                  convertirse en entrenador profesional o para crecer como deportista autodidacta.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Bajo la dirección del Profesor Diego Machado, especialista en Educación Física con 
                  especialización en Newcom, ofrecemos capacitaciones de calidad, materiales educativos 
                  y herramientas tecnológicas diseñadas específicamente para este deporte.
                </p>
                <Button>
                  Conocer Nuestros Cursos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="relative">
                <div className="bg-primary/10 rounded-2xl p-8 lg:p-12">
                  <blockquote className="text-lg lg:text-xl text-foreground italic leading-relaxed">
                    "El Newcom es más que un deporte, es una herramienta de formación integral. 
                    Mi objetivo es que cada entrenador y deportista tenga acceso al conocimiento 
                    necesario para desarrollarse al máximo en este deporte."
                  </blockquote>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      DM
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Diego Machado</p>
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
                Nuestro Fundador
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                Conocé a Diego Machado
              </h2>
              <p className="text-muted-foreground">
                El profesional detrás de Reactivar Academy y las capacitaciones de Newcom
              </p>
            </div>

            <div className="max-w-md mx-auto">
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
