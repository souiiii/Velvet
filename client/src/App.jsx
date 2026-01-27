import { Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/authContext";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedPages from "./pages/ProtectedPages";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ProtectedPages />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
