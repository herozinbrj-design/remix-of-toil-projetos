import { motion } from "framer-motion";
import { useAnimation } from "@/contexts/AnimationContext";

interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

export default function BlurReveal({ children, delay = 0, className, onClick }: BlurRevealProps) {
  const { enabled, blurPx, translateY, duration, repeat } = useAnimation();

  if (!enabled) {
    return <div className={className} onClick={onClick}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, filter: `blur(${blurPx}px)`, y: translateY }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: !repeat, amount: 0.1 }}
      transition={{ duration, delay, ease: [0.5, 0, 0, 1] }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
