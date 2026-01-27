import { createContext } from "react";
import { useEffect } from "react";
import { useState } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function setCurrUser() {
      try {
        setLoading(true);
        const res = await fetch("/api/user");
        if (res.status === 401) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user);
        return;
      } finally {
        setLoading(false);
      }
    }
    setCurrUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: user,
        setUser: setUser,
        loading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };
