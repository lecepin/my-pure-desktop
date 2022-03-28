import ReactDOM from "react-dom";
import React from "react";
import New from "./new/index";

const app = document.getElementById("app");

ReactDOM.render(<New />, app);

"serviceWorker" in navigator &&
  navigator.serviceWorker.register(new URL("./sw.js", import.meta.url));
