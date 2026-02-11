import { createContext } from "react";
import { useEffect } from "react";
import { useState } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser(initial = false) {
      try {
        if (initial) setLoading(true);

        const res = await fetch("/api/user", {
          credentials: "include",
        });

        if (res.status === 401) {
          setUser(null);
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.log(err.message);
      } finally {
        if (initial) setLoading(false);
      }
    }

    fetchUser(true); // initial load
    const interval = setInterval(() => fetchUser(false), 60000);

    return () => clearInterval(interval);
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
