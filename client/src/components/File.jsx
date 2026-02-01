import {
  Archive,
  EllipsisVertical,
  FileArchive,
  FileQuestion,
  FileText,
  Film,
  FolderArchive,
  Image,
  Link2,
  Music,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";

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

function File({ file }) {
  const [timeAgo, setTimeAgo] = useState(() =>
    DateTime.fromISO(file.createdAt, {
      zone: "utc",
    }).toRelative(),
  );

  const backElement = useRef(null);

  console.log(file.createdAt);
  const size = file.size
    ? file.size < 100000
      ? Math.floor(file.size / 1000) + " KB"
      : Math.floor(file.size / 100000) % 10 === 0
        ? Math.floor(Math.floor(file.size / 100000) / 10) + " MB"
        : Math.floor(file.size / 100000) / 10 + " MB"
    : "0 MB";

  const fileType = file.mimeType || '"application/pdf"';

  const title = file.fileName
    ? file.fileName.trim().slice(0, 1).toUpperCase() +
      file.fileName.trim().slice(1)
    : "File.fileType";

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
      setTimeout(() => {
        const getAgo = DateTime.fromISO(file.createdAt, {
          zone: "utc",
        }).toRelative();
        setTimeAgo(getAgo);
      }, 60000);
    },
    [timeAgo, file.createdAt],
  );

  useEffect(
    function () {
      if (!background) return;
      backElement.current.style.backgroundColor = background;
    },
    [background],
  );

  return (
    <div className="your-file-div">
      <div ref={backElement} className="your-file-logo-div">
        {color === "#60a5fa" ? (
          <FileText color={color} size={20} />
        ) : color === "#34d298" ? (
          <Image color={color} size={20} />
        ) : color === "#fbbf24" ? (
          <Archive color={color} size={20} />
        ) : color === "#f472b6" ? (
          <Music color={color} size={20} />
        ) : color === "#c084fc" ? (
          <Film color={color} size={20} />
        ) : color === "#ff6a6a" ? (
          <FileQuestion color={color} size={20} />
        ) : (
          <FileText color={color} size={20} />
        )}
      </div>
      <div className="your-file-details-div">
        <div className="your-file-title">{title}</div>
        <div className="your-file-sub-title-div">
          <div className="your-file-size">
            {size === "0 KB" ? "1 KB" : size}&nbsp;•&nbsp;{timeAgo}
          </div>
        </div>
      </div>
      <div className="your-file-actions-div ">
        <div className="your-file-generate-link-button label">
          <Link2 size={14} />
          <span>Generate Link</span>
        </div>
        <div className="your-file-action-button">
          <EllipsisVertical size={16} />
        </div>
      </div>
    </div>
  );
}

export default File;
