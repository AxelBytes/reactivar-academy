import { useState } from "react";
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
import { Search, MoreHorizontal, Eye, Mail, Package, GraduationCap, Calendar, User, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
type OrderType = "product" | "course";

interface OrderItem {
  id: number;
  name: string;
  type: OrderType;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  date: string;
  shippingAddress?: string;
}

const Orders = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "Juan Pérez",
      customerEmail: "juan.perez@email.com",
      items: [
        { id: 1, name: "Zapatillas Running Pro", type: "product", quantity: 1, price: 180000 },
        { id: 2, name: "Shaker Pro 750ml", type: "product", quantity: 2, price: 30000 },
      ],
      total: 240000,
      status: "completed",
      paymentMethod: "Tarjeta de Crédito",
      date: "2024-01-25",
      shippingAddress: "Calle Principal 123, Ciudad, CP 12345",
    },
    {
      id: "ORD-002",
      customerName: "María García",
      customerEmail: "maria.garcia@email.com",
      items: [
        { id: 3, name: "Curso de Nutrición para Atletas", type: "course", quantity: 1, price: 110000 },
      ],
      total: 110000,
      status: "completed",
      paymentMethod: "Transferencia Bancaria",
      date: "2024-01-24",
    },
    {
      id: "ORD-003",
      customerName: "Carlos López",
      customerEmail: "carlos.lopez@email.com",
      items: [
        { id: 4, name: "Set de Mancuernas Ajustables", type: "product", quantity: 1, price: 350000 },
      ],
      total: 350000,
      status: "processing",
      paymentMethod: "Tarjeta de Débito",
      date: "2024-01-24",
      shippingAddress: "Av. Libertador 456, Ciudad, CP 54321",
    },
    {
      id: "ORD-004",
      customerName: "Ana Martínez",
      customerEmail: "ana.martinez@email.com",
      items: [
        { id: 5, name: "Mat de Yoga Premium", type: "product", quantity: 1, price: 55000 },
        { id: 6, name: "Banda de Resistencia Kit", type: "product", quantity: 1, price: 42000 },
      ],
      total: 97000,
      status: "pending",
      paymentMethod: "Mercado Pago",
      date: "2024-01-23",
      shippingAddress: "San Martin 789, Ciudad, CP 67890",
    },
    {
      id: "ORD-005",
      customerName: "Roberto Díaz",
      customerEmail: "roberto.diaz@email.com",
      items: [
        { id: 7, name: "Curso Mentalidad Ganadora", type: "course", quantity: 1, price: 190000 },
        { id: 8, name: "Curso Entrenamiento Funcional", type: "course", quantity: 1, price: 150000 },
      ],
      total: 340000,
      status: "completed",
      paymentMethod: "Tarjeta de Crédito",
      date: "2024-01-23",
    },
    {
      id: "ORD-006",
      customerName: "Laura Fernández",
      customerEmail: "laura.fernandez@email.com",
      items: [
        { id: 9, name: "Zapatillas CrossFit Elite", type: "product", quantity: 1, price: 195000 },
      ],
      total: 195000,
      status: "cancelled",
      paymentMethod: "PayPal",
      date: "2024-01-22",
      shippingAddress: "Belgrano 321, Ciudad, CP 11111",
    },
    {
      id: "ORD-007",
      customerName: "Diego Gómez",
      customerEmail: "diego.gomez@email.com",
      items: [
        { id: 10, name: "Guantes de Entrenamiento", type: "product", quantity: 2, price: 38000 },
        { id: 11, name: "Cuerda de Saltar Profesional", type: "product", quantity: 1, price: 25000 },
      ],
      total: 101000,
      status: "processing",
      paymentMethod: "Tarjeta de Crédito",
      date: "2024-01-22",
      shippingAddress: "9 de Julio 555, Ciudad, CP 22222",
    },
  ]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "processing":
        return "En Proceso";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    toast({
      title: "Estado actualizado",
      description: `El pedido ${orderId} ha sido actualizado a ${getStatusLabel(newStatus)}.`,
    });
  };

  const handleSendEmail = (order: Order) => {
    // Aquí se conectará con el backend para enviar el correo
    toast({
      title: "Correo enviado",
      description: `Se ha enviado un correo de confirmación a ${order.customerEmail}`,
    });
  };

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona todas las órdenes de compra
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
              ${(totalRevenue / 1000).toLocaleString("es-AR")}K
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
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.items.length}</span>
                        <div className="flex gap-1">
                          {order.items.some((item) => item.type === "product") && (
                            <Package className="w-4 h-4 text-muted-foreground" />
                          )}
                          {order.items.some((item) => item.type === "course") && (
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      ${order.total.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-sm">{order.paymentMethod}</TableCell>
                    <TableCell className="text-sm">{order.date}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value as OrderStatus)
                        }
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
              <DialogTitle>Detalles del Pedido {selectedOrder?.id}</DialogTitle>
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
                    <p className="font-medium">{selectedOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Fecha</span>
                    </div>
                    <p className="font-medium">{selectedOrder.date}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Método de Pago</span>
                  </div>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Dirección de Envío</span>
                    </div>
                    <p className="font-medium">{selectedOrder.shippingAddress}</p>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Productos/Cursos</h3>
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.type === "product" ? (
                            <Package className="w-5 h-5 text-primary" />
                          ) : (
                            <GraduationCap className="w-5 h-5 text-primary" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type === "product" ? "Producto" : "Curso"} • Cantidad: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${item.price.toLocaleString("es-AR")}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              ${(item.price * item.quantity).toLocaleString("es-AR")} total
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedOrder.total.toLocaleString("es-AR")}
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
                    Enviar Email de Confirmación
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
