import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CloudDownload,
  FileText,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState, useRef } from "react";
import truncateFilename from "../utilities/truncate";

const MotionChevronUp = motion.create(ChevronUp);
const MotionChevronDown = motion.create(ChevronDown);

dayjs.extend(utc);

function CreateLink({ setRightOpen, selectedFile, setRefresh, setTab }) {
  const [loading, setLoading] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [expiry, setExpiry] = useState("never");
  const [clickOnDropDown, setClickOnDropDown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // const expiresAt =

  const rawTitle = selectedFile.fileName
    ? selectedFile.fileName.trim().slice(0, 1).toUpperCase() +
      selectedFile.fileName.trim().slice(1)
    : "File.fileType";

  const title = truncateFilename(rawTitle, 40);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setClickOnDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isChecked && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [isChecked]);

  function getExpiresAt() {
    if (expiry === "never") return null;

    const now = dayjs().utc();

    switch (expiry) {
      case "1 hour":
        return now.add(1, "hour").toISOString();
      case "1 day":
        return now.add(1, "day").toISOString();
      case "7 days":
        return now.add(7, "day").toISOString();
      case "1 month":
        return now.add(1, "month").toISOString();
      case "1 year":
        return now.add(1, "year").toISOString();
      default:
        return null;
    }
  }

  async function handleSubmit() {
    const payload = {};
    if (maxDownloads) payload.maxDownloads = maxDownloads;

    if (expiry !== "never") payload.expiresAt = getExpiresAt();
    payload.isPassEnabled = isChecked;
    if (password) payload.password = password;
    try {
      setLoading(true);
      const res = await fetch(`/api/file/create-link/${selectedFile._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data.msg);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.err);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
      setMaxDownloads("");
      setIsChecked(false);
      setPassword("");
      setExpiry("never");
      setRefresh((r) => r + 1);
      setTab("active");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className="box"
    >
      <div className="create-link-heading-div">
        <div className="create-link-heading-inner-div">
          <div className="create-link-heading-logo-div">
            <Sparkles size={14} />
          </div>
          <span>Create Link</span>
        </div>
        <div
          onClick={() => setRightOpen("")}
          className="close-right-panel-button"
        >
          <X size={18} />
        </div>
      </div>
      <div className="create-link-file-name-div">
        <FileText size={14} />
        <span>{title}</span>
      </div>
      <div className="create-link-option-action-div">
        <div className="create-link-expiry-div">
          <div className="create-link-subheading">
            <Clock size={12} />
            &nbsp;EXPIRES IN
          </div>
          <div ref={dropdownRef} className="create-link-select">
            <button
              type="button"
              onClick={() => setClickOnDropDown((o) => !o)}
              className="select-trigger"
            >
              <span>{expiry}</span>
              <motion.div className="arrow-div-outer">
                <AnimatePresence>
                  {clickOnDropDown ? (
                    <MotionChevronUp
                      color="gray"
                      initial={{ rotate: "90deg" }}
                      animate={{ rotate: "0deg" }}
                      exit={{ rotate: "90deg" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      size={16}
                    />
                  ) : (
                    <MotionChevronDown
                      color="gray"
                      initial={{ rotate: "-90deg" }}
                      animate={{ rotate: "0deg" }}
                      exit={{ rotate: "-90deg" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      size={16}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </button>
            <AnimatePresence>
              {clickOnDropDown && (
                <motion.ul
                  initial={{ opacity: 0, y: -80, scaleY: 0 }}
                  animate={{ opacity: 1, y: 2, scaleY: 1 }}
                  exit={{ opacity: 0, y: -80, scaleY: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="select-menu"
                >
                  <li
                    onClick={() => {
                      setExpiry("1 hour");
                      setClickOnDropDown(false);
                    }}
                    className={`${expiry === "1 hour" ? "create-link-select-selected" : ""}`}
                  >
                    <span>✔&nbsp;</span>1 hour
                  </li>
                  <li
                    onClick={() => {
                      setExpiry("1 day");
                      setClickOnDropDown(false);
                    }}
                    className={`${expiry === "1 day" ? "create-link-select-selected" : ""}`}
                  >
                    <span>✔&nbsp;</span>1 day
                  </li>
                  <li
                    onClick={() => {
                      setExpiry("7 days");
                      setClickOnDropDown(false);
                    }}
                    className={`${expiry === "7 days" ? "create-link-select-selected" : ""}`}
                  >
                    <span>✔&nbsp;</span>7 days
                  </li>
                  <li
                    onClick={() => {
                      setExpiry("1 month");
                      setClickOnDropDown(false);
                    }}
                    className={`${expiry === "1 month" ? "create-link-select-selected" : ""}`}
                  >
                    <span>✔&nbsp;</span>1 month
                  </li>
                  <li
                    onClick={() => {
                      setExpiry("1 year");
                      setClickOnDropDown(false);
                    }}
                    className={`${expiry === "1 year" ? "create-link-select-selected" : ""}`}
                  >
                    <span>✔&nbsp;</span>1 year
                  </li>
                  <li
                    onClick={() => {
                      setExpiry("never");
                      setClickOnDropDown(false);
                    }}
                    className={`${expiry === "never" ? "create-link-select-selected" : ""}`}
                  >
                    <span>✔&nbsp;</span>never
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="create-link-max-download-div">
          <div className="create-link-subheading">
            <CloudDownload size={12} />
            &nbsp;MAX DOWNLOADS
          </div>
          <input
            className="create-link-input-fields"
            type="number"
            value={maxDownloads}
            placeholder="Unlimited"
            onChange={(e) => setMaxDownloads(e.target.value)}
            min={1}
            max={1000000000}
            name="maxDownloads"
          />
        </div>
      </div>
      <div className="create-link-password-div">
        <div
          name="isPassword"
          onClick={() => setIsChecked((o) => !o)}
          className={`create-link-password-checkbox ${isChecked ? "click-password-checkbox" : ""}`}
        >
          {isChecked && <span>✔</span>}
        </div>
        <label htmlFor="password-input" className="password-message">
          <Lock size={12} />
          &nbsp;<span>Password</span>
        </label>
        <input
          id="password-input"
          ref={inputRef}
          className={`create-link-input-fields ${!isChecked ? "disabled-input-field" : ""}`}
          disabled={!isChecked}
          required={isChecked}
          name="password"
          placeholder="example: xyz"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          minLength={3}
          maxLength={25}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`action-button create-butt ${loading && "disabled-create-button"}`}
      >
        <span>+</span>&nbsp;{loading ? "Creating Link..." : "Create Link"}
      </button>
    </form>
  );
}

export default CreateLink;
