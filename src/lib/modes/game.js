import { h } from "../render.js";
import { loadState, saveState } from "../storage.js";
import { renderMcq, isMcqCorrect } from "../render-qa.js";

function pickMcq(bank, n) {
  const arr = bank.questions.filter((q) => q.type === "mcq");
  const pool = arr.length ? arr : bank.questions;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}

export function viewGame() {
  const state = loadState();
  const bank = state.currentBank;

  if (!bank) {
    return h("div", { class: "card" }, [
      h("div", { class: "title" }, "闯关模式"),
      h("div", { class: "subtitle" }, "请先到【学习】加载示例题库，或在【题库】导入题库。")
    ]);
  }

  const levelSize = 10;
  const qs = pickMcq(bank, levelSize);
  let i = 0;
  let points = state.gameStats?.points || 0;
  let level = state.gameStats?.level || 1;
  let showHint = false;

  const root = h("div", { class: "card" }, [
    h("div", { class: "title" }, "闯关模式"),
    h("div", { class: "subtitle", id: "game-meta" }, ""),
    h("div", { class: "divider" }),
    h("div", { id: "game-body" }, "")
  ]);

  function updateMeta() {
    document.getElementById("game-meta").textContent = `关卡：${level}｜分数：${points}｜进度：${Math.min(i + 1, levelSize)}/${levelSize}`;
  }

  function persist() {
    state.gameStats = { level, points };
    saveState(state);
  }

  function finish() {
    const body = document.getElementById("game-body");
    body.innerHTML = "";
    body.appendChild(
      h("div", { class: "card", style: "padding:12px;" }, [
        h("div", { class: "pill" }, "结算"),
        h("div", { style: "margin-top:8px;" }, `本关得分：${points}`),
        h("div", { class: "muted", style: "margin-top:6px;" }, "提示：查看提示会扣 3 分；答错扣 5 分。"),
        h("div", { style: "margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;" }, [
          h("a", { class: "btn primary", href: "#/game" }, "再来一关"),
          h("a", { class: "btn", href: "#/wrongs" }, "查看错题")
        ])
      ])
    );
  }

  function next() {
    updateMeta();
    const body = document.getElementById("game-body");
    body.innerHTML = "";

    const q = qs[i];
    body.appendChild(h("div", { class: "pill" }, `第 ${i + 1} 题`));
    body.appendChild(h("div", { class: "prompt" }, q.prompt));

    const qa = renderMcq(q, { showHint }, (evt) => {
      if (evt.type === "toggleHint") {
        const nextShow = evt.showHint;
        // 第一次打开提示：扣 3 分
        if (nextShow && !showHint) points = Math.max(0, points - 3);
        showHint = nextShow;
        persist();
        next();
        return;
      }
      if (evt.type === "submit") {
        const ok = isMcqCorrect(q, evt.chosen);
        points = Math.max(0, points + (ok ? 10 : -5));
        if (!ok) state.wrongBook[q.id] = true;
        state.progress[q.id] = {
          ...(state.progress[q.id] || {}),
          attempts: (state.progress[q.id]?.attempts || 0) + 1,
          correct: ok,
          lastAt: Date.now(),
          usedHint: showHint
        };
        persist();

        i++;
        showHint = false;
        if (i >= levelSize) {
          level += 1;
          persist();
          finish();
        } else {
          next();
        }
      }
    });

    body.appendChild(h("div", { class: "divider" }));
    body.appendChild(qa);
  }

  next();
  return root;
}

