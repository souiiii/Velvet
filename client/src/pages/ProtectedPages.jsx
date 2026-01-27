import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/useAuth";

function ProtectedPages() {
  const values = useAuth();
  if (values.loading) {
    return <Loading />;
  } else if (values.user) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedPages;
