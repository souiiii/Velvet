import { useState } from "react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/useAuth";

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const values = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 200) {
        const data = await res.json();
        values.setUser(data.user);
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  } else {
    return (
      <div>
        <div>Login</div>
        <form onSubmit={handleSubmit}>
          <label>
            <p>Enter Email</p>
            <input
              required
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <p>Enter Password</p>
            <input
              required
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            Log in
          </button>
        </form>
      </div>
    );
  }
}

export default Login;
