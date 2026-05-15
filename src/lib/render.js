export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = String(v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) el.setAttribute(k, String(v));
  }
  const list = Array.isArray(children) ? children : [children];
  list.filter(Boolean).forEach((c) => el.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return el;
}

export function render(node) {
  const root = document.getElementById("app");
  root.innerHTML = "";
  root.appendChild(node);
}

