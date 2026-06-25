document.addEventListener("DOMContentLoaded", () => {
  const gate = document.querySelector("[data-content-gate]");
  const body = document.querySelector("[data-content-body]");
  const enterButton = document.querySelector("[data-content-enter]");

  if (!gate || !body || !enterButton) {
    return;
  }

  enterButton.addEventListener("click", () => {
    gate.hidden = true;
    body.hidden = false;

    const heading = document.querySelector(".scenario-header h1");
    if (heading) {
      heading.focus?.();
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});