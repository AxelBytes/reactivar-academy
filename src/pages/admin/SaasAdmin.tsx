import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Save, RefreshCw, KeyRound, ExternalLink } from "lucide-react";

interface SaasPlan {
  id: number;
  name: string;
  months: number;
  price: number;
  original_price: number | null;
  description: string | null;
  features: string[] | null;
  is_active: boolean;
  badge: string | null;
}

const MONTH_LABELS: Record<number, string> = {
  1: "1 Mes",
  3: "3 Meses",
  6: "6 Meses",
  12: "12 Meses (1 Año)",
};

const DEFAULT_PLANS: Omit<SaasPlan, "id">[] = [
  { name: "Plan 1 Mes",    months: 1,  price: 2000,  original_price: null, description: null, features: null, is_active: true, badge: null },
  { name: "Plan 3 Meses",  months: 3,  price: 5000,  original_price: null, description: null, features: null, is_active: true, badge: null },
  { name: "Plan 6 Meses",  months: 6,  price: 8000,  original_price: null, description: null, features: null, is_active: true, badge: "popular" },
  { name: "Plan 12 Meses", months: 12, price: 14000, original_price: null, description: null, features: null, is_active: true, badge: null },
];

export default function SaasAdmin() {
  const { toast } = useToast();
  const [plans, setPlans]     = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<number | null>(null);

  const cargarPlanes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("saas_plans")
        .select("*")
        .order("months", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Crear los 4 planes por defecto si no existen
        const { data: inserted, error: insertError } = await supabase
          .from("saas_plans")
          .insert(DEFAULT_PLANS)
          .select();
        if (insertError) throw insertError;
        setPlans(inserted || []);
        toast({ title: "Planes creados", description: "Se crearon los 4 planes por defecto." });
      } else {
        setPlans(data);
      }
    } catch (e: any) {
      toast({ title: "Error cargando planes", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPlanes(); }, []);

  const updatePlan = (id: number, field: keyof SaasPlan, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const savePlan = async (plan: SaasPlan) => {
    setSaving(plan.id);
    try {
      const { error } = await supabase
        .from("saas_plans")
        .update({
          name:           plan.name,
          price:          plan.price,
          original_price: plan.original_price || null,
          description:    plan.description || null,
          features:       plan.features,
          is_active:      plan.is_active,
          badge:          plan.badge || null,
        })
        .eq("id", plan.id);

      if (error) throw error;
      toast({ title: "✅ Plan guardado", description: `${plan.name} actualizado correctamente.` });
    } catch (e: any) {
      toast({ title: "Error guardando", description: e.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">SaaS — Buscador de Reglamento</h1>
            <p className="text-muted-foreground mt-1">
              Configurá los precios y disponibilidad de cada plan de suscripción
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={cargarPlanes} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button variant="outline" asChild>
              <a href="/saas" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver página
              </a>
            </Button>
          </div>
        </div>

        {/* Info */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="flex items-start gap-3 pt-5">
            <KeyRound className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">¿Cómo funciona?</p>
              <p>
                Cuando un cliente compra un plan, se asigna automáticamente una clave de acceso desde
                Google Sheets y se le envía por email con el link del buscador.
                Los precios que configures acá se muestran directamente en <strong>/saas</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Planes */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {MONTH_LABELS[plan.months] || plan.name}
                      {plan.badge === "popular" && (
                        <Badge className="bg-primary text-primary-foreground text-xs">⭐ Popular</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {plan.is_active ? "Activo" : "Oculto"}
                      </span>
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={v => updatePlan(plan.id, "is_active", v)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Precio (ARS) *</Label>
                      <Input
                        type="number"
                        value={plan.price}
                        onChange={e => updatePlan(plan.id, "price", parseInt(e.target.value) || 0)}
                        placeholder="5000"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Precio tachado (opcional)</Label>
                      <Input
                        type="number"
                        value={plan.original_price ?? ""}
                        onChange={e => updatePlan(plan.id, "original_price", e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="7000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Badge (opcional)</Label>
                    <Input
                      value={plan.badge ?? ""}
                      onChange={e => updatePlan(plan.id, "badge", e.target.value || null)}
                      placeholder='Ej: popular  (deja vacío para ninguno)'
                    />
                    <p className="text-xs text-muted-foreground">
                      Escribí "popular" para mostrar la estrella ⭐ de "Más popular"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label>Características (una por línea)</Label>
                    <Textarea
                      rows={4}
                      value={plan.features ? plan.features.join("\n") : ""}
                      onChange={e => updatePlan(plan.id, "features", e.target.value ? e.target.value.split("\n").filter(Boolean) : null)}
                      placeholder={"Acceso completo al buscador\nBúsqueda por artículo\nActualizaciones incluidas"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Si lo dejás vacío se muestran las características por defecto.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => savePlan(plan)}
                    disabled={saving === plan.id}
                  >
                    {saving === plan.id
                      ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
                      : <><Save className="w-4 h-4 mr-2" />Guardar cambios</>
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
