interface ToastConfig {
  timeOut?: number;
  type?: "success" | "error" | "warning";
}

export default function toast(bodyTemplate: string, config: ToastConfig): void {
  const bindOwnEvents = (element: HTMLDivElement) => {
    const toastBody = element.querySelector(".toast__body") as HTMLDivElement;

    toastBody.innerHTML = bodyTemplate || "";
    let timeOut: ReturnType<typeof setTimeout>;
    if (config.timeOut) {
      timeOut = setTimeout(() => {
        toastDiv.remove();
      }, config.timeOut);
    }

    config.timeOut;
    const toastCloseBtn = element.querySelector(
      ".toast__close-btn"
    ) as HTMLOrSVGImageElement;
    toastCloseBtn.addEventListener("click", () => {
      clearTimeout(timeOut);
      toastDiv.remove();
    });
  };

  const contentNode = document.getElementById("content") as HTMLDivElement;
  const toastDiv = document.createElement("div");
  contentNode.appendChild(toastDiv);

  const template = `
        <div class="toast">
        <div class="toast__icon">
            ${
              config.type == "error"
                ? `<svg
                xmlns="http://www.w3.org/2000/svg"
                class="toast__icon--error"
                viewBox="0 0 20 20"
                fill="currentColor"
                >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
                </svg>`
                : config.type == "warning"
                ? `<svg
                xmlns="http://www.w3.org/2000/svg"
                class="toast__icon--warning"
                viewBox="0 0 20 20"
                fill="currentColor"
                >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                />
                </svg>`
                : `<svg
                xmlns="http://www.w3.org/2000/svg"
                class="toast__icon--success"
                viewBox="0 0 20 20"
                fill="currentColor"
                >
                <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                />
                </svg>`
            }
        </div>
        <div class="toast__body">
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="toast__close-btn" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
    </div>
    `;

  toastDiv.innerHTML = template;

  bindOwnEvents(toastDiv);
}
