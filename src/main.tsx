import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import MissingPage from "./routes/Missingno";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Footer from "@components/Footer";
import SchemaMaker from "./routes/SchemaMaker/Index";
import FeedFinder from "./routes/FeedFinder/Index";
import Home from "./routes/Home/Index";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Analytics />
    <SpeedInsights />
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <>
              <Navbar />
              <Footer />
            </>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="feed-finder" element={<FeedFinder />} />
          <Route path="schema-maker" element={<SchemaMaker />} />
        </Route>
        <Route path="*" element={<MissingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
