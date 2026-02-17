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
        title="Reactivar Academy - Cursos de Fitness y Entrenamiento Online"
        description="Academia de fitness y entrenamiento profesional. Cursos online de alta calidad, productos especializados y programas personalizados. Aprende con los mejores entrenadores de Argentina."
        keywords={[
          'cursos de fitness',
          'entrenamiento online',
          'academia fitness Argentina',
          'programas de entrenamiento',
          'fitness profesional',
          'entrenador personal',
          'capacitación deportiva',
          'cursos online fitness'
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
