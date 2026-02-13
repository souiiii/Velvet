import { Clock, Eye, Link2 } from "lucide-react";
import { motion } from "motion/react";

function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hero-div"
    >
      <div className="logo-velvet-hero-div">
        <img src="/logo3.svg" alt="logo" />
      </div>
      <div className="hero-main-heading">Share freely.</div>
      <div className="hero-sub-heading">Control stays yours.</div>
      <div className="hero--heading-description ">
        A premium encrypted vault for creating customizable public links with
        expiry, passwords, and download tracking.
      </div>
      <div className="hero-features-div ">
        <div className="hero-feature">
          <div className="hero-logo-feature-div">
            <Link2 size={16} />
          </div>
          <span>Custom shareable links with full access control</span>
        </div>
        <div className="hero-feature">
          <div className="hero-logo-feature-div">
            <Clock size={16} />
          </div>
          <span>Auto-expiring links that self-destruct on schedule</span>
        </div>
        <div className="hero-feature">
          <div className="hero-logo-feature-div">
            <Eye size={16} />
          </div>
          <span>Real-time view and download tracking</span>
        </div>
      </div>
    </motion.div>
  );
}

export default Hero;
