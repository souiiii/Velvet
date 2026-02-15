import { motion, AnimatePresence } from "motion/react";
import Loader from "./Loader";

function PageLoader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Loader />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageLoader;
