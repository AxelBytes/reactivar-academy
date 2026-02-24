import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Reactivar Academy - Capacitaciones de Newcom y Formación Deportiva"
        description="Plataforma de capacitación para entrenadores y formadores de deportistas Newconeros. Cursos de Newcom, formación deportiva integral por Diego Machado. La mejor herramienta para formadores de Newcom en Argentina."
        keywords={[
          'newcom',
          'newcom deporte',
          'capacitacion newcom',
          'entrenador newcom',
          'formador newcom',
          'deportistas newconeros',
          'reactivar academy',
          'diego machado newcom',
          'newcom argentina',
          'cursos newcom',
          'arbitro newcom',
          'planillero newcom',
          'formacion deportiva newcom'
        ]}
        type="website"
      />
      <Header />
      <main>
        <Hero />
        <FeaturedCourses />
        <FeaturedProducts />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
