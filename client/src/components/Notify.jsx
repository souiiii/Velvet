import { Ban, CircleCheckBig } from "lucide-react";
import { motion } from "motion/react";

function Notify({ msg = "default", type = "err" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: "-50%", y: -60 }}
      animate={{ opacity: 1, x: "-50%", y: 0 }}
      exit={{ opacity: 0, x: "-50%", y: -60 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`popup ${type === "err" ? "err-popup" : "msg-popup"}`}
    >
      <p>
        {type === "err" ? (
          <Ban className="non-shrinkable" size={20} />
        ) : (
          <CircleCheckBig className="non-shrinkable" size={20} />
        )}
        &nbsp;
        {msg}
      </p>
    </motion.div>
  );
}

export default Notify;
