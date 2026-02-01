import { useEffect, useState } from "react";
import AddFile from "../components/AddFile";
import LeftPanel from "../components/LeftPanel";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { useAuth } from "../contexts/useAuth";
import CenterPanel from "../components/CenterPanel";

function HomePage() {
  const values = useAuth();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const storageUsed = filesAndLinks?.reduce((acc, f) => acc + f.size, 0) || 0;
  const numberOfFiles = filesAndLinks?.length || 0;

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
    <div className="main">
      <div className="navbar">
        <div className="logo-div">Velvet</div>
        <div className="utility-div">
          <label htmlFor="upload" className="action-button">
            <span>+</span>&nbsp; New Upload
          </label>
        </div>
      </div>
      {globalLoading && <div>Loading..</div>}
      <LayoutGroup>
        <motion.div layout className="container">
          <motion.div layout className="leftPanel">
            <LeftPanel
              storageUsed={storageUsed}
              name={values.user.fullName}
              email={values.user.email}
              numberOfFiles={numberOfFiles}
            />
          </motion.div>
          <motion.div
            layout
            className="centerPanel"
            onClick={() => setRightOpen((o) => !o)}
          >
            <CenterPanel
              setRefresh={setRefresh}
              filesAndLinks={filesAndLinks}
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
                className="rightPanel"
              >
                right
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
                Right default
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

export default HomePage;
