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
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.svg" alt="Logo" className="w-[200px] h-[200px]" />
              <span className="text-2xl font-bold group-hover:text-primary transition-colors">
                REACTIVAR <span className="text-primary">ACADEMY</span>
              </span>
            </Link>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Tu plataforma de capacitación deportiva y equipamiento de alta calidad. 
              Aprende de los mejores y equípate para el éxito.
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
            <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {[
                { href: "/cursos", label: "Capacitaciones" },
                { href: "/tienda", label: "Tienda" },
                { href: "/sobre-nosotros", label: "Sobre Nosotros" },
                { href: "/contacto", label: "Contacto" },
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
            <h4 className="font-semibold text-lg mb-4">Categorías</h4>
            <ul className="space-y-3">
              {[
                "Entrenador/a de NEWCOM",
                "Formador/a de NEWCOM",
                "Árbitros de NEWCOM",
                "Planillero/a de NEWCOM",
              ].map((category) => (
                <li key={category}>
                  <a
                    href="#"
                    className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm"
                  >
                    {category}
                  </a>
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

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-secondary-foreground/60">
              © 2026 ReactivarAcademy. Todos los derechos reservados.
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
        <div className="mt-6 pt-4 border-t border-secondary-foreground/5">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-secondary-foreground/40">Desarrollado por</p>
            <img
              src={lionelDevLogo}
              alt="Lionel.Dev - Premium Web & Software Development"
              className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
