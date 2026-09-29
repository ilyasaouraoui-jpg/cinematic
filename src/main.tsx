import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ReactGA from "react-ga4";
import "./index.css";
import App from "./App";

const gaId = import.meta.env.VITE_GA_ID;
if (gaId) {
  ReactGA.initialize(gaId);
  ReactGA.send("pageview");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
