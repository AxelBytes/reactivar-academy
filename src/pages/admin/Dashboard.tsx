import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalStudents: number;
  previousMonthSales: number;
  previousMonthOrders: number;
}

interface Order {
  id: number;
  user_name: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
  courses: any[];
}

interface TopItem {
  id: number;
  name: string;
  title: string;
  sales: number;
  revenue: number;
  type: 'course' | 'product';
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalStudents: 0,
    previousMonthSales: 0,
    previousMonthOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Calcular fechas
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // 1. Obtener todas las órdenes
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error cargando órdenes:', ordersError);
        setLoading(false);
        return;
      }

      // 2. Obtener productos activos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sales')
        .eq('status', 'active');

      if (productsError) {
        console.error('Error cargando productos:', productsError);
      }

      // 3. Obtener cursos activos
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, students')
        .eq('status', 'active');

      if (coursesError) {
        console.error('Error cargando cursos:', coursesError);
      }

      // Calcular estadísticas
      const ordersThisMonth = allOrders?.filter(o => 
        new Date(o.created_at) >= firstDayThisMonth
      ) || [];

      const ordersLastMonth = allOrders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= firstDayLastMonth && orderDate <= lastDayLastMonth;
      }) || [];

      const totalSales = ordersThisMonth.reduce((sum, order) => sum + (order.total || 0), 0);
      const previousMonthSales = ordersLastMonth.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalStudents = courses?.reduce((sum, course) => sum + (course.students || 0), 0) || 0;

      setStats({
        totalSales,
        totalOrders: ordersThisMonth.length,
        totalProducts: products?.length || 0,
        totalStudents,
        previousMonthSales,
        previousMonthOrders: ordersLastMonth.length,
      });

      // 4. Obtener últimos 5 pedidos
      setRecentOrders((allOrders || []).slice(0, 5) as Order[]);

      // 5. Calcular top items (cursos más vendidos por estudiantes)
      const topCourses = (courses || [])
        .sort((a, b) => (b.students || 0) - (a.students || 0))
        .slice(0, 4)
        .map(course => ({
          id: course.id,
          name: course.title,
          title: course.title,
          sales: course.students || 0,
          revenue: 0, // Necesitaríamos calcular esto basándonos en órdenes
          type: 'course' as const
        }));

      setTopItems(topCourses);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'En Proceso';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  const salesChange = calculatePercentageChange(stats.totalSales, stats.previousMonthSales);
  const ordersChange = calculatePercentageChange(stats.totalOrders, stats.previousMonthOrders);
  const salesTrend = parseFloat(salesChange) >= 0 ? 'up' : 'down';
  const ordersTrend = parseFloat(ordersChange) >= 0 ? 'up' : 'down';

  const statsCards = [
    {
      title: "Ventas Totales",
      value: formatCurrency(stats.totalSales),
      change: `${salesChange >= '0' ? '+' : ''}${salesChange}%`,
      trend: salesTrend,
      icon: DollarSign,
      description: "vs. mes anterior",
    },
    {
      title: "Pedidos",
      value: stats.totalOrders.toString(),
      change: `${ordersChange >= '0' ? '+' : ''}${ordersChange}%`,
      trend: ordersTrend,
      icon: ShoppingBag,
      description: "Este mes",
    },
    {
      title: "Productos",
      value: stats.totalProducts.toString(),
      change: stats.totalProducts > 0 ? "Activos" : "Sin productos",
      trend: "up",
      icon: Package,
      description: "En catálogo",
    },
    {
      title: "Estudiantes",
      value: stats.totalStudents.toLocaleString('es-AR'),
      change: "Total",
      trend: "up",
      icon: Users,
      description: "En todos los cursos",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando datos del dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Resumen general de tu plataforma (datos en tiempo real)
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
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
                      {isPositive && stat.change.includes('%') ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : !isPositive && stat.change.includes('%') ? (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      ) : null}
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
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay pedidos recientes
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {order.user_name || order.user_email || 'Cliente'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.courses?.length 
                            ? `${order.courses.length} curso${order.courses.length > 1 ? 's' : ''}`
                            : 'Pedido'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-foreground whitespace-nowrap">
                          {formatCurrency(order.total || 0)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Cursos Más Populares</CardTitle>
              <CardDescription>Top 4 cursos por estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              {topItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay cursos disponibles
                </div>
              ) : (
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.sales.toLocaleString('es-AR')} estudiantes
                        </p>
                      </div>
                      <div className="text-right">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <a 
                href="/admin/productos"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
              >
                <Package className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Nuevo Producto</span>
              </a>
              <a 
                href="/admin/cursos"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
              >
                <GraduationCap className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Nuevo Curso</span>
              </a>
              <a 
                href="/admin/pedidos"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Ver Pedidos</span>
              </a>
              <button 
                onClick={loadDashboardData}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <TrendingUp className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-foreground">Actualizar Datos</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
