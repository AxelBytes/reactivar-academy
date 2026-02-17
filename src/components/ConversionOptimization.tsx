import { useState, useEffect } from 'react';
import { Clock, Users, Zap } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ endDate, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-lg">
      <Clock className="w-6 h-6 animate-pulse" />
      <div className="flex gap-2 font-bold text-lg">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-2xl">{timeLeft.days}</span>
              <span className="text-xs opacity-75">días</span>
            </div>
            <span className="text-2xl">:</span>
          </>
        )}
        <div className="flex flex-col items-center">
          <span className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs opacity-75">hrs</span>
        </div>
        <span className="text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs opacity-75">min</span>
        </div>
        <span className="text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs opacity-75">seg</span>
        </div>
      </div>
    </div>
  );
}

interface SocialProofBadgeProps {
  studentCount?: number;
  rating?: number;
  reviewCount?: number;
}

export function SocialProofBadge({
  studentCount = 2547,
  rating = 4.9,
  reviewCount = 832,
}: SocialProofBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-500" />
        <span className="font-semibold">{studentCount.toLocaleString('es-AR')}</span>
        <span className="text-muted-foreground">estudiantes</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${
                star <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          ))}
        </div>
        <span className="font-semibold ml-1">{rating}</span>
        <span className="text-muted-foreground">({reviewCount.toLocaleString('es-AR')} reseñas)</span>
      </div>
    </div>
  );
}

interface UrgencyBadgeProps {
  type: 'limited_spots' | 'limited_time' | 'hot_deal' | 'best_seller';
  count?: number;
}

export function UrgencyBadge({ type, count }: UrgencyBadgeProps) {
  const badges = {
    limited_spots: {
      text: count ? `Solo ${count} cupos disponibles` : 'Cupos limitados',
      color: 'bg-red-500',
      icon: Users,
    },
    limited_time: {
      text: 'Oferta por tiempo limitado',
      color: 'bg-orange-500',
      icon: Clock,
    },
    hot_deal: {
      text: '🔥 Más vendido',
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      icon: Zap,
    },
    best_seller: {
      text: '⭐ Best Seller',
      color: 'bg-yellow-500',
      icon: Zap,
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-semibold ${badge.color} animate-pulse`}
    >
      <Icon className="w-4 h-4" />
      {badge.text}
    </div>
  );
}

interface TrustBadgesProps {
  showMoneyBack?: boolean;
  showSecurePayment?: boolean;
  showLifetimeAccess?: boolean;
  showCertificate?: boolean;
}

export function TrustBadges({
  showMoneyBack = true,
  showSecurePayment = true,
  showLifetimeAccess = true,
  showCertificate = true,
}: TrustBadgesProps) {
  const badges = [
    showMoneyBack && {
      icon: '💯',
      text: 'Garantía 30 días',
      subtitle: 'o te devolvemos tu dinero',
    },
    showSecurePayment && {
      icon: '🔒',
      text: 'Pago seguro',
      subtitle: '256-bit SSL encriptado',
    },
    showLifetimeAccess && {
      icon: '♾️',
      text: 'Acceso de por vida',
      subtitle: 'Sin cargos adicionales',
    },
    showCertificate && {
      icon: '🎓',
      text: 'Certificado incluido',
      subtitle: 'Al completar el curso',
    },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-muted/30 rounded-lg">
      {badges.map((badge, index) => (
        <div key={index} className="flex flex-col items-center text-center">
          <div className="text-3xl mb-2">{badge.icon}</div>
          <div className="font-semibold text-sm">{badge.text}</div>
          <div className="text-xs text-muted-foreground mt-1">{badge.subtitle}</div>
        </div>
      ))}
    </div>
  );
}

interface LiveActivityNotificationProps {
  userName: string;
  action: string;
  courseName: string;
  timeAgo: string;
}

export function LiveActivityNotification({
  userName,
  action,
  courseName,
  timeAgo,
}: LiveActivityNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-in-left">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              <span className="font-bold">{userName}</span> {action}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{courseName}</p>
            <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
