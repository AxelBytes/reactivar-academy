import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone } from "lucide-react";
import lionelDevLogo from "@/assets/lioneldev-logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group" aria-label="Reactivar Academy - Plataforma #1 de Newcom en Argentina">
              <img src="/logo.svg" alt="Reactivar Academy - Newcom Argentina" className="w-[200px] h-[200px]" />
              <span className="text-2xl font-bold group-hover:text-primary transition-colors">
                REACTIVAR <span className="text-primary">ACADEMY</span>
              </span>
            </Link>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Plataforma #1 de capacitación en <strong>Newcom</strong> en Argentina. Cursos online,
              ebooks y buscador del reglamento oficial por el profesor Diego Machado.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/share/1887vTePKg/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/machado_reactivar_newcom?igsh=MTBveGN0dnVjb2M3cg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@reactivarnewcommachado?si=NSfWbIPY9pwNW48A" target="_blank" rel="noopener noreferrer" className="text-secondary-foreground/60 hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Newcom Argentina</h4>
            <ul className="space-y-3">
              {[
                { href: "/cursos", label: "Capacitaciones de Newcom" },
                { href: "/pdfs", label: "Ebooks de Newcom" },
                { href: "/saas", label: "Buscador del Reglamento" },
                { href: "/sobre-nosotros", label: "Sobre Diego Machado" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Formación en Newcom</h4>
            <ul className="space-y-3">
              {[
                { href: "/cursos", label: "Entrenador/a de Newcom" },
                { href: "/cursos", label: "Formador/a de Newcom" },
                { href: "/cursos", label: "Árbitros de Newcom" },
                { href: "/cursos", label: "Planillero/a de Newcom" },
              ].map((cat, i) => (
                <li key={i}>
                  <Link
                    to={cat.href}
                    className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-secondary-foreground/80">
                <Mail className="w-4 h-4 text-primary" />
                <span>Profedeeducacionfisica22@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary-foreground/80">
                <Phone className="w-4 h-4 text-primary" />
                <span>+54 9 3755 26-7435</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SEO keyword strip (visible y legítimo) */}
        <div className="mt-10 pt-6 border-t border-secondary-foreground/10">
          <p className="text-xs text-secondary-foreground/50 leading-relaxed text-center max-w-4xl mx-auto">
            <strong className="text-secondary-foreground/70">Reactivar Academy</strong> · Capacitaciones de Newcom Online · Cursos de Newcom Argentina ·
            Reglamento Oficial de Newcom · Diego Machado Newcom · Plataforma #1 de Newcom · Formación de
            Entrenadores Newcom · Árbitros y Planilleros Newcom · Ebooks de Newcom · Buscador Inteligente del
            Reglamento de Newcom · Newcom para adultos mayores · Newcom Misiones · Newcom Buenos Aires ·
            Capacitación deportiva especializada
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-secondary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-secondary-foreground/60">
              © 2026 Reactivar Academy - Newcom. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                Términos de Uso
              </a>
              <a href="#" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-8 pt-6 border-t border-secondary-foreground/5">
          <div className="flex flex-col items-center gap-4">
            <p className="text-base text-secondary-foreground/60 font-medium tracking-wide">Desarrollado por</p>
            <img
              src={lionelDevLogo}
              alt="Lionel.Dev - Premium Web & Software Development"
              className="h-20 md:h-24 object-contain brightness-125 hover:brightness-150 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
