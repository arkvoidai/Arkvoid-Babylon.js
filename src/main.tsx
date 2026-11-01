import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource/instrument-serif/400.css";
import "@/styles.css";
import App from "@/App";

const root = document.getElementById("root");
if (!root) throw new Error("Arkvoid root element is missing.");
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
