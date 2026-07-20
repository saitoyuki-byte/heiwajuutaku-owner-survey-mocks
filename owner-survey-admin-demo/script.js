const respondents = [
  {
    id: "OWN-001",
    name: "佐藤 一郎",
    property: "平和レジデンス一番町",
    submittedAt: "2026/07/18 09:42",
    assignee: "資産活用課 田中",
    status: "要対応",
    score: "高",
    answers: [
      ["今後の不動産追加購入", "条件が合えば検討したい"],
      ["所有物件の運営方針", "現状維持しつつ収益改善を相談したい"],
      ["リフォーム意向", "空室対策につながる提案を希望"],
      ["相談希望", "仙台市中心部の区分マンション購入について相談希望"]
    ],
    comments: [
      {
        staff: "資産活用課 田中",
        date: "2026/07/18 14:05",
        text: "追加購入意向あり。次回オーナー面談候補として確認。"
      }
    ]
  },
  {
    id: "OWN-002",
    name: "株式会社泉中央企画",
    property: "泉中央パークハイツ",
    submittedAt: "2026/07/18 11:20",
    assignee: "賃貸管理課 鈴木",
    status: "確認中",
    score: "中",
    answers: [
      ["今後の不動産追加購入", "現時点では未定"],
      ["所有物件の運営方針", "管理方針の見直しを検討"],
      ["リフォーム意向", "外壁と共用部の修繕時期を知りたい"],
      ["相談希望", "長期修繕計画の見直しを相談したい"]
    ],
    comments: [
      {
        staff: "賃貸管理課 鈴木",
        date: "2026/07/18 15:18",
        text: "修繕相談として建物担当へ共有予定。"
      }
    ]
  },
  {
    id: "OWN-003",
    name: "高橋 美智子",
    property: "青葉通りメゾン",
    submittedAt: "2026/07/19 08:35",
    assignee: "未設定",
    status: "要対応",
    score: "高",
    answers: [
      ["今後の不動産追加購入", "積極的に検討したい"],
      ["所有物件の運営方針", "資産組替も含めて相談したい"],
      ["リフォーム意向", "水回りのリフォーム提案希望"],
      ["相談希望", "相続を見据えた保有方針を相談したい"]
    ],
    comments: []
  },
  {
    id: "OWN-004",
    name: "山田 太郎",
    property: "北仙台コート",
    submittedAt: "2026/07/19 10:12",
    assignee: "オーナー課 佐々木",
    status: "対応済み",
    score: "低",
    answers: [
      ["今後の不動産追加購入", "予定なし"],
      ["所有物件の運営方針", "現状維持"],
      ["リフォーム意向", "今すぐの希望なし"],
      ["相談希望", "特になし"]
    ],
    comments: [
      {
        staff: "オーナー課 佐々木",
        date: "2026/07/19 13:30",
        text: "電話確認済み。今回は追加提案不要。"
      }
    ]
  }
];

let selectedId = respondents[0].id;

const respondentList = document.querySelector("#respondentList");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const detailName = document.querySelector("#detailName");
const detailStatus = document.querySelector("#detailStatus");
const detailMeta = document.querySelector("#detailMeta");
const answerList = document.querySelector("#answerList");
const historyList = document.querySelector("#historyList");
const commentStatus = document.querySelector("#commentStatus");
const commentText = document.querySelector("#commentText");
const saveComment = document.querySelector("#saveComment");

function statusClass(status) {
  if (status === "対応済み") return "done";
  if (status === "要対応") return "action";
  if (status === "保留") return "hold";
  return "";
}

function filteredRespondents() {
  const keyword = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  return respondents.filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const target = `${item.name} ${item.property} ${item.assignee}`.toLowerCase();
    return matchesStatus && target.includes(keyword);
  });
}

function renderMetrics() {
  document.querySelector("#metricTotal").textContent = respondents.length;
  document.querySelector("#metricAction").textContent = respondents.filter((item) => item.status === "要対応").length;
  document.querySelector("#metricCommented").textContent = respondents.filter((item) => item.comments.length > 0).length;
}

function renderList() {
  const list = filteredRespondents();
  respondentList.innerHTML = "";

  if (!list.length) {
    respondentList.innerHTML = '<p class="save-note">該当する回答者がいません。</p>';
    return;
  }

  list.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `respondent-row${item.id === selectedId ? " active" : ""}`;
    button.dataset.id = item.id;
    button.innerHTML = `
      <strong>${item.name}</strong>
      <span>${item.property}</span>
      <div class="row-meta">
        <small>${item.submittedAt}</small>
        <small>${item.status}</small>
      </div>
    `;
    respondentList.appendChild(button);
  });
}

function renderDetail() {
  const item = respondents.find((entry) => entry.id === selectedId) || filteredRespondents()[0] || respondents[0];
  selectedId = item.id;

  detailName.textContent = item.name;
  detailStatus.textContent = item.status;
  detailStatus.className = `status-chip ${statusClass(item.status)}`;
  commentStatus.value = item.status;

  detailMeta.innerHTML = `
    <div class="meta-card"><span>回答ID</span><strong>${item.id}</strong></div>
    <div class="meta-card"><span>対象物件</span><strong>${item.property}</strong></div>
    <div class="meta-card"><span>担当者</span><strong>${item.assignee}</strong></div>
    <div class="meta-card"><span>優先度</span><strong>${item.score}</strong></div>
  `;

  answerList.innerHTML = item.answers
    .map(([label, value]) => `<div class="answer-item"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  historyList.innerHTML = item.comments.length
    ? item.comments.map((comment) => `
        <div class="history-item">
          <strong>${comment.staff} / ${comment.date}</strong>
          <p>${comment.text}</p>
        </div>
      `).join("")
    : '<p class="save-note">まだコメントはありません。</p>';
}

function renderAll() {
  renderMetrics();
  renderList();
  renderDetail();
}

respondentList.addEventListener("click", (event) => {
  const row = event.target.closest(".respondent-row");
  if (!row) return;
  selectedId = row.dataset.id;
  renderAll();
});

searchInput.addEventListener("input", () => {
  const first = filteredRespondents()[0];
  if (first && !filteredRespondents().some((item) => item.id === selectedId)) {
    selectedId = first.id;
  }
  renderAll();
});

statusFilter.addEventListener("change", () => {
  const first = filteredRespondents()[0];
  if (first) selectedId = first.id;
  renderAll();
});

saveComment.addEventListener("click", () => {
  const item = respondents.find((entry) => entry.id === selectedId);
  const text = commentText.value.trim();
  if (!text) {
    commentText.focus();
    return;
  }

  item.status = commentStatus.value;
  item.comments.unshift({
    staff: "ログイン中スタッフ",
    date: new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }),
    text
  });
  commentText.value = "";
  renderAll();
});

renderAll();
