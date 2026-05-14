import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Video, Play } from "lucide-react";
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

      if (error) {
        console.error("Error fetching testimonials:", error);
        // Si la tabla no existe, simplemente establecer array vacío
        setTestimonials([]);
      } else {
        setTestimonials(data || []);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setTestimonials([]);
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
    if (!newYoutubeId.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresá la URL de YouTube",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const youtubeId = extractYoutubeId(newYoutubeId);
      
      // Generar número automático para el título
      const nextNumber = testimonials.length + 1;
      const autoTitle = newTitle.trim() || `Testimonio ${nextNumber}`;
      
      const { error } = await supabase
        .from("video_testimonials")
        .insert({
          youtube_id: youtubeId,
          title: autoTitle,
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
        description: error.message || "Error al agregar el testimonio. Verificá que la tabla esté creada en Supabase.",
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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Testimonios en Video
          </h1>
          <p className="text-muted-foreground">
            Administrá los testimonios que aparecen en la página de inicio
          </p>
        </div>

        {/* Botón para agregar */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Testimonio
          </Button>
        </div>

        {/* Formulario para agregar */}
        {showAddForm && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Testimonio</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  URL de YouTube *
                </label>
                <Input
                  value={newYoutubeId}
                  onChange={(e) => setNewYoutubeId(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Título (opcional)
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Si lo dejás vacío, se numerará automáticamente"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplo: "Testimonio {testimonials.length + 1}"
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTestimonial}
                  disabled={submitting}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewYoutubeId("");
                    setNewTitle("");
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de testimonios */}
        {loading ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">Cargando testimonios...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No hay testimonios todavía
            </p>
            <p className="text-sm text-muted-foreground">
              Hacé click en "Nuevo Testimonio" para agregar el primero
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
                  <h3 className="font-semibold text-card-foreground mb-2">
                    {testimonial.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 truncate">
                    {testimonial.youtube_id}
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
    </AdminLayout>
  );
};

export default AdminTestimonials;
