import { h } from "./render.js";

export function hintBox(hintText) {
  return h("div", { class: "card", style: "padding:12px; margin-top:10px;" }, [
    h("div", { class: "pill" }, ["小提示", h("span", { class: "mono" }, "hint")]),
    h("div", { style: "margin-top:8px; white-space:pre-wrap; line-height:1.65;" }, hintText)
  ]);
}

export function isMcqCorrect(q, chosen) {
  return q?.type === "mcq" && chosen && chosen === q.answer;
}

export function renderMcq(q, state, onEvent) {
  let chosen = state.chosen ?? "";
  let showHint = !!state.showHint;

  const opts = h("div", { class: "grid2", style: "margin-top:10px;" }, q.options.map((o) => {
    return h("label", { class: "card option" }, [
      h("div", {}, [
        h("input", {
          type: "radio",
          name: `q-${q.id}`,
          value: o.key,
          checked: chosen === o.key ? "" : null,
          onChange: (e) => {
            chosen = e.target.value;
            onEvent({ type: "choose", chosen });
          }
        }),
        h("span", { style: "margin-left:10px;" }, `${o.key}. ${o.text}`)
      ])
    ]);
  }));

  const actions = h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;" }, [
    h("button", {
      class: "btn",
      onClick: () => {
        showHint = !showHint;
        onEvent({ type: "toggleHint", showHint });
      }
    }, showHint ? "隐藏提示" : "查看提示"),
    h("button", {
      class: "btn primary",
      onClick: () => onEvent({ type: "submit", chosen })
    }, "提交")
  ]);

  const blocks = [opts, actions];
  if (showHint) blocks.push(hintBox(q.hint));
  return h("div", {}, blocks);
}

export function renderTextAnswer(q, state, onEvent) {
  let text = state.text ?? "";
  let showHint = !!state.showHint;
  let showRef = !!state.showRef;

  const input = h("textarea", {
    placeholder: "在这里输入你的答案…（主观题不自动判分）",
    onInput: (e) => {
      text = e.target.value;
      onEvent({ type: "typing", text });
    }
  }, []);
  if (text) input.value = text;

  const actions = h("div", { style: "display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;" }, [
    h("button", {
      class: "btn",
      onClick: () => {
        showHint = !showHint;
        onEvent({ type: "toggleHint", showHint });
      }
    }, showHint ? "隐藏提示" : "查看提示"),
    h("button", { class: "btn primary", onClick: () => onEvent({ type: "save", text }) }, "保存答案"),
    h("button", {
      class: "btn",
      onClick: () => {
        showRef = !showRef;
        onEvent({ type: "toggleRef", showRef });
      }
    }, showRef ? "隐藏参考" : "参考答案/范文")
  ]);

  const blocks = [input, actions];
  if (showHint) blocks.push(hintBox(q.hint));
  if (showRef) {
    blocks.push(h("div", { class: "card", style: "padding:12px; margin-top:10px;" }, [
      h("div", { class: "pill" }, "参考"),
      h("div", { style: "margin-top:8px; white-space:pre-wrap; line-height:1.65;" }, q.answer || "（该题暂无参考答案）")
    ]));
  }
  return h("div", {}, blocks);
}

