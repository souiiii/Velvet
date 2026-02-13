import { Construction } from "lucide-react";
import { motion } from "motion/react";
import BgEffects from "../components/BgEffects";

const ComingSoon = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
    className="coming-soon"
  >
    <BgEffects />
    <div className="coming-soon__inner">
      <img className="coming-soon-logo" src="/logo3.svg" alt="logo" />
      <div className="coming-soon__badge">
        <Construction style={{ width: 16, height: 16 }} />
        Under Development
      </div>
      <h1 className="coming-soon__title">Coming Soon</h1>
      <p className="coming-soon__desc">
        We're crafting something special. This feature will be available
        shortly.
      </p>
      <a href="/" className="coming-soon__link">
        Back to Vault
      </a>
    </div>
  </motion.div>
);

export default ComingSoon;
