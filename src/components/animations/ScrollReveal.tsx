import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
}

const ScrollReveal = ({ 
  children, 
  width = "fit-content",
  delay = 0,
  duration = 0.5 
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants: Variants = {
    hidden: { opacity: 0, y: 75 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ 
          duration, 
          delay,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollReveal;
