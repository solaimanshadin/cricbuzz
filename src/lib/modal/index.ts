export default function modal(bodyTemplate: string, bindEvents?: Function) {
  const bindOwnEvents = (element: HTMLDivElement) => {
    const modalBody = element.querySelector(".modal__body") as HTMLDivElement;
    modalBody && (modalBody.innerHTML = bodyTemplate || "");

    const modalCloseBtn = element.querySelector(
      ".modal__close-btn"
    ) as HTMLOrSVGImageElement;
    modalCloseBtn.addEventListener("click", () => {
      modalDiv.remove();
    });
    bindEvents && bindEvents(element, () => modalDiv.remove());
  };
  const contentNode = document.getElementById("content");
  const modalDiv = document.createElement("div");
  contentNode?.appendChild(modalDiv);

  const template = `
        <div id="modal"  class="match__extra_data">
        <div class="container">
        <div class="box-shadow">
        <div class="modal__header">
            <svg class="modal__close-btn" xmlns="http://www.w3.org/2000/svg" style="width:30px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div class="modal__body">
        </div>
      </div>
      </div>
    </div>
    `;

  modalDiv.innerHTML = template;

  bindOwnEvents(modalDiv);
}
