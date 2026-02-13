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
        <div className="signup-glow-primary"></div>
        <div className="signup-glow-magenta"></div>
        <div className="signup-grid-overlay"></div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="signup-float-dot signup-float-dot-1"
      ></motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="signup-float-dot signup-float-dot-2"
      ></motion.div>
    </>
  );
}

export default BgEffects;
