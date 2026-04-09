import { Layers, Paintbrush, Store, Box, PanelTop, Wrench, Diamond, Gem, Hammer, Ruler, Scissors, Palette, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Layers, Paintbrush, Store, Box, PanelTop, Wrench, Diamond, Gem, Hammer, Ruler, Scissors, Palette,
};

interface ServiceIconProps {
  name: string;
  className?: string;
}

export default function ServiceIcon({ name, className = "w-6 h-6 text-accent" }: ServiceIconProps) {
  const Icon = iconMap[name] || Layers;
  return <Icon className={className} />;
}

export { iconMap };
