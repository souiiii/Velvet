import { useRef, useState } from "react";
import Loading from "./Loading";
import UploadDownload from "./UploadDownload";

function AddFile({ setRefresh, uploading, setUploading }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);

    if (selected.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    setFiles(selected);
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

  async function handleSubmit(e) {
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
  }

  return (
    <div>
      <div>Add File</div>

      <form onSubmit={handleSubmit}>
        <label>
          <p>Add new files (max 5)</p>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            required
            onChange={handleFileChange}
          />
        </label>

        <button type="submit">
          Upload {files.length ? `(${files.length})` : ""}
        </button>
      </form>
    </div>
  );
}

export default AddFile;
