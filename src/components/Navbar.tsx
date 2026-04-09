import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoToil from "@/assets/logo-toil.png";
import ElectricButton from "./ElectricButton";
import { useSettings } from "@/contexts/SettingsContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Sobre", path: "/sobre" },
  { label: "Segmentos", path: "/segmentos" },
  { label: "Portfólio", path: "/portfolio" },
  { label: "Contato", path: "/contato" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settings = useSettings();
  const logo = settings.site_header_logo || logoToil;
  const phone = settings.site_phone || "(11) 98998-0791";
  const phoneClean = phone.replace(/\D/g, ""); // Remove tudo que não é número
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/95 backdrop-blur-xl shadow-lg border-b border-navy-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="TOIL Projetos" className="h-10 w-auto" width="57" height="40" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-accent"
                  : "text-navy-200 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 ml-4">
            <a
              href={`tel:+55${phoneClean}`}
              className="flex items-center gap-2 text-sm font-semibold text-white hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" />
              {phone}
            </a>
            <ElectricButton to="/contato">
              Solicitar Orçamento
            </ElectricButton>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu de navegação"}
          aria-expanded={isOpen}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-navy-950/98 backdrop-blur-xl border-t border-navy-800/50 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium py-2 border-b border-navy-800/30 transition-colors ${
                    location.pathname === link.path
                      ? "text-accent"
                      : "text-navy-200 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <ElectricButton to="/contato" fullWidth>
                Solicitar Orçamento
              </ElectricButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
