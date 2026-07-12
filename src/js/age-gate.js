document.addEventListener("DOMContentLoaded", () => {
  const gate = document.querySelector("[data-age-gate]");
  const enterButton = document.querySelector("[data-age-enter]");

  if (!gate || !enterButton) {
    return;
  }

  const confirmed = localStorage.getItem("fangAgeConfirmed");

  if (confirmed === "true") {
    gate.hidden = true;
    return;
  }

  gate.hidden = false;
  document.documentElement.classList.add("is-age-gate-open");

  enterButton.addEventListener("click", () => {
    localStorage.setItem("fangAgeConfirmed", "true");
    gate.hidden = true;
    document.documentElement.classList.remove("is-age-gate-open");
  });
});