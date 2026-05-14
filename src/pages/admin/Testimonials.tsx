import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Video, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface VideoTestimonial {
  id: number;
  youtube_id: string;
  title: string;
  created_at: string;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newYoutubeId, setNewYoutubeId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("video_testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractYoutubeId = (url: string): string => {
    // Extraer ID de varios formatos de URL de YouTube
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    // Si no coincide con ningún patrón, asumir que ya es un ID
    return url;
  };

  const handleAddTestimonial = async () => {
    if (!newYoutubeId.trim() || !newTitle.trim()) {
      toast({
        title: "Error",
        description: "Por favor completá todos los campos",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const youtubeId = extractYoutubeId(newYoutubeId);
      
      const { error } = await supabase
        .from("video_testimonials")
        .insert({
          youtube_id: youtubeId,
          title: newTitle.trim(),
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Testimonio agregado correctamente",
      });

      setNewYoutubeId("");
      setNewTitle("");
      setShowAddForm(false);
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este testimonio?")) return;

    try {
      const { error } = await supabase
        .from("video_testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Testimonio eliminado correctamente",
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestión de Testimonios en Video
            </h1>
            <p className="text-muted-foreground">
              Administrá los testimonios en video que aparecen en la página de inicio
            </p>
          </div>

          {/* Botón para agregar */}
          <div className="mb-6">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? "Cancelar" : "Agregar Testimonio"}
            </Button>
          </div>

          {/* Formulario para agregar */}
          {showAddForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Nuevo Testimonio en Video</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    URL o ID de YouTube
                  </label>
                  <Input
                    value={newYoutubeId}
                    onChange={(e) => setNewYoutubeId(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... o ID directo"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Podés pegar la URL completa del video o solo el ID
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Título del Testimonio
                  </label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Testimonio de Juan Pérez"
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleAddTestimonial}
                  disabled={submitting}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? "Guardando..." : "Guardar Testimonio"}
                </Button>
              </div>
            </div>
          )}

          {/* Lista de testimonios */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando testimonios...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No hay testimonios en video todavía
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Hacé click en "Agregar Testimonio" para crear uno
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={`https://img.youtube.com/vi/${testimonial.youtube_id}/hqdefault.jpg`}
                      alt={testimonial.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-80" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground mb-2 truncate">
                      {testimonial.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      ID: {testimonial.youtube_id}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {new Date(testimonial.created_at).toLocaleDateString("es-AR")}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="w-full gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminTestimonials;
