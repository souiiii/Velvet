import { useState } from "react";
import { motion } from "motion/react";
import { AlarmClockOff, Ban, Link2 } from "lucide-react";

function RightDefaultPanel({ videoRef }) {
  const [tab, setTab] = useState("active");
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
          <source src="/velvet2.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="right-panel-link-list-div">
        <div className="file-display-heading-div link-display-right-panel-heading-div">
          <div className="file-display-heading link-display-right-panel-heading">
            Your Links
          </div>
          <div className="file-display-file-count">5 links</div>
        </div>
        <div className="right-panel-link-tab-div">
          <div onClick={() => setTab("active")} className="right-panel-tab-div">
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
            onClick={() => setTab("revoked")}
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
            onClick={() => setTab("expired")}
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
        </div>
      </div>
    </div>
  );
}

export default RightDefaultPanel;
