import { useCallback, useEffect, useRef, useState } from "react";
import Loading from "./Loading";
import UploadDownload from "./UploadDownload";
import { Cloud, Lock, Upload } from "lucide-react";

function AddFile({ setRefresh, uploading, setUploading, app }) {
  const [files, setFiles] = useState([]);
  // const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const drop = useRef(null);

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) return alert("Max 5 files");
    setFiles(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setFiles(e.dataTransfer.files);
    console.log(e.dataTransfer.files);
    app.current.classList.remove("drag-over");
  }
  function handleDragOver(e) {
    e.preventDefault();
    // setIsDragOver(true);
    app.current.classList.add("drag-over");
  }

  async function uploadSingleFile(file) {
    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch("/api/file/add-file", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.err || "Upload failed");
    }
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!files.length) return;

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          setUploading({ name: file.name, index: i + 1 });
          await new Promise(requestAnimationFrame);
          await uploadSingleFile(file);
        }

        setRefresh((r) => r + 1);
        setFiles([]);
      } catch (err) {
        console.error(err.message);
        alert(err.message);
      } finally {
        setUploading(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [files, setUploading, setRefresh],
  );

  useEffect(() => {
    if (!files.length) return;
    handleSubmit(new Event("submit"));
  }, [files, handleSubmit]);

  return (
    <label
      ref={drop}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => {
        // setIsDragOver(false);
        app.current.classList.remove("drag-over");
      }}
      className="upload-files-div-box"
    >
      <form className="upload-files-div-form" onSubmit={handleSubmit}>
        <div className="upload-logo-div">
          <Upload size={28} />
        </div>
        <p className="upload-files-prompt-text">Upload Files (max 5)</p>
        <p className="upload-files-drag-instruction">
          Drag and drop or <span>browse</span>
        </p>
        <div className="upload-files-feature-div">
          <div className="upload-files-storage-claim-div">
            <Cloud size={14} />
            <span>Up to 100MB</span>
          </div>
          <div className="upload-files-encryption-claim-div">
            <Lock size={14} />
            <span>Encrypted in Transit (TLS)</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          hidden
          required
          onChange={handleFileChange}
        />

        {/* <button type="submit">
          Upload {files.length ? `(${files.length})` : ""}
        </button> */}
      </form>
    </label>
  );
}

export default AddFile;
