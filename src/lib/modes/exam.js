import { h } from "../render.js";
import { loadState, saveState } from "../storage.js";
import { isMcqCorrect } from "../render-qa.js";

function pickExamQs(bank, n) {
  const mcq = bank.questions.filter((q) => q.type === "mcq");
  const pool = mcq.length ? mcq : bank.questions;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}

export function viewExam() {
  const state = loadState();
  const bank = state.currentBank;

  if (!bank) {
    return h("div", { class: "card" }, [
      h("div", { class: "title" }, "考试模拟"),
      h("div", { class: "subtitle" }, "请先到【学习】加载示例题库，或在【题库】导入题库。")
    ]);
  }

  const total = 10;
  const qs = pickExamQs(bank, total);
  const answers = {};
  let idx = 0;
  let left = 15 * 60; // 15 分钟
  let timer = null;

  const root = h("div", { class: "card" }, [
    h("div", { class: "title" }, "考试模拟（MVP）"),
    h("div", { class: "subtitle", id: "exam-meta" }, ""),
    h("div", { class: "divider" }),
    h("div", { id: "exam-body" }, "")
  ]);

  function cleanup() {
    if (timer) clearInterval(timer);
    timer = null;
    window.removeEventListener("hashchange", cleanup);
  }
  window.addEventListener("hashchange", cleanup);

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function updateMeta() {
    document.getElementById("exam-meta").textContent = `剩余时间：${fmtTime(left)}｜进度：${idx + 1}/${total}`;
  }

  function finish() {
    cleanup();
    let correct = 0;
    const wrongs = [];

    qs.forEach((q) => {
      const chosen = answers[q.id] || "";
      const ok = isMcqCorrect(q, chosen);
      if (ok) correct++;
      else wrongs.push({ q, chosen });

      state.progress[q.id] = {
        ...(state.progress[q.id] || {}),
        attempts: (state.progress[q.id]?.attempts || 0) + 1,
        correct: ok,
        lastAt: Date.now(),
        usedHint: false
      };
      if (!ok) state.wrongBook[q.id] = true;
    });

    state.examHistory.push({ at: Date.now(), total, correct });
    saveState(state);

    const body = document.getElementById("exam-body");
    body.innerHTML = "";
    body.appendChild(
      h("div", { class: "card", style: "padding:12px;" }, [
        h("div", { class: "pill" }, "成绩报告"),
        h("div", { style: "margin-top:8px;" }, `正确率：${correct}/${total}`),
        h("div", { class: "muted", style: "margin-top:6px;" }, "错题已自动加入错题本（可在错题本复习）。"),
        h("div", { class: "divider" }),
        ...wrongs.slice(0, 6).map(({ q, chosen }) =>
          h("div", { class: "card", style: "padding:12px; margin-bottom:10px;" }, [
            h("div", { class: "pill" }, "错题"),
            h("div", { class: "prompt" }, q.prompt),
            h("div", { class: "muted", style: "margin-top:8px; white-space:pre-wrap;" }, `你的选择：${chosen || "（未作答）"}｜正确答案：${q.answer}`),
            h("div", { class: "card", style: "padding:12px; margin-top:10px;" }, [
              h("div", { class: "pill" }, "小提示"),
              h("div", { style: "margin-top:8px; white-space:pre-wrap; line-height:1.65;" }, q.hint)
            ])
          ])
        ),
        h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;" }, [
          h("a", { class: "btn primary", href: "#/exam" }, "再来一套"),
          h("a", { class: "btn", href: "#/wrongs" }, "去错题本")
        ])
      ])
    );
  }

  function renderQ() {
    updateMeta();
    const q = qs[idx];
    const body = document.getElementById("exam-body");
    body.innerHTML = "";

    body.appendChild(h("div", { class: "pill" }, `第 ${idx + 1} 题 / ${total}`));
    body.appendChild(h("div", { class: "prompt" }, q.prompt));

    const opts = h("div", { class: "grid2", style: "margin-top:10px;" }, q.options.map((o) => {
      return h("label", { class: "card option" }, [
        h("div", {}, [
          h("input", {
            type: "radio",
            name: `exam-${q.id}`,
            value: o.key,
            checked: answers[q.id] === o.key ? "" : null,
            onChange: (e) => { answers[q.id] = e.target.value; }
          }),
          h("span", { style: "margin-left:10px;" }, `${o.key}. ${o.text}`)
        ])
      ]);
    }));

    const actions = h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;" }, [
      h("button", { class: "btn", onClick: () => { if (idx > 0) { idx--; renderQ(); } } }, "上一题"),
      h("button", { class: "btn primary", onClick: () => { if (idx < total - 1) { idx++; renderQ(); } } }, "下一题"),
      h("button", { class: "btn good", onClick: () => finish() }, "交卷")
    ]);

    body.appendChild(opts);
    body.appendChild(actions);
  }

  timer = setInterval(() => {
    left -= 1;
    if (left <= 0) finish();
    else updateMeta();
  }, 1000);

  renderQ();
  return root;
}

