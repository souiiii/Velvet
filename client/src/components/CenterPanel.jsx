import { Search, SlidersHorizontal } from "lucide-react";
import AddFile from "./AddFile";
import { motion } from "motion/react";
import { useState } from "react";
import File from "./File";

function CenterPanel({
  setRefresh,
  filesAndLinks,
  uploading,
  setUploading,
  app,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFilesAndLinks = filesAndLinks
    ? filesAndLinks
        ?.filter((f) => {
          return searchQuery
            ? f.fileName
                .trim()
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase())
            : true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const numOfFiles = filteredFilesAndLinks ? filteredFilesAndLinks.length : 0;
  return (
    <motion.div className="center-panel-inner-div" layout="position">
      <motion.div className="search-div">
        <motion.div layout className="search-bar">
          <motion.div className="search-icon" layout>
            <Search layout="position" size={16} />
          </motion.div>
          <motion.input
            layout="position"
            className="search-field"
            type="text"
            maxLength={200}
            placeholder="Search files..."
            name="search-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search"
          />
        </motion.div>
        <motion.button className="filter-button" layout>
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </motion.button>
      </motion.div>
      <AddFile
        app={app}
        setRefresh={setRefresh}
        uploading={uploading}
        setUploading={setUploading}
      />

      <div className="file-display-div">
        <div className="file-display-heading-div">
          <div className="file-display-heading">Your Files</div>
          <div className="file-display-file-count">{numOfFiles} files</div>
        </div>
        <div className="file-display-list">
          {filteredFilesAndLinks.map((f) => (
            <File key={f._id} file={f} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default CenterPanel;
