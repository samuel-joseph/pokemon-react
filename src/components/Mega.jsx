import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Mega = ({ frontImage, megaFrontImage, onFinish }) => {
  const [phase, setPhase] = useState("before"); // "before" -> "mega" -> "done"

  useEffect(() => {
    const timers = [];

    // Show Mega after 1s
    timers.push(
      setTimeout(() => {
        setPhase("mega");
      }, 4000)
    );

    // Finish after 3s (or whatever total duration you want)
    timers.push(
      setTimeout(() => {
        setPhase("done");
        onFinish();
      }, 8000)
    );

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  
  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80"
          style={{ pointerEvents: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {phase === "before" && (
            <motion.img
              key="before"
              src={frontImage}
              alt="Before Mega"
              className="w-64 h-64 sm:w-96 sm:h-96"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
          {phase === "mega" && (
            <motion.img
              key="after"
              src={megaFrontImage}
              alt="Mega Evolution"
              className="w-64 h-64 sm:w-96 sm:h-96"
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          )}

          {/* glowing overlay */}
          <motion.div
            className="absolute w-full h-full bg-white rounded-full opacity-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, yoyo: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Mega;
