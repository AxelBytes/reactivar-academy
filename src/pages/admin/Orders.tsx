import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MoreHorizontal, Eye, Mail, Package, GraduationCap, Calendar, User, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "failed";

interface Order {
  id: number;
  user_name: string | null;
  user_email: string;
  user_dni: string | null;
  user_pais: string | null;
  user_provincia: string | null;
  user_localidad: string | null;
  total: number;
  status: string;
  payment_id: string | null;
  payment_method: string | null;
  created_at: string;
  courses: any[] | null;
}

const Orders = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando órdenes:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las órdenes",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Completado";
      case "processing":
        return "En Proceso";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      case "failed":
        return "Fallido";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'No especificado';
    switch (method.toLowerCase()) {
      case 'mercadopago':
        return 'MercadoPago';
      case 'paypal':
        return 'PayPal';
      case 'prex':
        return 'Prex';
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderId = `ORD-${order.id}`;
    const matchesSearch =
      orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user_dni?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error actualizando estado:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del pedido",
          variant: "destructive",
        });
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: "Estado actualizado",
        description: `El pedido ORD-${orderId} ha sido actualizado a ${getStatusLabel(newStatus)}.`,
      });
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  };

  const handleSendEmail = async (order: Order) => {
    // Enviar email de confirmación
    try {
      const response = await fetch('/api/send-course-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: order.user_email,
          userName: order.user_name,
          userDni: order.user_dni,
          userPais: order.user_pais,
          userProvincia: order.user_provincia,
          userLocalidad: order.user_localidad,
          courses: order.courses || [],
          paymentId: order.payment_id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Correo enviado",
          description: `Se ha enviado un correo de confirmación a ${order.user_email}`,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar el correo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el correo",
        variant: "destructive",
      });
    }
  };

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status.toLowerCase() === "completed").length;
  const pendingOrders = orders.filter((o) => o.status.toLowerCase() === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.status.toLowerCase() === "completed")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando pedidos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona todas las órdenes de compra (datos en tiempo real)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, cliente o email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="processing">En Proceso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Pedidos</p>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Completados</p>
            <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron pedidos
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">ORD-{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.user_name || 'Cliente'}</p>
                        <p className="text-xs text-muted-foreground">{order.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.courses?.length || 0}</span>
                        <div className="flex gap-1">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(order.total || 0)}
                    </TableCell>
                    <TableCell className="text-sm">{getPaymentMethodLabel(order.payment_method)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="processing">En Proceso</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                          <SelectItem value="failed">Fallido</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(order)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Email
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

        {/* Order Details Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Pedido ORD-{selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                Información completa del pedido y estado
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Cliente</span>
                    </div>
                    <p className="font-medium">{selectedOrder.user_name || 'No especificado'}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.user_email}</p>
                    {selectedOrder.user_dni && (
                      <p className="text-sm text-muted-foreground">DNI: {selectedOrder.user_dni}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Fecha</span>
                    </div>
                    <p className="font-medium">
                      {new Date(selectedOrder.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Location Info */}
                {(selectedOrder.user_pais || selectedOrder.user_provincia || selectedOrder.user_localidad) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Ubicación</span>
                    </div>
                    <p className="font-medium">
                      {[selectedOrder.user_localidad, selectedOrder.user_provincia, selectedOrder.user_pais]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}

                {/* Payment Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Método de Pago</span>
                  </div>
                  <p className="font-medium">{getPaymentMethodLabel(selectedOrder.payment_method)}</p>
                  {selectedOrder.payment_id && (
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {selectedOrder.payment_id}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Cursos Adquiridos</h3>
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {(selectedOrder.courses && selectedOrder.courses.length > 0) ? (
                      selectedOrder.courses.map((course: any, index: number) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{course.title || 'Curso'}</p>
                              <p className="text-sm text-muted-foreground">
                                Curso • Instructor: {course.instructor || 'No especificado'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(course.price || 0)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No hay cursos asociados a este pedido
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedOrder.total || 0)}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => handleSendEmail(selectedOrder)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar Email de Confirmación
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Orders;
