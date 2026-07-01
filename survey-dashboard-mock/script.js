const colors = ["#003b88", "#00a7c8", "#23966f", "#c89431", "#d94b38", "#6f7d92"];

const dashboards = {
  existing: {
    kicker: "EXISTING OWNER SURVEY",
    title: "創業50周年記念 既存オーナーアンケート集計",
    trendNote: "配布 1,206件 / 回答 468件",
    kpis: [
      ["回答数", "468", "前週比 +84"],
      ["回答率", "38.8%", "目標 45%"],
      ["投資見込み", "172件", "追加取得意向あり"],
      ["相談希望", "96件", "営業フォロー候補"],
    ],
    trend: [
      ["6/1", 18],
      ["6/5", 42],
      ["6/10", 74],
      ["6/15", 113],
      ["6/20", 169],
      ["6/25", 254],
      ["6/30", 356],
      ["7/2", 468],
    ],
    donutTitle: "不動産投資の方針",
    donut: [
      ["積極的に取得", 18],
      ["良ければ取得", 19],
      ["現状維持", 42],
      ["将来売却", 16],
      ["直ちに売却", 5],
    ],
    barTitle: "募集条件緩和の意向",
    bars: [
      ["賃料値下げ裁量を委任", 44],
      ["フリーレント導入", 31],
      ["トリプルゼロ導入", 22],
      ["条件緩和しない", 18],
      ["個別相談", 15],
    ],
    signalTitle: "優先フォロー候補",
    signals: [
      ["修", "修繕方針が積極的", "外壁・室内の投資余地", 138],
      ["投", "購入意向あり", "収益物件紹介の対象", 172],
      ["相", "相続相談あり", "承継提案の入口", 63],
      ["売", "売却方針", "査定・出口戦略提案", 98],
    ],
    matrixTitle: "オーナー意向セグメント",
    matrixColumns: ["修繕", "募集", "投資", "承継"],
    matrixRows: [
      ["高関与層", [4, 3, 4, 2]],
      ["収益改善層", [3, 4, 3, 1]],
      ["現状維持層", [2, 2, 1, 2]],
      ["売却検討層", [1, 2, 1, 4]],
    ],
  },
  new: {
    kicker: "NEW OWNER ONBOARDING",
    title: "新規受託アンケート集計",
    trendNote: "受付 86件 / 契約準備中 64件",
    kpis: [
      ["受付数", "86", "今月 +21"],
      ["電子契約", "72%", "書面契約 28%"],
      ["書類提出済", "61件", "未提出 25件"],
      ["投資意向", "29件", "追加提案候補"],
    ],
    trend: [
      ["6/1", 4],
      ["6/5", 11],
      ["6/10", 18],
      ["6/15", 31],
      ["6/20", 45],
      ["6/25", 58],
      ["6/30", 73],
      ["7/2", 86],
    ],
    donutTitle: "契約方法",
    donut: [
      ["電子契約", 72],
      ["書面契約", 28],
    ],
    barTitle: "希望連絡手段",
    bars: [
      ["メール", 46],
      ["LINE", 34],
      ["電話", 20],
      ["その他", 6],
    ],
    signalTitle: "手続き・提案シグナル",
    signals: [
      ["書", "本人確認書類未提出", "リマインド対象", 25],
      ["口", "送金口座未確定", "契約前確認", 14],
      ["投", "購入意向あり", "収益物件紹介候補", 29],
      ["承", "後継者未定", "承継ヒアリング候補", 33],
    ],
    matrixTitle: "契約準備ステータス",
    matrixColumns: ["情報", "書類", "口座", "提案"],
    matrixRows: [
      ["法人オーナー", [3, 2, 2, 3]],
      ["個人オーナー", [2, 3, 3, 2]],
      ["投資意向あり", [2, 2, 2, 4]],
      ["後継者未定", [1, 2, 2, 3]],
    ],
  },
};

const els = {
  updatedAt: document.getElementById("updatedAt"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  toolBtns: Array.from(document.querySelectorAll(".tool-btn")),
  kicker: document.getElementById("dashboardKicker"),
  title: document.getElementById("dashboardTitle"),
  kpiGrid: document.getElementById("kpiGrid"),
  trendNote: document.getElementById("trendNote"),
  trendChart: document.getElementById("trendChart"),
  donutTitle: document.getElementById("donutTitle"),
  donutChart: document.getElementById("donutChart"),
  barTitle: document.getElementById("barTitle"),
  barChart: document.getElementById("barChart"),
  signalTitle: document.getElementById("signalTitle"),
  signalList: document.getElementById("signalList"),
  matrixTitle: document.getElementById("matrixTitle"),
  matrixChart: document.getElementById("matrixChart"),
};

let activeDashboard = "existing";

els.updatedAt.textContent = new Date().toLocaleString("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeDashboard = tab.dataset.dashboard;
    els.tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderDashboard();
  });
});

els.toolBtns.forEach((button) => {
  button.addEventListener("click", () => {
    els.toolBtns.forEach((item) => item.classList.toggle("is-active", item === button));
  });
});

renderDashboard();

function renderDashboard() {
  const data = dashboards[activeDashboard];
  els.kicker.textContent = data.kicker;
  els.title.textContent = data.title;
  els.trendNote.textContent = data.trendNote;
  els.donutTitle.textContent = data.donutTitle;
  els.barTitle.textContent = data.barTitle;
  els.signalTitle.textContent = data.signalTitle;
  els.matrixTitle.textContent = data.matrixTitle;

  els.kpiGrid.innerHTML = data.kpis.map(renderKpi).join("");
  renderTrend(data.trend);
  renderDonut(data.donut);
  renderBars(data.bars);
  renderSignals(data.signals);
  renderMatrix(data.matrixColumns, data.matrixRows);
}

function renderKpi([label, value, note]) {
  return `
    <article class="kpi-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function renderTrend(points) {
  const max = Math.max(...points.map(([, value]) => value));
  els.trendChart.innerHTML = points
    .map(([label, value]) => {
      const height = Math.max(18, Math.round((value / max) * 190));
      return `
        <div class="trend-bar">
          <span style="height:${height}px"></span>
          <strong>${escapeHtml(String(value))}</strong>
          <em>${escapeHtml(label)}</em>
        </div>
      `;
    })
    .join("");
}

function renderDonut(items) {
  const total = items.reduce((sum, [, value]) => sum + value, 0);
  let current = 0;
  const gradient = items
    .map(([, value], index) => {
      const start = current;
      current += (value / total) * 100;
      return `${colors[index % colors.length]} ${start}% ${current}%`;
    })
    .join(", ");

  els.donutChart.innerHTML = `
    <div class="donut" data-total="${total}%" style="background: conic-gradient(${gradient})"></div>
    <div class="legend">
      ${items
        .map(
          ([label, value], index) => `
            <div class="legend-item">
              <span class="dot" style="background:${colors[index % colors.length]}"></span>
              <span>${escapeHtml(label)}</span>
              <strong>${value}%</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderBars(items) {
  const max = Math.max(...items.map(([, value]) => value));
  els.barChart.innerHTML = items
    .map(([label, value]) => {
      const width = Math.round((value / max) * 100);
      return `
        <div class="bar-row">
          <div class="bar-meta">
            <span>${escapeHtml(label)}</span>
            <strong>${value}%</strong>
          </div>
          <div class="bar-track"><span class="bar-fill" style="width:${width}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function renderSignals(items) {
  els.signalList.innerHTML = items
    .map(
      ([icon, title, desc, score]) => `
        <div class="signal-item">
          <span class="signal-icon">${escapeHtml(icon)}</span>
          <div>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(desc)}</span>
          </div>
          <span class="signal-score">${score}</span>
        </div>
      `,
    )
    .join("");
}

function renderMatrix(columns, rows) {
  const headers = [`<div class="matrix-cell header"></div>`]
    .concat(columns.map((column) => `<div class="matrix-cell header">${escapeHtml(column)}</div>`))
    .join("");

  const body = rows
    .map(([label, values]) => {
      const cells = values
        .map((value) => `<div class="matrix-cell" data-level="${value}"><strong>${value}</strong><small>priority</small></div>`)
        .join("");
      return `<div class="matrix-cell label">${escapeHtml(label)}</div>${cells}`;
    })
    .join("");

  els.matrixChart.innerHTML = headers + body;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
