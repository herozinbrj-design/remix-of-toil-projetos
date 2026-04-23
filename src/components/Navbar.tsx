import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoToil from "@/assets/logo-toil.png";
import ElectricButton from "./ElectricButton";
import { useSettings } from "@/contexts/SettingsContext";

interface MenuItem {
  id: number;
  label: string;
  link: string | null;
  order: number;
  children: MenuItem[];
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<number | null>(null);
  const settings = useSettings();
  const logo = settings.site_header_logo || logoToil;
  const phone = settings.site_phone || "(11) 98998-0791";
  const phoneClean = phone.replace(/\D/g, "");
  const location = useLocation();

  // Buscar menu da API
  useEffect(() => {
    fetch("/api/header-menu")
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch(() => {
        // Fallback para menu estático em caso de erro
        setMenuItems([
          { id: 1, label: "Home", link: "/", order: 1, children: [] },
          { id: 2, label: "Sobre", link: "/sobre", order: 2, children: [] },
          { id: 3, label: "Segmentos", link: "/segmentos", order: 3, children: [] },
          { id: 4, label: "Portfólio", link: "/portfolio", order: 4, children: [] },
          { id: 5, label: "Contato", link: "/contato", order: 5, children: [] },
        ]);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenSubmenu(null);
    setMobileOpenSubmenu(null);
  }, [location]);

  const isActive = (item: MenuItem): boolean => {
    if (item.link === location.pathname) return true;
    return item.children.some((child) => isActive(child));
  };

  const renderDesktopMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item);

    if (!hasChildren && item.link) {
      return (
        <Link
          key={item.id}
          to={item.link}
          className={`text-sm font-medium transition-colors ${
            active ? "text-accent" : "text-navy-200 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      );
    }

    if (hasChildren) {
      return (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => setOpenSubmenu(item.id)}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          {item.link ? (
            <Link
              to={item.link}
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                active ? "text-accent" : "text-navy-200 hover:text-white"
              }`}
            >
              {item.label}
              <ChevronDown className="w-3 h-3" />
            </Link>
          ) : (
            <button
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                active ? "text-accent" : "text-navy-200 hover:text-white"
              }`}
            >
              {item.label}
              <ChevronDown className="w-3 h-3" />
            </button>
          )}

          {/* Submenu Dropdown */}
          <AnimatePresence>
            {openSubmenu === item.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 min-w-[200px] bg-navy-900/98 backdrop-blur-xl border border-navy-800/50 rounded-lg shadow-xl overflow-hidden"
              >
                {item.children.map((child) => (
                  <div key={child.id}>
                    {child.link ? (
                      <Link
                        to={child.link}
                        className={`block px-4 py-3 text-sm transition-colors border-b border-navy-800/30 last:border-0 ${
                          location.pathname === child.link
                            ? "text-accent bg-accent/10"
                            : "text-navy-200 hover:text-white hover:bg-navy-800/50"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ) : (
                      <span className="block px-4 py-3 text-sm text-navy-400 border-b border-navy-800/30 last:border-0">
                        {child.label}
                      </span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return null;
  };

  const renderMobileMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item);
    const isSubmenuOpen = mobileOpenSubmenu === item.id;
    const paddingLeft = level * 16;

    return (
      <div key={item.id}>
        <div className="flex items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
          {item.link ? (
            <Link
              to={item.link}
              className={`flex-1 text-base font-medium py-2 border-b border-navy-800/30 transition-colors ${
                active ? "text-accent" : "text-navy-200 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span className="flex-1 text-base font-medium py-2 border-b border-navy-800/30 text-navy-200">
              {item.label}
            </span>
          )}
          {hasChildren && (
            <button
              onClick={() =>
                setMobileOpenSubmenu(isSubmenuOpen ? null : item.id)
              }
              className="p-2 text-navy-200 hover:text-white"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isSubmenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
        {hasChildren && isSubmenuOpen && (
          <div className="bg-navy-900/50">
            {item.children.map((child) => renderMobileMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

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
          {menuItems.map((item) => renderDesktopMenuItem(item))}
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
              {menuItems.map((item) => renderMobileMenuItem(item))}
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
