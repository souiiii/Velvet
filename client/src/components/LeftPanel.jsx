import { useRef, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import {
  AlarmClockOff,
  Ban,
  CloudDownload,
  FileText,
  Link,
  Link2,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect } from "react";
import { motion } from "motion/react";

function LeftPanel({
  name,
  email,
  storageUsed,
  numberOfFiles,
  activeLinks,
  revokedLinks,
  expiredLinks,
  totalDownloads,
}) {
  const nameSplit = name.trim().split(" ");
  const firstLetter = nameSplit[0].slice(0, 1);
  const values = useAuth();
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(null);
  const lastLetter =
    nameSplit.length > 1 ? nameSplit[nameSplit.length - 1].slice(0, 1) : "";

  const normalizedName = (
    firstLetter.toUpperCase() +
    nameSplit[0].slice(1) +
    " " +
    (nameSplit.length > 1
      ? lastLetter.toUpperCase() + nameSplit[nameSplit.length - 1].slice(1)
      : "")
  ).trim();

  const storage =
    storageUsed < 100000
      ? Math.floor(storageUsed / 1000) + " KB"
      : Math.floor(storageUsed / 100000) % 10 === 0
        ? Math.floor(Math.floor(storageUsed / 100000) / 10) + " MB"
        : Math.floor(storageUsed / 100000) / 10 + " MB";

  const leftStorage =
    storageUsed > 99000000
      ? Math.ceil((100000000 - storageUsed) / 1000) + " KB"
      : Math.ceil(storageUsed / 100000) % 10 === 0
        ? Math.ceil(Math.ceil((100000000 - storageUsed) / 100000) / 10) + " MB"
        : Math.ceil((100000000 - storageUsed) / 100000) / 10 + " MB";

  const percentage = Math.floor(storageUsed / 1000000);

  const storageMeterStyles = {
    // Customize the root svg element
    root: {},
    // Customize the path, i.e. the "completed progress"
    path: {
      // Path color
      stroke: `#e14848`,
      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
      strokeLinecap: "rounded",
      // Customize transition animation
      transition: "stroke-dashoffset 1.5s ease-out 0s",
      // Rotate the path
      //   transform: "rotate(0.25turn)",
      transformOrigin: "center center",
    },
    // Customize the circle behind the path, i.e. the "total progress"
    trail: {
      // Trail color
      stroke: "#1E2229",
      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
      strokeLinecap: "round",
      // Rotate the trail
      //   transform: "rotate(0.25turn)",
      transformOrigin: "center center",
    },
    // Customize the text
    text: {
      // Text color
      fill: "#f0f2f5",
      // Text size
      fontSize: "1.4rem",
      fontWeight: 700,
      fontFamily: "Noto Sans",
      lineHeight: "2rem",
      transform: "translateY(-5%)",
    },
    // Customize background - only used when the `background` prop is true
    background: {
      fill: "#df3939",
    },
  };

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  useEffect(
    function meter() {
      let raf;
      const duration = 1600;
      const start = performance.now();

      function animate(now) {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);

        if (percentRef.current) {
          percentRef.current.innerText = `${Math.round(eased * percentage)}%`;
        }

        if (t < 1) {
          raf = requestAnimationFrame(animate);
        }
      }

      raf = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(raf);
    },
    [percentage],
  );

  async function handleLogout() {
    try {
      setLoading(true);
      const res = await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.status === 200) {
        values.setUser(null);
      } else {
        console.log(data.err);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="left-panel-inner-div">
      <div className="box">
        <div className="profileDiv">
          <div className="profilePic">
            {firstLetter.toUpperCase()}
            {lastLetter.toUpperCase()}
          </div>
          <div className="nameDiv">
            <div className="name">{normalizedName}</div>
            <div className="email">{email}</div>
          </div>
        </div>
        <div className="user-util-div">
          <div className="user-interaction">
            <div className="settings">
              <Settings size={16} />
              <span>Settings</span>
            </div>
            <button
              className="logout"
              disabled={loading}
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="label">
            <Shield size={16} />
            <span>Security You Control</span>
          </div>
        </div>
      </div>
      <div className="box">
        <h1 className="storage-heading">Storage</h1>
        <div className="storage-meter-outer-div">
          <div className="storage-meter-div">
            <CircularProgressbarWithChildren
              value={percentage}
              styles={storageMeterStyles}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="percentage"
                ref={percentRef}
              >
                0%
              </motion.div>
              <div className="used">Used</div>
            </CircularProgressbarWithChildren>
          </div>
          <div className="storage-info-div">
            <div className="storageInfo">
              {storage === "0 KB" ? "0 MB" : storage}{" "}
              <span>&nbsp;of&nbsp;</span> 100 MB
            </div>
            <div className="remaining-storage">{leftStorage} available</div>
          </div>
        </div>

        <button className="label upgrade-storage">
          <span>Upgrade Storage</span>
        </button>
      </div>
      <div className="box">
        <div className="quick-stats-div">
          <div className="quick-stats-heading">Quick Stats</div>
          <div className="stats-div">
            <div className="stat">
              <div className="stat-logo-div">
                <FileText size={16} />
              </div>
              <div className="stat-block">
                <div className="stat-block-heading">Total Files</div>
                <div className="value-stat">{numberOfFiles}</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat-logo-div">
                <Link2 size={16} />
              </div>
              <div className="stat-block">
                <div className="stat-block-heading">Active Links</div>
                <div className="value-stat">{activeLinks}</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat-logo-div">
                <CloudDownload size={16} />
              </div>
              <div className="stat-block">
                <div className="stat-block-heading">Total Downloads</div>
                <div className="value-stat">{totalDownloads}</div>
              </div>
            </div>
            <div className="stat">
              <div className="stat-logo-div">
                <AlarmClockOff size={16} />
              </div>
              <div className="stat-block">
                <div className="stat-block-heading">Expired Links</div>
                <div className="value-stat">{expiredLinks}</div>
              </div>
            </div>
            <div className="stat last">
              <div className="stat-logo-div">
                <Ban size={16} />
              </div>
              <div className="stat-block ">
                <div className="stat-block-heading">Revoked Links</div>
                <div className="value-stat">{revokedLinks}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
