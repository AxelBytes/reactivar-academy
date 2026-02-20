import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Store from "./pages/Store";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCourses from "./pages/admin/Courses";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import CheckoutSuccess from "./pages/checkout/Success";
import CheckoutFailure from "./pages/checkout/Failure";
import CheckoutPending from "./pages/checkout/Pending";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/cursos" element={<Courses />} />
              <Route path="/tienda" element={<Store />} />
              <Route path="/sobre-nosotros" element={<About />} />
              <Route path="/login" element={<Login />} />

              {/* Checkout Routes */}
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/failure" element={<CheckoutFailure />} />
              <Route path="/checkout/pending" element={<CheckoutPending />} />
              
              {/* Rutas cortas (alias) */}
              <Route path="/success" element={<CheckoutSuccess />} />
              <Route path="/failure" element={<CheckoutFailure />} />
              <Route path="/pending" element={<CheckoutPending />} />

              {/* Admin Routes - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/productos"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/cursos"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pedidos"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/configuracion"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
