import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { devMode } from "./App";
import type { AppMode, Theme } from "./types";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Missing root element");

const root = createRoot(rootElement);

let rendered = false;

const render = (mode: AppMode, initialVisible: boolean, initialTheme?: Theme) => {
  if (rendered) return;
  rendered = true;
  root.render(
    <StrictMode>
      <App initialTheme={initialTheme} initialVisible={initialVisible} mode={mode} />
    </StrictMode>,
  );
};

if (devMode) {
  document.body.classList.add("dev-preview");
  render("development", true);
} else {
  window.addEventListener("message", (event) => {
    if (event.data === "componentsLoaded") render("phone", true);
    if (event.data?.action === "standalone:setVisible" && event.data.data?.visible) {
      render("standalone", true, event.data.data.theme);
    }
  });
}
