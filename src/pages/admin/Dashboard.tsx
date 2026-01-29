import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Package, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Ventas Totales",
      value: "$2,450,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      description: "vs. mes anterior",
    },
    {
      title: "Pedidos",
      value: "145",
      change: "+8.3%",
      trend: "up",
      icon: ShoppingBag,
      description: "Este mes",
    },
    {
      title: "Productos",
      value: "89",
      change: "+5",
      trend: "up",
      icon: Package,
      description: "Activos",
    },
    {
      title: "Estudiantes",
      value: "2,340",
      change: "+23.1%",
      trend: "up",
      icon: Users,
      description: "Usuarios activos",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "Juan Pérez", product: "Zapatillas Running Pro", amount: "$180,000", status: "Completado" },
    { id: "ORD-002", customer: "María García", product: "Curso de Nutrición", amount: "$110,000", status: "Pendiente" },
    { id: "ORD-003", customer: "Carlos López", product: "Set de Mancuernas", amount: "$350,000", status: "Completado" },
    { id: "ORD-004", customer: "Ana Martínez", product: "Mat de Yoga Premium", amount: "$55,000", status: "En Proceso" },
    { id: "ORD-005", customer: "Roberto Díaz", product: "Curso Mentalidad Ganadora", amount: "$190,000", status: "Completado" },
  ];

  const topProducts = [
    { name: "Zapatillas Running Pro", sales: 234, revenue: "$42,120,000" },
    { name: "Set de Mancuernas Ajustables", sales: 156, revenue: "$54,600,000" },
    { name: "Curso Entrenamiento Funcional", sales: 445, revenue: "$66,750,000" },
    { name: "Mat de Yoga Premium", sales: 389, revenue: "$21,395,000" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Resumen general de tu plataforma
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.trend === "up";

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`flex items-center text-sm font-medium ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Últimas transacciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {order.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.product}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {order.amount}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "Completado"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Top 4 productos del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales} ventas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {product.revenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Atajos para tareas comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <Package className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Nuevo Producto</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <GraduationCap className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Nuevo Curso</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <ShoppingBag className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Ver Pedidos</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <TrendingUp className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Reportes</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
