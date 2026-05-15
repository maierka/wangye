import { h } from "../render.js";
import { validateBank } from "../schema.js";
import { loadState, saveState } from "../storage.js";
import { SAMPLE_BANK } from "../sample-bank.js";
import { isMcqCorrect, renderMcq, renderTextAnswer } from "../render-qa.js";

function ensureBank(state) {
  if (state.currentBank) return state.currentBank;
  const v = validateBank(SAMPLE_BANK);
  if (!v.ok) throw new Error("内置示例题库损坏：" + v.errors.join("；"));
  state.currentBank = SAMPLE_BANK;
  saveState(state);
  return state.currentBank;
}

function safeIndex(idx, len) {
  if (len <= 0) return 0;
  if (idx < 0) return 0;
  if (idx >= len) return len - 1;
  return idx;
}

export function viewStudy() {
  const root = h("div", { class: "card" }, [
    h("div", { class: "title" }, "学习模式"),
    h("div", { class: "subtitle" }, "做题→提交→看提示/解析→收藏/错题。"),
    h("div", { class: "divider" }),
    h("div", { id: "study-body", class: "muted" }, "加载中…")
  ]);

  // 让页面先渲染出来，再挂载逻辑（避免阻塞）
  setTimeout(() => {
    const state = loadState();
    const bank = ensureBank(state);

    let list = bank.questions.slice();
    let filterType = "all";

    // 记住学习进度
    const last = state.progress?.__lastIndex;
    let idx = safeIndex(typeof last === "number" ? last : 0, list.length);

    let feedback = null;
    let qaState = { chosen: "", showHint: false, showRef: false, text: "" };

    function persistProgress(qid, patch) {
      const prev = state.progress[qid] || {};
      state.progress[qid] = { ...prev, ...patch };
      state.progress.__lastIndex = idx;
      saveState(state);
    }

    function applyFilter() {
      list =
        filterType === "all"
          ? bank.questions.slice()
          : bank.questions.filter((q) => q.type === filterType);
      idx = safeIndex(0, list.length);
      feedback = null;
      qaState = { chosen: "", showHint: false, showRef: false, text: "" };
    }

    function rerender() {
      const body = document.getElementById("study-body");
      body.innerHTML = "";

      if (!list.length) {
        body.appendChild(h("div", { class: "muted" }, "当前筛选下没有题目。"));
        return;
      }

      const q = list[idx];

      const top = h("div", { class: "row" }, [
        h("div", { class: "pill" }, `题型：${q.type}`),
        h("div", { class: "pill" }, `来源：${q.source}`),
        h("div", { class: "pill" }, `年份：${q.year}`)
      ]);

      const filter = h("div", { class: "card", style: "padding:12px; margin-top:10px;" }, [
        h("div", { class: "pill" }, "筛选"),
        h(
          "select",
          {
            style: "margin-top:10px;",
            onChange: (e) => {
              filterType = e.target.value;
              applyFilter();
              rerender();
            }
          },
          [
            h("option", { value: "all" }, "全部题型"),
            h("option", { value: "mcq" }, "单选题"),
            h("option", { value: "translation" }, "翻译"),
            h("option", { value: "writing" }, "写作")
          ]
        )
      ]);
      filter.querySelector("select").value = filterType;

      const prompt = h("div", { class: "prompt" }, q.prompt);

      const fb =
        feedback == null
          ? null
          : h("div", { class: `card ${feedback.ok ? "status-ok" : "status-bad"}`, style: "padding:12px; margin-top:10px;" }, [
              h("div", { class: "pill" }, feedback.ok ? "正确" : "不正确"),
              h("div", { style: "margin-top:8px; white-space:pre-wrap; line-height:1.65;" }, feedback.text)
            ]);

      const qa =
        q.type === "mcq"
          ? renderMcq(q, qaState, (evt) => {
              if (evt.type === "choose") qaState.chosen = evt.chosen;
              if (evt.type === "toggleHint") {
                qaState.showHint = evt.showHint;
                rerender();
              }
              if (evt.type === "submit") {
                const ok = isMcqCorrect(q, evt.chosen);
                persistProgress(q.id, {
                  attempts: (state.progress[q.id]?.attempts || 0) + 1,
                  correct: ok,
                  lastAt: Date.now(),
                  usedHint: !!qaState.showHint
                });
                if (!ok) state.wrongBook[q.id] = true;
                saveState(state);
                feedback = ok
                  ? { ok: true, text: "继续保持！" }
                  : { ok: false, text: `正确答案：${q.answer}\n解析：${q.explanation || "（暂无解析）"}` };
                rerender();
              }
            })
          : renderTextAnswer(q, qaState, (evt) => {
              if (evt.type === "typing") qaState.text = evt.text;
              if (evt.type === "toggleHint") {
                qaState.showHint = evt.showHint;
                rerender();
              }
              if (evt.type === "toggleRef") {
                qaState.showRef = evt.showRef;
                rerender();
              }
              if (evt.type === "save") {
                persistProgress(q.id, {
                  attempts: (state.progress[q.id]?.attempts || 0) + 1,
                  correct: null,
                  lastAt: Date.now(),
                  usedHint: !!qaState.showHint,
                  text: evt.text
                });
                feedback = { ok: true, text: "已保存你的答案（主观题不自动判分）。" };
                rerender();
              }
            });

      const nav = h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;" }, [
        h("button", {
          class: "btn",
          onClick: () => {
            idx = safeIndex(idx - 1, list.length);
            feedback = null;
            qaState = { chosen: "", showHint: false, showRef: false, text: "" };
            state.progress.__lastIndex = idx;
            saveState(state);
            rerender();
          }
        }, "上一题"),
        h("button", {
          class: "btn primary",
          onClick: () => {
            idx = safeIndex(idx + 1, list.length);
            feedback = null;
            qaState = { chosen: "", showHint: false, showRef: false, text: "" };
            state.progress.__lastIndex = idx;
            saveState(state);
            rerender();
          }
        }, "下一题"),
        h("button", {
          class: "btn",
          onClick: () => {
            idx = Math.floor(Math.random() * list.length);
            feedback = null;
            qaState = { chosen: "", showHint: false, showRef: false, text: "" };
            state.progress.__lastIndex = idx;
            saveState(state);
            rerender();
          }
        }, "随机一题")
      ]);

      const ops = h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;" }, [
        h("button", {
          class: `btn ${state.favorites[q.id] ? "good" : ""}`,
          onClick: () => {
            if (state.favorites[q.id]) delete state.favorites[q.id];
            else state.favorites[q.id] = true;
            saveState(state);
            rerender();
          }
        }, state.favorites[q.id] ? "已收藏" : "收藏"),
        h("button", {
          class: "btn",
          onClick: () => {
            state.wrongBook[q.id] = true;
            saveState(state);
            rerender();
          }
        }, "加入错题"),
        h("span", { class: "pill" }, `进度：${idx + 1}/${list.length}`)
      ]);

      body.appendChild(top);
      body.appendChild(filter);
      body.appendChild(prompt);
      if (fb) body.appendChild(fb);
      body.appendChild(h("div", { class: "divider" }));
      body.appendChild(qa);
      body.appendChild(nav);
      body.appendChild(ops);
    }

    rerender();
  }, 0);

  return root;
}

