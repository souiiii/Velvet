import { Search, SlidersHorizontal } from "lucide-react";
import AddFile from "./AddFile";
import { AnimatePresence, motion, number } from "motion/react";
import { useEffect, useState } from "react";
import File from "./File";
import Nothing from "./Nothing";

function CenterPanel({
  setRefresh,
  downloading,
  setDownloading,
  filesAndLinks,
  setRightOpen,
  uploading,
  deleting,
  setDeleting,
  selectedFile,
  setUploading,
  app,
  // isLayoutAnimating,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tick, setTick] = useState(0);
  const [selectedOp, setSelectedOp] = useState("");

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
  useEffect(function () {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      ref={app}
      className="center-panel-inner-div"
      // layout="position"
    >
      <motion.div className="search-div">
        <div
          // layout
          className="search-bar"
        >
          <div
            className="search-icon"
            // layout
          >
            <Search
              //  layout="position"
              size={16}
            />
          </div>
          <input
            // layout="position"
            className="search-field"
            type="text"
            maxLength={200}
            placeholder="Search files..."
            name="search-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search"
          />
        </div>
        <button
          className="filter-button"
          // layout
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
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
        {numOfFiles ? (
          <>
            <motion.div
              className={`${numOfFiles !== 1 ? "file-display-list" : "lisstttt"}`}
            >
              {filteredFilesAndLinks.map((f, i) => (
                <File
                  // isLayoutAnimating={isLayoutAnimating}
                  setUploading={setUploading}
                  setDeleting={setDeleting}
                  deleting={deleting}
                  selectedOp={selectedOp}
                  selectedFile={selectedFile}
                  setSelectedOp={setSelectedOp}
                  tick={tick}
                  setRefresh={setRefresh}
                  setRightOpen={setRightOpen}
                  key={f._id}
                  file={f}
                  i={i}
                />
              ))}
            </motion.div>
          </>
        ) : searchQuery.length ? (
          <Nothing message="No results found" pic="ufo" />
        ) : (
          <Nothing message="Add files to create links" pic="ufo" />
        )}
      </div>
    </div>
  );
}

export default CenterPanel;
