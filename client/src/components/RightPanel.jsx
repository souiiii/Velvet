import { useState } from "react";
import { motion } from "motion/react";
import { AlarmClockOff, Ban, Link2 } from "lucide-react";
import CreateLink from "./CreateLink";
import Link from "./Link";

function RightPanel({ selectedFile = {}, setRightOpen, setRefresh }) {
  const [tab, setTab] = useState("active");
  const links = selectedFile.links;

  const now = new Date();

  const relevantLinks = (
    links?.filter((l) => {
      const expiresAt = l.expiresAt ? new Date(l.expiresAt) : null;

      if (tab === "active") {
        return !l.isRevoked && (!expiresAt || now < expiresAt);
      }

      if (tab === "revoked") {
        return l.isRevoked;
      }

      return expiresAt && now >= expiresAt;
    }) || []
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const numberOfLinks = relevantLinks.length;

  return (
    <div className="right-panel-div">
      <CreateLink
        setRefresh={setRefresh}
        setRightOpen={setRightOpen}
        selectedFile={selectedFile}
      />
      <div className="right-panel-link-list-div">
        <div className="file-display-heading-div link-display-right-panel-heading-div">
          <div className="file-display-heading link-display-right-panel-heading">
            Your Links
          </div>
          <div className="file-display-file-count">{numberOfLinks} links</div>
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
        <div className="right-panel-link-list-scrollable-div">
          {relevantLinks.map((l) => (
            <Link
              key={"34ra" + l._id + "33534"}
              link={l}
              fileName={selectedFile.fileName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
