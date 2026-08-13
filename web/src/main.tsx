import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { devMode } from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Missing root element");

const root = createRoot(rootElement);

const render = () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

if (devMode) {
  document.body.classList.add("dev-preview");
  render();
} else if (window.name === "") {
  window.addEventListener("message", (event) => {
    if (event.data === "componentsLoaded") render();
  }, { once: true });
}
