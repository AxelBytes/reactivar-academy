import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import FeaturedEbooks from "@/components/home/FeaturedEbooks";
import ReglamentoSection from "@/components/home/ReglamentoSection";
import FeaturedArticles from "@/components/home/FeaturedArticles";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import NewcomFAQ from "@/components/home/NewcomFAQ";
import SeoContent from "@/components/home/SeoContent";
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
        <FeaturedEbooks />
        <ReglamentoSection />
        <FeaturedArticles />
        <Testimonials />
        <NewcomFAQ />
        <CTA />
        <SeoContent />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
