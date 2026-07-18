document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-person-filter]");
  const cards = document.querySelectorAll("[data-persons]");

  if (!buttons.length || !cards.length) {
    return;
  }

  const applyFilter = (selectedPerson) => {
    cards.forEach((card) => {
      const persons = card.dataset.persons || "";

      const shouldShow =
        selectedPerson === "all" || persons.split(" ").includes(selectedPerson);

      card.hidden = !shouldShow;
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.personFilter === selectedPerson;
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (selectedPerson === "all") {
      history.replaceState(null, "", window.location.pathname);
    } else {
      history.replaceState(
        null,
        "",
        `#person-${encodeURIComponent(selectedPerson)}`
      );
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.personFilter);
    });
  });

  const hash = decodeURIComponent(window.location.hash.replace("#person-", ""));
  const validPersons = Array.from(buttons).map((button) => button.dataset.personFilter);

  applyFilter(validPersons.includes(hash) ? hash : "all");
});