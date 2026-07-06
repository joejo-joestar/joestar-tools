import "./index.css";
import { NavLink, Outlet } from "react-router";

const Navbar = () => {
  return (
    <>
      <nav>
            <div className="nav-home">
              <NavLink to="/">
                <img
                  src="https://raw.githubusercontent.com/joejo-joestar/joestar-tools/refs/heads/main/public/pixlogo.png"
                  alt="Joe :3"
                />
                Tools
              </NavLink>
            </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
