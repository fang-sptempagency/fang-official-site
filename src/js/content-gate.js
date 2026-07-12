document.addEventListener("DOMContentLoaded", () => {
  const gate = document.querySelector("[data-content-gate]");
  const enterButton = document.querySelector("[data-content-enter]");
  const bodies = document.querySelectorAll("[data-content-body]");

  if (!gate || !enterButton || !bodies.length) {
    return;
  }

  enterButton.addEventListener("click", () => {
    gate.hidden = true;

    bodies.forEach((body) => {
      body.hidden = false;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});