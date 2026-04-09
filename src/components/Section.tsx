import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}

export default function Section({ children, className = "", id, dark }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-20 md:py-28 px-6 ${dark ? "bg-navy-950 text-white" : ""} ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto"
      >
        {children}
      </motion.div>
    </section>
  );
}
