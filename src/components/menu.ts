import navigation from "../navigation";
import { router } from "../utils/router";

export default function menu(): Component {
  function bindEvents(element: HTMLElement) {
    const navLinks = element.querySelectorAll(
      ".navbar__link"
    ) as NodeListOf<HTMLLIElement>;

    navLinks.forEach((each) => {
      each.addEventListener("click", (event: Event) => {
        const target = event.target as HTMLLIElement;
        target.dataset.link && router(target.dataset.link);
      });
    });

    const settingsIcon = element.querySelector(
      ".btn--settings"
    ) as HTMLOrSVGImageElement;

    settingsIcon.addEventListener("click", () => {
      router("#match-settings");
    });
  }

  const template = `
    <nav class="navbar container">
      <div class="d--flex" style="justify-content:center">
      <h1 class="navbar__brand" href="#">Cricket Scorer</h1>
      <svg style="width:20; margin-left: 10px;cursor: pointer" xmlns="http://www.w3.org/2000/svg" class="btn--settings" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
      </div>
      <ul class="navbar__nav">
        <li bizFor="navigation" data-link="{{link}}" class="navbar__link">
            {{name}}
        </li>
      </ul>
    </nav>
    `;

  return {
    bindEvents,
    template,
    exports: {
      navigation,
    },
  };
}
