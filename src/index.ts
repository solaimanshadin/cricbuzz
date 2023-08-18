import menu from "./components/menu";
import render from "./utils/render";
import { router } from "./utils/router";
import "./style.css";

const navigationNode = document.getElementById("menu") as HTMLDivElement;

render(navigationNode, menu());
router(location.hash || "#new-match");
