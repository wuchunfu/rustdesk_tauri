import React from "react"
import ReactDOM from "react-dom"
// import App from "./App"

// TODO: непонятно как это дебажить, в консоле ничего не меняется по обращению к build/index.html(если к нему обращаться без новой логики в index.tsx, то все работает), я не тот файл пытаюсь получить из rust?
ReactDOM.render(
  <React.StrictMode>
    <h1>Hello, world!</h1>
  </React.StrictMode>,
  document.getElementById("root")
)