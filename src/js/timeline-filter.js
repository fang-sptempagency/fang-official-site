console.log("🔥 route-filter.js NEW VERSION loaded");

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-route-filter]");
  const items = document.querySelectorAll(".scenario-branch-route [data-routes]");

  console.log("[route-filter] loaded");
  console.log("[route-filter] buttons:", buttons.length);
  console.log("[route-filter] items:", items.length);

  if (!buttons.length || !items.length) {
    return;
  }

  const applyFilter = (route) => {
    items.forEach((item) => {
      const itemRoutes = (item.dataset.routes || "")
        .split(/\s+/)
        .filter(Boolean);

      item.hidden = !itemRoutes.includes(route);
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.routeFilter === route;
      button.setAttribute("aria-pressed", String(isActive));
    });

    const descriptions = document.querySelectorAll("[data-route-description]");

    descriptions.forEach((description) => {
      description.hidden = description.dataset.routeDescription !== route;
    });

    history.replaceState(null, "", `#${route}`);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.routeFilter);
    });
  });

  const initialRoute = window.location.hash.replace("#", "") || "fang";
  const validRoutes = Array.from(buttons).map((button) => button.dataset.routeFilter);

  applyFilter(validRoutes.includes(initialRoute) ? initialRoute : "fang");
});