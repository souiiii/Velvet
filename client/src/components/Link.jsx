import { motion } from "motion/react";

import {
  Ban,
  Copy,
  ExternalLink,
  Gauge,
  Infinity,
  Shield,
  SquarePen,
} from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import truncateFilename from "../utilities/truncate";
import { AnimatePresence } from "motion/react";

function Link({
  link,
  fileName,
  tab,
  setRefresh,
  tick,
  layoutReady,
  page = "",
  i = 0,
}) {
  const [copySuccess, setCopySuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const expiresIn = link.expiresAt
    ? DateTime.fromISO(link.expiresAt, { zone: "utc" }).toRelative()
    : "never";
  const bee = tick;
  const valueToCopy = link.publicId;

  const timeAgo =
    DateTime.fromISO(link.createdAt, {
      zone: "utc",
    }).toRelative() || "Some time ago";

  const rawTitle = fileName
    ? fileName.trim().slice(0, 1).toUpperCase() + fileName.trim().slice(1)
    : "File";

  const title = truncateFilename(rawTitle, 24);

  const badge =
    tab === "active" && link.password
      ? "Secure"
      : link.maxDownloads
        ? "Limited"
        : "Unlimited";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 1500);
    } catch (err) {
      setCopySuccess("Failed to copy!");
      console.log(err.message);
    }
  };

  async function handleRevoke() {
    try {
      setLoading(true);
      const res = await fetch(`/api/file/revoke-link/${link.publicId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data.msg);
        setRefresh((r) => r + 1);
      } else {
        const data = await res.json();
        throw new Error(data.err);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: "easeIn" }}
      className="box link-box"
      layout={layoutReady}
    >
      <div className="link-top-heading-div">
        <div className="link-top-heading-inner-div">
          <div className="link-top-heading">{title}</div>
          <div className="link-ago-time-created">
            {timeAgo === "0 seconds ago" ? "Just now" : timeAgo}
          </div>
        </div>
        {tab === "active" && (
          <div
            className={`link-top-heading-badge ${badge === "Limited" ? "yell" : badge === "Unlimited" ? "gren" : "re"}`}
          >
            {badge === "Limited" ? (
              <Gauge size={12} />
            ) : badge === "Unlimited" ? (
              <Infinity size={12} />
            ) : (
              <Shield size={12} />
            )}
            {badge}
          </div>
        )}
      </div>
      <div className="link-display-action-div">
        <div className="link-display">{link.publicId}</div>
        <div className="link-action-inner-div">
          <div onClick={copyToClipboard} className="link-action-copy">
            <Copy size={14} />
            <AnimatePresence>
              {copySuccess && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="copied-link"
                  >
                    Copied
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="copied-link-arrow"
                  ></motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <a
            href={`${link.publicId}`}
            target="_blank"
            className="link-action-redirect"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div className="link-display-action-downloads-expiry-div">
        <div className="link-display-action-downloads">
          {link.downloads} downloads
        </div>
        <div className="link-display-action-expiry">
          {tab === "active" ? "Expires" : tab === "expired" ? "Expired" : ""}{" "}
          {tab === "revoked" ? "Revoked" : expiresIn}
        </div>
      </div>
      {tab === "active" && (
        <div className="link-display-edit-revoke-div">
          <button
            className={`settings link-display-edit-button ${page === "default" ? "none-display" : ""}`}
          >
            <SquarePen size={14} />
            Edit Link
          </button>
          <button
            onClick={handleRevoke}
            disabled={loading}
            className={`link-display-revoke-button ${loading ? "banning" : ""} ${page === "default" ? "label upgrade-storage take-all-space-button" : ""}`}
          >
            <Ban size={16} />
            {page === "default" && <span>Revoke Link {i}</span>}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default Link;
