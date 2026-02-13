import { useState } from "react";
import Loading from "../components/Loading";
import { ArrowRight, Eye, EyeOff, Key, Lock, Mail, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { AnimatePresence, motion } from "motion/react";
import Hero from "../components/Hero";
import PageLoader from "../components/PageLoader";
import BgEffects from "../components/BgEffects";

function Login({ setMsg, setErr, loading, setLoading }) {
  const [eye, setEye] = useState(false);

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

      if (res.ok) {
        const data = await res.json();
        values.setUser(data.user);
        setMsg(data.msg);
        navigate("/");
      } else {
        const data = await res.json();
        if (res.status === 401) values.setUser(null);
        throw new Error(data.err);
      }
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main signup-login">
      {loading && <PageLoader show={true} />}
      <BgEffects />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="signup-login-container-main"
        >
          <div className="signup-login-left-container ">
            <Hero />
          </div>
          <div className="signup-login-right-container">
            <div className="security-assurance-logo-div">
              <Key size={56} />
            </div>
            <div className="signup-login-heading">Welcome back</div>
            <div className="signup-login-sub-heading">
              Sign in to your secure vault
            </div>
            <form className="signup-login-form" onSubmit={handleSubmit}>
              <label className="signup-login-form-field-div">
                <p className="signup-login-form-label">
                  <Mail size={16} />
                  &nbsp;<span>Email address</span>
                </p>
                <input
                  className="signup-login-input-field"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <div className="signup-login-form-field-div">
                <label
                  htmlFor="password-signup"
                  className="signup-login-form-label"
                >
                  <Lock size={16} />
                  &nbsp;<span>Password</span>
                </label>
                <div className="password-eye-div">
                  {eye ? (
                    <EyeOff
                      onClick={() => setEye((e) => !e)}
                      className="eye"
                      size={16}
                    />
                  ) : (
                    <Eye
                      onClick={() => setEye((e) => !e)}
                      className="eye"
                      size={16}
                    />
                  )}
                </div>
                <input
                  id="password-signup"
                  className="signup-login-input-field password-field"
                  type={eye ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                className="signup-login-button butt-mar-top"
                type="submit"
                disabled={loading}
              >
                <span>Sign in</span>&nbsp;
                <ArrowRight className="signup-login-arrow" size={16} />
              </button>
              <div className=" signup-login-already-account">
                New to Velvet?&nbsp;
                <Link
                  className="signup-login-already-account-link"
                  to="/signup"
                >
                  Create an account
                </Link>
              </div>
            </form>
            <div className="signup-login-footer">
              <div className="shield-logo-div">
                <Shield color="#dc2828" size={14} />
              </div>
              &nbsp;Protected by end-to-end encryption
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Login;
