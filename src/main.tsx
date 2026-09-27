import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./index.css";
import App from "./App";

const GA_ID = import.meta.env.VITE_GA_ID || "G-NZ2WJ2KQMH";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
      <GoogleAnalytics gaId={GA_ID} />
    </BrowserRouter>
  </StrictMode>
);
