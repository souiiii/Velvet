import { useEffect, useRef, useState } from "react";
import LeftPanel from "../components/LeftPanel";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { useAuth } from "../contexts/useAuth";
import CenterPanel from "../components/CenterPanel";
import UploadDownload from "../components/UploadDownload";
import RightDefaultPanel from "../components/RightDefaultPanel";
import RightPanel from "../components/RightPanel";
import NavBar from "../components/NavBar";
import BlackBackgound from "../components/BlackBackgound";
import PageLoader from "../components/PageLoader";

function HomePage() {
  const values = useAuth();
  const [globalLoading, setGlobalLoading] = useState(false);
  const [rightOpen, setRightOpen] = useState("");
  const [leftOpen, setLeftOpen] = useState(false);
  const [filesAndLinks, setFilesAndLinks] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [uploading, setUploading] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isSmallMobile, setIsSmallMobile] = useState(
    window.matchMedia("(max-width: 1000px)").matches,
  );
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 1338px)").matches,
  );
  const [isLaptop, setIsLaptop] = useState(
    window.matchMedia("(max-width: 2300px)").matches,
  );

  const app = useRef(null);

  const storageUsed = filesAndLinks?.reduce((acc, f) => acc + f.size, 0) || 0;
  const numberOfFiles = filesAndLinks?.length || 0;
  const now = new Date();
  const setUser = values?.setUser;

  const links = filesAndLinks?.flatMap((f) => f?.links ?? []) ?? [];
  const activeLinks = links.filter((l) => {
    const expiresAt = l.expiresAt ? new Date(l.expiresAt) : null;
    return !l.isRevoked && (!expiresAt || now < expiresAt);
  }).length;

  const revokedLinks = links.filter((l) => l.isRevoked).length;

  const expiredLinks = links.filter((l) => {
    const expiresAt = l.expiresAt ? new Date(l.expiresAt) : null;
    return !l.isRevoked && expiresAt && now >= expiresAt;
  }).length;

  const totalDownloads = links.reduce((acc, l) => acc + l.downloads, 0);

  const selectedFile = filesAndLinks?.find(
    (f) => rightOpen === f._id.toString(),
  );

  const videoRef = useRef(null);

  // const [isLayoutAnimating, setIsLayoutAnimating] = useState(false);

  const handleRightOpen = (id) => {
    // setIsLayoutAnimating(true);
    setRightOpen(id);
    // setTimeout(() => setIsLayoutAnimating(false), 400);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1338px)");

    const handleChange = (e) => setIsMobile(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1000px)");

    const handleChange = (e) => setIsSmallMobile(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 2300px)");

    const handleChange = (e) => setIsLaptop(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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
          if (res.status === 401) values.setUser(null);
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
  }, [values]);

  useEffect(() => {
    const controller = new AbortController();

    async function getFilesAndLinksSilently() {
      try {
        const res = await fetch("/api/file/all", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 401) setUser(null);
          throw new Error(errData.err || "Failed to fetch files");
        }

        const data = await res.json();
        setFilesAndLinks(data.filesAndLinks);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    }

    getFilesAndLinksSilently();

    return () => controller.abort();
  }, [refresh, setUser]);

  return (
    <div className="main">
      {globalLoading && <PageLoader show={true} />}

      <AnimatePresence>
        {uploading && <UploadDownload uploading={uploading} />}
        {downloading && <UploadDownload downloading={downloading} />}
        {deleting && <UploadDownload deleting={deleting} />}
      </AnimatePresence>

      <NavBar setRightOpen={setRightOpen} setLeftOpen={setLeftOpen} />
      {/* {globalLoading && <div>Loading..</div>} */}
      {/* <LayoutGroup> */}
      <motion.div className="container">
        <AnimatePresence>
          {((isMobile && leftOpen) || (isSmallMobile && rightOpen)) && (
            <BlackBackgound
              setRightOpen={setRightOpen}
              setLeftOpen={setLeftOpen}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(!isMobile || leftOpen) && (
            <motion.div
              // layout
              initial={{ opacity: 0, x: "-320px" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-320px" }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="leftPanel"
            >
              <LeftPanel
                leftOpen={leftOpen}
                storageUsed={storageUsed}
                totalDownloads={totalDownloads}
                expiredLinks={expiredLinks}
                revokedLinks={revokedLinks}
                activeLinks={activeLinks}
                name={values.user.fullName}
                email={values.user.email}
                numberOfFiles={numberOfFiles}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          // layout
          className="centerPanel"
        >
          <CenterPanel
            // isLayoutAnimating={isLayoutAnimating}
            deleting={deleting}
            isSmallMobile={isSmallMobile}
            isLaptop={isLaptop}
            isMobile={isMobile}
            setDeleting={setDeleting}
            setRightOpen={handleRightOpen}
            setRefresh={setRefresh}
            filesAndLinks={filesAndLinks}
            uploading={uploading}
            downloading={downloading}
            setDownloading={setDownloading}
            setUploading={setUploading}
            selectedFile={selectedFile}
            app={app}
          />
        </motion.div>
        <AnimatePresence mode="popLayout">
          {rightOpen ? (
            <motion.div
              key="right-panel"
              // layout="position"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="rightPanel notDefault"
            >
              <RightPanel
                selectedFile={selectedFile}
                setRefresh={setRefresh}
                setRightOpen={handleRightOpen}
              />
            </motion.div>
          ) : (
            <motion.div
              key="right-default"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="rightPanel  right-default-panel-div"
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
      {/* </LayoutGroup> */}
    </div>
  );
}

export default HomePage;
