import { motion } from "framer-motion";
import SEOHead from "../components/SEOHead";
import BlurReveal from "../components/BlurReveal";
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ElectricButton from "../components/ElectricButton";
import { useSettings } from "../contexts/SettingsContext";
import Section from "../components/Section";
import { toast } from "sonner";

interface Service {
  id: number;
  name: string;
}

export default function Contato() {
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", servico: "", mensagem: "" });
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const settings = useSettings();

  const g = (key: string, fallback: string) => settings[key] || fallback;

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

  // Buscar serviços do banco de dados
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
        toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
        setFormData({ nome: "", email: "", telefone: "", servico: "", mensagem: "" });
      } else {
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Contato" description="Entre em contato com a Toil Projetos. Solicite um orçamento e fale com nossa equipe." />
      <section className="relative pt-32 pb-20 bg-navy-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">
              {g("contato_hero_badge", "Contato")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mt-4 mb-6">
              {g("contato_hero_title", "Fale conosco")}
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto">
              {g("contato_hero_subtitle", "Solicite um orçamento ou tire suas dúvidas. Estamos prontos para atender você.")}
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info */}
          <BlurReveal className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                {g("contato_info_title", "Informações de Contato")}
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: "Telefone", value: g("contato_phone", "(11) 98998-0791") },
                  { icon: Mail, label: "E-mail", value: g("contato_email", "contato@toilprojetos.com.br") },
                  { icon: MapPin, label: "Endereço", value: g("contato_address", "Rua Fernão Marques, 420 – São Paulo, SP") },
                  { icon: Clock, label: "Horário de Funcionamento", value: g("contato_hours", "Seg-Sex: 8h às 18h") },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</div>
                      <div className="text-foreground font-medium whitespace-pre-line">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={g("contato_whatsapp_link", "https://wa.me/5511989980791?text=Olá! Gostaria de solicitar um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-lg transition-all shadow-md"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.117 1.533 5.845L0 24l6.335-1.56C8.035 23.44 9.975 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.665-.522-5.176-1.43l-.37-.22-3.758.926.996-3.65-.243-.382C2.533 15.635 2 13.878 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {g("contato_whatsapp_text", "Falar pelo WhatsApp")}
            </a>
          </BlurReveal>

          {/* Form */}
          <BlurReveal delay={0.15} className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-display font-bold text-card-foreground mb-4">
              {g("contato_form_title", "Solicitar Orçamento")}
            </h3>
            <input
              type="text" placeholder="Seu nome completo" required
              value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              disabled={isSubmitting}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="email" placeholder="E-mail" required
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                disabled={isSubmitting}
              />
              <input
                type="tel" placeholder="Telefone / WhatsApp" required
                value={formData.telefone} onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={15}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                disabled={isSubmitting}
              />
            </div>
            <select
              value={formData.servico} onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-muted-foreground"
              disabled={isSubmitting}
            >
              <option value="">Selecione o serviço</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.name}>{svc.name}</option>
              ))}
            </select>
            <textarea
              placeholder="Descreva seu projeto com o máximo de detalhes..." rows={5} required
              value={formData.mensagem} onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-center">
              <ElectricButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
              </ElectricButton>
            </div>
          </form>
          </BlurReveal>
        </div>
      </Section>

      {/* Map Section */}
      <Section className="bg-muted/30">
        <BlurReveal>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-3">
              {g("contato_map_title", "Nossa Localização")}
            </h2>
            <p className="text-muted-foreground">
              {g("contato_map_subtitle", "Visite nosso showroom e conheça nossos projetos de perto")}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(g("contato_map_label", "TOIL Projetos") + ", " + g("contato_map_address", "Rua Fernão Marques, 420 – São Paulo, SP"))}`}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização da Toil Projetos"
            />
          </div>
        </BlurReveal>
      </Section>
    </>
  );
}
