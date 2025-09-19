import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socials } from "../../shared/socialsList";
import { NavLink } from "react-router";

const Footer = () => {
  const hehe = "\x70\x61\x73\x6f\x77\x72\x64";
  return (
    <footer>
      <p>
        &copy; {new Date().getFullYear()} Joseph Cijo
        <NavLink to={hehe}>.</NavLink> All rights reserved
        <NavLink to={hehe}>.</NavLink>
      </p>
      <div className="social-links">
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <FontAwesomeIcon icon={social.icon} className="fab" />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
