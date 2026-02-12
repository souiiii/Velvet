import { motion } from "motion/react";

function BgEffects() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="signup-bg-effects"
      >
        <div class="signup-glow-primary"></div>
        <div class="signup-glow-magenta"></div>
        <div class="signup-grid-overlay"></div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        class="signup-float-dot signup-float-dot-1"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        class="signup-float-dot signup-float-dot-2"
      ></motion.div>
    </>
  );
}

export default BgEffects;
