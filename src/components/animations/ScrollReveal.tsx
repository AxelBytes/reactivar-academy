import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

const ScrollReveal = ({ 
  children, 
  width = "fit-content",
  delay = 0,
  duration = 0.5,
  direction = "up"
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getVariants = (): Variants => {
    const directions = {
      up: { hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } },
      down: { hidden: { opacity: 0, y: -75 }, visible: { opacity: 1, y: 0 } },
      left: { hidden: { opacity: 0, x: 75 }, visible: { opacity: 1, x: 0 } },
      right: { hidden: { opacity: 0, x: -75 }, visible: { opacity: 1, x: 0 } }
    };
    return directions[direction];
  };

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={getVariants()}
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
