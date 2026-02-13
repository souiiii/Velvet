import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function NavBar({ setLeftOpen, setRightOpen }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <div className="navbar">
      <div className="logo-div">
        <div
          onClick={() => {
            setLeftOpen((o) => !o);
            setRightOpen("");
          }}
          className="menu-logo"
        >
          <Menu size={20} />
        </div>
        <Link to="/" className="logo-div-navbar">
          <img src="/logo3.svg" alt="logo" />
        </Link>
      </div>
      <div className="utility-div">
        {isHomePage && (
          <label
            onClick={() => {
              setLeftOpen(false);
              setRightOpen("");
            }}
            htmlFor="upload"
            className="action-button"
          >
            <span>+</span>&nbsp;New Upload
          </label>
        )}
      </div>
    </div>
  );
}

export default NavBar;
