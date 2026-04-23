import { motion } from "framer-motion";
import SEOHead from "../components/SEOHead";
import BlurReveal from "../components/BlurReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import ServiceIcon from "../components/ServiceIcon";
import { useServices } from "../contexts/ServicesContext";
import ElectricButton from "../components/ElectricButton";

export default function Segmentos() {
  const { services } = useServices();
  const activeServices = services.filter(s => s.active).sort((a, b) => a.order - b.order);

  return (
    <>
      <SEOHead title="Segmentos" description="Conheça todos os segmentos da Toil Projetos: acrílico, marcenaria, comunicação visual e muito mais." />
      <section className="relative pt-32 pb-20 bg-navy-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Segmentos</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mt-4 mb-6">
              Nossas soluções
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto">
              Oferecemos soluções completas em acrílico, marcenaria e comunicação visual para transformar a identidade do seu espaço.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="space-y-8">
          {activeServices.map((s, i) => (
            <BlurReveal
              key={s.id}
              delay={i * 0.08}
              className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 !== 0 ? "md:[direction:rtl]" : ""}`}
            >
              <div className="rounded-xl overflow-hidden aspect-[3/2] group" style={{ direction: "ltr" }}>
                <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div style={{ direction: "ltr" }} className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors duration-300">
                  <ServiceIcon name={s.icon} />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">{s.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                <div className="flex items-center gap-4">
                  <Link to="/contato" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
                    Solicitar orçamento <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </Section>

      {/* CTA Final */}
      <Section dark>
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Não encontrou seu segmento?
            </h2>
            <p className="text-navy-300 text-lg mb-8">
              Atendemos projetos personalizados para qualquer tipo de negócio. Fale conosco!
            </p>
            <ElectricButton to="/contato">Fale Conosco</ElectricButton>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
