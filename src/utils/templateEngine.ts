export function templateEngine(template: HTMLElement, imports?: any) {
  // If directive - support
  const ifDirectives = template.querySelectorAll("[bizIf]");
  ifDirectives?.forEach((ifDirective) => {
    const expressionValue = ifDirective?.getAttribute("bizIf");
    let booleanExpression = false;
    if (expressionValue == "true") {
      booleanExpression = true;
    } else if (expressionValue == "false") {
      booleanExpression = false;
    } else {
      booleanExpression = Boolean(expressionValue);
    }

    if (!booleanExpression) {
      ifDirective?.remove();
    } else {
      ifDirective?.removeAttribute("bizIf");
    }
  });

  // for directive - support
  const forDirectives = template.querySelectorAll("[bizFor]");
  forDirectives?.forEach((forDirective) => {
    const forExpressionValue: string | null =
      forDirective?.getAttribute("bizFor");
    let templates: { template: string; data: any }[] = [];
    forDirective?.removeAttribute("bizFor");
    forExpressionValue &&
      imports?.[forExpressionValue]?.forEach((item: object) => {
        templates.push({ template: forDirective.outerHTML, data: item });
      });
    const replaced = templates.map((item: any) => {
      let interpolatedItem = item.template;
      for (const [k, v] of Object.entries(item.data)) {
        let regex = new RegExp(`{{${k}}}`, "g");
        interpolatedItem = interpolatedItem.replace(regex, v);
      }
      return interpolatedItem;
    });
    if (forDirective) {
      forDirective.outerHTML = replaced.join("");
    }
  });
}
