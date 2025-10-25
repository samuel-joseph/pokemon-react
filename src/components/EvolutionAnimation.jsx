import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EvolutionAnimation = ({ frames = [], duration = 3000, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!frames.length) return;

    const intervalTime = duration / frames.length;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 >= frames.length) {
          clearInterval(timer);
          onFinish && onFinish();
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [frames, duration, onFinish]);

  if (!frames.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80"
        style={{ pointerEvents: "none" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.img
          key={currentIndex}
          src={frames[currentIndex]}
          alt="Evolving Pokémon"
          className="w-40 h-40 sm:w-56 sm:h-56"
          initial={{ scale: 0 }}
          animate={{ scale: 1.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / frames.length / 1000, ease: "easeOut" }}
        />

        {/* optional glowing overlay */}
        <motion.div
          className="absolute w-full h-full bg-white rounded-full opacity-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, yoyo: Infinity }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default EvolutionAnimation;
