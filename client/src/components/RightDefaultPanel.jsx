import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClockOff, Ban, Link2 } from "lucide-react";
import Link from "./Link";

function RightDefaultPanel({ videoRef, files, setRefresh }) {
  const [tick, setTick] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const [tab, setTab] = useState("active");

  const links = useMemo(() => {
    if (!files) return [];

    const now = new Date();

    return files
      .flatMap((f) =>
        (f.links || [])
          .filter((l) => {
            const expiresAt = l.expiresAt ? new Date(l.expiresAt) : null;

            if (tab === "active") {
              return !l.isRevoked && (!expiresAt || now < expiresAt);
            }

            if (tab === "revoked") {
              return l.isRevoked;
            }

            return expiresAt && now >= expiresAt;
          })
          .map((l) => ({
            ...l,
            fileName: f.fileName,
          })),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [files, tab]);

  links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  console.log(links);

  const numberOfLinks = links?.length;

  useEffect(() => {
    requestAnimationFrame(() => {
      setLayoutReady(true);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (tab !== "active") return;
    if (!links || links.length === 0) return;

    const now = Date.now();

    const nextExpiry = links
      .filter((l) => !l.isRevoked && l.expiresAt)
      .map((l) => DateTime.fromISO(l.expiresAt, { zone: "utc" }).toMillis())
      .filter((t) => t > now)
      .sort((a, b) => a - b)[0];

    if (!nextExpiry) return;

    const delay = nextExpiry - now;

    const timeout = setTimeout(() => {
      setRefresh((r) => r + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [links, tab, setRefresh]);

  return (
    <div className="right-panel-div">
      <div className=" box video-player">
        <video
          ref={videoRef}
          style={{ width: "100%", borderRadius: "2rem" }}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/hillclimb.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="right-panel-link-list-div">
        <div className="file-display-heading-div link-display-right-panel-heading-div">
          <div className="file-display-heading link-display-right-panel-heading">
            Your Links
          </div>
          <div className="file-display-file-count">{numberOfLinks} links</div>
        </div>
        <motion.div className="right-panel-link-tab-div">
          <div
            onClick={() => {
              setTab("active");
            }}
            className="right-panel-tab-div"
          >
            <div
              className={`right-panel-tab ${tab === "active" ? "active-tab" : ""}`}
            >
              <Link2 size={tab === "active" ? "18" : "14"} />
              &nbsp;Active
            </div>
            {tab === "active" && (
              <motion.div
                layoutId="selected"
                transition={{ ease: "ease", duration: 0.3 }}
                className="right-panel-tab-overlay"
              ></motion.div>
            )}
          </div>
          <div
            onClick={() => {
              setTab("revoked");
            }}
            className="right-panel-tab-div"
          >
            <div
              className={`right-panel-tab ${tab === "revoked" ? "active-tab" : ""}`}
            >
              <Ban size={tab === "revoked" ? "18" : "14"} />
              &nbsp;Revoked
            </div>
            {tab === "revoked" && (
              <motion.div
                layoutId="selected"
                transition={{ ease: "ease", duration: 0.3 }}
                className="right-panel-tab-overlay"
              ></motion.div>
            )}
          </div>
          <div
            onClick={() => {
              setTab("expired");
            }}
            className="right-panel-tab-div"
          >
            <div
              className={`right-panel-tab ${tab === "expired" ? "active-tab" : ""}`}
            >
              <AlarmClockOff size={tab === "expired" ? "18" : "14"} />
              &nbsp;Expired
            </div>
            {tab === "expired" && (
              <motion.div
                layoutId="selected"
                transition={{ ease: "ease", duration: 0.3 }}
                className="right-panel-tab-overlay"
              ></motion.div>
            )}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="right-panel-link-list-scrollable-div"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {links.map((l, index) => (
                <Link
                  key={l._id}
                  layoutReady={layoutReady}
                  link={l}
                  tab={tab}
                  setRefresh={setRefresh}
                  fileName={l.fileName}
                  tick={tick}
                  page="default"
                  i={index + 1}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RightDefaultPanel;
