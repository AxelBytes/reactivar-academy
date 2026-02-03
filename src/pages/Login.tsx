import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Mail, User, Loader2, CreditCard, MapPin, Globe, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Configuración inteligente por país
interface PaisConfig {
  documentLabel: string;
  documentPlaceholder: string;
  documentMaxLength: number;
  divisionLabel: string; // Provincia, Estado, Región, etc.
  divisionPlaceholder: string;
  requiereDivision: boolean;
  divisiones?: string[]; // Lista de divisiones específicas del país
  localidadLabel: string; // Localidad, Ciudad, Municipio, Comuna, etc.
  localidadPlaceholder: string;
}

const PAISES_CONFIG: Record<string, PaisConfig> = {
  "Argentina": {
    documentLabel: "DNI",
    documentPlaceholder: "12345678",
    documentMaxLength: 8,
    divisionLabel: "Provincia",
    divisionPlaceholder: "Buenos Aires",
    requiereDivision: true,
    divisiones: [
      "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Ciudad Autónoma de Buenos Aires",
      "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
      "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
      "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
    ],
    localidadLabel: "Localidad",
    localidadPlaceholder: "Ciudad Autónoma de Buenos Aires"
  },
  "Brasil": {
    documentLabel: "CPF",
    documentPlaceholder: "123.456.789-00",
    documentMaxLength: 14,
    divisionLabel: "Estado",
    divisionPlaceholder: "São Paulo",
    requiereDivision: true,
    divisiones: [
      "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
      "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
      "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
      "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
      "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
    ],
    localidadLabel: "Município",
    localidadPlaceholder: "São Paulo"
  },
  "Chile": {
    documentLabel: "RUT",
    documentPlaceholder: "12.345.678-9",
    documentMaxLength: 12,
    divisionLabel: "Región",
    divisionPlaceholder: "Metropolitana de Santiago",
    requiereDivision: true,
    divisiones: [
      "Región de Arica y Parinacota", "Región de Tarapacá", "Región de Antofagasta",
      "Región de Atacama", "Región de Coquimbo", "Región de Valparaíso",
      "Región Metropolitana de Santiago", "Región del Libertador General Bernardo O'Higgins",
      "Región del Maule", "Región de Ñuble", "Región del Biobío", "Región de La Araucanía",
      "Región de Los Ríos", "Región de Los Lagos", "Región de Aysén del General Carlos Ibáñez del Campo",
      "Región de Magallanes y de la Antártica Chilena"
    ],
    localidadLabel: "Comuna",
    localidadPlaceholder: "Santiago"
  },
  "Colombia": {
    documentLabel: "Cédula",
    documentPlaceholder: "1234567890",
    documentMaxLength: 10,
    divisionLabel: "Departamento",
    divisionPlaceholder: "Cundinamarca",
    requiereDivision: true,
    divisiones: [
      "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá",
      "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
      "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
      "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
      "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
    ],
    localidadLabel: "Municipio",
    localidadPlaceholder: "Bogotá"
  },
  "México": {
    documentLabel: "CURP",
    documentPlaceholder: "ABCD123456HDFMRN09",
    documentMaxLength: 18,
    divisionLabel: "Estado",
    divisionPlaceholder: "Ciudad de México",
    requiereDivision: true,
    divisiones: [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
      "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Guanajuato",
      "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit",
      "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
      "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ],
    localidadLabel: "Municipio",
    localidadPlaceholder: "Ciudad de México"
  },
  "Perú": {
    documentLabel: "DNI",
    documentPlaceholder: "12345678",
    documentMaxLength: 8,
    divisionLabel: "Departamento",
    divisionPlaceholder: "Lima",
    requiereDivision: true,
    divisiones: [
      "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao",
      "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque",
      "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno",
      "San Martín", "Tacna", "Tumbes", "Ucayali"
    ],
    localidadLabel: "Distrito",
    localidadPlaceholder: "Lima"
  },
  "Uruguay": {
    documentLabel: "CI",
    documentPlaceholder: "1.234.567-8",
    documentMaxLength: 11,
    divisionLabel: "Departamento",
    divisionPlaceholder: "Montevideo",
    requiereDivision: true,
    divisiones: [
      "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", "Florida",
      "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro", "Rivera", "Rocha",
      "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
    ],
    localidadLabel: "Ciudad",
    localidadPlaceholder: "Montevideo"
  },
  "Paraguay": {
    documentLabel: "Cédula",
    documentPlaceholder: "1234567",
    documentMaxLength: 10,
    divisionLabel: "Departamento",
    divisionPlaceholder: "Central",
    requiereDivision: true,
    divisiones: [
      "Alto Paraguay", "Alto Paraná", "Amambay", "Asunción", "Boquerón", "Caaguazú",
      "Caazapá", "Canindeyú", "Central", "Concepción", "Cordillera", "Guairá", "Itapúa",
      "Misiones", "Ñeembucú", "Paraguarí", "Presidente Hayes", "San Pedro"
    ],
    localidadLabel: "Ciudad",
    localidadPlaceholder: "Asunción"
  },
  "Venezuela": {
    documentLabel: "Cédula",
    documentPlaceholder: "V-12345678",
    documentMaxLength: 11,
    divisionLabel: "Estado",
    divisionPlaceholder: "Miranda",
    requiereDivision: true,
    divisiones: [
      "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo",
      "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "Lara",
      "Mérida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira",
      "Trujillo", "Vargas", "Yaracuy", "Zulia"
    ],
    localidadLabel: "Municipio",
    localidadPlaceholder: "Caracas"
  },
  "Ecuador": {
    documentLabel: "Cédula",
    documentPlaceholder: "1234567890",
    documentMaxLength: 10,
    divisionLabel: "Provincia",
    divisionPlaceholder: "Pichincha",
    requiereDivision: true,
    divisiones: [
      "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas",
      "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago",
      "Napo", "Orellana", "Pastaza", "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas",
      "Sucumbíos", "Tungurahua", "Zamora Chinchipe"
    ],
    localidadLabel: "Cantón",
    localidadPlaceholder: "Quito"
  },
  "Bolivia": {
    documentLabel: "CI",
    documentPlaceholder: "1234567",
    documentMaxLength: 10,
    divisionLabel: "Departamento",
    divisionPlaceholder: "La Paz",
    requiereDivision: true,
    divisiones: [
      "Chuquisaca", "Cochabamba", "Beni", "La Paz", "Oruro", "Pando", "Potosí", "Santa Cruz", "Tarija"
    ],
    localidadLabel: "Municipio",
    localidadPlaceholder: "La Paz"
  },
  "España": {
    documentLabel: "DNI/NIE",
    documentPlaceholder: "12345678A",
    documentMaxLength: 9,
    divisionLabel: "Comunidad Autónoma",
    divisionPlaceholder: "Madrid",
    requiereDivision: true,
    divisiones: [
      "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria",
      "Castilla-La Mancha", "Castilla y León", "Cataluña", "Ceuta", "Comunidad Valenciana",
      "Extremadura", "Galicia", "La Rioja", "Madrid", "Melilla", "Murcia", "Navarra", "País Vasco"
    ],
    localidadLabel: "Municipio",
    localidadPlaceholder: "Madrid"
  },
  "Estados Unidos": {
    documentLabel: "SSN",
    documentPlaceholder: "123-45-6789",
    documentMaxLength: 11,
    divisionLabel: "Estado",
    divisionPlaceholder: "California",
    requiereDivision: true,
    divisiones: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ],
    localidadLabel: "Ciudad",
    localidadPlaceholder: "Los Angeles"
  },
  "Costa Rica": {
    documentLabel: "Cédula",
    documentPlaceholder: "1-2345-6789",
    documentMaxLength: 12,
    divisionLabel: "Provincia",
    divisionPlaceholder: "San José",
    requiereDivision: true,
    divisiones: [
      "Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"
    ],
    localidadLabel: "Cantón",
    localidadPlaceholder: "San José"
  },
  "Panamá": {
    documentLabel: "Cédula",
    documentPlaceholder: "8-123-456",
    documentMaxLength: 11,
    divisionLabel: "Provincia",
    divisionPlaceholder: "Panamá",
    requiereDivision: true,
    divisiones: [
      "Bocas del Toro", "Chiriquí", "Coclé", "Colón", "Darién", "Emberá-Wounaan",
      "Guna Yala", "Herrera", "Los Santos", "Ngäbe-Buglé", "Panamá", "Panamá Oeste", "Veraguas"
    ],
    localidadLabel: "Distrito",
    localidadPlaceholder: "Ciudad de Panamá"
  },
  // Configuración por defecto para países sin configuración específica
  "default": {
    documentLabel: "Documento de Identidad",
    documentPlaceholder: "Número de documento",
    documentMaxLength: 20,
    divisionLabel: "Provincia/Estado",
    divisionPlaceholder: "Tu provincia o estado",
    requiereDivision: true,
    localidadLabel: "Ciudad",
    localidadPlaceholder: "Tu ciudad"
  }
};

// Lista completa de países en español
const PAISES = [
  "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", 
  "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", 
  "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", 
  "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", 
  "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", 
  "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", 
  "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", 
  "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", 
  "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", 
  "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guinea", "Guinea Ecuatorial", 
  "Guinea-Bisáu", "Guyana", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", 
  "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", 
  "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", 
  "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Macedonia del Norte", 
  "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", 
  "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", 
  "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", 
  "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", 
  "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República del Congo", 
  "República Democrática del Congo", "República Dominicana", "Ruanda", "Rumania", "Rusia", "Samoa", 
  "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", 
  "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", 
  "Somalia", "Sri Lanka", "Suazilandia", "Sudáfrica", "Sudán", "Sudán del Sur", "Suecia", "Suiza", 
  "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", 
  "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", 
  "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"
];

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
    pais: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtener configuración del país seleccionado
  const paisConfig = useMemo(() => {
    return PAISES_CONFIG[registerData.pais] || PAISES_CONFIG["default"];
  }, [registerData.pais]);

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

    // Validación del documento de identidad (flexible según el país)
    if (!registerData.dni || registerData.dni.trim().length === 0) {
      setError(`El ${paisConfig.documentLabel} es requerido`);
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
                    <Label htmlFor="register-dni">{paisConfig.documentLabel}</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-dni"
                        type="text"
                        placeholder={paisConfig.documentPlaceholder}
                        className="pl-10"
                        value={registerData.dni}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= paisConfig.documentMaxLength) {
                            setRegisterData({ ...registerData, dni: value });
                          }
                        }}
                        required
                        maxLength={paisConfig.documentMaxLength}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-pais">País</Label>
                    <Select 
                      value={registerData.pais} 
                      onValueChange={(value) => setRegisterData({ ...registerData, pais: value, provincia: "" })}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Seleccioná tu país" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {PAISES.map((pais) => (
                          <SelectItem key={pais} value={pais}>
                            {pais}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {paisConfig.requiereDivision && (
                    <div className="space-y-2">
                      <Label htmlFor="register-provincia">{paisConfig.divisionLabel}</Label>
                      {paisConfig.divisiones ? (
                        <Select 
                          value={registerData.provincia} 
                          onValueChange={(value) => setRegisterData({ ...registerData, provincia: value })}
                        >
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder={`Seleccioná tu ${paisConfig.divisionLabel.toLowerCase()}`} />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {paisConfig.divisiones.map((division) => (
                              <SelectItem key={division} value={division}>
                                {division}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="register-provincia"
                            type="text"
                            placeholder={paisConfig.divisionPlaceholder}
                            className="pl-10"
                            value={registerData.provincia}
                            onChange={(e) => setRegisterData({ ...registerData, provincia: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-localidad">{paisConfig.localidadLabel}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-localidad"
                        type="text"
                        placeholder={paisConfig.localidadPlaceholder}
                        className="pl-10"
                        value={registerData.localidad}
                        onChange={(e) => setRegisterData({ ...registerData, localidad: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="register-email">Correo Electrónico</Label>
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <Info className="w-4 h-4 text-primary hover:text-primary/80 transition-colors cursor-help" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-sm">
                              <strong>Importante:</strong> Ingresá tu correo personal o el que revisás habitualmente. 
                              A esta dirección te enviaremos toda la información y los accesos a tus capacitaciones.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
