import { createContext } from "react";
import { useEffect } from "react";
import { useState } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(function () {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(
    function () {
      async function silentFetch() {
        try {
          const res = await fetch("/api/user", { credentials: "include" });
          if (res.status === 401) {
            setUser(null);
            return;
          }
          const data = await res.json();

          setUser((u) =>
            u?._id?.toString() === data?.user?._id?.toString()
              ? u
              : (data?.user ?? null),
          );
          return;
        } catch (err) {
          console.log(err.message);
        }
      }
      silentFetch();
    },
    [tick],
  );

  useEffect(function () {
    async function setCurrUser() {
      try {
        setLoading(true);
        const res = await fetch("/api/user", { credentials: "include" });

        if (!res.ok) {
          const data = await res.json();

          if (res.status === 401) {
            setUser(null);
            return;
          }

          throw new Error(data.err);
        }
        const data = await res.json();

        setUser(data.user);
        return;
      } catch (err) {
        console.log(err.message);
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
