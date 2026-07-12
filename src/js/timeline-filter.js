document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-route-filter]");
  const items = document.querySelectorAll("[data-routes]");

  if (!buttons.length || !items.length) {
    return;
  }

  const applyFilter = (route) => {
    items.forEach((item) => {
      const itemRoutes = item.dataset.routes.split(" ");
      const shouldShow = route === "all" || itemRoutes.includes(route);

      item.hidden = !shouldShow;
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.routeFilter === route;
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (route === "all") {
      history.replaceState(null, "", window.location.pathname);
    } else {
      history.replaceState(null, "", `#${route}`);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.routeFilter);
    });
  });

  const initialRoute = window.location.hash.replace("#", "") || "all";
  const validRoutes = [
    "all",
    ...Array.from(buttons).map((button) => button.dataset.routeFilter)
  ];

  applyFilter(validRoutes.includes(initialRoute) ? initialRoute : "all");
});