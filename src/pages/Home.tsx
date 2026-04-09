import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import ElectricButton from "../components/ElectricButton";
import BlurReveal from "../components/BlurReveal";
import AnimatedCounter from "../components/AnimatedCounter";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import SEOHead from "../components/SEOHead";
import { usePortfolio } from "../contexts/PortfolioContext";
import { useSettings } from "../contexts/SettingsContext";

interface HeroBanner {
  subtitle: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaPrimaryLink: string;
  ctaSecondary: string;
  ctaSecondaryLink: string;
  image: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

interface Service {
  id: number;
  name: string;
}

const fallbackBanners: HeroBanner[] = [
  {
    subtitle: "SOLUÇÕES EM ACRÍLICO E MARCENARIA",
    title: "Transformamos ideias em projetos extraordinários",
    description: "Especialistas em acrílico, marcenaria e comunicação visual. Criamos soluções personalizadas que elevam a presença da sua marca.",
    ctaPrimary: "Solicitar Orçamento",
    ctaPrimaryLink: "/contato",
    ctaSecondary: "Ver Portfólio",
    ctaSecondaryLink: "/portfolio",
    image: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=1920&h=1080&fit=crop",
  },
  {
    subtitle: "PROJETOS SOB MEDIDA",
    title: "Excelência em cada detalhe do seu projeto",
    description: "Do conceito à instalação, nossa equipe garante qualidade premium e prazo garantido em todos os projetos.",
    ctaPrimary: "Fale Conosco",
    ctaPrimaryLink: "/contato",
    ctaSecondary: "Nossos Segmentos",
    ctaSecondaryLink: "/segmentos",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop",
  },
  {
    subtitle: "COMUNICAÇÃO VISUAL PROFISSIONAL",
    title: "Sua marca com impacto visual máximo",
    description: "Fachadas, letreiros, painéis e sinalização completa para destacar sua empresa no mercado.",
    ctaPrimary: "Ver Projetos",
    ctaPrimaryLink: "/portfolio",
    ctaSecondary: "Saiba Mais",
    ctaSecondaryLink: "/sobre",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
  },
];

const diferenciais = [
  { icon: Award, title: "Qualidade Premium", desc: "Materiais selecionados e acabamento impecável em todos os projetos." },
  { icon: Clock, title: "Prazo Garantido", desc: "Compromisso com prazos e cronogramas definidos." },
  { icon: Users, title: "Atendimento Dedicado", desc: "Equipe especializada do projeto à instalação." },
];


import {
  ShoppingBag, Building2, Stethoscope, UtensilsCrossed,
  GraduationCap, Hotel, PartyPopper, Store, Layers,
  Briefcase, Heart, Truck, Wrench, Sparkles, Music, Camera,
  Palette, Landmark, Plane, Zap, Leaf, Globe, Gem, Rocket,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag, Store, Building2, Stethoscope, UtensilsCrossed,
  GraduationCap, Hotel, PartyPopper, Layers, Briefcase, Heart,
  Truck, Wrench, Sparkles, Music, Camera, Palette, Landmark,
  Plane, Zap, Leaf, Globe, Award, Gem, Rocket,
};

interface Segment {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
}

function getIconForSegment(segment: Segment): React.ElementType {
  if (segment.image && iconMap[segment.image]) return iconMap[segment.image];
  const lower = segment.name.toLowerCase();
  if (lower.includes("varejo") || lower.includes("franquia")) return ShoppingBag;
  if (lower.includes("shopping")) return Store;
  if (lower.includes("corporat")) return Building2;
  if (lower.includes("saúde") || lower.includes("saude") || lower.includes("clínica")) return Stethoscope;
  if (lower.includes("alimenta") || lower.includes("restaur")) return UtensilsCrossed;
  if (lower.includes("educa")) return GraduationCap;
  if (lower.includes("hotel")) return Hotel;
  if (lower.includes("evento")) return PartyPopper;
  return Layers;
}


interface CarouselItem {
  image: string;
  caption?: string;
}

interface CarouselSection {
  title: string;
  titleAccent: string;
  description: string;
  btnText: string;
  btnLink: string;
  speed: number;
  items: CarouselItem[];
}

const defaultCarousel: CarouselSection = {
  title: "Nossos projetos",
  titleAccent: "falam por si.",
  description: "Veja alguns dos trabalhos entregues pela nossa equipe. Cada projeto é feito sob medida para destacar a sua marca.",
  btnText: "Ver Portfólio",
  btnLink: "/portfolio",
  speed: 30,
  items: [
    { image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop" },
    { image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=600&fit=crop" },
    { image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop" },
    { image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=600&fit=crop" },
    { image: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=400&h=600&fit=crop" },
  ],
};

export default function Home() {
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", servico: "", mensagem: "" });
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(fallbackBanners);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<{ num: string; label: string }[]>([]);
  const [clientesLogos, setClientesLogos] = useState<string[]>([]);
  const { projects } = usePortfolio();
  const settingsData = useSettings();
  const isFirstSlide = useRef(true);

  // Função para formatar telefone brasileiro
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, ddd, first, second) => {
        if (second) return `(${ddd}) ${first}-${second}`;
        if (first) return `(${ddd}) ${first}`;
        return ddd ? `(${ddd}` : ddd;
      });
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, ddd, first, second) => {
      if (second) return `(${ddd}) ${first}-${second}`;
      if (first) return `(${ddd}) ${first}`;
      return ddd ? `(${ddd}` : ddd;
    });
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData({ ...formData, telefone: formatted });
  };

  const carousel: CarouselSection = {
    title: settingsData.carousel_title || defaultCarousel.title,
    titleAccent: settingsData.carousel_title_accent || defaultCarousel.titleAccent,
    description: settingsData.carousel_description || defaultCarousel.description,
    btnText: settingsData.carousel_btn_text || defaultCarousel.btnText,
    btnLink: settingsData.carousel_btn_link || defaultCarousel.btnLink,
    speed: parseFloat(settingsData.carousel_speed) || defaultCarousel.speed,
    items: settingsData.carousel_items
      ? (() => { try { return JSON.parse(settingsData.carousel_items); } catch { return defaultCarousel.items; } })()
      : defaultCarousel.items,
  };

  const clientes = {
    title: settingsData.clients_title || "Clientes que confiam",
    subtitle: settingsData.clients_subtitle || "Empresas que já transformaram seus espaços com a Toil Projetos",
    speed: parseFloat(settingsData.clients_speed) || 40,
  };

  // Fetch banners from API
  useEffect(() => {
    fetch("/api/banners?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHeroBanners(
            data.map((b: Record<string, unknown>) => ({
              subtitle: (b.subtitle as string) || "",
              title: (b.title as string) || "",
              description: (b.description as string) || "",
              ctaPrimary: (b.ctaPrimary as string) || "Solicitar Orçamento",
              ctaPrimaryLink: (b.ctaPrimaryLink as string) || "/contato",
              ctaSecondary: (b.ctaSecondary as string) || "Ver Portfólio",
              ctaSecondaryLink: (b.ctaSecondaryLink as string) || "/portfolio",
              image: (b.image as string) || "",
              overlayColor: (b.overlayColor as string) || "#0a1628",
              overlayOpacity: (b.overlayOpacity as number) ?? 70,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch segments from API
  useEffect(() => {
    fetch("/api/segments?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSegments(data.sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch services from API
  useEffect(() => {
    fetch("/api/services?active=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServices(data.sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {});
  }, []);

  // Load stats from settings
  useEffect(() => {
    const defaultStats = [
      { num: "500+", label: "Projetos Realizados" },
      { num: "14+", label: "Anos de Experiência" },
      { num: "200+", label: "Clientes Atendidos" },
      { num: "98%", label: "Satisfação" },
    ];
    
    if (settingsData.sobre_stats_items) {
      try {
        setStats(JSON.parse(settingsData.sobre_stats_items));
      } catch {
        setStats(defaultStats);
      }
    } else {
      setStats(defaultStats);
    }

    // Load clientes logos
    if (settingsData.clients_logos) {
      try {
        setClientesLogos(JSON.parse(settingsData.clients_logos));
      } catch {
        setClientesLogos([]);
      }
    }
  }, [settingsData.sobre_stats_items, settingsData.clients_logos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          phone: formData.telefone,
          service: formData.servico,
          message: formData.mensagem,
          source: "site",
        }),
      });

      if (response.ok) {
        toast.success("Orçamento enviado! Entraremos em contato em breve.");
        setFormData({ nome: "", email: "", telefone: "", servico: "", mensagem: "" });
      } else {
        toast.error("Erro ao enviar orçamento. Tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao enviar orçamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  }, [heroBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, [heroBanners.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <>
      <SEOHead />
      {/* Hero Slider */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroBanners[currentSlide].image}
              alt="Projeto Toil"
              className="w-full h-full object-cover"
              style={{ opacity: 1 - (heroBanners[currentSlide].overlayOpacity ?? 70) / 100 }}
              loading="eager"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${heroBanners[currentSlide].overlayColor || '#0a1628'}b3, ${heroBanners[currentSlide].overlayColor || '#0a1628'}80, ${heroBanners[currentSlide].overlayColor || '#0a1628'})`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={isFirstSlide.current ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onAnimationComplete={() => { isFirstSlide.current = false; }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-md mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-accent text-xs font-semibold tracking-wide uppercase">
                  {heroBanners[currentSlide].subtitle}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
                {heroBanners[currentSlide].title.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-accent">
                  {heroBanners[currentSlide].title.split(" ").slice(-2).join(" ")}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                {heroBanners[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ElectricButton to={heroBanners[currentSlide].ctaPrimaryLink || "/contato"}>
                  {heroBanners[currentSlide].ctaPrimary}
                </ElectricButton>
                <ElectricButton to={heroBanners[currentSlide].ctaSecondaryLink || "/portfolio"}>
                  {heroBanners[currentSlide].ctaSecondary}
                </ElectricButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev/Next Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Próximo slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {heroBanners.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} aria-label={`Ir para slide ${i + 1}`} className="relative group">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-10 bg-accent" : "w-4 bg-white/30 hover:bg-white/50"}`} />
              {i === currentSlide && (
                <motion.div
                  className="absolute inset-0 h-1.5 rounded-full bg-accent/50"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Clientes Section */}
      {clientesLogos.length > 0 && (
        <section className="relative py-16 overflow-hidden" style={{ backgroundColor: '#0C111D' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-display font-bold text-white mb-3"
              >
                {clientes.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-navy-300 text-base max-w-2xl mx-auto"
              >
                {clientes.subtitle}
              </motion.p>
            </div>

            {/* Auto-scrolling logos carousel */}
            <div className="relative overflow-hidden mask-horizontal">
              <div className="flex gap-12 items-center">
                {/* Primeira faixa - TODOS os logos */}
                <div
                  className="flex gap-12 items-center flex-shrink-0"
                  style={{ 
                    animation: 'scroll-infinite linear infinite',
                    animationDuration: `${clientes.speed}s` 
                  }}
                >
                  {clientesLogos.map((logo, i) => (
                    <div
                      key={`first-${i}`}
                      className="flex-shrink-0 w-[180px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                    >
                      <img
                        src={logo}
                        alt={`Cliente ${i + 1}`}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Erro ao carregar logo:', logo);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                {/* Segunda faixa - TODOS os logos duplicados para loop contínuo */}
                <div
                  className="flex gap-12 items-center flex-shrink-0"
                  style={{ 
                    animation: 'scroll-infinite linear infinite',
                    animationDuration: `${clientes.speed}s` 
                  }}
                  aria-hidden="true"
                >
                  {clientesLogos.map((logo, i) => (
                    <div
                      key={`second-${i}`}
                      className="flex-shrink-0 w-[180px] h-[100px] flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                    >
                      <img
                        src={logo}
                        alt={`Cliente ${i + 1}`}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Carousel Section */}
      <section className="relative bg-navy-950 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[360px_1fr] gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                {carousel.title}{" "}
                <span className="text-accent">{carousel.titleAccent}</span>
              </h2>
              <p className="text-navy-300 text-base leading-relaxed">{carousel.description}</p>
              <ElectricButton to={carousel.btnLink}>{carousel.btnText}</ElectricButton>
            </motion.div>

            {/* Right: Auto-scrolling carousel */}
            <div className="relative overflow-hidden mask-horizontal">
              {carousel.items.length > 0 && (
                <div className="flex gap-4">
                  {/* Primeira faixa - TODOS os itens */}
                  <div
                    className="flex gap-4 flex-shrink-0"
                    style={{ 
                      animation: 'scroll-infinite linear infinite',
                      animationDuration: `${carousel.speed}s` 
                    }}
                  >
                    {carousel.items.map((item, i) => (
                      <div
                        key={`first-${i}`}
                        className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden border border-navy-800/60 bg-navy-900 relative"
                        style={{ aspectRatio: "3/4" }}
                      >
                        <img
                          src={item.image}
                          alt={item.caption || `Projeto ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {item.caption && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-xs text-white/90 leading-snug">{item.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Segunda faixa - TODOS os itens duplicados para loop contínuo */}
                  <div
                    className="flex gap-4 flex-shrink-0"
                    style={{ 
                      animation: 'scroll-infinite linear infinite',
                      animationDuration: `${carousel.speed}s` 
                    }}
                    aria-hidden="true"
                  >
                    {carousel.items.map((item, i) => (
                      <div
                        key={`second-${i}`}
                        className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden border border-navy-800/60 bg-navy-900 relative"
                        style={{ aspectRatio: "3/4" }}
                      >
                        <img
                          src={item.image}
                          alt={item.caption || `Projeto ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {item.caption && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-xs text-white/90 leading-snug">{item.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <Section dark>
        <SectionHeader badge="Por que a Toil?" title="O que nos destaca" subtitle="Mais de uma década entregando projetos com excelência e compromisso." light />
        <div className="grid md:grid-cols-3 gap-6">
          {diferenciais.map((d, i) => (
            <BlurReveal
              key={d.title}
              delay={i * 0.12}
              className="group text-center p-8 rounded-2xl border border-navy-800/40 hover:border-accent/25 bg-navy-900/20 hover:bg-navy-900/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/20 group-hover:border-accent/40 group-hover:scale-110 transition-all duration-300">
                <d.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-3">{d.title}</h3>
              <p className="text-sm text-navy-300 leading-relaxed">{d.desc}</p>
            </BlurReveal>
          ))}
        </div>
      </Section>

      {/* Projetos Gallery */}
      <Section>
        <SectionHeader badge="Portfólio" title="Projetos que inspiram" subtitle="Confira alguns dos nossos trabalhos realizados." />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const homeProjects = projects.filter(p => p.showOnHome && p.status === "Publicado");
            const displayProjects = homeProjects.length > 0
              ? homeProjects.slice(0, 4)
              : projects.filter(p => p.status === "Publicado").slice(0, 4);
            return displayProjects.map((p, i) => (
              <BlurReveal key={p.id} delay={i * 0.1}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 ring-1 ring-navy-800/50 hover:ring-accent/30"
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="text-xs text-accent font-semibold mb-1 uppercase tracking-wide">{p.category}</span>
                  <h3 className="text-white font-display font-bold group-hover:text-accent/90 transition-colors">{p.name}</h3>
                </div>
              </BlurReveal>
            ));
          })()}
        </div>
        <div className="text-center mt-10">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
            Ver todos os projetos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Contadores */}
      {stats.length > 0 && (
        <Section className="pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => {
              // Extrair número e sufixo (ex: "500+" -> 500 e "+")
              const match = s.num.match(/^(\d+)(.*)$/);
              const number = match ? parseInt(match[1]) : 0;
              const suffix = match ? match[2] : "";
              
              return (
                <BlurReveal key={i} delay={i * 0.1}>
                  <AnimatedCounter 
                    end={number} 
                    suffix={suffix}
                    duration={2500}
                    className="text-4xl md:text-5xl font-display font-bold text-accent mb-2"
                  />
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </BlurReveal>
              );
            })}
          </div>
        </Section>
      )}

      {/* Segmentos */}
      <Section dark>
        <SectionHeader badge="Setores" title="Setores que atendemos" subtitle="Experiência comprovada em diversos segmentos do mercado." light />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {segments.map((s, i) => {
            const Icon = getIconForSegment(s);
            return (
              <BlurReveal key={s.id} delay={i * 0.06} className="bg-navy-900/50 border border-navy-800/50 rounded-xl p-5 text-center hover:border-accent/30 hover:bg-navy-900 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 border-gradient">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-semibold text-navy-200">{s.name}</span>
              </BlurReveal>
            );
          })}
        </div>
      </Section>

      {/* Form */}
      <Section id="orcamento">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader badge="Orçamento" title="Solicite seu orçamento gratuito" subtitle="Preencha o formulário e nossa equipe entrará em contato em até 24 horas." center={false} />
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>✓ Resposta em até 24h úteis</p>
              <p>✓ Orçamento detalhado sem compromisso</p>
              <p>✓ Visita técnica quando necessário</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-8 shadow-lg border-gradient">
            <input 
              type="text" 
              placeholder="Seu nome completo" 
              required 
              value={formData.nome} 
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-white/50 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" 
              disabled={isSubmitting}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                type="email" 
                placeholder="E-mail" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-white/50 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" 
                disabled={isSubmitting}
              />
              <input 
                type="tel" 
                placeholder="Telefone / WhatsApp" 
                required 
                value={formData.telefone} 
                onChange={(e) => handlePhoneChange(e.target.value)} 
                maxLength={15}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-white/50 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all" 
                disabled={isSubmitting}
              />
            </div>
            <select
              value={formData.servico} 
              onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              disabled={isSubmitting}
            >
              <option value="">Selecione o serviço</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.name}>{svc.name}</option>
              ))}
            </select>
            <textarea 
              placeholder="Descreva seu projeto com o máximo de detalhes..." 
              rows={4} 
              required 
              value={formData.mensagem} 
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })} 
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-white/50 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none" 
              disabled={isSubmitting}
            />
            <div className="flex justify-center">
              <ElectricButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Orçamento"}
              </ElectricButton>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
