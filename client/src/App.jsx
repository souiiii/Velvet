import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedPages from "./pages/ProtectedPages";
import LinkPage from "./pages/LinkPage";
import PageLoader from "./components/PageLoader";
import { useEffect, useState } from "react";
import BgEffects from "./components/BgEffects";
import Notify from "./components/Notify";
import { AnimatePresence } from "motion/react";
import ComingSoon from "./pages/ComingSoon";
// import CosmicBackground from "./components/CosmicBackground";

function App() {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(
    function () {
      const timeout = setTimeout(() => {
        setMsg("");
        setErr("");
      }, 2000);

      return () => clearTimeout(timeout);
    },
    [msg, err],
  );

  return (
    <AuthProvider>
      <AnimatePresence>
        {msg && <Notify msg={msg} type="msg" />}
        {err && <Notify msg={err} type="err" />}
      </AnimatePresence>
      <PageLoader show={globalLoading} />
      <Routes>
        <Route path="/" element={<ProtectedPages />}>
          <Route
            index
            element={
              <HomePage
                globalLoading={globalLoading}
                setGlobalLoading={setGlobalLoading}
                setMsg={setMsg}
                setErr={setErr}
              />
            }
          />
        </Route>
        <Route
          path="/link/:publicId"
          element={
            <LinkPage
              setMsg={setMsg}
              setErr={setErr}
              loading={globalLoading}
              setLoading={setGlobalLoading}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              loading={globalLoading}
              setLoading={setGlobalLoading}
              setMsg={setMsg}
              setErr={setErr}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              loading={globalLoading}
              setLoading={setGlobalLoading}
              setMsg={setMsg}
              setErr={setErr}
            />
          }
        />
        <Route path="/coming-soon" element={<ComingSoon />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
