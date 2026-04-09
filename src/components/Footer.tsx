import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface FooterItem {
  label: string;
  link: string;
}

interface FooterData {
  logo: string | null;
  description: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  navTitle: string;
  servicesTitle: string;
  navItems: FooterItem[];
  serviceItems: FooterItem[];
  copyright: string;
  cnpj: string;
  developedBy: string;
}

const defaults: FooterData = {
  logo: null,
  description: "Soluções sob medida em acrílico, marcenaria e comunicação visual para varejo, empresas e projetos especiais.",
  phone: "(11) 98998-0791",
  email: "contato@toilprojetos.com.br",
  address: "Rua Fernão Marques, 420 – São Paulo, SP – CEP 08220-390",
  instagram: "",
  facebook: "",
  linkedin: "",
  navTitle: "NAVEGAÇÃO",
  servicesTitle: "SERVIÇOS",
  navItems: [
    { label: "Sobre", link: "/sobre" },
    { label: "Serviços", link: "/servicos" },
    { label: "Portfólio", link: "/portfolio" },
    { label: "Segmentos", link: "/segmentos" },
    { label: "Contato", link: "/contato" },
  ],
  serviceItems: [
    { label: "Peças em Acrílico", link: "" },
    { label: "Marcenaria Sob Medida", link: "" },
    { label: "Comunicação Visual", link: "" },
    { label: "Montagem de Lojas", link: "" },
    { label: "Displays e Totens", link: "" },
    { label: "Projetos Especiais", link: "" },
  ],
  copyright: "© 2026 Toil Projetos. Todos os direitos reservados.",
  cnpj: "20.483.474/0001-49",
  developedBy: "Desenvolvido com excelência",
};

function tryParseJson<T>(json: string, fallback: T): T {
  try { return JSON.parse(json); } catch { return fallback; }
}

export default function Footer() {
  const s = useSettings();
  const data: FooterData = {
    logo: s.site_footer_logo || null,
    description: s.footer_description || defaults.description,
    phone: s.footer_phone || defaults.phone,
    email: s.footer_email || defaults.email,
    address: s.footer_address || defaults.address,
    instagram: s.footer_instagram || "",
    facebook: s.footer_facebook || "",
    linkedin: s.footer_linkedin || "",
    navTitle: s.footer_nav_title || defaults.navTitle,
    servicesTitle: s.footer_services_title || defaults.servicesTitle,
    navItems: s.footer_nav_items ? tryParseJson(s.footer_nav_items, defaults.navItems) : defaults.navItems,
    serviceItems: s.footer_service_items ? tryParseJson(s.footer_service_items, defaults.serviceItems) : defaults.serviceItems,
    copyright: s.footer_copyright || defaults.copyright,
    cnpj: s.footer_cnpj || defaults.cnpj,
    developedBy: s.footer_developed_by || defaults.developedBy,
  };

  const socialLinks = [
    { url: data.instagram, Icon: Instagram, label: "Instagram" },
    { url: data.facebook, Icon: Facebook, label: "Facebook" },
    { url: data.linkedin, Icon: Linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-navy-950 text-navy-200 border-t border-navy-800/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="h-10 w-auto" width="57" height="40" />
              ) : (
                <span className="text-2xl font-display font-bold text-white tracking-tight">
                  TOIL<span className="text-accent">.</span>
                </span>
              )}
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed">{data.description}</p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map(({ url, Icon, label }, i) => {
                  // Cores oficiais das marcas
                  const brandColors: Record<string, { bg: string; text: string }> = {
                    Instagram: { 
                      bg: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]", 
                      text: "text-white" 
                    },
                    Facebook: { 
                      bg: "bg-[#1877F2]", 
                      text: "text-white" 
                    },
                    LinkedIn: { 
                      bg: "bg-[#0A66C2]", 
                      text: "text-white" 
                    },
                  };
                  const colors = brandColors[label] || { bg: "bg-navy-800/50", text: "text-navy-300" };
                  
                  return (
                    <a 
                      key={i} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={`Seguir no ${label}`} 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${colors.bg} ${colors.text}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{data.navTitle}</p>
            <ul className="space-y-2.5">
              {data.navItems.map((item, i) => (
                <li key={i}>
                  {item.link ? (
                    <Link to={item.link} className="text-sm text-navy-300 hover:text-accent transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-navy-300">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{data.servicesTitle}</p>
            <ul className="space-y-2.5 text-sm text-navy-300">
              {data.serviceItems.map((item, i) => (
                <li key={i}>
                  {item.link ? (
                    <Link to={item.link} className="hover:text-accent transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Canais de Comunicação</p>
            <ul className="space-y-3">
              {data.phone && (
                <li className="flex items-start gap-3 text-sm text-navy-300">
                  <Phone className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>{data.phone}</span>
                </li>
              )}
              {data.email && (
                <li className="flex items-start gap-3 text-sm text-navy-300">
                  <Mail className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>{data.email}</span>
                </li>
              )}
              {data.address && (
                <li className="flex items-start gap-3 text-sm text-navy-300">
                  <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                  <span>{data.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">{data.copyright}{data.cnpj ? ` | CNPJ: ${data.cnpj}` : ""}</p>
          {data.developedBy && <p className="text-xs text-navy-400">{data.developedBy}</p>}
        </div>
      </div>
    </footer>
  );
}
