import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedPages from "./pages/ProtectedPages";
import LinkPage from "./pages/LinkPage";
import PageLoader from "./components/PageLoader";
import { useState } from "react";
import BgEffects from "./components/BgEffects";
// import CosmicBackground from "./components/CosmicBackground";

function App() {
  const [globalLoading, setGlobalLoading] = useState(false);

  return (
    <AuthProvider>
      <PageLoader show={globalLoading} />
      <Routes>
        <Route path="/" element={<ProtectedPages />}>
          <Route
            index
            element={
              <HomePage
                globalLoading={globalLoading}
                setGlobalLoading={setGlobalLoading}
              />
            }
          />
        </Route>
        <Route
          path="/link/:publicId"
          element={
            <LinkPage loading={globalLoading} setLoading={setGlobalLoading} />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
