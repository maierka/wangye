function isStr(x) {
  return typeof x === "string" && x.trim().length > 0;
}
function isNum(x) {
  return typeof x === "number" && Number.isFinite(x);
}

/**
 * 导入题库校验：保证结构正确，尤其是 hint（每题必填）
 * @param {any} bank
 * @returns {{ok:boolean, errors:string[]}}
 */
export function validateBank(bank) {
  const errors = [];
  if (!bank || typeof bank !== "object") return { ok: false, errors: ["题库不是对象"] };
  if (!isStr(bank.title || "")) errors.push("title 必须是非空字符串");
  if (!Array.isArray(bank.questions)) errors.push("questions 必须是数组");

  const qs = Array.isArray(bank.questions) ? bank.questions : [];
  const idSet = new Set();

  qs.forEach((q, i) => {
    const at = `questions[${i}]`;
    if (!isStr(q?.id)) errors.push(`${at}.id 必须是非空字符串`);
    else {
      if (idSet.has(q.id)) errors.push(`${at}.id 重复：${q.id}`);
      idSet.add(q.id);
    }

    if (!isStr(q?.type)) errors.push(`${at}.type 必须是非空字符串`);
    if (!isNum(q?.year)) errors.push(`${at}.year 必须是数字（如 2025）`);
    if (!["user", "original"].includes(q?.source)) errors.push(`${at}.source 必须是 user|original`);
    if (!isStr(q?.prompt)) errors.push(`${at}.prompt 必须是非空字符串`);
    if (!isStr(q?.hint)) errors.push(`${at}.hint（小提示）必填，且不能为空`);

    if (q?.tags !== undefined && !Array.isArray(q.tags)) errors.push(`${at}.tags 若存在必须是数组`);

    if (q?.type === "mcq") {
      if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${at}.options 必须是 4 个选项`);
      const okOptions =
        Array.isArray(q.options) &&
        q.options.every((o) => o && isStr(o.key) && isStr(o.text) && "ABCD".includes(o.key));
      if (!okOptions) errors.push(`${at}.options 每个选项必须包含 key(A-D) 与 text`);
      if (!isStr(q.answer) || !"ABCD".includes(q.answer)) errors.push(`${at}.answer 必须是 A/B/C/D`);
    } else if (q?.type === "translation" || q?.type === "writing") {
      if (q.answer !== undefined && typeof q.answer !== "string") errors.push(`${at}.answer 若存在必须是字符串`);
      if (q.explanation !== undefined && typeof q.explanation !== "string") errors.push(`${at}.explanation 若存在必须是字符串`);
    } else {
      errors.push(`${at}.type 暂不支持：${q?.type}`);
    }
  });

  return { ok: errors.length === 0, errors };
}

