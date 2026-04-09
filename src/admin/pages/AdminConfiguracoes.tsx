import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";
import { usePermissions } from "../../contexts/PermissionsContext";
import {
  Upload, Palette, Type, Image, X, Check, Mail, Loader2,
  Globe, Bookmark, LayoutTemplate, Paintbrush, Settings, PanelBottom,
  Plus, Trash2, Link as LinkIcon, GripVertical, Pencil, Info, Phone, Film, Sparkles, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AdminBanner from "./AdminBanner";

const SOBRE_ICONS = [
  "Target", "Eye", "Award", "Users", "Star", "Heart", "Shield",
  "Zap", "Globe", "Compass", "CheckCircle", "Trophy", "Flame",
  "ThumbsUp", "Lightbulb", "Rocket", "Clock",
];

const GOOGLE_FONTS = [
  "Plus Jakarta Sans", "Space Grotesk", "DM Sans", "Inter", "Poppins",
  "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway",
  "Nunito", "Work Sans", "Outfit", "Sora", "Manrope",
  "Rubik", "Quicksand", "Mulish", "Barlow", "Urbanist",
  "Playfair Display", "Merriweather", "Lora", "Bitter", "Crimson Text",
  "Oswald", "Bebas Neue", "Anton", "Archivo Black", "Teko",
];

interface ColorConfig {
  label: string;
  key: string;
  value: string;
}

interface NavSection {
  title: string;
  items: { id: string; label: string; icon: React.ElementType; permission?: string }[];
}

const navSections: NavSection[] = [
  {
    title: "GERAL",
    items: [
      { id: "geral", label: "Geral", icon: Globe, permission: "edit_settings_general" },
      { id: "seo", label: "SEO", icon: Bookmark, permission: "edit_settings_seo" },
    ],
  },
  {
    title: "SEÇÕES",
    items: [
      { id: "banner", label: "Banner Principal", icon: LayoutTemplate, permission: "edit_settings_banners" },
      { id: "carrossel", label: "Carrossel Home", icon: Film, permission: "edit_settings_carousel" },
      { id: "clientes", label: "Clientes", icon: Users, permission: "edit_settings_clients" },
      { id: "footer", label: "Footer", icon: PanelBottom, permission: "edit_settings_footer" },
      { id: "sobre", label: "Página Sobre", icon: Info, permission: "edit_settings_about" },
      { id: "contato", label: "Página Contato", icon: Phone, permission: "edit_settings_contact" },
    ],
  },
  {
    title: "APARÊNCIA",
    items: [
      { id: "cores", label: "Cores & Botões", icon: Paintbrush, permission: "edit_settings_colors" },
      { id: "logos", label: "Logomarcas", icon: Image, permission: "edit_settings_logos" },
      { id: "fontes", label: "Tipografia", icon: Type, permission: "edit_settings_fonts" },
      { id: "animacoes", label: "Animações", icon: Sparkles, permission: "edit_settings_animations" },
    ],
  },
  {
    title: "INTEGRAÇÕES",
    items: [
      { id: "smtp", label: "E-mail (SMTP)", icon: Mail, permission: "edit_settings_smtp" },
    ],
  },
];

export default function AdminConfiguracoes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get("secao") || "geral";
  const [activeSection, setActiveSection] = useState(initialSection);
  const { hasPermission } = usePermissions();

  // Filtrar seções baseado nas permissões do usuário
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Se o item tem permissão definida, verificar se o usuário tem essa permissão
      if (item.permission) {
        return hasPermission(item.permission);
      }
      // Se não tem permissão definida, mostrar sempre
      return true;
    })
  })).filter(section => section.items.length > 0); // Remover seções vazias

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setSearchParams({ secao: id });
  };

  // --- Auth helper ---
  function getToken() {
    return localStorage.getItem("admin_token") || "";
  }
  function authHeaders(extra?: Record<string, string>) {
    return { Authorization: `Bearer ${getToken()}`, ...extra };
  }

  // --- Load settings from API ---
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    phone: "",
    email: "",
    address: "",
    cnpj: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    keywords: "",
    ogImage: "",
    ogLocale: "pt_BR",
    twitterCard: "summary_large_image",
    twitterHandle: "",
    schemaEnabled: "true",
    schemaType: "LocalBusiness",
    schemaLat: "",
    schemaLng: "",
    schemaZip: "",
    schemaOpeningHours: "",
    schemaPriceRange: "",
    googleVerification: "",
    bingVerification: "",
    robotsIndex: "true",
    robotsFollow: "true",
    sitemapEnabled: "true",
    aiAllowed: "true",
    aiSummary: "",
  });

  const [footerForm, setFooterForm] = useState({
    description: "Soluções sob medida em acrílico, marcenaria e comunicação visual para varejo, empresas e projetos especiais.",
    phone: "(11) 98998-0791",
    email: "contato@toilprojetos.com.br",
    address: "Rua Fernão Marques, 420 – São Paulo, SP – CEP 08220-390",
    instagram: "",
    facebook: "",
    linkedin: "",
    copyright: "© 2026 Toil Projetos. Todos os direitos reservados.",
    cnpj: "20.483.474/0001-49",
    developedBy: "Desenvolvido com excelência",
    navTitle: "NAVEGAÇÃO",
    servicesTitle: "SERVIÇOS",
  });
  const updateFooter = (key: string, value: string) => setFooterForm({ ...footerForm, [key]: value });

  // Footer columns: navigation and services as structured arrays
  const [footerNavItems, setFooterNavItems] = useState<{ label: string; link: string }[]>([
    { label: "Sobre", link: "/sobre" },
    { label: "Serviços", link: "/servicos" },
    { label: "Portfólio", link: "/portfolio" },
    { label: "Segmentos", link: "/segmentos" },
    { label: "Contato", link: "/contato" },
  ]);
  const [footerServiceItems, setFooterServiceItems] = useState<{ label: string; link: string }[]>([
    { label: "Peças em Acrílico", link: "" },
    { label: "Marcenaria Sob Medida", link: "" },
    { label: "Comunicação Visual", link: "" },
    { label: "Montagem de Lojas", link: "" },
    { label: "Displays e Totens", link: "" },
    { label: "Projetos Especiais", link: "" },
  ]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setForm({
        companyName: data.site_name || "",
        phone: data.site_phone || "",
        email: data.site_email || "",
        address: data.site_address || "",
        cnpj: data.site_cnpj || "",
        instagram: data.site_instagram || "",
        facebook: data.site_facebook || "",
        linkedin: data.site_linkedin || "",
        metaTitle: data.site_meta_title || "",
        metaDescription: data.site_meta_description || "",
        canonicalUrl: data.site_canonical_url || "",
        keywords: data.seo_keywords || "",
        ogImage: data.seo_og_image || "",
        ogLocale: data.seo_og_locale || "pt_BR",
        twitterCard: data.seo_twitter_card || "summary_large_image",
        twitterHandle: data.seo_twitter_handle || "",
        schemaEnabled: data.seo_schema_enabled ?? "true",
        schemaType: data.seo_schema_type || "LocalBusiness",
        schemaLat: data.seo_schema_lat || "",
        schemaLng: data.seo_schema_lng || "",
        schemaZip: data.seo_schema_zip || "",
        schemaOpeningHours: data.seo_schema_opening_hours || "",
        schemaPriceRange: data.seo_schema_price_range || "",
        googleVerification: data.seo_google_verification || "",
        bingVerification: data.seo_bing_verification || "",
        robotsIndex: data.seo_robots_index ?? "true",
        robotsFollow: data.seo_robots_follow ?? "true",
        sitemapEnabled: data.seo_sitemap_enabled ?? "true",
        aiAllowed: data.seo_ai_allowed ?? "true",
        aiSummary: data.seo_ai_summary || "",
      });
      setHeaderLogo(data.site_header_logo || null);
      setFooterLogo(data.site_footer_logo || null);
      setFooterForm((prev) => ({
        ...prev,
        description: data.footer_description || prev.description,
        phone: data.footer_phone || prev.phone,
        email: data.footer_email || prev.email,
        address: data.footer_address || prev.address,
        instagram: data.footer_instagram || prev.instagram,
        facebook: data.footer_facebook || prev.facebook,
        linkedin: data.footer_linkedin || prev.linkedin,
        copyright: data.footer_copyright || prev.copyright,
        cnpj: data.footer_cnpj || prev.cnpj,
        developedBy: data.footer_developed_by || prev.developedBy,
        navTitle: data.footer_nav_title || prev.navTitle,
        servicesTitle: data.footer_services_title || prev.servicesTitle,
      }));
      if (data.footer_nav_items) {
        try { setFooterNavItems(JSON.parse(data.footer_nav_items)); } catch { /* keep defaults */ }
      }
      if (data.footer_service_items) {
        try { setFooterServiceItems(JSON.parse(data.footer_service_items)); } catch { /* keep defaults */ }
      }
      if (data.site_heading_font) setHeadingFont(data.site_heading_font);
      if (data.site_body_font) setBodyFont(data.site_body_font);
      if (data.site_smtp_host) setSmtp((prev) => ({
        ...prev,
        host: data.site_smtp_host || "",
        port: data.site_smtp_port || "587",
        encryption: data.site_smtp_encryption || "tls",
        username: data.site_smtp_username || "",
        password: data.site_smtp_password || "",
        fromName: data.site_smtp_from_name || "",
        fromEmail: data.site_smtp_from_email || "",
        replyTo: data.site_smtp_reply_to || "",
      }));
      setSobreForm((prev) => ({
        heroBadge: data.sobre_hero_badge || prev.heroBadge,
        heroTitle: data.sobre_hero_title || prev.heroTitle,
        heroSubtitle: data.sobre_hero_subtitle || prev.heroSubtitle,
        heroImage: data.sobre_hero_image || prev.heroImage,
        storyBadge: data.sobre_story_badge || prev.storyBadge,
        storyTitle: data.sobre_story_title || prev.storyTitle,
        storyP1: data.sobre_story_p1 || prev.storyP1,
        storyP2: data.sobre_story_p2 || prev.storyP2,
        storyP3: data.sobre_story_p3 || prev.storyP3,
        storyImage: data.sobre_story_image || prev.storyImage,
        valuesBadge: data.sobre_values_badge || prev.valuesBadge,
        valuesTitle: data.sobre_values_title || prev.valuesTitle,
      }));
      if (data.sobre_values_items) {
        try { setSobreValues(JSON.parse(data.sobre_values_items)); } catch { /* keep defaults */ }
      }
      if (data.sobre_stats_items) {
        try { setSobreStats(JSON.parse(data.sobre_stats_items)); } catch { /* keep defaults */ }
      }
      setContatoForm((prev) => ({
        heroBadge: data.contato_hero_badge || prev.heroBadge,
        heroTitle: data.contato_hero_title || prev.heroTitle,
        heroSubtitle: data.contato_hero_subtitle || prev.heroSubtitle,
        infoTitle: data.contato_info_title || prev.infoTitle,
        phone: data.contato_phone || prev.phone,
        email: data.contato_email || prev.email,
        address: data.contato_address || prev.address,
        cep: data.contato_cep || prev.cep,
        hours: data.contato_hours || prev.hours,
        whatsappLink: data.contato_whatsapp_link || prev.whatsappLink,
        whatsappText: data.contato_whatsapp_text || prev.whatsappText,
        formTitle: data.contato_form_title || prev.formTitle,
        mapTitle: data.contato_map_title || prev.mapTitle,
        mapSubtitle: data.contato_map_subtitle || prev.mapSubtitle,
        mapAddress: data.contato_map_address || prev.mapAddress,
        mapLabel: data.contato_map_label || prev.mapLabel,
      }));
      if (data.contato_form_services) {
        try { setContatoServices(JSON.parse(data.contato_form_services)); } catch { /* keep defaults */ }
      }
      setCarrosselForm((prev) => ({
        title: data.carousel_title || prev.title,
        titleAccent: data.carousel_title_accent || prev.titleAccent,
        description: data.carousel_description || prev.description,
        btnText: data.carousel_btn_text || prev.btnText,
        btnLink: data.carousel_btn_link || prev.btnLink,
        speed: parseFloat(data.carousel_speed) || prev.speed,
      }));
      if (data.carousel_items) {
        try { setCarrosselItems(JSON.parse(data.carousel_items)); } catch { /* keep defaults */ }
      }
      setClientesForm((prev) => ({
        title: data.clients_title || prev.title,
        subtitle: data.clients_subtitle || prev.subtitle,
        speed: parseFloat(data.clients_speed) || prev.speed,
      }));
      if (data.clients_logos) {
        try { setClientesLogos(JSON.parse(data.clients_logos)); } catch { /* keep defaults */ }
      }
      setAnimacaoForm({
        enabled: data.animation_reveal_enabled !== "false",
        repeat: data.animation_repeat === "true",
        blurPx: parseFloat(data.animation_blur_px) || 12,
        translateY: parseFloat(data.animation_reveal_y) || 30,
        duration: parseFloat(data.animation_reveal_duration) || 0.7,
      });
      setSettingsLoaded(true);
    } catch {
      toast.error("Erro ao carregar configurações");
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async (settings: Record<string, string>, label: string) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success(`${label} salvas com sucesso!`);
    } catch {
      toast.error(`Erro ao salvar ${label.toLowerCase()}`);
    }
  };

  const [primaryColors, setPrimaryColors] = useState<ColorConfig[]>([
    { label: "Fundo Principal", key: "background", value: "#0a1929" },
    { label: "Texto Principal", key: "foreground", value: "#e2e8f0" },
    { label: "Primária", key: "primary", value: "#2563eb" },
    { label: "Secundária", key: "secondary", value: "#1e3a5f" },
  ]);

  const [accentColors, setAccentColors] = useState<ColorConfig[]>([
    { label: "Destaque (Accent)", key: "accent", value: "#3b82f6" },
    { label: "Sucesso", key: "success", value: "#10b981" },
    { label: "Alerta", key: "warning", value: "#f59e0b" },
    { label: "Perigo", key: "danger", value: "#ef4444" },
  ]);

  const [buttonColors, setButtonColors] = useState<ColorConfig[]>([
    { label: "Botão Primário — Fundo", key: "btnPrimaryBg", value: "#3b82f6" },
    { label: "Botão Primário — Texto", key: "btnPrimaryText", value: "#ffffff" },
    { label: "Botão Secundário — Fundo", key: "btnSecondaryBg", value: "#1e3a5f" },
    { label: "Botão Secundário — Texto", key: "btnSecondaryText", value: "#e2e8f0" },
    { label: "Botão CTA — Fundo", key: "btnCtaBg", value: "#3b82f6" },
    { label: "Botão CTA — Texto", key: "btnCtaText", value: "#ffffff" },
  ]);

  const [customColors, setCustomColors] = useState<ColorConfig[]>([]);
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newCustomColor, setNewCustomColor] = useState("#3b82f6");

  const [headerLogo, setHeaderLogo] = useState<string | null>(null);
  const [footerLogo, setFooterLogo] = useState<string | null>(null);
  const headerLogoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);

  const [headingFont, setHeadingFont] = useState("Space Grotesk");
  const [bodyFont, setBodyFont] = useState("Plus Jakarta Sans");
  const [fontSearch, setFontSearch] = useState("");
  const [fontTarget, setFontTarget] = useState<"heading" | "body">("heading");

  const [smtp, setSmtp] = useState({
    host: "", port: "587", encryption: "tls", username: "", password: "",
    fromName: "TOIL Projetos", fromEmail: "contato@toilprojetos.com.br", replyTo: "",
  });
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = useState("");

  const [sobreForm, setSobreForm] = useState({
    heroBadge: "Sobre nós",
    heroTitle: "Quem é a Toil Projetos",
    heroSubtitle: "Somos especialistas em transformar conceitos em realidade, com soluções sob medida em acrílico, marcenaria e comunicação visual.",
    heroImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1920&h=600&fit=crop",
    storyBadge: "Nossa História",
    storyTitle: "Mais de uma década de excelência",
    storyP1: "Fundada em 2010, a Toil Projetos nasceu da paixão por criar soluções visuais e estruturais que transformam espaços e elevam marcas.",
    storyP2: "Com uma equipe multidisciplinar de designers, engenheiros e marceneiros, atendemos clientes de diversos segmentos, sempre com foco em qualidade, inovação e prazos.",
    storyP3: "Nossa fábrica em São Paulo conta com tecnologia de ponta para corte a laser, CNC e acabamento premium, garantindo a excelência em cada projeto.",
    storyImage: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=700&h=500&fit=crop",
    valuesBadge: "Valores",
    valuesTitle: "O que nos move",
  });
  const updateSobre = (key: string, value: string) => setSobreForm((prev) => ({ ...prev, [key]: value }));

  const [sobreValues, setSobreValues] = useState([
    { icon: "Target", title: "Precisão", desc: "Cada detalhe é planejado e executado com máxima precisão." },
    { icon: "Eye", title: "Visão", desc: "Antecipamos tendências e inovamos continuamente." },
    { icon: "Award", title: "Excelência", desc: "Comprometidos com os mais altos padrões de qualidade." },
    { icon: "Users", title: "Parceria", desc: "Construímos relações de longo prazo com nossos clientes." },
  ]);

  const [sobreStats, setSobreStats] = useState([
    { num: "500+", label: "Projetos Realizados" },
    { num: "14+", label: "Anos de Experiência" },
    { num: "200+", label: "Clientes Atendidos" },
    { num: "98%", label: "Satisfação" },
  ]);

  const sobreHeroImageRef = useRef<HTMLInputElement>(null);
  const sobreStoryImageRef = useRef<HTMLInputElement>(null);

  // --- Carrossel Home ---
  const [carrosselForm, setCarrosselForm] = useState({
    title: "Nossos projetos",
    titleAccent: "falam por si.",
    description: "Veja alguns dos trabalhos entregues pela nossa equipe. Cada projeto é feito sob medida para destacar a sua marca.",
    btnText: "Ver Portfólio",
    btnLink: "/portfolio",
    speed: 30,
  });
  const updateCarrossel = (key: string, value: string) => setCarrosselForm((prev) => ({ ...prev, [key]: value }));
  const [carrosselItems, setCarrosselItems] = useState<{ image: string; caption?: string }[]>([]);
  const [carrosselUploading, setCarrosselUploading] = useState(false);
  const carrosselInputRef = useRef<HTMLInputElement>(null);

  // --- Clientes ---
  const [clientesForm, setClientesForm] = useState({
    title: "Clientes que confiam",
    subtitle: "Empresas que já transformaram seus espaços com a Toil Projetos",
    speed: 40,
  });
  const updateClientes = (key: string, value: string) => setClientesForm((prev) => ({ ...prev, [key]: value }));
  const [clientesLogos, setClientesLogos] = useState<string[]>([]);
  const [clientesUploading, setClientesUploading] = useState(false);
  const clientesInputRef = useRef<HTMLInputElement>(null);

  // --- Animações ---
  const [animacaoForm, setAnimacaoForm] = useState({
    enabled: true,
    repeat: false,
    blurPx: 12,
    translateY: 30,
    duration: 0.7,
  });

  const [contatoForm, setContatoForm] = useState({
    heroBadge: "Contato",
    heroTitle: "Fale conosco",
    heroSubtitle: "Solicite um orçamento ou tire suas dúvidas. Estamos prontos para atender você.",
    infoTitle: "Informações de Contato",
    phone: "(11) 98998-0791",
    email: "contato@toilprojetos.com.br",
    address: "Rua Fernão Marques, 420 – São Paulo, SP",
    cep: "08220-390",
    hours: "Seg-Sex: 8h às 18h",
    whatsappLink: "https://wa.me/5511989980791?text=Olá! Gostaria de solicitar um orçamento.",
    whatsappText: "Falar pelo WhatsApp",
    formTitle: "Solicitar Orçamento",
    mapTitle: "Nossa Localização",
    mapSubtitle: "Visite nosso showroom e conheça nossos projetos de perto",
    mapAddress: "Rua Fernão Marques, 420 – São Paulo, SP",
    mapLabel: "TOIL Projetos",
  });
  const updateContato = (key: string, value: string) => setContatoForm((prev) => ({ ...prev, [key]: value }));

  const [contatoServices, setContatoServices] = useState([
    "Peças em Acrílico",
    "Comunicação Visual",
    "Montagem de Lojas",
    "Marcenaria Sob Medida",
    "Displays e Totens",
    "Projetos Especiais",
  ]);

  const filteredFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });
  const updateSmtp = (key: string, value: string) => setSmtp({ ...smtp, [key]: value });

  const updateColor = (
    list: ColorConfig[],
    setter: React.Dispatch<React.SetStateAction<ColorConfig[]>>,
    key: string,
    value: string
  ) => {
    setter(list.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const addCustomColor = () => {
    if (!newCustomLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    setCustomColors([...customColors, { label: newCustomLabel, key, value: newCustomColor }]);
    setNewCustomLabel("");
    setNewCustomColor("#3b82f6");
  };

  const removeCustomColor = (key: string) => {
    setCustomColors(customColors.filter((c) => c.key !== key));
  };

  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=settings", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setter(data.url);
      toast.success("Logo enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=settings", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      onSuccess(d.url);
      toast.success("Imagem enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCarrosselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCarrosselUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=carousel", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCarrosselItems((prev) => [...prev, { image: data.url, caption: "" }]);
      toast.success("Imagem adicionada ao carrossel!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setCarrosselUploading(false);
      if (carrosselInputRef.current) carrosselInputRef.current.value = "";
    }
  };

  const handleClientesLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClientesUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=clients", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClientesLogos((prev) => [...prev, data.url]);
      toast.success("Logo adicionado!");
    } catch {
      toast.error("Erro ao enviar logo");
    } finally {
      setClientesUploading(false);
      if (clientesInputRef.current) clientesInputRef.current.value = "";
    }
  };

  const testSmtp = async () => {
    if (!smtp.host || !smtp.username || !smtp.password) {
      toast.error("Preencha host, usuário e senha antes de testar.");
      return;
    }

    if (!smtpTestEmail || !smtpTestEmail.includes("@")) {
      toast.error("Digite um e-mail válido para receber o teste.");
      return;
    }
    
    // Primeiro salvar as configurações
    setSmtpTesting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          site_smtp_host: smtp.host,
          site_smtp_port: smtp.port,
          site_smtp_encryption: smtp.encryption,
          site_smtp_username: smtp.username,
          site_smtp_password: smtp.password,
          site_smtp_from_name: smtp.fromName,
          site_smtp_from_email: smtp.fromEmail,
          site_smtp_reply_to: smtp.replyTo,
        }),
      });
      
      if (!res.ok) throw new Error("Erro ao salvar configurações");
      
      // Agora enviar e-mail de teste
      const testRes = await fetch("/api/smtp/test", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ email: smtpTestEmail }),
      });
      
      const testData = await testRes.json();
      
      if (testRes.ok) {
        toast.success(`E-mail de teste enviado para ${smtpTestEmail}!`);
      } else {
        toast.error(testData.error || "Erro ao enviar e-mail de teste");
      }
    } catch (error) {
      toast.error("Erro ao testar SMTP");
    } finally {
      setSmtpTesting(false);
    }
  };

  const ColorPicker = ({ item, onChange, onRemove }: { item: ColorConfig; onChange: (value: string) => void; onRemove?: () => void }) => (
    <div className="flex items-center gap-3 group">
      <input
        type="color"
        value={item.value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-input cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.label}</p>
        <p className="text-xs text-muted-foreground font-mono uppercase">{item.value}</p>
      </div>
      {onRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive">
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );

  const ColorSection = ({ title, colors, setter }: { title: string; colors: ColorConfig[]; setter: React.Dispatch<React.SetStateAction<ColorConfig[]>> }) => (
    <Card>
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colors.map((c) => (
            <ColorPicker key={c.key} item={c} onChange={(v) => updateColor(colors, setter, c.key, v)} />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // --- Current section label ---
  const currentItem = navSections.flatMap((s) => s.items).find((i) => i.id === activeSection);
  const CurrentIcon = currentItem?.icon || Settings;

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie todas as configurações do site em um só lugar" />

      <div className="flex gap-6 mt-2">
        {/* Left sidebar navigation */}
        <nav className="w-[220px] shrink-0 space-y-6">
          {filteredNavSections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-bold text-muted-foreground tracking-wider mb-2 px-3">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-card"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{currentItem?.label}</h2>
              <p className="text-sm text-muted-foreground">
                {activeSection === "geral" && "Informações básicas do site, contato e redes sociais"}
                {activeSection === "seo" && "Meta tags e otimização para motores de busca"}
                {activeSection === "banner" && "Gerencie os slides do hero da página inicial"}
                {activeSection === "footer" && "Textos, links, contato e redes sociais do rodapé"}
                {activeSection === "cores" && "Cores do tema, botões e personalizações visuais"}
                {activeSection === "logos" && "Logomarcas do header e footer"}
                {activeSection === "fontes" && "Fontes de títulos e corpo do texto"}
                {activeSection === "smtp" && "Configuração de envio de e-mails"}
                {activeSection === "carrossel" && "Texto do lado esquerdo e imagens do carrossel na página inicial"}
                {activeSection === "clientes" && "Carrossel horizontal de logos de clientes na página inicial"}
                {activeSection === "sobre" && "Conteúdo da página Sobre: hero, história, valores e estatísticas"}
                {activeSection === "contato" && "Textos, informações de contato, WhatsApp e serviços do formulário"}
                {activeSection === "animacoes" && "Efeito de revelação com blur ao rolar a página"}
              </p>
            </div>
          </div>

          {/* GERAL */}
          {activeSection === "geral" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Informações da Empresa</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Telefone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
                    <div className="space-y-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Endereço</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
                    <div className="space-y-2"><Label>CNPJ</Label><Input value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} /></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Redes Sociais</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Facebook</Label><Input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} /></div>
                    <div className="space-y-2"><Label>LinkedIn</Label><Input value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} /></div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  site_name: form.companyName,
                  site_phone: form.phone,
                  site_email: form.email,
                  site_address: form.address,
                  site_cnpj: form.cnpj,
                  site_instagram: form.instagram,
                  site_facebook: form.facebook,
                  site_linkedin: form.linkedin,
                }, "Configurações gerais")}>Salvar Configurações Gerais</Button>
              </div>
            </div>
          )}

          {/* SEO */}
          {activeSection === "seo" && (
            <div className="space-y-6">

              {/* Meta Tags Básicas */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Meta Tags Básicas</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta Título <span className="text-muted-foreground text-xs">(ideal: 50–60 caracteres)</span></Label>
                    <Input value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} placeholder="Toil Projetos - Soluções em Acrílico, Marcenaria e Comunicação Visual" />
                    <p className="text-xs text-muted-foreground">{form.metaTitle.length} caracteres</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Descrição <span className="text-muted-foreground text-xs">(ideal: 150–160 caracteres)</span></Label>
                    <Textarea rows={3} value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} placeholder="Empresa especializada em soluções sob medida em acrílico, marcenaria e comunicação visual em São Paulo." />
                    <p className="text-xs text-muted-foreground">{form.metaDescription.length} caracteres</p>
                  </div>
                  <div className="space-y-2">
                    <Label>URL Canônica do Site</Label>
                    <Input value={form.canonicalUrl} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder="https://toilprojetos.com.br" />
                    <p className="text-xs text-muted-foreground">URL principal sem barra final. Usada no sitemap e robots.txt.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Palavras-chave <span className="text-muted-foreground text-xs">(separadas por vírgula)</span></Label>
                    <Input value={form.keywords} onChange={(e) => update("keywords", e.target.value)} placeholder="acrílico, marcenaria, comunicação visual, São Paulo" />
                  </div>
                </CardContent>
              </Card>

              {/* Open Graph / Redes Sociais */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Open Graph — Compartilhamento em Redes Sociais</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagem OG (1200×630px recomendado)</Label>
                    <Input value={form.ogImage} onChange={(e) => update("ogImage", e.target.value)} placeholder="https://toilprojetos.com.br/og-image.jpg" />
                    <p className="text-xs text-muted-foreground">Imagem exibida ao compartilhar no WhatsApp, Facebook, LinkedIn etc.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Locale OG</Label>
                      <Select value={form.ogLocale} onValueChange={(v) => update("ogLocale", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt_BR">pt_BR (Português Brasil)</SelectItem>
                          <SelectItem value="en_US">en_US (English US)</SelectItem>
                          <SelectItem value="es_ES">es_ES (Español)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter/X Card</Label>
                      <Select value={form.twitterCard} onValueChange={(v) => update("twitterCard", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary_large_image">summary_large_image (recomendado)</SelectItem>
                          <SelectItem value="summary">summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Handle Twitter/X <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input value={form.twitterHandle} onChange={(e) => update("twitterHandle", e.target.value)} placeholder="@toilprojetos" />
                  </div>
                </CardContent>
              </Card>

              {/* Schema.org LocalBusiness */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Schema.org — Dados Estruturados (JSON-LD)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">Informações lidas pelo Google, Bing e IAs para exibir rich results (endereço, horário, telefone em destaque).</p>
                  <div className="flex items-center gap-3">
                    <Label>Ativar Schema.org</Label>
                    <Select value={form.schemaEnabled} onValueChange={(v) => update("schemaEnabled", v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativado</SelectItem>
                        <SelectItem value="false">Desativado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de negócio</Label>
                      <Select value={form.schemaType} onValueChange={(v) => update("schemaType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                          <SelectItem value="Store">Store (Loja)</SelectItem>
                          <SelectItem value="HomeAndConstructionBusiness">HomeAndConstruction</SelectItem>
                          <SelectItem value="ProfessionalService">ProfessionalService</SelectItem>
                          <SelectItem value="GeneralContractor">GeneralContractor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input value={form.schemaZip} onChange={(e) => update("schemaZip", e.target.value)} placeholder="08220-390" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input value={form.schemaLat} onChange={(e) => update("schemaLat", e.target.value)} placeholder="-23.5505" />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input value={form.schemaLng} onChange={(e) => update("schemaLng", e.target.value)} placeholder="-46.6333" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Horário de Funcionamento <span className="text-muted-foreground text-xs">(separado por vírgula)</span></Label>
                    <Input value={form.schemaOpeningHours} onChange={(e) => update("schemaOpeningHours", e.target.value)} placeholder="Mo-Fr 08:00-18:00, Sa 08:00-12:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Faixa de Preço</Label>
                    <Select value={form.schemaPriceRange} onValueChange={(v) => update("schemaPriceRange", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ (Econômico)</SelectItem>
                        <SelectItem value="$$">$$ (Moderado)</SelectItem>
                        <SelectItem value="$$$">$$$ (Premium)</SelectItem>
                        <SelectItem value="$$$$">$$$$ (Luxo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Verificação de Buscadores */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Verificação de Buscadores</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Google Search Console — código de verificação</Label>
                    <Input value={form.googleVerification} onChange={(e) => update("googleVerification", e.target.value)} placeholder="google-site-verification: xxxxxxxxxxxxx" />
                    <p className="text-xs text-muted-foreground">Cole o conteúdo da meta tag fornecida pelo Google Search Console.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Bing Webmaster Tools — código de verificação</Label>
                    <Input value={form.bingVerification} onChange={(e) => update("bingVerification", e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                    <p className="text-xs text-muted-foreground">Cole o código da meta tag msvalidate.01 fornecida pelo Bing.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Robots & Sitemap */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Robots & Sitemap</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Indexação</Label>
                      <Select value={form.robotsIndex} onValueChange={(v) => update("robotsIndex", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">index (visível)</SelectItem>
                          <SelectItem value="false">noindex (oculto)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rastreamento de links</Label>
                      <Select value={form.robotsFollow} onValueChange={(v) => update("robotsFollow", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">follow</SelectItem>
                          <SelectItem value="false">nofollow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sitemap XML</Label>
                      <Select value={form.sitemapEnabled} onValueChange={(v) => update("sitemapEnabled", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ativado</SelectItem>
                          <SelectItem value="false">Desativado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {form.canonicalUrl && (
                    <div className="flex gap-3 flex-wrap text-xs">
                      <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver sitemap.xml ↗</a>
                      <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver robots.txt ↗</a>
                      <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-primary underline">Ver llms.txt ↗</a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* IA Search Engines */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Motores de Busca de IA (ChatGPT, Perplexity, Gemini…)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    IAs como ChatGPT Search, Perplexity, Google Gemini e Copilot rastreiam sites para responder perguntas dos usuários.
                    O arquivo <strong>llms.txt</strong> é um padrão emergente que instrui essas IAs sobre o seu negócio.
                  </p>
                  <div className="space-y-2">
                    <Label>Permitir rastreamento por IAs</Label>
                    <Select value={form.aiAllowed} onValueChange={(v) => update("aiAllowed", v)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Permitido</SelectItem>
                        <SelectItem value="false">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resumo para IAs <span className="text-muted-foreground text-xs">(aparece no llms.txt)</span></Label>
                    <Textarea rows={3} value={form.aiSummary} onChange={(e) => update("aiSummary", e.target.value)} placeholder="Toil Projetos é uma empresa especializada em fabricação e instalação de peças em acrílico, marcenaria sob medida e comunicação visual para o varejo e empresas em São Paulo." />
                    <p className="text-xs text-muted-foreground">{form.aiSummary.length} caracteres — seja claro e objetivo, as IAs usam esse texto para responder perguntas sobre sua empresa.</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  site_meta_title: form.metaTitle,
                  site_meta_description: form.metaDescription,
                  site_canonical_url: form.canonicalUrl,
                  seo_keywords: form.keywords,
                  seo_og_image: form.ogImage,
                  seo_og_locale: form.ogLocale,
                  seo_twitter_card: form.twitterCard,
                  seo_twitter_handle: form.twitterHandle,
                  seo_schema_enabled: form.schemaEnabled,
                  seo_schema_type: form.schemaType,
                  seo_schema_lat: form.schemaLat,
                  seo_schema_lng: form.schemaLng,
                  seo_schema_zip: form.schemaZip,
                  seo_schema_opening_hours: form.schemaOpeningHours,
                  seo_schema_price_range: form.schemaPriceRange,
                  seo_google_verification: form.googleVerification,
                  seo_bing_verification: form.bingVerification,
                  seo_robots_index: form.robotsIndex,
                  seo_robots_follow: form.robotsFollow,
                  seo_sitemap_enabled: form.sitemapEnabled,
                  seo_ai_allowed: form.aiAllowed,
                  seo_ai_summary: form.aiSummary,
                }, "SEO")}>Salvar SEO</Button>
              </div>
            </div>
          )}

          {/* BANNER */}
          {activeSection === "banner" && <AdminBanner />}

          {/* CARROSSEL HOME */}
          {activeSection === "carrossel" && (
            <div className="space-y-6">
              {/* Texto do lado esquerdo */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Texto (lado esquerdo)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título Principal</Label>
                      <Input value={carrosselForm.title} onChange={(e) => updateCarrossel("title", e.target.value)} placeholder="Nossos projetos" />
                      <p className="text-xs text-muted-foreground">Primeira parte do título (cor branca)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Destaque do Título</Label>
                      <Input value={carrosselForm.titleAccent} onChange={(e) => updateCarrossel("titleAccent", e.target.value)} placeholder="falam por si." />
                      <p className="text-xs text-muted-foreground">Segunda parte do título (cor accent)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea rows={3} value={carrosselForm.description} onChange={(e) => updateCarrossel("description", e.target.value)} placeholder="Texto descritivo abaixo do título..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Texto do Botão</Label>
                      <Input value={carrosselForm.btnText} onChange={(e) => updateCarrossel("btnText", e.target.value)} placeholder="Ver Portfólio" />
                    </div>
                    <div className="space-y-2">
                      <Label>Link do Botão</Label>
                      <Input value={carrosselForm.btnLink} onChange={(e) => updateCarrossel("btnLink", e.target.value)} placeholder="/portfolio" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Velocidade do carrossel</Label>
                      <span className="text-sm font-mono text-muted-foreground">{carrosselForm.speed}s</span>
                    </div>
                    <input
                      type="range" min={8} max={80} step={2}
                      value={carrosselForm.speed}
                      onChange={(e) => setCarrosselForm((prev) => ({ ...prev, speed: Number(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mais rápido (8s)</span><span>Mais lento (80s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imagens do carrossel */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Imagens do Carrossel</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">As imagens serão exibidas em proporção retrato (3:4). Recomendado: 400×600px ou maior.</p>
                    </div>
                    <div className="flex gap-2">
                      <input ref={carrosselInputRef} type="file" accept="image/*" className="hidden" onChange={handleCarrosselImageUpload} />
                      <Button size="sm" onClick={() => carrosselInputRef.current?.click()} disabled={carrosselUploading}>
                        {carrosselUploading ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Enviando...</> : <><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Imagem</>}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {carrosselItems.length === 0 ? (
                    <div
                      onClick={() => carrosselInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-pointer"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">Clique para adicionar a primeira imagem</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {carrosselItems.map((item, i) => (
                        <div key={i} className="group relative rounded-xl overflow-hidden border border-border bg-background" style={{ aspectRatio: "3/4" }}>
                          <img src={item.image} alt={`Carrossel ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1">
                            <Input
                              value={item.caption || ""}
                              onChange={(e) => {
                                const n = [...carrosselItems];
                                n[i] = { ...n[i], caption: e.target.value };
                                setCarrosselItems(n);
                              }}
                              placeholder="Legenda (opcional)"
                              className="h-7 text-xs bg-black/50 border-white/20 text-white placeholder:text-white/50"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs w-full"
                              onClick={() => setCarrosselItems(carrosselItems.filter((_, j) => j !== i))}
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Remover
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{i + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  carousel_title: carrosselForm.title,
                  carousel_title_accent: carrosselForm.titleAccent,
                  carousel_description: carrosselForm.description,
                  carousel_btn_text: carrosselForm.btnText,
                  carousel_btn_link: carrosselForm.btnLink,
                  carousel_speed: String(carrosselForm.speed),
                  carousel_items: JSON.stringify(carrosselItems),
                }, "Carrossel Home")}>Salvar Carrossel</Button>
              </div>
            </div>
          )}

          {/* CLIENTES */}
          {activeSection === "clientes" && (
            <div className="space-y-6">
              {/* Textos */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Textos da Seção</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={clientesForm.title} onChange={(e) => updateClientes("title", e.target.value)} placeholder="Clientes que confiam" />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input value={clientesForm.subtitle} onChange={(e) => updateClientes("subtitle", e.target.value)} placeholder="Empresas que já transformaram seus espaços..." />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Velocidade do carrossel</Label>
                      <span className="text-sm font-mono text-muted-foreground">{clientesForm.speed}s</span>
                    </div>
                    <input
                      type="range" min={10} max={100} step={5}
                      value={clientesForm.speed}
                      onChange={(e) => setClientesForm((prev) => ({ ...prev, speed: Number(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mais rápido (10s)</span><span>Mais lento (100s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logos dos clientes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Logos dos Clientes</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Logos serão exibidos em escala de cinza com hover colorido. Recomendado: PNG com fundo transparente.</p>
                    </div>
                    <div className="flex gap-2">
                      <input ref={clientesInputRef} type="file" accept="image/*" className="hidden" onChange={handleClientesLogoUpload} />
                      <Button size="sm" onClick={() => clientesInputRef.current?.click()} disabled={clientesUploading}>
                        {clientesUploading ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Enviando...</> : <><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Logo</>}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {clientesLogos.length === 0 ? (
                    <div
                      onClick={() => clientesInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-pointer"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">Clique para adicionar o primeiro logo</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {clientesLogos.map((logo, i) => (
                        <div key={i} className="group relative rounded-xl overflow-hidden border border-border bg-background p-4 aspect-square flex items-center justify-center">
                          <img src={logo} alt={`Cliente ${i + 1}`} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setClientesLogos(clientesLogos.filter((_, j) => j !== i))}
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Remover
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{i + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  clients_title: clientesForm.title,
                  clients_subtitle: clientesForm.subtitle,
                  clients_speed: String(clientesForm.speed),
                  clients_logos: JSON.stringify(clientesLogos),
                }, "Clientes")}>Salvar Clientes</Button>
              </div>
            </div>
          )}

          {/* FOOTER */}
          {activeSection === "footer" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Descrição & Marca</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Descrição do Footer</Label>
                      <Textarea rows={3} value={footerForm.description} onChange={(e) => updateFooter("description", e.target.value)} placeholder="Texto que aparece abaixo da logo no footer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Copyright</Label>
                      <Input value={footerForm.copyright} onChange={(e) => updateFooter("copyright", e.target.value)} placeholder="© 2026 Empresa..." />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ</Label>
                      <Input value={footerForm.cnpj} onChange={(e) => updateFooter("cnpj", e.target.value)} placeholder="XX.XXX.XXX/0001-XX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Créditos (Desenvolvido por)</Label>
                      <Input value={footerForm.developedBy} onChange={(e) => updateFooter("developedBy", e.target.value)} placeholder="Desenvolvido com excelência" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm">Canais de Comunicação</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={footerForm.phone} onChange={(e) => updateFooter("phone", e.target.value)} placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input value={footerForm.email} onChange={(e) => updateFooter("email", e.target.value)} placeholder="contato@empresa.com.br" />
                    </div>
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Textarea rows={2} value={footerForm.address} onChange={(e) => updateFooter("address", e.target.value)} placeholder="Rua, número – Cidade, UF – CEP" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Redes Sociais</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Instagram (URL completa)</Label>
                      <Input value={footerForm.instagram} onChange={(e) => updateFooter("instagram", e.target.value)} placeholder="https://instagram.com/empresa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Facebook (URL completa)</Label>
                      <Input value={footerForm.facebook} onChange={(e) => updateFooter("facebook", e.target.value)} placeholder="https://facebook.com/empresa" />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn (URL completa)</Label>
                      <Input value={footerForm.linkedin} onChange={(e) => updateFooter("linkedin", e.target.value)} placeholder="https://linkedin.com/company/empresa" />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-3">
                          <Label className="text-xs text-muted-foreground">Título da Coluna</Label>
                          <Input value={footerForm.navTitle} onChange={(e) => updateFooter("navTitle", e.target.value)} className="mt-1 text-sm font-semibold" />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setFooterNavItems([...footerNavItems, { label: "Novo Link", link: "/" }])}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {footerNavItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background">
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 space-y-1">
                            <Input value={item.label} onChange={(e) => { const n = [...footerNavItems]; n[i] = { ...n[i], label: e.target.value }; setFooterNavItems(n); }} placeholder="Nome" className="h-8 text-sm" />
                            <div className="flex items-center gap-1.5">
                              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <Input value={item.link} onChange={(e) => { const n = [...footerNavItems]; n[i] = { ...n[i], link: e.target.value }; setFooterNavItems(n); }} placeholder="/pagina" className="h-7 text-xs" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setFooterNavItems(footerNavItems.filter((_, j) => j !== i))}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      {footerNavItems.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum link adicionado</p>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-3">
                          <Label className="text-xs text-muted-foreground">Título da Coluna</Label>
                          <Input value={footerForm.servicesTitle} onChange={(e) => updateFooter("servicesTitle", e.target.value)} className="mt-1 text-sm font-semibold" />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setFooterServiceItems([...footerServiceItems, { label: "Novo Serviço", link: "" }])}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {footerServiceItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background">
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 space-y-1">
                            <Input value={item.label} onChange={(e) => { const n = [...footerServiceItems]; n[i] = { ...n[i], label: e.target.value }; setFooterServiceItems(n); }} placeholder="Nome" className="h-8 text-sm" />
                            <div className="flex items-center gap-1.5">
                              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <Input value={item.link} onChange={(e) => { const n = [...footerServiceItems]; n[i] = { ...n[i], link: e.target.value }; setFooterServiceItems(n); }} placeholder="/servicos (opcional)" className="h-7 text-xs" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setFooterServiceItems(footerServiceItems.filter((_, j) => j !== i))}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      {footerServiceItems.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum serviço adicionado</p>}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  footer_description: footerForm.description,
                  footer_phone: footerForm.phone,
                  footer_email: footerForm.email,
                  footer_address: footerForm.address,
                  footer_instagram: footerForm.instagram,
                  footer_facebook: footerForm.facebook,
                  footer_linkedin: footerForm.linkedin,
                  footer_nav_title: footerForm.navTitle,
                  footer_services_title: footerForm.servicesTitle,
                  footer_nav_items: JSON.stringify(footerNavItems),
                  footer_service_items: JSON.stringify(footerServiceItems),
                  footer_copyright: footerForm.copyright,
                  footer_cnpj: footerForm.cnpj,
                  footer_developed_by: footerForm.developedBy,
                }, "Footer")}>Salvar Footer</Button>
              </div>
            </div>
          )}

          {/* CORES */}
          {activeSection === "cores" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ColorSection title="Cores Primárias" colors={primaryColors} setter={setPrimaryColors} />
                <ColorSection title="Cores de Status" colors={accentColors} setter={setAccentColors} />
              </div>
              <ColorSection title="Cores dos Botões" colors={buttonColors} setter={setButtonColors} />
              <Card>
                <CardHeader><CardTitle className="text-sm">Pré-visualização dos Botões</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { label: "Botão Primário", bg: buttonColors[0].value, text: buttonColors[1].value },
                      { label: "Botão Secundário", bg: buttonColors[2].value, text: buttonColors[3].value },
                      { label: "Botão CTA", bg: buttonColors[4].value, text: buttonColors[5].value },
                    ].map((btn) => (
                      <Button key={btn.label} style={{ backgroundColor: btn.bg, color: btn.text }} className="hover:opacity-90">{btn.label}</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Cores Customizadas</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {customColors.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {customColors.map((c) => (
                        <ColorPicker key={c.key} item={c} onChange={(v) => updateColor(customColors, setCustomColors, c.key, v)} onRemove={() => removeCustomColor(c.key)} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>Nome da Cor</Label>
                      <Input value={newCustomLabel} onChange={(e) => setNewCustomLabel(e.target.value)} placeholder="Ex: Azul Header" />
                    </div>
                    <input type="color" value={newCustomColor} onChange={(e) => setNewCustomColor(e.target.value)} className="w-10 h-10 rounded-lg border border-input cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none" />
                    <Button onClick={addCustomColor}>Adicionar</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Cores salvas!")}>Salvar Cores</Button>
              </div>
            </div>
          )}

          {/* LOGOS */}
          {activeSection === "logos" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { title: "Logo do Header (Navegação)", logo: headerLogo, setter: setHeaderLogo, ref: headerLogoRef },
                  { title: "Logo do Footer (Rodapé)", logo: footerLogo, setter: setFooterLogo, ref: footerLogoRef },
                ].map((item) => (
                  <Card key={item.title}>
                    <CardHeader>
                      <CardTitle className="text-sm">{item.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">Recomendado: PNG transparente, máx. 200x60px</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.logo ? (
                        <div className="space-y-4">
                          <div className="bg-background rounded-xl p-8 flex items-center justify-center min-h-[120px]">
                            <img src={item.logo} alt="Logo" className="max-h-16 max-w-full object-contain" />
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" size="sm" onClick={() => item.ref.current?.click()}>Trocar</Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => item.setter(null)}>Remover</Button>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => item.ref.current?.click()} className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer">
                          <Upload className="w-8 h-8" />
                          <span className="text-sm font-medium">Clique para enviar a logo</span>
                        </div>
                      )}
                      <input ref={item.ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, item.setter)} />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  site_header_logo: headerLogo || "",
                  site_footer_logo: footerLogo || "",
                }, "Logomarcas")}>Salvar Logomarcas</Button>
              </div>
            </div>
          )}

          {/* TIPOGRAFIA */}
          {activeSection === "fontes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Fonte de Títulos (Display)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background rounded-lg p-6 text-center">
                      <link href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, "+")}&display=swap`} rel="stylesheet" />
                      <p style={{ fontFamily: `"${headingFont}", sans-serif` }} className="text-2xl font-bold">{headingFont}</p>
                      <p style={{ fontFamily: `"${headingFont}", sans-serif` }} className="text-lg text-muted-foreground mt-2">TOIL Projetos</p>
                    </div>
                    <Button variant={fontTarget === "heading" ? "default" : "outline"} className="w-full" onClick={() => setFontTarget("heading")}>
                      {fontTarget === "heading" ? "Selecionando para Títulos" : "Alterar Fonte de Títulos"}
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Fonte do Corpo (Body)</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-background rounded-lg p-6 text-center">
                      <link href={`https://fonts.googleapis.com/css2?family=${bodyFont.replace(/ /g, "+")}&display=swap`} rel="stylesheet" />
                      <p style={{ fontFamily: `"${bodyFont}", sans-serif` }} className="text-2xl font-bold">{bodyFont}</p>
                      <p style={{ fontFamily: `"${bodyFont}", sans-serif` }} className="text-base text-muted-foreground mt-2">Soluções sob medida em acrílico.</p>
                    </div>
                    <Button variant={fontTarget === "body" ? "default" : "outline"} className="w-full" onClick={() => setFontTarget("body")}>
                      {fontTarget === "body" ? "Selecionando para Corpo" : "Alterar Fonte do Corpo"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Escolher Fonte — {fontTarget === "heading" ? "Títulos" : "Corpo"}</CardTitle>
                    <span className="text-xs text-muted-foreground">{filteredFonts.length} fontes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} placeholder="Buscar fonte..." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {filteredFonts.map((font) => {
                      const isSelected = (fontTarget === "heading" && headingFont === font) || (fontTarget === "body" && bodyFont === font);
                      return (
                        <button
                          key={font}
                          onClick={() => { if (fontTarget === "heading") setHeadingFont(font); else setBodyFont(font); }}
                          className={`relative text-left p-4 rounded-lg border transition-all ${isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 bg-background"}`}
                        >
                          <link href={`https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`} rel="stylesheet" />
                          <p style={{ fontFamily: `"${font}", sans-serif` }} className="text-base font-semibold truncate">{font}</p>
                          <p style={{ fontFamily: `"${font}", sans-serif` }} className="text-xs text-muted-foreground mt-1">Aa Bb Cc 123</p>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  site_heading_font: headingFont,
                  site_body_font: bodyFont,
                }, "Tipografia")}>Salvar Tipografia</Button>
              </div>
            </div>
          )}

          {/* SMTP */}
          {activeSection === "smtp" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Servidor SMTP</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Host</Label><Input value={smtp.host} onChange={(e) => updateSmtp("host", e.target.value)} placeholder="smtp.gmail.com" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Porta</Label><Input value={smtp.port} onChange={(e) => updateSmtp("port", e.target.value)} /></div>
                      <div className="space-y-2">
                        <Label>Criptografia</Label>
                        <Select value={smtp.encryption} onValueChange={(v) => updateSmtp("encryption", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">Nenhuma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Usuário</Label><Input value={smtp.username} onChange={(e) => updateSmtp("username", e.target.value)} placeholder="seu@email.com" /></div>
                    <div className="space-y-2"><Label>Senha</Label><Input type="password" value={smtp.password} onChange={(e) => updateSmtp("password", e.target.value)} placeholder="••••••••" /></div>
                  </CardContent>
                </Card>
                <div className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Remetente Padrão</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><Label>Nome</Label><Input value={smtp.fromName} onChange={(e) => updateSmtp("fromName", e.target.value)} /></div>
                      <div className="space-y-2"><Label>E-mail</Label><Input value={smtp.fromEmail} onChange={(e) => updateSmtp("fromEmail", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Reply-To</Label><Input value={smtp.replyTo} onChange={(e) => updateSmtp("replyTo", e.target.value)} placeholder="Opcional" /></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Testar Conexão</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>E-mail para Teste</Label>
                        <Input 
                          type="email" 
                          value={smtpTestEmail} 
                          onChange={(e) => setSmtpTestEmail(e.target.value)} 
                          placeholder="seu@email.com"
                        />
                        <p className="text-xs text-muted-foreground">Digite o e-mail que receberá o teste</p>
                      </div>
                      <Button onClick={testSmtp} disabled={smtpTesting} className="w-full">
                        {smtpTesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Testando...</> : <><Mail className="w-4 h-4" /> Enviar E-mail de Teste</>}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  site_smtp_host: smtp.host,
                  site_smtp_port: smtp.port,
                  site_smtp_encryption: smtp.encryption,
                  site_smtp_username: smtp.username,
                  site_smtp_password: smtp.password,
                  site_smtp_from_name: smtp.fromName,
                  site_smtp_from_email: smtp.fromEmail,
                  site_smtp_reply_to: smtp.replyTo,
                }, "SMTP")}>Salvar SMTP</Button>
              </div>
            </div>
          )}
          {/* SOBRE */}
          {activeSection === "sobre" && (
            <div className="space-y-6">
              {/* Hero */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Seção Hero</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Badge (texto acima do título)</Label><Input value={sobreForm.heroBadge} onChange={(e) => updateSobre("heroBadge", e.target.value)} placeholder="Sobre nós" /></div>
                    <div className="space-y-2"><Label>Título Principal</Label><Input value={sobreForm.heroTitle} onChange={(e) => updateSobre("heroTitle", e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Subtítulo</Label><Textarea rows={2} value={sobreForm.heroSubtitle} onChange={(e) => updateSobre("heroSubtitle", e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Imagem de Fundo (URL ou upload)</Label>
                    <div className="flex gap-2">
                      <Input value={sobreForm.heroImage} onChange={(e) => updateSobre("heroImage", e.target.value)} placeholder="https://..." className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => sobreHeroImageRef.current?.click()} title="Enviar imagem"><Upload className="w-4 h-4" /></Button>
                    </div>
                    {sobreForm.heroImage && <img src={sobreForm.heroImage} alt="Preview hero" className="rounded-lg max-h-28 object-cover" />}
                    <input ref={sobreHeroImageRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => updateSobre("heroImage", url))} />
                  </div>
                </CardContent>
              </Card>

              {/* Nossa História */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Seção Nossa História</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Badge</Label><Input value={sobreForm.storyBadge} onChange={(e) => updateSobre("storyBadge", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Título</Label><Input value={sobreForm.storyTitle} onChange={(e) => updateSobre("storyTitle", e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Parágrafo 1</Label><Textarea rows={2} value={sobreForm.storyP1} onChange={(e) => updateSobre("storyP1", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Parágrafo 2</Label><Textarea rows={2} value={sobreForm.storyP2} onChange={(e) => updateSobre("storyP2", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Parágrafo 3</Label><Textarea rows={2} value={sobreForm.storyP3} onChange={(e) => updateSobre("storyP3", e.target.value)} /></div>
                  <div className="space-y-2">
                    <Label>Imagem (URL ou upload)</Label>
                    <div className="flex gap-2">
                      <Input value={sobreForm.storyImage} onChange={(e) => updateSobre("storyImage", e.target.value)} placeholder="https://..." className="flex-1" />
                      <Button variant="outline" size="sm" onClick={() => sobreStoryImageRef.current?.click()} title="Enviar imagem"><Upload className="w-4 h-4" /></Button>
                    </div>
                    {sobreForm.storyImage && <img src={sobreForm.storyImage} alt="Preview história" className="rounded-lg max-h-28 object-cover" />}
                    <input ref={sobreStoryImageRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => updateSobre("storyImage", url))} />
                  </div>
                </CardContent>
              </Card>

              {/* Valores */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <CardTitle className="text-sm">Seção Valores</CardTitle>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Badge</Label>
                          <Input value={sobreForm.valuesBadge} onChange={(e) => updateSobre("valuesBadge", e.target.value)} className="h-8" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Título da Seção</Label>
                          <Input value={sobreForm.valuesTitle} onChange={(e) => updateSobre("valuesTitle", e.target.value)} className="h-8" />
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 mt-6" onClick={() => setSobreValues([...sobreValues, { icon: "Star", title: "Novo Valor", desc: "Descrição do valor." }])}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sobreValues.map((v, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-background space-y-2">
                      <div className="flex items-center gap-2">
                        <Select value={v.icon} onValueChange={(val) => { const n = [...sobreValues]; n[i] = { ...n[i], icon: val }; setSobreValues(n); }}>
                          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Ícone" /></SelectTrigger>
                          <SelectContent>
                            {SOBRE_ICONS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input value={v.title} onChange={(e) => { const n = [...sobreValues]; n[i] = { ...n[i], title: e.target.value }; setSobreValues(n); }} placeholder="Título" className="flex-1 h-8" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setSobreValues(sobreValues.filter((_, j) => j !== i))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Textarea value={v.desc} rows={1} onChange={(e) => { const n = [...sobreValues]; n[i] = { ...n[i], desc: e.target.value }; setSobreValues(n); }} placeholder="Descrição" className="text-sm" />
                    </div>
                  ))}
                  {sobreValues.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum valor adicionado</p>}
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Números & Estatísticas</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setSobreStats([...sobreStats, { num: "0+", label: "Novo Item" }])}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sobreStats.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background">
                        <div className="flex-1 space-y-1">
                          <Input value={s.num} onChange={(e) => { const n = [...sobreStats]; n[i] = { ...n[i], num: e.target.value }; setSobreStats(n); }} placeholder="500+" className="h-8 text-sm font-bold" />
                          <Input value={s.label} onChange={(e) => { const n = [...sobreStats]; n[i] = { ...n[i], label: e.target.value }; setSobreStats(n); }} placeholder="Projetos Realizados" className="h-7 text-xs" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setSobreStats(sobreStats.filter((_, j) => j !== i))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {sobreStats.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma estatística adicionada</p>}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  sobre_hero_badge: sobreForm.heroBadge,
                  sobre_hero_title: sobreForm.heroTitle,
                  sobre_hero_subtitle: sobreForm.heroSubtitle,
                  sobre_hero_image: sobreForm.heroImage,
                  sobre_story_badge: sobreForm.storyBadge,
                  sobre_story_title: sobreForm.storyTitle,
                  sobre_story_p1: sobreForm.storyP1,
                  sobre_story_p2: sobreForm.storyP2,
                  sobre_story_p3: sobreForm.storyP3,
                  sobre_story_image: sobreForm.storyImage,
                  sobre_values_badge: sobreForm.valuesBadge,
                  sobre_values_title: sobreForm.valuesTitle,
                  sobre_values_items: JSON.stringify(sobreValues),
                  sobre_stats_items: JSON.stringify(sobreStats),
                }, "Página Sobre")}>Salvar Página Sobre</Button>
              </div>
            </div>
          )}

          {/* CONTATO */}
          {activeSection === "contato" && (
            <div className="space-y-6">
              {/* Hero */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Seção Hero</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Badge (texto acima do título)</Label><Input value={contatoForm.heroBadge} onChange={(e) => updateContato("heroBadge", e.target.value)} placeholder="Contato" /></div>
                    <div className="space-y-2"><Label>Título Principal</Label><Input value={contatoForm.heroTitle} onChange={(e) => updateContato("heroTitle", e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Subtítulo</Label><Textarea rows={2} value={contatoForm.heroSubtitle} onChange={(e) => updateContato("heroSubtitle", e.target.value)} /></div>
                </CardContent>
              </Card>

              {/* Informações de Contato */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Informações de Contato</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Título do bloco</Label><Input value={contatoForm.infoTitle} onChange={(e) => updateContato("infoTitle", e.target.value)} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Telefone</Label><Input value={contatoForm.phone} onChange={(e) => updateContato("phone", e.target.value)} placeholder="(11) 99999-9999" /></div>
                    <div className="space-y-2"><Label>E-mail</Label><Input value={contatoForm.email} onChange={(e) => updateContato("email", e.target.value)} placeholder="contato@empresa.com.br" /></div>
                  </div>
                  <div className="space-y-2"><Label>Endereço</Label><Input value={contatoForm.address} onChange={(e) => updateContato("address", e.target.value)} placeholder="Rua, número – Cidade, UF" /></div>
                  <div className="space-y-2">
                    <Label>Horário de Funcionamento</Label>
                    <Textarea 
                      rows={3} 
                      value={contatoForm.hours} 
                      onChange={(e) => updateContato("hours", e.target.value)} 
                      placeholder="Seg-Qui: 8h às 18h&#10;Sex: 8h às 17h" 
                    />
                    <p className="text-xs text-muted-foreground">Use Enter para quebrar linha e colocar horários em linhas separadas</p>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Botão WhatsApp</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Texto do Botão</Label><Input value={contatoForm.whatsappText} onChange={(e) => updateContato("whatsappText", e.target.value)} placeholder="Falar pelo WhatsApp" /></div>
                  <div className="space-y-2">
                    <Label>Link do WhatsApp</Label>
                    <Input value={contatoForm.whatsappLink} onChange={(e) => updateContato("whatsappLink", e.target.value)} placeholder="https://wa.me/55119..." />
                    <p className="text-xs text-muted-foreground">Formato: https://wa.me/5511999999999?text=Mensagem+pré-preenchida</p>
                  </div>
                </CardContent>
              </Card>

              {/* Formulário */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm">Formulário de Orçamento</CardTitle>
                      <p className="text-xs text-muted-foreground">Título e lista de serviços disponíveis no select</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setContatoServices([...contatoServices, "Novo Serviço"])}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Título do Formulário</Label><Input value={contatoForm.formTitle} onChange={(e) => updateContato("formTitle", e.target.value)} placeholder="Solicitar Orçamento" /></div>
                  <Separator />
                  <Label>Serviços no Select</Label>
                  <div className="space-y-2">
                    {contatoServices.map((svc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input value={svc} onChange={(e) => { const n = [...contatoServices]; n[i] = e.target.value; setContatoServices(n); }} className="h-8 text-sm" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => setContatoServices(contatoServices.filter((_, j) => j !== i))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {contatoServices.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum serviço adicionado</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Mapa */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Seção do Mapa</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Título da Seção</Label><Input value={contatoForm.mapTitle} onChange={(e) => updateContato("mapTitle", e.target.value)} placeholder="Nossa Localização" /></div>
                    <div className="space-y-2"><Label>Subtítulo</Label><Input value={contatoForm.mapSubtitle} onChange={(e) => updateContato("mapSubtitle", e.target.value)} placeholder="Visite nosso showroom..." /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome/Label no Mapa</Label>
                    <Input value={contatoForm.mapLabel} onChange={(e) => updateContato("mapLabel", e.target.value)} placeholder="TOIL Projetos" />
                    <p className="text-xs text-muted-foreground">Nome que aparece como marcador no mapa (ex: nome da empresa)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço do Mapa</Label>
                    <Input value={contatoForm.mapAddress} onChange={(e) => updateContato("mapAddress", e.target.value)} placeholder="Rua, número – Cidade, UF" />
                    <p className="text-xs text-muted-foreground">Este endereço será usado para buscar a localização no Google Maps</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  contato_hero_badge: contatoForm.heroBadge,
                  contato_hero_title: contatoForm.heroTitle,
                  contato_hero_subtitle: contatoForm.heroSubtitle,
                  contato_info_title: contatoForm.infoTitle,
                  contato_phone: contatoForm.phone,
                  contato_email: contatoForm.email,
                  contato_address: contatoForm.address,
                  contato_hours: contatoForm.hours,
                  contato_whatsapp_link: contatoForm.whatsappLink,
                  contato_whatsapp_text: contatoForm.whatsappText,
                  contato_form_title: contatoForm.formTitle,
                  contato_map_title: contatoForm.mapTitle,
                  contato_map_subtitle: contatoForm.mapSubtitle,
                  contato_map_address: contatoForm.mapAddress,
                  contato_map_label: contatoForm.mapLabel,
                  contato_form_services: JSON.stringify(contatoServices),
                }, "Página Contato")}>Salvar Página Contato</Button>
              </div>
            </div>
          )}
          {/* ANIMAÇÕES */}
          {activeSection === "animacoes" && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-sm">Efeito Scroll Reveal com Blur</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Ativar efeito</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Elementos entram com fade + blur + deslizamento ao rolar</p>
                    </div>
                    <button
                      onClick={() => setAnimacaoForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${animacaoForm.enabled ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${animacaoForm.enabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {/* Repeat toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Repetir ao rolar</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Elementos desaparecem ao sair da tela e reaparecem ao voltar</p>
                    </div>
                    <button
                      onClick={() => setAnimacaoForm((prev) => ({ ...prev, repeat: !prev.repeat }))}
                      disabled={!animacaoForm.enabled}
                      className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-40 ${animacaoForm.repeat ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${animacaoForm.repeat ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  <Separator />

                  {/* Blur intensity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Intensidade do Blur inicial</Label>
                      <span className="text-sm font-mono text-muted-foreground">{animacaoForm.blurPx}px</span>
                    </div>
                    <input
                      type="range" min={0} max={30} step={1}
                      value={animacaoForm.blurPx}
                      onChange={(e) => setAnimacaoForm((prev) => ({ ...prev, blurPx: Number(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-full"
                      disabled={!animacaoForm.enabled}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sem blur</span><span>Máximo</span>
                    </div>
                  </div>

                  {/* Translate Y */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Deslocamento vertical inicial</Label>
                      <span className="text-sm font-mono text-muted-foreground">{animacaoForm.translateY}px</span>
                    </div>
                    <input
                      type="range" min={0} max={80} step={5}
                      value={animacaoForm.translateY}
                      onChange={(e) => setAnimacaoForm((prev) => ({ ...prev, translateY: Number(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-full"
                      disabled={!animacaoForm.enabled}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sem deslocamento</span><span>80px abaixo</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Duração da animação</Label>
                      <span className="text-sm font-mono text-muted-foreground">{animacaoForm.duration.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range" min={0.3} max={1.5} step={0.1}
                      value={animacaoForm.duration}
                      onChange={(e) => setAnimacaoForm((prev) => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full accent-primary h-2 rounded-full"
                      disabled={!animacaoForm.enabled}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rápido (0.3s)</span><span>Lento (1.5s)</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">Pré-visualização do efeito</p>
                    <div className="rounded-xl border border-border bg-muted/30 p-6 text-center overflow-hidden">
                      <div
                        key={`${animacaoForm.enabled}-${animacaoForm.blurPx}-${animacaoForm.translateY}-${animacaoForm.duration}`}
                        style={{
                          animation: animacaoForm.enabled
                            ? `blurRevealPreview ${animacaoForm.duration}s cubic-bezier(0.5,0,0,1) forwards`
                            : "none",
                        }}
                      >
                        <p className="text-sm font-semibold">Exemplo de elemento</p>
                        <p className="text-xs text-muted-foreground mt-1">Este bloco aparece com o efeito configurado</p>
                      </div>
                    </div>
                    <style>{`
                      @keyframes blurRevealPreview {
                        from { opacity: 0; filter: blur(${animacaoForm.blurPx}px); transform: translateY(${animacaoForm.translateY}px); }
                        to   { opacity: 1; filter: blur(0); transform: translateY(0); }
                      }
                    `}</style>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings({
                  animation_reveal_enabled: animacaoForm.enabled ? "true" : "false",
                  animation_repeat: animacaoForm.repeat ? "true" : "false",
                  animation_blur_px: String(animacaoForm.blurPx),
                  animation_reveal_y: String(animacaoForm.translateY),
                  animation_reveal_duration: String(animacaoForm.duration),
                }, "Animações")}>Salvar Animações</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
