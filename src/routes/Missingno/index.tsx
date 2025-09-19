import { NavLink } from "react-router";
import "./index.css";

const MissingPage = () => {
  return (
    <section className="missing-page">
      <img
        src="https://raw.githubusercontent.com/joejo-joestar/joestar/8088435f433a56d8bc6dbf45c871dea1e615d75a/src/assets/pix404.png"
        className="missingno"
        alt="Missing Page"
      />
      <div className="missing-header">
        <span className="four-oh-four">404</span>
        <span>haha lmao no page here</span>
      </div>
      <span className="missing-text">
        try going back to the <NavLink to="/">home page</NavLink>!
      </span>
    </section>
  );
};

export default MissingPage;
