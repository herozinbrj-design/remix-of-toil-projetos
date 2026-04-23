import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ArrowRight, ChevronLeft, ChevronRight, Send } from "lucide-react";
import SEOHead from "../components/SEOHead";
import Section from "../components/Section";
import ServiceIcon from "../components/ServiceIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Segment {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  image: string | null;
  gallery: string | null;
  active: boolean;
  order: number;
}

export default function SegmentoDetalhes() {
  const { slug } = useParams<{ slug: string }>();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [otherSegments, setOtherSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sending, setSending] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    fetchSegment();
    fetchOtherSegments();
  }, [slug]);

  const fetchSegment = async () => {
    try {
      const res = await fetch(`/api/seo-segments/${slug}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSegment(data);
    } catch {
      toast.error("Segmento não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherSegments = async () => {
    try {
      const res = await fetch("/api/seo-segments?active=true");
      const data = await res.json();
      // Filter out current segment and only show segments with slug
      const filtered = data.filter((s: Segment) => s.slug && s.slug !== slug).slice(0, 4);
      setOtherSegments(filtered);
    } catch {
      // Silent fail
    }
  };

  const galleryImages = segment?.gallery ? JSON.parse(segment.gallery) : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Preencha nome e e-mail");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: segment?.name || "",
          message: formData.message,
          source: "site",
        }),
      });

      if (!res.ok) throw new Error();
      
      toast.success("Mensagem enviada com sucesso!");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!segment) {
    return (
      <Section>
        <div className="text-center py-20">
          <h1 className="text-3xl font-display font-bold mb-4">Segmento não encontrado</h1>
          <Link to="/segmentos" className="text-accent hover:underline">
            Voltar para Segmentos
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <>
      <SEOHead
        title={segment.name}
        description={segment.subtitle || segment.description?.substring(0, 160) || `Conheça nossos serviços em ${segment.name}`}
      />

      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        {segment.image && (
          <div className="absolute inset-0">
            <img
              src={segment.image}
              alt={segment.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/70 to-navy-950" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/segmentos"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-6 hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para Segmentos
              </Link>

              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                  <ServiceIcon name={segment.icon || "Layers"} className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-4 drop-shadow-2xl">
                    {segment.name}
                  </h1>
                  {segment.subtitle && (
                    <p className="text-2xl text-white/90 max-w-3xl drop-shadow-lg">
                      {segment.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section with Sidebar */}
      <Section>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Gallery Section */}
                {galleryImages.length > 0 && (
                  <div className="mb-16">
                    <h2 className="text-3xl font-display font-bold mb-8">Galeria de Imagens</h2>
                    
                    {/* Main Image */}
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-navy-900 mb-4 group">
                      <img
                        src={galleryImages[currentImageIndex]}
                        alt={`${segment.name} - Imagem ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Navigation Arrows */}
                      {galleryImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          
                          {/* Counter */}
                          <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold">
                            {currentImageIndex + 1} / {galleryImages.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {galleryImages.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {galleryImages.map((img: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all ${
                              index === currentImageIndex
                                ? "ring-4 ring-accent scale-105"
                                : "ring-2 ring-border hover:ring-accent/50 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Miniatura ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {segment.description && (
                  <div
                    className="rich-text-content prose prose-lg max-w-none mt-16"
                    dangerouslySetInnerHTML={{ __html: segment.description }}
                  />
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Contact Form */}
                <Card className="border-accent/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-display font-bold mb-2">Como Podemos Ajudar?</h3>
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                      <ServiceIcon name={segment.icon || "Layers"} className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground">{segment.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Entre em contato e solicite um orçamento
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        placeholder="Nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="Telefone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      <Input
                        type="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                      <Textarea
                        placeholder="Mensagem"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                      <Button type="submit" className="w-full" disabled={sending}>
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" /> Enviar
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Other Services */}
                {otherSegments.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-display font-bold mb-4">Outros Serviços</h3>
                      <div className="space-y-3">
                        {otherSegments.map((s) => (
                          <Link
                            key={s.id}
                            to={`/segmentos/${s.slug}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                              <ServiceIcon name={s.icon || "Layers"} className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                                {s.name}
                              </p>
                              {s.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {s.subtitle}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <style>{`
        .rich-text-content {
          color: var(--foreground);
        }
        .rich-text-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--foreground);
        }
        .rich-text-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          color: var(--foreground);
        }
        .rich-text-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--foreground);
        }
        .rich-text-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .rich-text-content li {
          margin-bottom: 0.5rem;
        }
        .rich-text-content a {
          color: var(--accent);
          text-decoration: underline;
        }
        .rich-text-content a:hover {
          opacity: 0.8;
        }
        .rich-text-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .rich-text-content strong {
          font-weight: 600;
        }
        .rich-text-content em {
          font-style: italic;
        }
      `}</style>
    </>
  );
}
