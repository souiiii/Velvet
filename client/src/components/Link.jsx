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
import { useAuth } from "../contexts/useAuth";

function Link({
  setErr,
  setMsg,
  link,
  setEditLink = () => {},
  isSmallMobile,
  fileName,
  layout,
  tab,
  editLink,
  setRefresh,
  tick,
  // layoutReady,
  page = "",
  i = 0,
}) {
  const [copySuccess, setCopySuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const values = useAuth();

  const expiresIn = link.expiresAt
    ? DateTime.fromISO(link.expiresAt, { zone: "utc" }).toRelative()
    : "never";
  const bee = tick;
  const valueToCopy = `localhost:5173/link/${link.publicId}`;

  const maxDownloads = link?.maxDownloads || null;

  const timeAgo =
    DateTime.fromISO(link.createdAt, {
      zone: "utc",
    }).toRelative() || "Some time ago";

  const rawTitle = fileName
    ? fileName.trim().slice(0, 1).toUpperCase() +
      fileName.trim().slice(1).toLowerCase()
    : "File";

  const title = truncateFilename(rawTitle, isSmallMobile ? 20 : 24);

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
        setMsg(data.msg);
        setEditLink(null);
        setRefresh((r) => r + 1);
      } else {
        const data = await res.json();
        if (res.status === 401) values.setUser(null);
        throw new Error(data.err);
      }
    } catch (err) {
      setErr(err.message);
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: 1,
        x: 0,
        // Stagger: The first item waits 0.05s, the second 0.10s, etc.
        transition: { delay: i * 0.05, duration: 0.3 },
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
      }}
      // exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: "easeIn" }}
      className={`box link-box ${editLink?._id?.toString() === link?._id?.toString() ? "editing-curr-link" : ""} ${loading ? "opacity-nill" : ""}`}
      layout={layout}
      // layout
      // layout="position"
    >
      <div className="link-top-heading-div">
        <div className="link-top-heading-inner-div">
          <div className="link-top-heading">{title}</div>
          <div className="link-ago-time-created">
            {timeAgo === "0 seconds ago" || timeAgo === "in 0 seconds"
              ? "Just now"
              : timeAgo}
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
        <div className="link-display">localhost:5173/link/{link.publicId}</div>
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
            href={`http:/link/${link.publicId}`}
            target="_blank"
            className="link-action-redirect"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div className="link-display-action-downloads-expiry-div">
        <div className="link-display-action-downloads">
          {link.downloads}&nbsp;of&nbsp;
          {maxDownloads || <Infinity size={12} />}
          &nbsp;downloads
        </div>
        <div className="link-display-action-expiry">
          {tab === "active" ? "Expires" : tab === "expired" ? "Expired" : ""}{" "}
          {tab === "revoked" ? "Revoked" : expiresIn}
        </div>
      </div>
      {tab === "active" && (
        <div className="link-display-edit-revoke-div">
          <button
            onClick={() => setEditLink({ ...link, i: i })}
            className={`settings link-display-edit-button ${page === "default" ? "none-display" : ""}`}
          >
            <SquarePen size={16} />
            Edit Link {i + 1}
          </button>
          <button
            onClick={handleRevoke}
            disabled={loading}
            className={`link-display-revoke-button ${loading ? "banning" : ""} ${page === "default" ? "label upgrade-storage take-all-space-button" : ""}`}
          >
            <Ban size={16} />
            {page === "default" && <span>Revoke Link {i + 1}</span>}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default Link;
