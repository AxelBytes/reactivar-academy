import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Mail, User, Loader2, CreditCard, MapPin, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    name: "", 
    dni: "",
    email: "", 
    password: "",
    confirmPassword: "",
    provincia: "",
    localidad: "",
    pais: "Argentina"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(loginData.email, loginData.password);

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      });
      navigate("/");
    } else {
      setError(result.error || "Error al iniciar sesión");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validación de contraseñas
    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    // Validación de DNI (solo números, entre 7 y 8 dígitos)
    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(registerData.dni)) {
      setError("El DNI debe tener entre 7 y 8 dígitos numéricos");
      setIsLoading(false);
      return;
    }

    const result = await register(
      registerData.email, 
      registerData.password, 
      registerData.name, 
      registerData.dni,
      registerData.provincia,
      registerData.localidad,
      registerData.pais
    );

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
      navigate("/");
    } else {
      setError(result.error || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background p-4">
      {/* Logo/Brand */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="Logo" className="w-[100px] h-[100px]" />
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            REACTIVAR <span className="text-primary">ACADEMY</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tu email y contraseña para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Demo Credentials Info */}
                  <div className="rounded-lg bg-primary/10 p-3 text-sm space-y-1">
                    <p className="font-medium text-foreground">Credenciales de prueba:</p>
                    <p className="text-muted-foreground">
                      <strong>Admin:</strong> admin@reactivar.com / admin123
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Usuario:</strong> usuario@test.com / user123
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Iniciar Sesión
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => navigate("/")} type="button">
                    Volver al Inicio
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
                <CardDescription>
                  Completa el formulario para crear tu cuenta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre y Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Juan Pérez"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-dni">DNI</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-dni"
                        type="text"
                        placeholder="12345678"
                        className="pl-10"
                        value={registerData.dni}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 8) {
                            setRegisterData({ ...registerData, dni: value });
                          }
                        }}
                        required
                        maxLength={8}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      7 u 8 dígitos sin puntos ni espacios
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-pais">País</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-pais"
                        type="text"
                        placeholder="Argentina"
                        className="pl-10"
                        value={registerData.pais}
                        onChange={(e) => setRegisterData({ ...registerData, pais: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-provincia">Provincia</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-provincia"
                        type="text"
                        placeholder="Buenos Aires"
                        className="pl-10"
                        value={registerData.provincia}
                        onChange={(e) => setRegisterData({ ...registerData, provincia: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-localidad">Localidad</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-localidad"
                        type="text"
                        placeholder="Ciudad Autónoma de Buenos Aires"
                        className="pl-10"
                        value={registerData.localidad}
                        onChange={(e) => setRegisterData({ ...registerData, localidad: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Repetir Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Crear Cuenta
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => navigate("/")} type="button">
                    Volver al Inicio
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
