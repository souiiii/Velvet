import { ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="main"
    >
      <div className="container middle">
        <div className="box download-file-container-box not-found-box">
          <div className="not-found-warning-div">
            <ShieldAlert size={32} />
          </div>
          <div className="not-found-heading">Link Not Found</div>
          <div className="not-found-para">
            This link doesn't exist or has been removed by the owner.
          </div>
        </div>
        <div className="link-page-footer">
          Secure file sharing powered by <span>Velvet</span>
        </div>
      </div>
    </motion.div>
  );
}

export default NotFound;
