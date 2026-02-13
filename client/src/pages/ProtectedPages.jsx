import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import PageLoader from "../components/PageLoader";

function ProtectedPages({}) {
  const values = useAuth();
  if (values.loading) {
    return <PageLoader show={true} />;
  } else if (values.user) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default ProtectedPages;
