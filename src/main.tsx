
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { apiService } from "./services/api";

// Make API service available globally for compatibility
(window as any).apiService = apiService;

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
