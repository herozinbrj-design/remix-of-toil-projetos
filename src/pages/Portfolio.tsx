import { motion } from "framer-motion";
import SEOHead from "../components/SEOHead";
import BlurReveal from "../components/BlurReveal";
import { useState } from "react";
import Section from "../components/Section";
import { usePortfolio } from "../contexts/PortfolioContext";
import ImageLightbox from "../components/ImageLightbox";

export default function Portfolio() {
  const { projects } = usePortfolio();
  const publishedProjects = projects.filter(p => p.status === "Publicado");
  const categories = ["Todos", ...Array.from(new Set(publishedProjects.map(p => p.category)))];

  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? publishedProjects : publishedProjects.filter((p) => p.category === filter);
  
  const [lightboxImage, setLightboxImage] = useState<{ image: string; alt: string } | null>(null);

  return (
    <>
      <SEOHead title="Portfólio" description="Veja os projetos realizados pela Toil Projetos em acrílico, marcenaria e comunicação visual." />
      <section className="relative pt-32 pb-20 bg-navy-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Portfólio</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mt-4 mb-6">
              Nossos projetos
            </h1>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto">
              Conheça alguns dos projetos que realizamos com excelência e dedicação.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === c
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p, i) => (
            <BlurReveal
              key={p.id}
              delay={i * 0.05}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer ring-1 ring-navy-800/50 hover:ring-accent/30 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300"
              onClick={() => setLightboxImage({ image: p.image, alt: p.name })}
            >
              <img src={p.image} alt={p.name} className="w-full h-full object-contain bg-navy-900/50 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-xs text-accent font-semibold mb-1 uppercase tracking-wide">{p.category}</span>
                <h3 className="text-white font-display font-bold text-base group-hover:text-accent/90 transition-colors">{p.name}</h3>
              </div>
            </BlurReveal>
          ))}
        </div>
        
        <ImageLightbox
          image={lightboxImage?.image || ""}
          alt={lightboxImage?.alt || ""}
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      </Section>
    </>
  );
}
