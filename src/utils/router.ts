import render from "./render";
import routes from "../routes";

export function router(
  link: string,
  paramValues: string[] = [],
  state?: object
): void {
  const contentNode = document.getElementById("content") as HTMLDivElement;
  let pathName = link.split("?")[0];

  routes.find((route) => {
    if (route.path === pathName) {
      const linkWithParams =
        paramValues?.length > 0
          ? `${link}?${route.params
              ?.map((param, i) => `${param}=${paramValues[i]}`)
              .join("&")}`
          : link;
      window.history.pushState(state, "", linkWithParams);
      render(contentNode, route.component());
    }
  });
}

export function getRouterState<T>(): T {
  return window.history.state;
}

export function getRouterParams(): string[] {
  const searchString = window.location.hash.split("?")?.[1];
  const searchStringValue = searchString?.split("=");

  return searchStringValue
    .map((value) => value.replace("%20", " ").split("&"))
    .flat()
    .filter((_value, i) => i % 2 != 0);
}

export function rerenderRoute(): void {
  router(location.hash);
}
