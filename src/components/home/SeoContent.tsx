import { Link } from "react-router-dom";

const SeoContent = () => {
  return (
    <section
      className="py-12 bg-muted/30 border-t border-border"
      aria-label="Información sobre Reactivar Academy y el deporte Newcom en Argentina"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Reactivar Academy - La plataforma líder de Newcom en Argentina
            </h2>

            <p className="leading-relaxed mb-4">
              <strong className="text-foreground">Reactivar Academy</strong> es la plataforma de capacitación
              online <strong>#1 en Newcom</strong> de Argentina, dirigida por el profesor{" "}
              <strong>Diego Machado</strong>, referente nacional del deporte. Si estás buscando{" "}
              <Link to="/cursos" className="text-primary hover:underline">cursos de Newcom</Link>,
              capacitaciones para entrenadores, formación para árbitros o planilleros, materiales
              educativos en PDF o el <Link to="/saas" className="text-primary hover:underline">buscador
              inteligente del Reglamento de Newcom</Link>, en Reactivar Academy encontrás todo en un
              solo lugar.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">
              ¿Por qué elegir Reactivar Academy para tu formación en Newcom?
            </h3>

            <p className="leading-relaxed mb-4">
              El deporte <strong>Newcom</strong> está creciendo de manera exponencial en Argentina, especialmente
              entre adultos mayores de 40 años que buscan mantenerse activos físicamente sin las exigencias
              de impacto de otros deportes. Como entrenador, formador o profesor de Educación Física,
              capacitarte en Newcom te abre un mercado enorme de practicantes que necesitan guía profesional.
              Nuestras <strong>capacitaciones de Newcom online</strong> te dan las herramientas técnicas, tácticas,
              físicas y reglamentarias para liderar grupos de jugadores Newconeros y desarrollarlos al máximo nivel.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">
              Capacitaciones disponibles para el deporte Newcom
            </h3>

            <p className="leading-relaxed mb-4">
              En Reactivar Academy ofrecemos diferentes <Link to="/cursos" className="text-primary hover:underline">capacitaciones de Newcom</Link> según tu nivel y objetivo:
              cursos para <strong>entrenadores principiantes</strong> que se inician en el deporte,
              capacitaciones avanzadas para <strong>formadores de Newcom</strong> con experiencia,
              cursos específicos para <strong>árbitros y planilleros</strong>, y material en PDF descargable
              en nuestra <Link to="/pdfs" className="text-primary hover:underline">sección de Ebooks</Link>.
              Todos los cursos incluyen videos en alta definición, materiales descargables, soporte semanal
              vía videoconferencia y acceso de por vida al contenido.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">
              El Buscador del Reglamento Oficial de Newcom
            </h3>

            <p className="leading-relaxed mb-4">
              Una de nuestras herramientas más usadas es el{" "}
              <Link to="/saas" className="text-primary hover:underline">Buscador del Reglamento de Newcom</Link>,
              una aplicación web inteligente que te permite buscar cualquier artículo del reglamento oficial
              por palabra clave en segundos. Ideal para árbitros, planilleros, entrenadores y jugadores que
              necesitan resolver una duda durante un partido o entrenamiento. Funciona en cualquier dispositivo
              (celular, tablet o computadora) y se accede mediante una clave personal de suscripción mensual,
              sin permanencia.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">
              Diego Machado - Entrenador y formador de Newcom en Argentina
            </h3>

            <p className="leading-relaxed mb-4">
              <strong>Diego Machado</strong> es Profesor de Educación Física con especialización en el
              deporte Newcom, fundador de Reactivar Academy. Con más de 29.800 seguidores en su comunidad
              de Facebook y una activa presencia en Instagram (@machado_reactivar_newcom), Diego es uno
              de los referentes más reconocidos del Newcom en Argentina. Su metodología combina la
              formación deportiva integral con herramientas prácticas para que los entrenadores puedan
              evitar lesiones, mejorar técnicas y desarrollar jugadores Newconeros que perduren en el tiempo.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">
              Sobre el deporte Newcom y su práctica en Argentina
            </h3>

            <p className="leading-relaxed mb-4">
              El <strong>Newcom</strong> es un deporte de equipo derivado del vóleibol, diseñado especialmente
              para adultos mayores de 40 años. Se juega con una pelota más liviana y la red se ubica a menor
              altura, lo que hace al deporte accesible para personas de todas las edades. A diferencia del
              vóley tradicional, en el Newcom la pelota se atrapa y se lanza nuevamente sobre la red, lo
              que reduce el riesgo de lesiones y permite extender la vida deportiva activa. En Argentina,
              el Newcom se practica en clubes, polideportivos, gimnasios y centros recreativos de todo el
              país, con miles de personas que se forman como jugadores, árbitros, entrenadores y formadores.
            </p>

            <p className="leading-relaxed mt-6 text-center text-xs">
              <strong>Reactivar Academy</strong> · Newcom Argentina · Diego Machado · Capacitaciones de
              Newcom Online · Reglamento Oficial · Entrenadores y Formadores · Cursos certificados ·
              Plataforma #1 de Newcom
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default SeoContent;
