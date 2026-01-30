import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { LogOut, Settings, Shield } from "lucide-react";

function LeftPanel({ name, email }) {
  const nameSplit = name.trim().split(" ");
  const firstLetter = nameSplit[0].slice(0, 1);
  const values = useAuth();
  const [loading, setLoading] = useState(false);
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
        {/* <button>Upgrade S</button> */}
      </div>
      <div className="box"></div>
    </div>
  );
}

export default LeftPanel;
