import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, KeyRound, Search, Shield, Zap, RefreshCw, Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CheckoutDialog from "@/components/checkout/CheckoutDialog";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";

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

const DEFAULT_FEATURES = [
  "Acceso completo al Buscador de Reglamento",
  "Búsqueda inteligente por artículo",
  "Resultados en tiempo real",
  "Disponible en cualquier dispositivo",
  "Actualizaciones del reglamento incluidas",
];

const PLAN_LABELS: Record<number, { label: string; sublabel: string; color: string }> = {
  1:  { label: "1 Mes",    sublabel: "Prueba el sistema",        color: "border-border" },
  3:  { label: "3 Meses",  sublabel: "Ideal para la temporada",  color: "border-blue-400" },
  6:  { label: "6 Meses",  sublabel: "El más elegido",           color: "border-primary" },
  12: { label: "1 Año",    sublabel: "Máximo ahorro",            color: "border-green-500" },
};

export default function Saas() {
  const { addSaas, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("saas_plans")
          .select("*")
          .eq("is_active", true)
          .order("months", { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch {
        // fallback vacío
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleBuy = (plan: SaasPlan) => {
    if (!isAuthenticated) {
      toast({
        title: "Iniciá sesión primero",
        description: "Necesitás una cuenta para comprar. Es rápido y gratis.",
      });
      navigate("/login");
      return;
    }

    addSaas({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      image: "",
      subscriptionMonths: plan.months,
    });

    setCheckoutOpen(true);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo recibo mi clave de acceso al Buscador de Reglamento de Newcom?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Al completar el pago, tu clave se activa automáticamente y te llega por email en minutos.",
        },
      },
      {
        "@type": "Question",
        name: "¿En qué dispositivos puedo usar el Buscador de Reglamento de Newcom?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El buscador funciona en cualquier navegador: celular, tablet o computadora.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué pasa cuando vence mi suscripción al Buscador de Reglamento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tu clave se desactiva automáticamente. Podés renovar en cualquier momento.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo cambiar de plan de suscripción al Buscador de Reglamento de Newcom?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Al renovar podés elegir un plan diferente. Si renovás antes de que venza, se extiende desde la fecha actual.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Buscador del Reglamento de Newcom | Reactivar Academy"
        description="Accedé al buscador inteligente del Reglamento Oficial de Newcom. Encontrá cualquier artículo en segundos desde tu celular. Suscripción mensual sin permanencia."
        keywords={[
          'reglamento newcom',
          'buscador reglamento newcom',
          'reglamento oficial newcom',
          'arbitro newcom',
          'planillero newcom',
          'reglas newcom',
          'reglamento newcom argentina',
          'reglamento newcom pdf',
          'capitulos reglamento newcom',
        ]}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-3xl">
          <Badge className="mb-4 text-sm px-4 py-1">🔍 Buscador de Reglamento</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Encontrá cualquier artículo<br />
            <span className="text-primary">en segundos</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Accedé al buscador inteligente del Reglamento de Newcom. Buscá por artículo,
            capítulo o palabra clave y obtené resultados instantáneos.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: Search,       text: "Búsqueda inteligente" },
              { icon: Zap,          text: "Resultados instantáneos" },
              { icon: Shield,       text: "Acceso seguro con clave" },
              { icon: RefreshCw,    text: "Reglamento siempre actualizado" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-2">Elegí tu plan</h2>
          <p className="text-center text-muted-foreground mb-10">
            Sin permanencia. Podés renovar o cambiar de plan cuando quieras.
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="p-6 space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <KeyRound className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>Los planes estarán disponibles próximamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const meta     = PLAN_LABELS[plan.months] || { label: `${plan.months} Meses`, sublabel: "", color: "border-border" };
                const features = plan.features?.length ? plan.features : DEFAULT_FEATURES;
                const isBest   = plan.badge === "popular" || plan.months === 6;
                const alreadyInCart = isInCart(plan.id, "saas");

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col border-2 transition-shadow hover:shadow-xl ${
                      isBest ? "border-primary shadow-lg scale-[1.02]" : meta.color
                    }`}
                  >
                    {isBest && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Más popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-2 pt-8 text-center">
                      <p className="text-sm font-medium text-muted-foreground">{meta.sublabel}</p>
                      <h3 className="text-2xl font-extrabold">{meta.label}</h3>
                      <div className="mt-2">
                        {plan.original_price && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${plan.original_price.toLocaleString("es-AR")}
                          </p>
                        )}
                        <p className="text-4xl font-extrabold text-foreground">
                          ${plan.price.toLocaleString("es-AR")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${Math.round(plan.price / plan.months).toLocaleString("es-AR")} / mes
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 gap-4 pt-0">
                      <ul className="space-y-2 flex-1">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full mt-2 ${isBest ? "" : "variant-outline"}`}
                        variant={isBest ? "default" : "outline"}
                        onClick={() => handleBuy(plan)}
                        disabled={alreadyInCart}
                      >
                        {alreadyInCart ? "✓ Agregado" : "Suscribirme"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-accent/20">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Cómo recibo mi clave de acceso?",
                a: "Al completar el pago, tu clave se activa automáticamente y te llega por email en minutos.",
              },
              {
                q: "¿En qué dispositivos puedo usarlo?",
                a: "El buscador funciona en cualquier navegador: celular, tablet o computadora.",
              },
              {
                q: "¿Qué pasa cuando vence mi suscripción?",
                a: "Tu clave se desactiva automáticamente. Podés renovar en cualquier momento.",
              },
              {
                q: "¿Puedo cambiar de plan?",
                a: "Sí. Al renovar podés elegir un plan diferente. Si renovás antes de que venza, se extiende desde la fecha actual.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-card rounded-lg p-5 border border-border">
                <p className="font-semibold mb-1">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}
