import { templateEngine } from "./templateEngine";

export default function render(domNode: HTMLElement, component: Component) {
  domNode && (domNode.innerHTML = "");
 
  const newElement: HTMLDivElement = document.createElement("div");
  newElement.innerHTML = component.template;

  templateEngine(newElement, component.exports);

  component.bindEvents && component.bindEvents(newElement);
  !domNode.childNodes.length && domNode.appendChild(newElement);
}
