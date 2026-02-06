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
import { useEffect, useState } from "react";
import truncateFilename from "../utilities/truncate";

function Link({ link, fileName, tab, setRefresh, tick }) {
  const bee = tick;
  const expiresIn = link.expiresAt
    ? DateTime.fromISO(link.expiresAt, { zone: "utc" }).toRelative()
    : "never";

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

  useEffect(() => {
    if (tab !== "active") return;
    if (!link.expiresAt) return;

    const expiresAt = DateTime.fromISO(link.expiresAt, {
      zone: "utc",
    }).toMillis();
    const now = Date.now();
    const delay = expiresAt - now;

    if (delay <= 0) {
      setRefresh((r) => r + 1);
      return;
    }

    const timeout = setTimeout(() => {
      setRefresh((r) => r + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [link.expiresAt, tab, setRefresh]);

  return (
    <div className="box link-box">
      <div className="link-top-heading-div">
        <div className="link-top-heading-inner-div">
          <div className="link-top-heading">{title}</div>
          <div className="link-ago-time-created">
            {timeAgo === "0 seconds ago" ? "Just now" : timeAgo}
          </div>
        </div>
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
      </div>
      <div className="link-display-action-div">
        <div className="link-display">{link.publicId}</div>
        <div className="link-action-inner-div">
          <div className="link-action-copy">
            <Copy size={14} />
          </div>
          <div className="link-action-redirect">
            <ExternalLink size={14} />
          </div>
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
      <div className="link-display-edit-revoke-div">
        <button className="settings link-display-edit-button">
          <SquarePen size={14} />
          Edit Link
        </button>
        <button className="link-display-revoke-button">
          <Ban size={16} />
        </button>
      </div>
    </div>
  );
}

export default Link;
