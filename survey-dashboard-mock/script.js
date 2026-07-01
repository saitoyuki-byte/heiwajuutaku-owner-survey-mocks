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
    respondents: [
      {
        id: "EX-1042",
        name: "佐藤 一郎",
        property: "青葉レジデンス",
        submitted: "2026/07/02 09:14",
        status: "投資意向あり",
        score: "高",
        summary: "修繕と追加取得に前向き。物件紹介と外壁修繕提案の優先度が高い回答。",
        answers: [
          ["外壁・屋根", "耐用年数を伸長させる建物保全を行いたい"],
          ["室内修繕", "家賃維持を目的としたリフォームを希望"],
          ["募集条件", "賃料値下げ裁量を委任、フリーレント導入"],
          ["不動産投資", "積極的に収益不動産を追加取得したい"],
          ["相談事項", "築古物件の修繕計画と購入候補について相談したい"],
        ],
      },
      {
        id: "EX-1038",
        name: "株式会社泉中央企画",
        property: "泉中央パークビル",
        submitted: "2026/07/01 17:46",
        status: "売却検討",
        score: "中",
        summary: "近い将来の売却方針。査定・出口戦略の案内が有効な回答。",
        answers: [
          ["外壁・屋根", "最低限必要な修繕のみ行いたい"],
          ["室内修繕", "現状維持程度の修繕に留める"],
          ["募集方針", "募集条件を緩和して早期入居を優先"],
          ["不動産投資", "将来売却方針"],
          ["相談事項", "売却時期と概算査定について相談したい"],
        ],
      },
      {
        id: "EX-1029",
        name: "高橋 美智子",
        property: "一番町コート",
        submitted: "2026/07/01 11:22",
        status: "相続相談",
        score: "高",
        summary: "後継者未定で相続相談ニーズあり。承継面談の候補。",
        answers: [
          ["外壁・屋根", "まだ具体的には決まっていない"],
          ["室内修繕", "家賃を維持できるようにリフォームしたい"],
          ["募集条件", "条件緩和は都度相談"],
          ["相続", "相続について相談したい"],
          ["自由記述", "子どもに賃貸経営を引き継ぐべきか相談したい"],
        ],
      },
      {
        id: "EX-1017",
        name: "山田 太郎",
        property: "平和レジデンス一番町",
        submitted: "2026/06/30 15:08",
        status: "現状維持",
        score: "低",
        summary: "現状維持寄り。大きな営業アクションより定期接点向き。",
        answers: [
          ["外壁・屋根", "安全面を維持できる程度の修繕のみ"],
          ["室内修繕", "多少賃料が下がっても現状維持"],
          ["募集方針", "リフォームも条件緩和もせず待つ"],
          ["不動産投資", "現状維持"],
          ["相談事項", "特になし"],
        ],
      },
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
    respondents: [
      {
        id: "NW-0086",
        name: "株式会社青葉アセット",
        property: "青葉区上杉 1棟マンション",
        submitted: "2026/07/02 10:03",
        status: "電子契約",
        score: "高",
        summary: "電子契約・書類提出済。追加取得意向があり、収益物件紹介につなげやすい回答。",
        answers: [
          ["契約方法", "電子契約による締結"],
          ["委託者情報", "法人 / 代表者情報入力済"],
          ["提出書類", "本人確認書類アップロード済"],
          ["送金口座", "下記口座を送金先とする"],
          ["不動産投資", "良いものがあれば追加取得したい"],
        ],
      },
      {
        id: "NW-0082",
        name: "伊藤 由紀",
        property: "泉区南光台 アパート",
        submitted: "2026/07/01 16:32",
        status: "書類待ち",
        score: "中",
        summary: "基本情報は入力済み。本人確認書類と送金口座の確認が残っている回答。",
        answers: [
          ["契約方法", "書面契約による締結"],
          ["委託者情報", "住所検索済 / E-mail任意未入力"],
          ["提出書類", "別の手段で後日提出"],
          ["送金口座", "送金先口座が未定の為、後日連絡"],
          ["希望連絡手段", "電話"],
        ],
      },
      {
        id: "NW-0077",
        name: "遠藤 誠",
        property: "太白区長町 戸建",
        submitted: "2026/07/01 09:50",
        status: "後継者未定",
        score: "中",
        summary: "契約準備は進行中。後継者未定のため承継方針のヒアリング候補。",
        answers: [
          ["契約方法", "電子契約による締結"],
          ["提出書類", "本人確認書類アップロード済"],
          ["募集条件", "フリーレント導入を検討"],
          ["相続", "まだ何も決まっていない、わからない"],
          ["後継者", "検討中・未定"],
        ],
      },
      {
        id: "NW-0069",
        name: "森田 裕子",
        property: "若林区荒井 マンション",
        submitted: "2026/06/30 13:17",
        status: "口座確認",
        score: "低",
        summary: "運用方針は保守的。送金口座確認後、通常契約フローで進める回答。",
        answers: [
          ["契約方法", "電子契約による締結"],
          ["希望連絡手段", "メール"],
          ["送金口座", "送金先口座が未定の為、後日連絡"],
          ["募集条件", "募集条件緩和は原則行わない"],
          ["不動産投資", "現状維持"],
        ],
      },
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
  respondentCount: document.getElementById("respondentCount"),
  respondentList: document.getElementById("respondentList"),
  respondentDetailTitle: document.getElementById("respondentDetailTitle"),
  respondentDetailMeta: document.getElementById("respondentDetailMeta"),
  respondentDetail: document.getElementById("respondentDetail"),
};

let activeDashboard = "existing";
let selectedRespondentId = dashboards[activeDashboard].respondents[0].id;

els.updatedAt.textContent = new Date().toLocaleString("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeDashboard = tab.dataset.dashboard;
    selectedRespondentId = dashboards[activeDashboard].respondents[0].id;
    els.tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    renderDashboard();
  });
});

els.respondentList.addEventListener("click", (event) => {
  const button = event.target.closest(".respondent-row");
  if (!button) return;
  selectedRespondentId = button.dataset.respondentId;
  renderRespondents(dashboards[activeDashboard].respondents);
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
  renderRespondents(data.respondents);
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

function renderRespondents(respondents) {
  const selected = respondents.find((item) => item.id === selectedRespondentId) || respondents[0];
  selectedRespondentId = selected.id;
  els.respondentCount.textContent = `${respondents.length}件表示`;

  els.respondentList.innerHTML = respondents
    .map(
      (respondent) => `
        <button class="respondent-row ${respondent.id === selectedRespondentId ? "is-active" : ""}" type="button" data-respondent-id="${escapeHtml(respondent.id)}">
          <span class="respondent-id">${escapeHtml(respondent.id)}</span>
          <strong>${escapeHtml(respondent.name)}</strong>
          <span>${escapeHtml(respondent.property)}</span>
          <em>${escapeHtml(respondent.status)}</em>
        </button>
      `,
    )
    .join("");

  els.respondentDetailTitle.textContent = selected.name;
  els.respondentDetailMeta.textContent = selected.submitted;
  els.respondentDetail.innerHTML = `
    <div class="detail-summary">
      <span class="score-badge ${selected.score === "高" ? "high" : selected.score === "中" ? "middle" : "low"}">優先度 ${escapeHtml(selected.score)}</span>
      <strong>${escapeHtml(selected.property)}</strong>
      <p>${escapeHtml(selected.summary)}</p>
    </div>
    <div class="answer-list">
      ${selected.answers
        .map(
          ([label, value]) => `
            <div class="answer-item">
              <span>${escapeHtml(label)}</span>
              <p>${escapeHtml(value)}</p>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
