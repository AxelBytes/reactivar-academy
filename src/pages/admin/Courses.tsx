import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CourseFormDialog from "@/components/admin/CourseFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Course {
  id: number;
  title: string;
  instructor: string;
  price: number;
  students: number;
  rating: number;
  level: "Básico" | "Intermedio" | "Avanzado";
  duration: string;
  status: "active" | "draft";
}

const Courses = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar cursos desde Supabase
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando cursos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setCourses(data);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (newCourse: any) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .insert([newCourse])
        .select()
        .single();

      if (error) {
        console.error("Error guardando curso:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar el curso",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setCourses([data, ...courses]);
        toast({
          title: "¡Curso creado!",
          description: `${data.title} ha sido agregado exitosamente`,
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error inesperado guardando curso:", error);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (course: Course) => {
    toast({
      title: "Editar curso",
      description: `Editando: ${course.title} (próximamente)`,
    });
  };

  const handleDelete = async (course: Course) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", course.id);

      if (error) {
        console.error("Error eliminando curso:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el curso",
          variant: "destructive",
        });
        return;
      }

      setCourses(courses.filter(c => c.id !== course.id));
      toast({
        title: "Curso eliminado",
        description: `${course.title} ha sido eliminado.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error inesperado eliminando curso:", error);
    }
  };

  const handleView = (course: Course) => {
    toast({
      title: "Ver detalles",
      description: `Viendo detalles de: ${course.title} (próximamente)`,
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Básico":
        return "bg-green-100 text-green-700";
      case "Intermedio":
        return "bg-yellow-100 text-yellow-700";
      case "Avanzado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalRevenue = courses.reduce((sum, c) => sum + (c.price * c.students), 0);
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const avgRating = (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona el catálogo de capacitaciones
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Cursos</p>
            <p className="text-2xl font-bold text-foreground">{courses.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Estudiantes</p>
            <p className="text-2xl font-bold text-primary">{totalStudents.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-600">
              ${(totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Rating Promedio</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estudiantes</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-muted-foreground">Cargando cursos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron cursos
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div>
                        <p className="truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.duration}</p>
                      </div>
                    </TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell>${course.price.toLocaleString("es-AR")}</TableCell>
                    <TableCell>{course.students.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.status === "active" ? "default" : "secondary"}>
                        {course.status === "active" ? "Activo" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleView(course)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(course)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(course)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para agregar curso */}
      <CourseFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCourse}
      />
    </AdminLayout>
  );
};

export default Courses;
