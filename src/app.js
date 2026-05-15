import { getRoute, onRouteChange, setActiveNav } from "./lib/router.js";
import { render, h } from "./lib/render.js";

import { viewStudy } from "./lib/modes/study.js";
import { viewGame } from "./lib/modes/game.js";
import { viewExam } from "./lib/modes/exam.js";
import { viewBank } from "./lib/modes/bank.js";
import { viewWrongs } from "./lib/modes/wrongs.js";

const routes = {
  "/study": viewStudy,
  "/game": viewGame,
  "/exam": viewExam,
  "/bank": viewBank,
  "/wrongs": viewWrongs
};

function notFound(path) {
  return h("div", { class: "card" }, [
    h("div", { class: "title" }, "页面不存在"),
    h("div", { class: "subtitle" }, `未找到路由：${path}`),
    h("a", { class: "btn primary", href: "#/study" }, "回到学习")
  ]);
}

function mount() {
  const { path } = getRoute();
  const view = routes[path] || (() => notFound(path));
  setActiveNav(path in routes ? path : "/study");
  render(view());
}

onRouteChange(mount);
mount();

