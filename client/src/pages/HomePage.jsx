import { useEffect, useState } from "react";
import AddFile from "../components/AddFile";
import LeftPanel from "../components/LeftPanel";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { useAuth } from "../contexts/useAuth";

function HomePage() {
  const values = useAuth();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState(null);

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
  }, []);
  return (
    <div className="main">
      <div className="navbar">
        <div className="logo-div">Velvet</div>
        <div className="utility-div">
          <button className="action-button">
            <span>+</span>&nbsp; New Upload
          </button>
        </div>
      </div>
      {globalLoading && <div>Loading..</div>}
      <LayoutGroup>
        <motion.div layout className="container">
          <motion.div layout className="leftPanel">
            <LeftPanel name={values.user.fullName} email={values.user.email} />
          </motion.div>
          <motion.div
            layout
            className="centerPanel"
            onClick={() => setRightOpen((o) => !o)}
          ></motion.div>

          <AnimatePresence mode="popLayout">
            {rightOpen && (
              <motion.div
                key="right-panel"
                layout="position"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
                className="rightPanel"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
      <AddFile />
    </div>
  );
}

export default HomePage;
