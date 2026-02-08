import { AnimatePresence, motion } from "motion/react";

const pics = { ufo: "/ufo.svg", cat: "/cat.svg", dog: "/dog.svg" };

function Nothing({ message, pic = "ufo" }) {
  const link = pics[pic] || "/nothing.svg";
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="nothing-view"
      >
        <div className="nothing-view-image-div">
          <img className="nothing-image" src={link} />
        </div>
        <div className="nothing-message">
          {message || "Nothing to see here"}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Nothing;
