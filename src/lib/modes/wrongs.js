import { h } from "../render.js";
import { loadState, saveState } from "../storage.js";

export function viewWrongs() {
  const state = loadState();
  const bank = state.currentBank;

  const items = bank ? bank.questions.filter((q) => state.wrongBook[q.id]) : [];

  function clearWrong(qid) {
    delete state.wrongBook[qid];
    saveState(state);
    location.hash = "#/wrongs";
  }

  return h("div", { class: "card" }, [
    h("div", { class: "title" }, "错题本"),
    h("div", { class: "subtitle" }, `共 ${items.length} 题（仅本机保存）`),
    h("div", { class: "divider" }),
    ...items.map((q) =>
      h("div", { class: "card", style: "padding:12px; margin-bottom:10px;" }, [
        h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; align-items:center;" }, [
          h("div", { class: "pill" }, `题型：${q.type}`),
          h("div", { class: "pill" }, `年份：${q.year}`),
          h("div", { class: "pill" }, `来源：${q.source}`)
        ]),
        h("div", { class: "prompt" }, q.prompt),
        h("div", { class: "card", style: "padding:12px; margin-top:10px;" }, [
          h("div", { class: "pill" }, "小提示"),
          h("div", { style: "margin-top:8px; white-space:pre-wrap; line-height:1.65;" }, q.hint)
        ]),
        h("div", { style: "margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;" }, [
          h("a", { class: "btn primary", href: "#/study" }, "去学习页复习"),
          h("button", { class: "btn", onClick: () => clearWrong(q.id) }, "移出错题本")
        ])
      ])
    ),
    items.length === 0 ? h("div", { class: "muted" }, "暂无错题。去学习/闯关/模考做几题吧。") : null
  ]);
}

