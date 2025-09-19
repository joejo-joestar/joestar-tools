import { Link } from "react-router";
import { useScrollToTop } from "@hooks/useScrollToTop";

function Home() {
  useScrollToTop();
  return (
    <>
      <section className="min-h-screen justify-center align-middle flex flex-col w-10/12 text-ctp-rosewater">
        <h1 className="flex items-center text-4xl mb-10 font-bold text-ctp-green">
          <img
            className="inline-block w-16 h-16 mr-4"
            src="https://raw.githubusercontent.com/joejo-joestar/joestar/5c0d47baa1b1bc02dace9f882fd2d6ba92e0e0db/src/assets/pixhi.png"
            alt="o7"
          />
          <span>
            some tools by{" "}
            <a href="https://joestar.vercel.app" target="_blank">
              joestar
            </a>
          </span>
        </h1>
        <div className="flex flex-col gap-4 text-2xl text-ctp-rosewater">
          <Link to={"/feed-finder"}>
            <img
              className="inline-block w-12 h-12 mr-2"
              src="https://raw.githubusercontent.com/joejo-joestar/joestar-tools/refs/heads/main/src/assets/pixnewscar.png"
              alt="o7"
            />
            feed finder
          </Link>
          <Link to={"/schema-maker"}>
            <img
              className="inline-block w-12 h-12 mr-2"
              src="https://raw.githubusercontent.com/joejo-joestar/joestar-tools/refs/heads/main/src/assets/pixcodingcar.png"
              alt="o7"
            />
            schema maker
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
