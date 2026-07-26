import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { ProfileProvider } from "./context/ProfileContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </ThemeProvider>
  </StrictMode>,
);
