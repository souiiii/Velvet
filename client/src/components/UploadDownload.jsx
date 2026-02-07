import { motion } from "motion/react";

function UploadDownload({ uploading, downloading, deleting }) {
  return (
    <motion.div
      initial={{ x: "-50%", y: "-4rem", opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      exit={{ x: "-50%", y: "-4rem", opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.4 }}
      className="uploading-now"
    >
      <motion.span
        key={uploading?.name || downloading?.name || deleting?.name}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="uploading-text"
      >
        {uploading && `Uploading ${uploading?.name.trim()}`}
        {downloading && `Downloading ${downloading?.name.trim()}`}
        {deleting && `Deleting ${deleting?.name.trim()}`}
      </motion.span>
    </motion.div>
  );
}

export default UploadDownload;
