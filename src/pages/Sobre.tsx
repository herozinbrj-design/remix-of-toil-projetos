import { motion } from "framer-motion";
import SEOHead from "../components/SEOHead";
import BlurReveal from "../components/BlurReveal";
import AnimatedCounter from "../components/AnimatedCounter";
import {
  Target, Eye, Award, Users, Star, Heart, Shield,
  Zap, Globe, Compass, CheckCircle, Trophy, Flame,
  ThumbsUp, Lightbulb, Rocket, Clock,
} from "lucide-react";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import { useSettings } from "../contexts/SettingsContext";

const ICON_MAP: Record<string, React.ElementType> = {
  Target, Eye, Award, Users, Star, Heart, Shield,
  Zap, Globe, Compass, CheckCircle, Trophy, Flame,
  ThumbsUp, Lightbulb, Rocket, Clock,
};

const DEFAULT_VALUES = [
  { icon: "Target", title: "Precisão", desc: "Cada detalhe é planejado e executado com máxima precisão." },
  { icon: "Eye", title: "Visão", desc: "Antecipamos tendências e inovamos continuamente." },
  { icon: "Award", title: "Excelência", desc: "Comprometidos com os mais altos padrões de qualidade." },
  { icon: "Users", title: "Parceria", desc: "Construímos relações de longo prazo com nossos clientes." },
];

const DEFAULT_STATS = [
  { num: "500+", label: "Projetos Realizados" },
  { num: "14+", label: "Anos de Experiência" },
  { num: "200+", label: "Clientes Atendidos" },
  { num: "98%", label: "Satisfação" },
];

export default function Sobre() {
  const data = useSettings();
  const values = data.sobre_values_items
    ? (() => { try { return JSON.parse(data.sobre_values_items); } catch { return DEFAULT_VALUES; } })()
    : DEFAULT_VALUES;
  const stats = data.sobre_stats_items
    ? (() => { try { return JSON.parse(data.sobre_stats_items); } catch { return DEFAULT_STATS; } })()
    : DEFAULT_STATS;

  const g = (key: string, fallback: string) => data[key] || fallback;

  return (
    <>
      <SEOHead title="Sobre Nós" description="Conheça a Toil Projetos: nossa história, valores e missão." />
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={g("sobre_hero_image", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1920&h=600&fit=crop")}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">
              {g("sobre_hero_badge", "Sobre nós")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mt-4 mb-6">
              {g("sobre_hero_title", "Quem é a Toil Projetos")}
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {g("sobre_hero_subtitle", "Somos especialistas em transformar conceitos em realidade, com soluções sob medida em acrílico, marcenaria e comunicação visual.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <BlurReveal>
            <SectionHeader
              badge={g("sobre_story_badge", "Nossa História")}
              title={g("sobre_story_title", "Mais de uma década de excelência")}
              center={false}
            />
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{g("sobre_story_p1", "Fundada em 2010, a Toil Projetos nasceu da paixão por criar soluções visuais e estruturais que transformam espaços e elevam marcas.")}</p>
              <p>{g("sobre_story_p2", "Com uma equipe multidisciplinar de designers, engenheiros e marceneiros, atendemos clientes de diversos segmentos, sempre com foco em qualidade, inovação e prazos.")}</p>
              <p>{g("sobre_story_p3", "Nossa fábrica em São Paulo conta com tecnologia de ponta para corte a laser, CNC e acabamento premium, garantindo a excelência em cada projeto.")}</p>
            </div>
          </BlurReveal>
          <BlurReveal delay={0.15} className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
            <img
              src={g("sobre_story_image", "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=700&h=500&fit=crop")}
              alt="Fábrica Toil Projetos"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
          </BlurReveal>
        </div>
      </Section>

      {/* Valores */}
      <Section dark>
        <SectionHeader badge={g("sobre_values_badge", "Valores")} title={g("sobre_values_title", "O que nos move")} light />
        <div className={`grid gap-6 ${
          values.length === 1 ? "grid-cols-1 max-w-md mx-auto" :
          values.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto" :
          values.length === 3 ? "grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto" :
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}>
          {values.map((v: { icon: string; title: string; desc: string }, i: number) => {
            const IconComp = ICON_MAP[v.icon] || Target;
            return (
              <BlurReveal
                key={i}
                delay={i * 0.1}
                className="group bg-navy-900/50 border border-navy-800/50 rounded-xl p-6 text-center hover:border-accent/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 hover:bg-navy-900 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <IconComp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-navy-300">{v.desc}</p>
              </BlurReveal>
            );
          })}
        </div>
      </Section>

      {/* Numbers */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s: { num: string; label: string }, i: number) => {
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
    </>
  );
}
