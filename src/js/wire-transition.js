document.addEventListener("DOMContentLoaded", () => {

  const links = document.querySelectorAll("[wire-transition]");
  const overlay = document.querySelector("[wire-transition-overlay]");

  if (!links.length || !overlay) {
    return;
  }

  const transitionDuration = 520;

  const resetOverlay = () => {
    overlay.classList.remove("is-active");
    overlay.removeAttribute("style");
    overlay.setAttribute("aria-hidden", "true");
  };

  // 初回表示時にも念のためリセット
  resetOverlay();

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href) {
            return;
        }

        if (
            link.target === "_blank" ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        ) {
            return;
        }

        event.preventDefault();

        overlay.setAttribute("aria-hidden", "false");
        overlay.classList.add("is-active");

        window.setTimeout(() => {
            window.location.href = href;
        }, transitionDuration);
        });
    });

    // ブラウザバック/進むでbfcacheから復元された時にリセット
    window.addEventListener("pageshow", () => {
        resetOverlay();
    });

    window.addEventListener("pagehide", () => {
        resetOverlay();
    });
});