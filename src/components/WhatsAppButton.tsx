import { useSettings } from "@/contexts/SettingsContext";

export default function WhatsAppButton() {
  const settings = useSettings();
  const phone = settings.site_phone || "(11) 98998-0791";
  const phoneClean = phone.replace(/\D/g, ""); // Remove tudo que não é número
  const whatsappLink = `https://wa.me/55${phoneClean}?text=Olá! Gostaria de solicitar um orçamento.`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all hover:-translate-y-1 group"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.117 1.533 5.845L0 24l6.335-1.56C8.035 23.44 9.975 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.665-.522-5.176-1.43l-.37-.22-3.758.926.996-3.65-.243-.382C2.533 15.635 2 13.878 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </a>
  );
}
