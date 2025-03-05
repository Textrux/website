import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { useRegisterSW } from "virtual:pwa-register/react";

function RootApp() {
  // This hook gives you booleans like `offlineReady` once the service worker finishes its initial caching
  const { offlineReady } = useRegisterSW();

  useEffect(() => {
    if (offlineReady) {
      // Show your "fully loaded" message here, e.g. an alert or a toast
      // alert("This app is fully loaded and can be used offline now if needed.");
    }
  }, [offlineReady]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
