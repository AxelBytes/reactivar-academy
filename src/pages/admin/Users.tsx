import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  Search, 
  MoreVertical, 
  Mail, 
  Shield, 
  ShieldCheck, 
  Ban, 
  UserCheck,
  Calendar,
  TrendingUp,
  Users as UsersIcon,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role?: string;
  total_spent?: number;
  orders_count?: number;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Obtener usuarios de auth
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        throw authError;
      }

      // Obtener estadísticas de órdenes por email
      const { data: ordersData } = await supabase
        .from('orders')
        .select('customer_email, total');

      // Calcular estadísticas por usuario
      const userStats: { [email: string]: { total_spent: number; orders_count: number } } = {};
      
      ordersData?.forEach(order => {
        if (!userStats[order.customer_email]) {
          userStats[order.customer_email] = { total_spent: 0, orders_count: 0 };
        }
        userStats[order.customer_email].total_spent += order.total || 0;
        userStats[order.customer_email].orders_count += 1;
      });

      // Combinar datos
      const usersWithStats = authData.users.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        role: user.user_metadata?.role || 'user',
        total_spent: userStats[user.email || '']?.total_spent || 0,
        orders_count: userStats[user.email || '']?.orders_count || 0,
      }));

      setUsers(usersWithStats);
      setFilteredUsers(usersWithStats);
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Verifica tus permisos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role: string = 'user') => {
    const roles: { [key: string]: { label: string; variant: any } } = {
      admin: { label: 'Admin', variant: 'destructive' },
      user: { label: 'Usuario', variant: 'default' },
    };

    const roleInfo = roles[role] || roles.user;
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.last_sign_in_at).length,
    totalRevenue: users.reduce((sum, u) => sum + (u.total_spent || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona los usuarios de la plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registrados en la plataforma
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Han iniciado sesión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Con permisos elevados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString('es-AR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                De todos los usuarios
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busca y filtra usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="user">Usuarios</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Todos los usuarios registrados en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2">Cargando usuarios...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead className="text-right">Pedidos</TableHead>
                      <TableHead className="text-right">Total Gastado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(user.last_sign_in_at)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {user.orders_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(user.total_spent || 0).toLocaleString('es-AR')}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="w-4 h-4 mr-2" />
                                Cambiar Rol
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Ban className="w-4 h-4 mr-2" />
                                Suspender Usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Nota sobre permisos
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Para modificar usuarios, necesitas configurar la Service Role Key de Supabase. 
                  Las funciones de edición/eliminación requieren permisos de administrador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Users;
