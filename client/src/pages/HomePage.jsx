import { useEffect, useRef, useState } from "react";
import AddFile from "../components/AddFile";
import LeftPanel from "../components/LeftPanel";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { useAuth } from "../contexts/useAuth";
import CenterPanel from "../components/CenterPanel";
import UploadDownload from "../components/UploadDownload";
import RightDefaultPanel from "../components/RightDefaultPanel";
import RightPanel from "../components/RightPanel";

function HomePage() {
  const values = useAuth();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [rightOpen, setRightOpen] = useState("");
  const [filesAndLinks, setFilesAndLinks] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [uploading, setUploading] = useState(null);
  const app = useRef(null);

  const storageUsed = filesAndLinks?.reduce((acc, f) => acc + f.size, 0) || 0;
  const numberOfFiles = filesAndLinks?.length || 0;

  const selectedFile = filesAndLinks?.find(
    (f) => rightOpen === f._id.toString(),
  );

  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      videoRef.current?.play();
    }, 8000); // delay in ms (800ms = 0.8s)

    return () => clearTimeout(timer);
  }, []);

  // const activeLinks = filesAndLinks?.reduce((acc, f)=>acc+f.links.reduce((a, l)=>(!l.isRevoked && !),0),0)

  useEffect(() => {
    const controller = new AbortController();

    async function getFilesAndLinks() {
      try {
        setGlobalLoading(true);

        const res = await fetch("/api/file/all", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.err || "Failed to fetch files");
        }

        const data = await res.json();
        setFilesAndLinks(data.filesAndLinks);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setGlobalLoading(false);
      }
    }

    getFilesAndLinks();

    return () => controller.abort();
  }, [refresh]);

  return (
    <div ref={app} className="main">
      <AnimatePresence>
        {uploading && <UploadDownload uploading={uploading} />}
      </AnimatePresence>
      <div className="navbar">
        <div className="logo-div">Velvet</div>
        <div className="utility-div">
          <label htmlFor="upload" className="action-button">
            <span>+</span>&nbsp;New Upload
          </label>
        </div>
      </div>
      {/* {globalLoading && <div>Loading..</div>} */}
      <LayoutGroup>
        <motion.div layout className="container">
          <motion.div
            // layout
            className="leftPanel"
          >
            <LeftPanel
              storageUsed={storageUsed}
              name={values.user.fullName}
              email={values.user.email}
              numberOfFiles={numberOfFiles}
            />
          </motion.div>
          <motion.div
            // layout
            className="centerPanel"
          >
            <CenterPanel
              setRightOpen={setRightOpen}
              setRefresh={setRefresh}
              filesAndLinks={filesAndLinks}
              uploading={uploading}
              setUploading={setUploading}
              app={app}
            />
          </motion.div>

          <AnimatePresence mode="popLayout">
            {rightOpen && (
              <motion.div
                key="right-panel"
                // layout="position"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
                className="rightPanel notDefault"
              >
                <RightPanel
                  selectedFile={selectedFile}
                  setRefresh={setRefresh}
                  setRightOpen={setRightOpen}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {!rightOpen && (
              <motion.div
                key="right-default"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
                className="rightPanel"
              >
                <RightDefaultPanel
                  files={filesAndLinks}
                  setRefresh={setRefresh}
                  videoRef={videoRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

export default HomePage;
