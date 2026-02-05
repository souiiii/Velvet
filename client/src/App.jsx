import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedPages from "./pages/ProtectedPages";
import LinkPage from "./pages/LinkPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ProtectedPages />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="/link/:id" element={<LinkPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
