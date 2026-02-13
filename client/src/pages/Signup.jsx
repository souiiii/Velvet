import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import {
  ArrowRight,
  Check,
  Dot,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader";
import { AnimatePresence, motion } from "motion/react";
import BgEffects from "../components/BgEffects";
import Hero from "../components/Hero";

const MotionCheck = motion.create(Check);
const MotionDot = motion.create(Dot);

function Signup({ setMsg, setErr, loading, setLoading }) {
  const [eye, setEye] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCirteria, setPasswordCriteria] = useState([]);
  const navigate = useNavigate();

  useEffect(
    function () {
      const criteria = [];
      if (password.length >= 8) criteria.push("len");
      if (/\d/.test(password)) criteria.push("num");
      if (/[a-z]/.test(password) && /[A-Z]/.test(password))
        criteria.push("char");
      setPasswordCriteria(criteria);
    },
    [password],
  );

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
      if (res.ok) {
        const data = await res.json();
        setMsg(data.msg);
        navigate("/login");
      } else {
        const errData = await res.json();
        throw new Error(errData.err);
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
          <div className="signup-login-left-container">
            <Hero />
          </div>
          <div className="signup-login-right-container">
            <div className="security-assurance-logo-div">
              <ShieldCheck size={56} />
            </div>
            <div className="signup-login-heading">Create your vault</div>
            <div className="signup-login-sub-heading">
              Start securing your files today
            </div>
            <form className="signup-login-form" onSubmit={handleSubmit}>
              <label className="signup-login-form-field-div">
                <p className="signup-login-form-label">
                  <User size={16} />
                  &nbsp;
                  <span>Full Name</span>
                </p>
                <input
                  className="signup-login-input-field"
                  type="text"
                  name="fullName"
                  placeholder="Javier Rees"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
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
                  placeholder="Create a strong password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="password-requirements-div">
                <div
                  className={`password-requirement ${passwordCirteria.includes("len") ? "green-check" : ""}`}
                >
                  <AnimatePresence mode="wait">
                    {passwordCirteria.includes("len") ? (
                      <MotionCheck
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        size={14}
                      />
                    ) : (
                      <MotionDot
                        key="dot"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        size={14}
                      />
                    )}
                  </AnimatePresence>
                  &nbsp;8+ characters
                </div>
                <div
                  className={`password-requirement ${passwordCirteria.includes("num") ? "green-check" : ""}`}
                >
                  <AnimatePresence mode="wait">
                    {passwordCirteria.includes("num") ? (
                      <MotionCheck
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        size={14}
                      />
                    ) : (
                      <MotionDot
                        key="dot"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        size={14}
                      />
                    )}
                  </AnimatePresence>
                  &nbsp;At least one number
                </div>
                <div
                  className={`password-requirement ${passwordCirteria.includes("char") ? "green-check" : ""}`}
                >
                  <AnimatePresence mode="wait">
                    {passwordCirteria.includes("char") ? (
                      <MotionCheck
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        size={14}
                      />
                    ) : (
                      <MotionDot
                        key="dot"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        size={14}
                      />
                    )}
                  </AnimatePresence>
                  &nbsp;Uppercase & lowercase letters
                </div>
              </div>
              <button
                className="signup-login-button"
                type="submit"
                disabled={loading}
              >
                <span>Create account</span>&nbsp;
                <ArrowRight className="signup-login-arrow" size={16} />
              </button>
              <div className=" signup-login-already-account">
                Already have an account?&nbsp;
                <Link className="signup-login-already-account-link" to="/login">
                  Sign in instead
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

export default Signup;
