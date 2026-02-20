import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Bell,
  Lock,
  CreditCard,
  Palette,
  Database,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Config {
  // General
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  supportEmail: string;
  
  // Features
  enableRegistration: boolean;
  enableComments: boolean;
  enableReviews: boolean;
  maintenanceMode: boolean;
  
  // Email
  emailProvider: string;
  fromEmail: string;
  fromName: string;
  
  // Payments
  mercadoPagoEnabled: boolean;
  testMode: boolean;
  
  // Notifications
  telegramEnabled: boolean;
  emailNotifications: boolean;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

const Settings = () => {
  const [config, setConfig] = useState<Config>({
    // General
    siteName: "Reactivar Academy",
    siteDescription: "Academia de fitness y entrenamiento profesional",
    siteUrl: window.location.origin,
    supportEmail: "soporte@reactivar.com",
    
    // Features
    enableRegistration: true,
    enableComments: false,
    enableReviews: true,
    maintenanceMode: false,
    
    // Email
    emailProvider: "Brevo",
    fromEmail: "noreply@reactivar.com",
    fromName: "Reactivar Academy",
    
    // Payments
    mercadoPagoEnabled: true,
    testMode: false,
    
    // Notifications
    telegramEnabled: true,
    emailNotifications: true,
    
    // SEO
    metaTitle: "Reactivar Academy - Cursos de Fitness Online",
    metaDescription: "Academia de fitness profesional con cursos online certificados",
    metaKeywords: "fitness, entrenamiento, cursos online, capacitación deportiva",
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  // Verificar estado de servicios
  const [servicesStatus, setServicesStatus] = useState({
    supabase: true,
    mercadopago: true,
    brevo: true,
    telegram: true,
    systeme: false,
  });

  useEffect(() => {
    checkServicesStatus();
  }, []);

  const checkServicesStatus = async () => {
    // Verificar variables de entorno
    const supabaseOk = !!import.meta.env.VITE_SUPABASE_URL;
    const mercadopagoOk = !!import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    const brevoOk = !!import.meta.env.VITE_BREVO_API_KEY;
    const telegramOk = !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const systemeOk = !!import.meta.env.VITE_SYSTEME_API_KEY;

    setServicesStatus({
      supabase: supabaseOk,
      mercadopago: mercadopagoOk,
      brevo: brevoOk,
      telegram: telegramOk,
      systeme: systemeOk,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Aquí guardarías la configuración en Supabase o localStorage
      localStorage.setItem('siteConfig', JSON.stringify(config));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular guardado
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof Config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const ServiceStatus = ({ name, status }: { name: string; status: boolean }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <span className="text-sm font-medium">{name}</span>
      {status ? (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Activo
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Inactivo
        </Badge>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona la configuración de la plataforma
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>

        {/* Estado de Servicios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Estado de Servicios
            </CardTitle>
            <CardDescription>
              Verifica que todos los servicios externos estén configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ServiceStatus name="Supabase (Base de datos)" status={servicesStatus.supabase} />
              <ServiceStatus name="Mercado Pago (Pagos)" status={servicesStatus.mercadopago} />
              <ServiceStatus name="Brevo (Emails)" status={servicesStatus.brevo} />
              <ServiceStatus name="Telegram Bot" status={servicesStatus.telegram} />
              <ServiceStatus name="systeme.io (Cursos)" status={servicesStatus.systeme} />
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general">
              <Globe className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Lock className="w-4 h-4 mr-2" />
              Avanzado
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Configuración básica del sitio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => updateConfig('siteName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descripción</Label>
                  <Textarea
                    id="siteDescription"
                    value={config.siteDescription}
                    onChange={(e) => updateConfig('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL del Sitio</Label>
                  <Input
                    id="siteUrl"
                    value={config.siteUrl}
                    onChange={(e) => updateConfig('siteUrl', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config.supportEmail}
                    onChange={(e) => updateConfig('supportEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades</CardTitle>
                <CardDescription>Activa o desactiva características</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir Registro de Usuarios</Label>
                    <p className="text-sm text-muted-foreground">
                      Los usuarios pueden crear nuevas cuentas
                    </p>
                  </div>
                  <Switch
                    checked={config.enableRegistration}
                    onCheckedChange={(checked) => updateConfig('enableRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Habilitar Reseñas</Label>
                    <p className="text-sm text-muted-foreground">
                      Los usuarios pueden dejar reseñas en cursos
                    </p>
                  </div>
                  <Switch
                    checked={config.enableReviews}
                    onCheckedChange={(checked) => updateConfig('enableReviews', checked)}
                  />
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <Label className="text-destructive">Modo Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      El sitio mostrará un mensaje de mantenimiento
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Email</CardTitle>
                <CardDescription>Proveedor y configuración de emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Proveedor de Email</Label>
                  <Input
                    id="emailProvider"
                    value={config.emailProvider}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Actualmente usando Brevo (Sendinblue)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email Remitente</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={config.fromEmail}
                    onChange={(e) => updateConfig('fromEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">Nombre Remitente</Label>
                  <Input
                    id="fromName"
                    value={config.fromName}
                    onChange={(e) => updateConfig('fromName', e.target.value)}
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Configuración de API Key
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        La API Key de Brevo se configura en las variables de entorno (.env.local)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Pagos</CardTitle>
                <CardDescription>Pasarelas de pago y configuración</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mercado Pago Habilitado</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir pagos con Mercado Pago
                    </p>
                  </div>
                  <Switch
                    checked={config.mercadoPagoEnabled}
                    onCheckedChange={(checked) => updateConfig('mercadoPagoEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Prueba</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar credenciales de testing
                    </p>
                  </div>
                  <Switch
                    checked={config.testMode}
                    onCheckedChange={(checked) => updateConfig('testMode', checked)}
                  />
                </div>

                {config.testMode && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                          Modo de Prueba Activo
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Los pagos no serán reales. Desactiva esto en producción.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Configura cómo y cuándo enviar notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails de notificación
                    </p>
                  </div>
                  <Switch
                    checked={config.emailNotifications}
                    onCheckedChange={(checked) => updateConfig('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bot de Telegram</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones de ventas por Telegram
                    </p>
                  </div>
                  <Switch
                    checked={config.telegramEnabled}
                    onCheckedChange={(checked) => updateConfig('telegramEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración Avanzada</CardTitle>
                <CardDescription>SEO y configuraciones técnicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Título SEO</Label>
                  <Input
                    id="metaTitle"
                    value={config.metaTitle}
                    onChange={(e) => updateConfig('metaTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Descripción SEO</Label>
                  <Textarea
                    id="metaDescription"
                    value={config.metaDescription}
                    onChange={(e) => updateConfig('metaDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Keywords SEO</Label>
                  <Input
                    id="metaKeywords"
                    value={config.metaKeywords}
                    onChange={(e) => updateConfig('metaKeywords', e.target.value)}
                    placeholder="fitness, entrenamiento, cursos..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                <CardDescription>Acciones irreversibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                  <div>
                    <Label className="text-destructive">Limpiar Caché</Label>
                    <p className="text-sm text-muted-foreground">
                      Elimina todos los datos en caché
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Limpiar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                  <div>
                    <Label className="text-destructive">Restablecer Configuración</Label>
                    <p className="text-sm text-muted-foreground">
                      Volver a valores por defecto
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Restablecer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
