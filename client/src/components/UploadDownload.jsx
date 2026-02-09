import { motion } from "motion/react";
import truncateFilename from "../utilities/truncate";

function UploadDownload({ uploading, downloading, deleting }) {
  const rawTitle =
    uploading || downloading || deleting
      ? (
          uploading?.name ||
          downloading?.name ||
          deleting?.name ||
          "File.fileType"
        )
          .trim()
          .slice(0, 1)
          .toUpperCase() +
        (uploading?.name || downloading?.name || deleting?.name)
          ?.trim()
          .slice(1)
          .toLowerCase()
      : "File.fileType";

  const title = truncateFilename(rawTitle, 35);
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
        {uploading && `Uploading ${title?.trim()}`}
        {downloading && `Downloading ${title?.trim()}`}
        {deleting && `Deleting ${title?.trim()}`}
      </motion.span>
      <div className="loading-bar"></div>
    </motion.div>
  );
}

export default UploadDownload;
