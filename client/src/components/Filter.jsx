import {
  Archive,
  FileQuestionMark,
  FileText,
  Film,
  Image,
  LayoutGrid,
  Music,
} from "lucide-react";

const i = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

const d = [
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

const a = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "audio/mp4",
];

const v = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/quicktime",
];

const c = [
  "application/zip",
  "application/x-rar",
  "application/x-7z-compressed",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
];

const o = ["application/octet-stream"];

function Filter({ filtered = "", setFiltered = () => {} }) {
  return (
    <div className="filter-floater-div">
      <div className="filter-floater-list-div">
        <div
          onClick={() => setFiltered("")}
          className={`filter-floater-options ${filtered === "" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <LayoutGrid color="#ed9" size={20} />
          </div>
          <div className="filter-floater-option-text">All Files</div>
        </div>
        <div
          onClick={() => setFiltered("i")}
          className={`filter-floater-options ${filtered === "i" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "i" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "i" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <Image color="#34d399" size={20} />
          </div>
          <div className="filter-floater-option-text">Images</div>
        </div>
        <div
          onClick={() => setFiltered("d")}
          className={`filter-floater-options ${filtered === "d" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "d" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "d" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <FileText color="#60a5fa" size={20} />
          </div>
          <div className="filter-floater-option-text">Documents</div>
        </div>
        <div
          onClick={() => setFiltered("v")}
          className={`filter-floater-options ${filtered === "v" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "v" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "v" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <Film color="#c084fc" size={20} />
          </div>
          <div className="filter-floater-option-text">Videos</div>
        </div>
        <div
          onClick={() => setFiltered("a")}
          className={`filter-floater-options ${filtered === "a" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "a" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "a" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <Music color="#f472b6" size={20} />
          </div>
          <div className="filter-floater-option-text">Audio</div>
        </div>
        <div
          onClick={() => setFiltered("c")}
          className={`filter-floater-options ${filtered === "c" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "c" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "c" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <Archive color="#fbbf24" size={20} />
          </div>
          <div className="filter-floater-option-text">Compressed</div>
        </div>
        <div
          onClick={() => setFiltered("o")}
          className={`filter-floater-options ${filtered === "o" ? "selected-filter-option" : ""}`}
        >
          <div
            name="isPassword"
            className={`create-link-password-checkbox ${filtered === "o" ? "click-password-checkbox" : ""}`}
          >
            {filtered === "o" && <span>✔</span>}
          </div>
          <div className="filter-floater-option-logo-div">
            <FileQuestionMark color="#ff6a6a" size={20} />
          </div>
          <div className="filter-floater-option-text">Other</div>
        </div>
      </div>
    </div>
  );
}

export default Filter;
