import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Clock, User } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { motion } from "framer-motion";

const articles = [
  {
    id: 1,
    title: "Historia y Evolución del Newcom",
    excerpt: "Descubrí los orígenes de este deporte fascinante y cómo se ha desarrollado a lo largo de los años en Argentina y el mundo.",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
    author: "Diego Machado",
    readTime: "5 min",
    category: "Historia",
  },
  {
    id: 2,
    title: "Técnicas Fundamentales para Principiantes",
    excerpt: "Conocé las bases técnicas esenciales que todo jugador de Newcom debe dominar para comenzar su camino en el deporte.",
    image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&q=80",
    author: "Diego Machado",
    readTime: "8 min",
    category: "Técnica",
  },
  {
    id: 3,
    title: "Reglamento Oficial: Puntos Clave",
    excerpt: "Una guía completa sobre los aspectos más importantes del reglamento oficial de Newcom que todo jugador y entrenador debe conocer.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    author: "Diego Machado",
    readTime: "6 min",
    category: "Reglamento",
  },
];

const FeaturedArticles = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <ScrollReveal width="100%" duration={0.8} direction="left">
          <div className="relative max-w-4xl mx-auto mb-14 px-6 md:px-10 py-10 md:py-14 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 shadow-2xl border-4 border-cyan-400/20">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

            <div className="relative text-center">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm uppercase tracking-widest mb-5 border border-white/30">
                <BookOpen className="w-4 h-4" />
                Conocimiento deportivo
              </span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-5 leading-none tracking-tight drop-shadow-lg">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent">Artículos</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
                Los mejores artículos específicos para el deporte Newcom. Información, técnicas y estrategias para mejorar tu juego.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <StaggerContainer 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          staggerDelay={0.15}
        >
          {articles.map((article) => (
            <StaggerItem key={article.id}>
              <motion.article
                whileHover={{ 
                  scale: 1.03,
                  rotateY: 2,
                  rotateX: -2,
                  transition: { duration: 0.3 }
                }}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cyan-100 flex flex-col h-full"
              >
                <div className="relative h-52 bg-gradient-to-br from-cyan-50 to-blue-100 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-cyan-500 text-white text-xs font-medium px-3 py-1">
                      {article.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-cyan-600 transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-base mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-cyan-100">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
                    asChild
                  >
                    <Link to={`/articulos/${article.id}`}>
                      Leer Artículo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild className="text-base border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-500 hover:text-white px-8 py-4">
            <Link to="/articulos">
              Ver Todos los Artículos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
