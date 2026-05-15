export function getRoute() {
  const h = location.hash || "#/study";
  const [path, query] = h.slice(1).split("?");
  const params = new URLSearchParams(query || "");
  return { path, params };
}

export function setActiveNav(path) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  [...nav.querySelectorAll("a")].forEach((a) => {
    const href = a.getAttribute("href") || "";
    a.classList.toggle("active", href === `#${path}`);
  });
}

export function onRouteChange(cb) {
  window.addEventListener("hashchange", cb);
}

