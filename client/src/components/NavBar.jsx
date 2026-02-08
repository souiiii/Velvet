import { useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <div className="navbar">
      <div className="logo-div">Velvet</div>
      <div className="utility-div">
        {isHomePage && (
          <label htmlFor="upload" className="action-button">
            <span>+</span>&nbsp;New Upload
          </label>
        )}
      </div>
    </div>
  );
}

export default NavBar;
