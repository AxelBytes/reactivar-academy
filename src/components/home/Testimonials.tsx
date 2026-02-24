import { useState, useEffect } from "react";
import { Star, Quote, Send, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface VideoTestimonial {
  id: number;
  youtubeId: string;
  title: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
}

const videoTestimonials: VideoTestimonial[] = [
  { id: 1, youtubeId: "RIBca2Do-gs", title: "Testimonio 1" },
  { id: 2, youtubeId: "3UUojxQvl1I", title: "Testimonio 2" },
  { id: 3, youtubeId: "wKH41RBxnCU", title: "Testimonio 3" },
  { id: 4, youtubeId: "pxujtXL4SZE", title: "Testimonio 4" },
  { id: 5, youtubeId: "dvkBRocbpzU", title: "Testimonio 5" },
  { id: 6, youtubeId: "dk7j_zmZ1CA", title: "Testimonio 6" },
  { id: 7, youtubeId: "MxlJoew71XM", title: "Testimonio 7" },
];

const Testimonials = () => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

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
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Lo que Dicen Nuestros Estudiantes
          </h2>
          <p className="text-muted-foreground">
            Mirá las experiencias de quienes ya son parte de Reactivar Academy
          </p>
        </div>

        {/* Video Testimonials */}
        {videoTestimonials.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Testimonios en Video
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoTestimonials.map((video) => (
                <div
                  key={video.id}
                  className="relative rounded-xl overflow-hidden shadow-md border border-border group cursor-pointer"
                  onClick={() =>
                    setActiveVideo(
                      activeVideo === video.youtubeId ? null : video.youtubeId
                    )
                  }
                >
                  {activeVideo === video.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                      title={video.title}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
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
                  {activeVideo !== video.youtubeId && (
                    <div className="p-3 bg-card">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {video.title}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Reviews - solo visibles para usuarios logueados */}
        {isAuthenticated && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="relative bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow"
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
              </div>
            ))}
          </div>
        )}

        {/* Write a Review */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-card rounded-xl p-6 md:p-8 shadow-md border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
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
      </div>
    </section>
  );
};

export default Testimonials;
