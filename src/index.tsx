/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import App from "./pages/App";

render(() => <App />, document.getElementById("root") as HTMLElement);
