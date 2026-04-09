interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
}

export default function SectionHeader({ badge, title, subtitle, light, center = true }: SectionHeaderProps) {
  return (
    <div className={`mb-12 md:mb-16 ${center ? "text-center" : ""}`}>
      {badge && (
        <span className={`inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 ${light ? "text-accent" : "text-accent"}`}>
          {badge}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight ${light ? "text-white" : "text-foreground"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg max-w-2xl ${center ? "mx-auto" : ""} ${light ? "text-navy-300" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
