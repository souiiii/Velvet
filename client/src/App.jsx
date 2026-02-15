import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import ProtectedPages from "./pages/ProtectedPages";
import PageLoader from "./components/PageLoader";
import React, { Suspense, useEffect, useState } from "react";
import Notify from "./components/Notify";
import { AnimatePresence } from "motion/react";
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Login = React.lazy(() => import("./pages/Login"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ComingSoon = React.lazy(() => import("./pages/ComingSoon"));
const LinkPage = React.lazy(() => import("./pages/LinkPage"));

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
      <Suspense fallback={<PageLoader show={true} />}>
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
      </Suspense>
    </AuthProvider>
  );
}

export default App;
