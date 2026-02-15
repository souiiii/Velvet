import {
  Download,
  DownloadCloud,
  FileText,
  ShieldCheckIcon,
  Archive,
  FileQuestion,
  Film,
  Image,
  Eye,
  EyeOff,
  HatGlasses,
  Music,
  User,
  Link,
  Ban,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Link as Linkk, useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";
import { LayoutGroup, motion, AnimatePresence } from "motion/react";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import truncateFilename from "../utilities/truncate";
import PageLoader from "../components/PageLoader";
import NotFound from "../components/NotFound";
import BgEffects from "../components/BgEffects";

const imageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

const documentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];

const audioTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "audio/mp4",
];

const videoTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/quicktime",
];

const compressedTypes = [
  "application/zip",
  "application/x-rar",
  "application/x-7z-compressed",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
];

const otherTypes = ["application/octet-stream"];

function LinkPage({ loading, setLoading, setMsg, setErr }) {
  const [link, setLink] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [eye, setEye] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [isSmallMobile, setIsSmallMobile] = useState(
    window.matchMedia("(max-width: 1000px)").matches,
  );
  const [password, setPassword] = useState("");

  const [tick, setTick] = useState(0);
  const { publicId } = useParams();
  const navigate = useNavigate();
  // console.log(link);
  const backElement = useRef(null);
  const fileBox = useRef(null);
  const [error, setError] = useState("");
  // const values = useAuth();

  const [searchParams] = useSearchParams();
  const timeAgo =
    DateTime.fromISO(link?.createdAt, {
      zone: "utc",
    }).toRelative() || "some time ago";

  const downloads = link?.downloads || 0;
  const maxDownloads = link?.maxDownloads;
  const isPassEnabled = link?.isPassEnabled;

  const downloadable = !maxDownloads
    ? true
    : Number(downloads) < Number(maxDownloads);
  const nameSplit = link?.userId?.fullName?.trim().split(" ") || [
    "Velvet",
    "user",
  ];

  const firstLetter = nameSplit[0].slice(0, 1);

  const lastLetter =
    nameSplit.length > 1 ? nameSplit[nameSplit.length - 1].slice(0, 1) : "";

  const normalizedName = (
    firstLetter.toUpperCase() +
    nameSplit[0].slice(1).toLowerCase() +
    " " +
    (nameSplit.length > 1
      ? lastLetter.toUpperCase() +
        nameSplit[nameSplit.length - 1].slice(1).toLowerCase()
      : "")
  ).trim();

  const size = link?.fileId?.size
    ? link?.fileId?.size < 100000
      ? Math.floor(link?.fileId?.size / 1000) + " KB"
      : Math.floor(link?.fileId?.size / 100000) % 10 === 0
        ? Math.floor(Math.floor(link?.fileId?.size / 100000) / 10) + " MB"
        : Math.floor(link?.fileId?.size / 100000) / 10 + " MB"
    : "0 MB";

  const fileType = link?.fileId?.mimeType || "application/pdf";

  const rawTitle = link?.fileId?.fileName
    ? link?.fileId?.fileName.trim().slice(0, 1).toUpperCase() +
      link?.fileId?.fileName.trim().slice(1).toLowerCase()
    : "File.fileType";

  const title = isSmallMobile
    ? truncateFilename(rawTitle, 24)
    : truncateFilename(rawTitle, 30);

  let background = fileType
    ? documentTypes.includes(fileType)
      ? "#162031"
      : imageTypes.includes(fileType)
        ? "#122625"
        : compressedTypes.includes(fileType)
          ? "#2b241a"
          : audioTypes.includes(fileType)
            ? "#281a28"
            : videoTypes.includes(fileType)
              ? "#211c31"
              : otherTypes.includes(fileType)
                ? "#292319"
                : "#181b22"
    : "#181b22";

  let color = fileType
    ? documentTypes.includes(fileType)
      ? "#60a5fa"
      : imageTypes.includes(fileType)
        ? "#34d298"
        : compressedTypes.includes(fileType)
          ? "#fbbf24"
          : audioTypes.includes(fileType)
            ? "#f472b6"
            : videoTypes.includes(fileType)
              ? "#c084fc"
              : otherTypes.includes(fileType)
                ? "#ff6a6a"
                : "#181b22"
    : "#181b22";

  useEffect(
    function () {
      if (!background || !backElement.current) return;
      backElement.current.style.backgroundColor = background;
    },
    [background],
  );

  useEffect(function () {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1000px)");

    const handleChange = (e) => setIsSmallMobile(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(
    function () {
      if (!isDownloading) return;
      const timeout = setTimeout(() => setIsDownloading(false), 3000);
      return () => clearTimeout(timeout);
    },
    [isDownloading],
  );

  useEffect(
    function () {
      async function getLinkDetails() {
        try {
          setLoading(true);
          const res = await fetch(`/api/file/link/${publicId}`, {
            method: "GET",
          });
          if (res.ok) {
            const data = await res.json();
            setLink(data.link);
          } else {
            const data = await res.json();

            throw new Error(data.err);
          }
        } catch (err) {
          console.log(err.message);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      getLinkDetails();
    },
    [publicId, setLoading],
  );

  useEffect(
    function () {
      async function getLinkDetailsSilently() {
        try {
          const res = await fetch(`/api/file/link/${publicId}`, {
            method: "GET",
          });
          if (res.ok) {
            const data = await res.json();
            setLink(data.link);
          } else {
            const data = await res.json();
            if (res.status === 401 || res.status === 403) {
              setErr(data.err);
              return;
            }
            throw new Error(data.err);
          }
        } catch (err) {
          console.log(err.message);
          setError(err.message);
        }
      }
      const interval = setInterval(() => {
        if (document.visibilityState !== "visible" || isDownloading) return;
        getLinkDetailsSilently();
      }, 2000);
      return () => clearInterval(interval);
    },
    [publicId, setErr, isDownloading],
  );

  useEffect(() => {
    const errorFromQuery = searchParams.get("error");
    if (errorFromQuery) {
      setErr(errorFromQuery);
    }
  }, [searchParams, setErr]);

  return (
    <div className="main">
      <BgEffects />
      {loading ? (
        <PageLoader show={true} />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="container middle"
          >
            <ArrowLeft
              onClick={() => navigate("/")}
              className="arrow-left-back"
              size={21}
            />
            <LayoutGroup>
              <Linkk to="/" className="Velvet-logo-div-big">
                <img src="/logo3.svg" alt="logo" />
              </Linkk>
              <div className="security-you-control">
                <span>Security</span>, you control
              </div>
              <AnimatePresence>
                {error ? (
                  <NotFound />
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="linear-gradient-style"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="box download-file-container-box"
                    >
                      <div className="download-file-container-box-inner">
                        <div className="file-details-div-link-div">
                          <div
                            ref={backElement}
                            className="your-file-logo-div logo-div-link-page"
                          >
                            {color === "#60a5fa" ? (
                              <FileText color={color} size={28} />
                            ) : color === "#34d298" ? (
                              <Image color={color} size={28} />
                            ) : color === "#fbbf24" ? (
                              <Archive color={color} size={28} />
                            ) : color === "#f472b6" ? (
                              <Music color={color} size={28} />
                            ) : color === "#c084fc" ? (
                              <Film color={color} size={28} />
                            ) : color === "#ff6a6a" ? (
                              <FileQuestion color={color} size={28} />
                            ) : (
                              <FileText color={color} size={28} />
                            )}
                          </div>
                          <div className="file-details-div-link-view">
                            <div className="file-name-link-view">{title}</div>
                            <div className="shared-by-link-view">
                              {link?.isAnonymous ? (
                                <HatGlasses
                                  className="non-shrinkable "
                                  size={16}
                                />
                              ) : (
                                <User className="non-shrinkable " size={16} />
                              )}
                              &nbsp;
                              {link?.isAnonymous
                                ? "Anonymous share"
                                : "Shared by " + normalizedName}
                            </div>
                          </div>
                        </div>
                        <div className="sharing-details-div">
                          <div className="shared-ago-link">
                            <Link size={12} />
                            &nbsp;Linked {timeAgo}
                          </div>
                          <div className="shared-download-count">
                            <DownloadCloud size={12} />
                            &nbsp;<span>{downloads} downloads</span>
                          </div>
                        </div>
                        {isPassEnabled && downloadable && (
                          <div className="signup-login-form-field-div password-div-link-page">
                            <label
                              htmlFor="password-signup"
                              className="signup-login-form-label"
                            >
                              <Lock size={16} />
                              &nbsp;<span>Password</span>
                            </label>
                            <div className="password-eye-div">
                              {eye ? (
                                <EyeOff
                                  onClick={() => setEye((e) => !e)}
                                  className="eye"
                                  size={16}
                                />
                              ) : (
                                <Eye
                                  onClick={() => setEye((e) => !e)}
                                  className="eye"
                                  size={16}
                                />
                              )}
                            </div>
                            <input
                              id="password-signup"
                              className="signup-login-input-field password-field"
                              type={eye ? "text" : "password"}
                              placeholder="(minimum 3 characters)"
                              name="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                        )}
                        {downloadable &&
                        (!isPassEnabled || password.length >= 3) ? (
                          <a
                            onClick={() => setIsDownloading(true)}
                            href={`/api/file/download-public/${publicId}?password=${password}`}
                            className="action-button sharing-download-button"
                          >
                            <Download size={20} />
                            &nbsp;Download File ({size})
                          </a>
                        ) : (
                          <div className="action-button sharing-download-button disabled-download-button">
                            <Ban size={20} />
                            &nbsp;
                            {!downloadable
                              ? "Download limit reached"
                              : "Enter Password to download"}
                          </div>
                        )}
                      </div>
                      <div className="secure-file-delivery-claim">
                        <ShieldCheckIcon size={14} />
                        &nbsp;
                        <span>End-to-end encrypted</span>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="link-page-footer"
                    >
                      Secure file sharing powered by&nbsp;<span>Velvet</span>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </LayoutGroup>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default LinkPage;
