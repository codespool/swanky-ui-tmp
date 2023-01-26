import React from "react";
import {createRoot} from "react-dom/client";
import {cryptoWaitReady} from "@polkadot/util-crypto";
// import {keyring} from "@polkadot/ui-keyring";
import {App} from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Unable to find element with id 'root'");
}

const root = createRoot(rootElement!);

cryptoWaitReady()
  .then((): void => {
    root.render(<App />);
  })
  .catch(console.error);
