const NS = "cet6web:v1:";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function defaults() {
  return {
    currentBank: null,
    progress: {}, // { [qid]: { attempts, correct, lastAt, usedHint, text? } }
    wrongBook: {}, // { [qid]: true }
    favorites: {}, // { [qid]: true }
    gameStats: { level: 1, points: 0 },
    examHistory: []
  };
}

export function loadState() {
  const d = defaults();
  const raw = localStorage.getItem(NS + "state");
  if (!raw) return d;
  const s = safeParse(raw, d);
  return { ...d, ...s };
}

export function saveState(state) {
  localStorage.setItem(NS + "state", JSON.stringify(state));
}

export function resetState(keepBank = true) {
  const d = defaults();
  if (keepBank) {
    const s = loadState();
    d.currentBank = s.currentBank;
  }
  saveState(d);
  return d;
}

