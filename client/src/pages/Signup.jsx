import { useState } from "react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, fullName, password }),
      });
      if (res.status === 201) {
        navigate("/login");
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
        <div>Signup</div>
        <form onSubmit={handleSubmit}>
          <label>
            <p>Enter Full Name</p>
            <input
              type="text"
              name="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label>
            <p>Enter Email</p>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <p>Enter Password</p>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            Sign up
          </button>
        </form>
      </div>
    );
  }
}

export default Signup;
