import React from "react";
import { createRoot } from "react-dom/client";
import SkeletonPatternPage from "./pages/SkeletonPatternPage.jsx";
import "./styles/skeletonPattern.css";

const root = createRoot(document.getElementById("root"));
const params = new URLSearchParams(window.location.search);
const introCompleted = params.has("intro");
let introBackRequested = false;

function renderApp() {
  root.render(
    <React.StrictMode>
      <SkeletonPatternPage />
    </React.StrictMode>
  );
}

function goBackToIntro() {
  if (introBackRequested || window.location.pathname !== "/" || window.scrollY > 2) return;
  introBackRequested = true;
  window.location.href = "/intro/index.html?fromMain=1";
}

function enableIntroBackGesture() {
  let touchStartY = null;

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.deltaY < -36) goBackToIntro();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (touchStartY === null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      if (currentY - touchStartY > 48) goBackToIntro();
    },
    { passive: true }
  );
}

if (introCompleted) {
  window.history.replaceState(null, "", "/");
  renderApp();
} else if (window.location.pathname === "/") {
  window.location.replace("/intro/index.html");
} else {
  renderApp();
}

enableIntroBackGesture();
