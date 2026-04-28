import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  KeyRound, Users, XCircle, CheckCircle2, RefreshCw,
  Search, ChevronLeft, ChevronRight, Eye, UserCheck,
} from "lucide-react";
import {
  listarClaves, activarClave, desactivarClave, consultarClave,
  obtenerClaveDisponible,
  type Clave, type ConsultarClaveResponse,
} from "@/services/suscripciones";

const ITEMS_PER_PAGE = 20;

const estadoOrder: Record<string, number> = { Activa: 0, Inactiva: 1, Disponible: 2 };

export default function GestionSuscripciones() {
  const { toast } = useToast();

  // ── Estado principal ──────────────────────────────────────────────────────
  const [claves, setClaves] = useState<Clave[]>([]);
  const [stats, setStats] = useState({ total: 0, activas: 0, inactivas: 0, disponibles: 0 });
  const [loading, setLoading] = useState(true);

  // ── Filtros y paginación ──────────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [page, setPage]               = useState(1);

  // ── Formulario activar ────────────────────────────────────────────────────
  const [form, setForm] = useState({ nombre: "", email: "", meses: "1" });
  const [activando, setActivando] = useState(false);

  // ── Dialog desactivar ─────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; clave: Clave | null }>({ open: false, clave: null });
  const [desactivando, setDesactivando]   = useState(false);

  // ── Dialog detalles ───────────────────────────────────────────────────────
  const [detailDialog, setDetailDialog]   = useState<{ open: boolean; data: ConsultarClaveResponse | null }>({ open: false, data: null });
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Cargar datos ──────────────────────────────────────────────────────────
  const cargarClaves = async () => {
    setLoading(true);
    try {
      const res = await listarClaves();
      const sorted = [...res.claves].sort(
        (a, b) => (estadoOrder[a.estado] ?? 9) - (estadoOrder[b.estado] ?? 9)
      );
      setClaves(sorted);
      setStats({ total: res.total, activas: res.activas, inactivas: res.inactivas, disponibles: res.disponibles });
    } catch (e: any) {
      toast({ title: "Error al cargar claves", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarClaves(); }, []);

  // ── Filtrado y paginación ─────────────────────────────────────────────────
  const filtradas = useMemo(() => {
    const q = search.toLowerCase();
    return claves.filter(c => {
      const matchSearch =
        c.clave.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchEstado = filtroEstado === "Todos" || c.estado === filtroEstado;
      return matchSearch && matchEstado;
    });
  }, [claves, search, filtroEstado]);

  const totalPages = Math.max(1, Math.ceil(filtradas.length / ITEMS_PER_PAGE));
  const paginated  = filtradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, filtroEstado]);

  // ── Activar suscripción ───────────────────────────────────────────────────
  const handleActivar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) {
      toast({ title: "Completá todos los campos", variant: "destructive" });
      return;
    }
    setActivando(true);
    try {
      const disponible = await obtenerClaveDisponible();
      const resultado  = await activarClave({
        clave:  disponible.clave,
        nombre: form.nombre.trim(),
        email:  form.email.trim(),
        meses:  parseInt(form.meses),
      });
      toast({
        title: "✅ Suscripción activada",
        description: `Clave: ${resultado.clave} · Vence: ${resultado.vencimiento}`,
      });
      setForm({ nombre: "", email: "", meses: "1" });
      await cargarClaves();
    } catch (e: any) {
      toast({ title: "Error al activar", description: e.message, variant: "destructive" });
    } finally {
      setActivando(false);
    }
  };

  // ── Desactivar clave ──────────────────────────────────────────────────────
  const handleDesactivar = async () => {
    if (!confirmDialog.clave) return;
    setDesactivando(true);
    try {
      await desactivarClave(confirmDialog.clave.clave);
      toast({ title: "Acceso desactivado", description: `Clave ${confirmDialog.clave.clave} bloqueada.` });
      setConfirmDialog({ open: false, clave: null });
      await cargarClaves();
    } catch (e: any) {
      toast({ title: "Error al desactivar", description: e.message, variant: "destructive" });
    } finally {
      setDesactivando(false);
    }
  };

  // ── Ver detalles ──────────────────────────────────────────────────────────
  const handleVerDetalles = async (clave: string) => {
    setDetailDialog({ open: true, data: null });
    setLoadingDetail(true);
    try {
      const data = await consultarClave(clave);
      setDetailDialog({ open: true, data });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setDetailDialog({ open: false, data: null });
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Badge por estado ──────────────────────────────────────────────────────
  const estadoBadge = (estado: string) => {
    if (estado === "Activa")     return <Badge className="bg-green-100 text-green-800 border-green-300">Activa</Badge>;
    if (estado === "Inactiva")   return <Badge className="bg-red-100 text-red-800 border-red-300">Inactiva</Badge>;
    return <Badge variant="secondary">Disponible</Badge>;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Suscripciones</h1>
            <p className="text-muted-foreground mt-1">Administrá el acceso al Buscador de Reglamento</p>
          </div>
          <Button onClick={cargarClaves} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Claves</CardTitle>
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Activas</CardTitle>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.activas}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inactivas</CardTitle>
                  <XCircle className="w-4 h-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-500">{stats.inactivas}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
                  <Users className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-500">{stats.disponibles}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Formulario activar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Activar nueva suscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivar} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <Label htmlFor="nombre">Nombre del cliente</Label>
                <Input
                  id="nombre"
                  placeholder="Juan García"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  disabled={activando}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@mail.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={activando}
                />
              </div>
              <div className="space-y-1">
                <Label>Meses de suscripción</Label>
                <Select
                  value={form.meses}
                  onValueChange={v => setForm(f => ({ ...f, meses: v }))}
                  disabled={activando}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 mes</SelectItem>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={activando} className="bg-green-600 hover:bg-green-700 text-white">
                {activando ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Activando...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" />Activar suscripción</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Suscripciones</CardTitle>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o clave..."
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  <SelectItem value="Activa">Activa</SelectItem>
                  <SelectItem value="Inactiva">Inactiva</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vence</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(6).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        {Array(6).fill(0).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No se encontraron suscripciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map(clave => (
                      <TableRow key={clave.clave}>
                        <TableCell className="font-mono text-xs">{clave.clave}</TableCell>
                        <TableCell className="font-medium">{clave.nombre || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{clave.email || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{estadoBadge(clave.estado)}</TableCell>
                        <TableCell className="text-sm">{String(clave.vence) || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerDetalles(clave.clave)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                            {clave.estado === "Activa" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setConfirmDialog({ open: true, clave })}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Desactivar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""} · Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Confirmar desactivar */}
      <Dialog open={confirmDialog.open} onOpenChange={open => !desactivando && setConfirmDialog(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar acceso?</DialogTitle>
            <DialogDescription>
              ¿Desactivar acceso de <strong>{confirmDialog.clave?.nombre || confirmDialog.clave?.clave}</strong>?
              Esta acción bloquea su acceso inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, clave: null })} disabled={desactivando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDesactivar} disabled={desactivando}>
              {desactivando ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Desactivando...</> : "Sí, desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalles de clave */}
      <Dialog open={detailDialog.open} onOpenChange={open => setDetailDialog(s => ({ ...s, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la suscripción</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="space-y-3 py-2">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          ) : detailDialog.data ? (
            <div className="space-y-3 text-sm">
              {[
                { label: "Clave",   value: <span className="font-mono">{detailDialog.data.clave}</span> },
                { label: "Nombre",  value: detailDialog.data.nombre  || "—" },
                { label: "Email",   value: detailDialog.data.email   || "—" },
                { label: "Estado",  value: estadoBadge(detailDialog.data.estado) },
                { label: "Fecha de alta",  value: String(detailDialog.data.alta)  || "—" },
                { label: "Vencimiento",    value: String(detailDialog.data.vence) || "—" },
                { label: "Meses contratados", value: detailDialog.data.meses ? `${detailDialog.data.meses} mes${detailDialog.data.meses > 1 ? "es" : ""}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialog({ open: false, data: null })}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
