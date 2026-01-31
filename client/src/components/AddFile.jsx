import { useState } from "react";
import Loading from "./Loading";

function AddFile({ setRefresh }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/file/add-file", {
        credentials: "include",
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log(data);
      setRefresh((r) => r + 1);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }
  if (loading) return <Loading />;
  else
    return (
      <div>
        <div>Add File</div>
        <form onSubmit={handleSubmit}>
          <label>
            <p>Add new file</p>
            <input
              type="file"
              required
              name="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
          <button type="submit">Upload file</button>
        </form>
      </div>
    );
}

export default AddFile;
