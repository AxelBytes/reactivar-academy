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
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
        >
          {/* Partículas de fondo animadas */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: Math.random() * 0.5 + 0.3,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [null, Math.random() * 0.8, Math.random() * 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Contenedor principal */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo con animación de pulso */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.img
                src="/logo.svg"
                alt="Reactivar Academy"
                className="w-32 h-32 md:w-40 md:h-40"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Jugador con animación de flotación y rebote */}
            <motion.div
              className="relative mb-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: [0, -20, 0],
                opacity: 1,
              }}
              transition={{
                y: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.5,
                }
              }}
            >
              {/* Círculo brillante con efecto de pulso */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Ícono de jugador simplificado con animación */}
              <motion.div
                className="relative z-10"
                animate={{
                  rotateY: [0, 10, 0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Pelota con animación */}
                  <motion.circle
                    cx="80"
                    cy="25"
                    r="8"
                    fill="#3B82F6"
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Jugador simplificado */}
                  <circle cx="60" cy="35" r="12" fill="#EF4444" />
                  <motion.path
                    d="M 60 47 Q 55 70, 45 90 M 60 47 Q 65 70, 75 90 M 60 55 L 75 65 M 60 55 L 45 65"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    animate={{
                      d: [
                        "M 60 47 Q 55 70, 45 90 M 60 47 Q 65 70, 75 90 M 60 55 L 75 65 M 60 55 L 45 65",
                        "M 60 47 Q 55 70, 43 88 M 60 47 Q 65 70, 77 88 M 60 55 L 78 60 M 60 55 L 42 60",
                        "M 60 47 Q 55 70, 45 90 M 60 47 Q 65 70, 75 90 M 60 55 L 75 65 M 60 55 L 45 65",
                      ]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </motion.div>

              {/* Estrellas flotantes alrededor del jugador */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 80}px`,
                    top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 80}px`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>

            {/* Texto animado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center mb-8"
            >
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-white mb-2"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                CARGANDO REACTIVAR ACADEMY...
              </motion.h2>
              <p className="text-blue-300 text-lg md:text-xl font-medium">
                IMPULSANDO TU JUEGO.
              </p>
            </motion.div>

            {/* Barra de progreso */}
            <div className="w-64 md:w-80 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Porcentaje */}
            <motion.p
              className="text-white text-sm mt-4 font-mono"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
