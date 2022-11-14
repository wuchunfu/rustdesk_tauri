import { ColorModeScript } from '@chakra-ui/react';
import React from "react"
import ReactDOM from "react-dom"
import App from "./app"

{/* <script type="text/tiscript">
include "common.tis";
include "msgbox.tis";
include "ab.tis";
include "index.tis";
</script> */}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)
