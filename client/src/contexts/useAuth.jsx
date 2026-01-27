import { useContext } from "react";
import { AuthContext } from "./authContext.jsx";

function useAuth() {
  const value = useContext(AuthContext);
  if (value === undefined) throw new Error("using context outside the scope");
  return value;
}

export { useAuth };
