import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socials } from "../../shared/socialsList";

const Footer = () => {
  const hehe =
    "\x68\x74\x74\x70\x73\x3A\x2F\x2F\x6A\x6F\x65\x73\x74\x61\x72\x2E\x69\x73\x2D\x61\x2E\x64\x65\x76\x2F\x70\x61\x73\x6F\x77\x72\x64";
  return (
    <footer>
      <p>
        &copy; {new Date().getFullYear()} Joseph Cijo
        <a href={hehe}>.</a> All rights reserved
        <a href={hehe}>.</a>
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
