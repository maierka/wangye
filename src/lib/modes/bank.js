import { h } from "../render.js";
import { validateBank } from "../schema.js";
import { loadState, saveState, resetState } from "../storage.js";

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function viewBank() {
  const state = loadState();
  const msg = h("div", { class: "muted", style: "margin-top:10px; white-space:pre-wrap;" }, "");

  const fileInput = h("input", {
    type: "file",
    accept: "application/json",
    onChange: async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const text = await f.text();
      let bank;
      try {
        bank = JSON.parse(text);
      } catch {
        msg.textContent = "JSON 解析失败，请检查文件格式。";
        return;
      }
      const v = validateBank(bank);
      if (!v.ok) {
        msg.textContent = "题库校验失败：\n" + v.errors.join("\n");
        return;
      }
      state.currentBank = bank;
      saveState(state);
      msg.textContent = `导入成功：${bank.title}（${bank.questions.length} 题）`;
    }
  });

  return h("div", { class: "card" }, [
    h("div", { class: "title" }, "题库管理"),
    h("div", { class: "subtitle" }, "导入/导出 JSON（导入会替换当前题库；学习记录仍保留）。"),
    h("div", { class: "divider" }),

    h("div", { class: "card", style: "padding:12px;" }, [
      h("div", { class: "pill" }, "导入题库 JSON"),
      h("div", { style: "margin-top:10px;" }, [fileInput]),
      msg
    ]),

    h("div", { class: "divider" }),

    h("div", { class: "row" }, [
      h(
        "button",
        {
          class: "btn primary",
          onClick: () => {
            if (!state.currentBank) {
              msg.textContent = "当前没有题库。你可以先去【学习】页加载示例题库，或导入题库 JSON。";
              return;
            }
            downloadJson("question-bank.export.json", state.currentBank);
          }
        },
        "导出当前题库"
      ),
      h(
        "button",
        {
          class: "btn",
          onClick: () => downloadJson("learning-data.export.json", { ...state, currentBank: null })
        },
        "导出学习数据"
      )
    ]),

    h("div", { class: "divider" }),

    h("div", { style: "display:flex; gap:10px; flex-wrap:wrap;" }, [
      h(
        "button",
        {
          class: "btn bad",
          onClick: () => {
            resetState(true);
            msg.textContent = "已重置学习数据（保留当前题库）。";
          }
        },
        "重置学习数据"
      ),
      h(
        "button",
        {
          class: "btn warn",
          onClick: () => downloadJson("question-bank.sample.json", state.currentBank || null)
        },
        "导出题库（用于编辑）"
      )
    ])
  ]);
}

