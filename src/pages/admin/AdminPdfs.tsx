import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface PdfProduct {
  id: number;
  name: string;
  description: string;
  detailed_description?: string | null;
  category: string;
  price: number;
  original_price?: number | null;
  stock: number;
  image_url?: string | null;
  video_url?: string | null;
  features?: string[] | null;
  pdf_url?: string | null;
  subscription_months?: number;
  status: "active" | "inactive";
  sales: number;
}

const AdminPdfs = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PdfProduct | null>(null);
  const [products, setProducts] = useState<PdfProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Digital")
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error", description: "No se pudieron cargar los PDFs", variant: "destructive" });
        return;
      }
      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productPayload: any) => {
    try {
      // Forzar categoría Digital
      const payload = { ...productPayload, category: "Digital" };
      const { id, ...fields } = payload;

      if (id) {
        const { data, error } = await supabase
          .from("products")
          .update(fields)
          .eq("id", id)
          .select()
          .single();
        if (error) { toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" }); return; }
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        toast({ title: "✅ PDF actualizado", description: `${data.name} editado correctamente.` });
        setEditingProduct(null);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([fields])
          .select()
          .single();
        if (error) { toast({ title: "Error", description: "No se pudo crear el PDF", variant: "destructive" }); return; }
        setProducts(prev => [data, ...prev]);
        toast({ title: "✅ PDF creado", description: `${data.name} agregado exitosamente.` });
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error guardando PDF:", err);
    }
  };

  const handleEdit = (product: PdfProduct) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: PdfProduct) => {
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) { toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" }); return; }
    setProducts(products.filter(p => p.id !== product.id));
    toast({ title: "PDF eliminado", description: `${product.name} eliminado.`, variant: "destructive" });
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Productos PDF
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestioná los productos digitales descargables
            </p>
          </div>
          <Button
            onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo PDF
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{products.length}</p>
            <p className="text-sm text-blue-600">Total PDFs</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">
              {products.filter(p => p.status === "active").length}
            </p>
            <p className="text-sm text-green-600">Activos</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-700">
              {products.reduce((s, p) => s + (p.sales || 0), 0)}
            </p>
            <p className="text-sm text-purple-600">Ventas totales</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar PDFs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay PDFs todavía</p>
              <p className="text-sm mt-1">Agregá tu primer producto digital</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Archivo PDF</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ventas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold">${product.price.toLocaleString("es-AR")}</span>
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            ${product.original_price.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.pdf_url ? (
                        <a
                          href={product.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Ver PDF
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin archivo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{product.sales || 0}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={open => { setIsDialogOpen(open); if (!open) setEditingProduct(null); }}
        onSave={handleSaveProduct}
        editProduct={editingProduct}
      />
    </AdminLayout>
  );
};

export default AdminPdfs;
