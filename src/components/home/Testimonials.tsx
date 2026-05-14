import { useState, useEffect } from "react";
import { Star, Quote, Send, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { motion } from "framer-motion";

interface VideoTestimonial {
  id: number;
  youtube_id: string;
  title: string;
  created_at: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
}

const Testimonials = () => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchVideoTestimonials();
  }, []);

  const fetchVideoTestimonials = async () => {
    const { data, error } = await supabase
      .from("video_testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVideoTestimonials(data);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);

    if (!error && data) {
      setReviews(data);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        rating: newRating,
        content: newContent.trim(),
      });

      if (!error) {
        setSubmitted(true);
        setNewContent("");
        setNewRating(5);
        fetchReviews();
      }
    } catch (err) {
      console.error("Error al enviar reseña:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal width="100%" duration={0.8} direction="left">
          <div className="relative max-w-4xl mx-auto mb-14 px-6 md:px-10 py-10 md:py-14 rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-purple-600 shadow-2xl border-4 border-primary/20">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <div className="relative text-center">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-primary-foreground font-bold text-sm uppercase tracking-widest mb-5 border border-white/30">
                <Users className="w-4 h-4" />
                Testimonios Reales
              </span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-primary-foreground mb-5 leading-none tracking-tight drop-shadow-lg">
                Lo que Dicen<br />
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-white bg-clip-text text-transparent">Nuestros Estudiantes</span>
              </h2>
              <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium max-w-2xl mx-auto leading-relaxed">
                Mirá las experiencias de quienes ya son parte de Reactivar Academy
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Video Testimonials */}
        {videoTestimonials.length > 0 && (
          <div className="mb-16">
            <ScrollReveal width="100%" direction="down">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Testimonios en Video
              </h3>
            </ScrollReveal>
            <StaggerContainer 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              staggerDelay={0.1}
            >
              {videoTestimonials.map((video) => (
                <StaggerItem key={video.id}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 3,
                      rotateX: -3,
                      transition: { duration: 0.3 }
                    }}
                    className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary/20 hover:border-primary/50 group cursor-pointer transition-all"
                    onClick={() =>
                      setActiveVideo(
                        activeVideo === video.youtube_id ? null : video.youtube_id
                      )
                    }
                  >
                  {activeVideo === video.youtube_id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
                      title={video.title}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  {activeVideo !== video.youtube_id && (
                    <div className="p-3 bg-card">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {video.title}
                      </p>
                    </div>
                  )}
                </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* User Reviews - solo visibles para usuarios logueados */}
        {isAuthenticated && reviews.length > 0 && (
          <StaggerContainer 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            staggerDelay={0.1}
          >
            {reviews.map((review) => (
              <StaggerItem key={review.id}>
                <motion.div
                  whileHover={{ 
                    scale: 1.03,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="relative bg-card rounded-xl p-6 shadow-md border-2 border-border hover:border-primary/50 hover:shadow-xl transition-all h-full"
                >
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Quote className="w-5 h-5 text-primary-foreground" />
                </div>

                <div className="flex items-center gap-1 mb-4 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  "{review.content}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {getInitials(review.user_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-sm">
                      {review.user_name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
              </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Write a Review */}
        <ScrollReveal width="100%" duration={0.6} delay={0.2} direction="right">
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
              <h3 className="text-2xl font-bold text-card-foreground mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Dejá tu reseña
              </h3>

            {!isAuthenticated ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Iniciá sesión para dejar tu reseña y compartir tu experiencia.
                </p>
                <Button
                  variant="default"
                  onClick={() => (window.location.href = "/login")}
                >
                  Iniciar Sesión
                </Button>
              </div>
            ) : submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-foreground font-medium text-lg">
                  ¡Gracias por tu reseña!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Tu reseña ya es visible para la comunidad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Compartí tu experiencia con la comunidad, {user?.name}.
                </p>

                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Tu valoración
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || newRating)
                              ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {newRating}/5
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-2">
                    Tu experiencia
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Contanos cómo fue tu experiencia con Reactivar Academy..."
                    className="w-full min-h-[120px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {newContent.length}/500
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !newContent.trim()}
                  className="w-full"
                >
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Reseña
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Testimonials;
