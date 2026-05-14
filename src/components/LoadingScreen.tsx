import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simular carga progresiva
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
            onLoadingComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          {/* Imagen de fondo con overlay oscuro */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <motion.img
              src="/loading-screen.png"
              alt="Cargando..."
              className="w-full h-full object-contain md:object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ objectPosition: 'center' }}
            />
            {/* Overlay para mejorar legibilidad */}
            <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
          </div>

          {/* Partículas flotantes extras para más vida - menos en móvil */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white hidden md:block"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, Math.random() * 0.8 + 0.2, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Partículas reducidas para móvil */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`mobile-${i}`}
                className="absolute rounded-full bg-white md:hidden"
                style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, Math.random() * 0.6 + 0.2, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Efecto de brillo giratorio sobre el jugador - adaptado a mobile */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] pointer-events-none"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-2xl md:blur-3xl" />
          </motion.div>

          {/* Círculo pulsante detrás del jugador - adaptado a mobile */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Barra de progreso y texto en la parte inferior - responsive */}
          <div className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 w-full max-w-xs md:max-w-md px-6 md:px-4 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center mb-4 md:mb-6"
            >
              <motion.p
                className="text-white text-xs md:text-base font-medium tracking-wider mb-2 drop-shadow-lg"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Cargando experiencia premium...
              </motion.p>
            </motion.div>

            {/* Barra de progreso moderna */}
            <div className="relative">
              <div className="h-1 md:h-1.5 bg-gray-800/70 rounded-full overflow-hidden backdrop-blur-sm border border-white/20 shadow-lg">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Efecto de brillo en la barra */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Porcentaje */}
              <motion.div
                className="absolute -top-7 md:-top-8 right-0 text-white text-xs md:text-sm font-mono bg-black/50 backdrop-blur-sm px-2 md:px-3 py-1 rounded shadow-lg border border-white/10"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>
          </div>

          {/* Efecto de destello ocasional */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/5 to-blue-500/0 pointer-events-none"
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
