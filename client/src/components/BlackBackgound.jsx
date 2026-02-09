import { motion } from "motion/react";

function BlackBackgound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
      className="black-background"
    ></motion.div>
  );
}

export default BlackBackgound;
