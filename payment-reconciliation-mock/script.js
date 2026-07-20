const payments = [
  {
    id: 1,
    date: "7月15日",
    payer: "入居者 A",
    bank: "七十七銀行",
    amount: 257177,
    status: "一致",
    score: 100,
    caseId: "45001",
    property: "アリエール青葉",
    room: "102",
    customer: "入居者 A",
    category: "一括受取",
    expected: 257177,
    reasons: ["入金額が一致", "振込名義が一致"],
  },
  {
    id: 2,
    date: "7月15日",
    payer: "入居者 B",
    bank: "七十七銀行",
    amount: 16483,
    status: "未一致",
    reasons: ["同じ金額・名義の未決済案件が見つかりません"],
  },
  {
    id: 3,
    date: "7月15日",
    payer: "入居者 C",
    bank: "七十七銀行",
    amount: 49462,
    status: "一致",
    score: 100,
    caseId: "45025",
    property: "D-room 八乙女中央",
    room: "205",
    customer: "入居者 C",
    category: "一括受取",
    expected: 49462,
    reasons: ["入金額が一致", "振込名義が一致"],
  },
  {
    id: 4,
    date: "7月16日",
    payer: "入居者 D",
    bank: "七十七銀行",
    amount: 88550,
    status: "一致",
    score: 100,
    caseId: "44948",
    property: "グラン グレイス",
    room: "204",
    customer: "入居者 D",
    category: "自社口座",
    expected: 88550,
    reasons: ["入金額が一致", "振込名義が一致"],
  },
  {
    id: 5,
    date: "7月16日",
    payer: "入居者 D",
    bank: "七十七銀行",
    amount: 3300,
    status: "一致",
    score: 100,
    caseId: "45009",
    property: "グレイス I",
    room: "駐車場15",
    customer: "入居者 D",
    category: "自社口座",
    expected: 3300,
    reasons: ["入金額が一致", "同じ名義の別請求と金額を区別"],
  },
  {
    id: 6,
    date: "7月16日",
    payer: "法人 A（代行会社経由）",
    bank: "七十七銀行",
    amount: 675476,
    status: "要確認",
    score: 82,
    caseId: "44867",
    property: "パークアクシス仙台西公園",
    room: "201",
    customer: "法人 A",
    category: "一括受取",
    expected: 675476,
    reasons: ["入金額が一致", "振込名義が契約者名と異なる"],
  },
  {
    id: 7,
    date: "7月16日",
    payer: "法人 B（社宅代行）",
    bank: "七十七銀行",
    amount: 361513,
    status: "一致",
    score: 96,
    caseId: "44905",
    property: "レジディア榴岡",
    room: "904",
    customer: "法人 B",
    category: "一括受取",
    expected: 361513,
    reasons: ["入金額が一致", "過去の振込名義と一致"],
  },
  {
    id: 8,
    date: "7月16日",
    payer: "管理会社 A",
    bank: "七十七銀行",
    amount: 11000,
    status: "一致",
    score: 100,
    caseId: "45048",
    property: "ヴァン・ヴェール",
    room: "202",
    customer: "入居者 E",
    category: "入管費",
    expected: 11000,
    reasons: ["入金額が一致", "管理会社名が一致"],
  },
  {
    id: 9,
    date: "7月16日",
    payer: "法人 C",
    bank: "七十七銀行",
    amount: 506717,
    status: "一致",
    score: 100,
    caseId: "44985",
    property: "HF 仙台長町レジデンス",
    room: "301",
    customer: "法人 C",
    category: "一括受取",
    expected: 506717,
    reasons: ["入金額が一致", "振込名義が一致"],
  },
  {
    id: 10,
    date: "7月16日",
    payer: "法人 D",
    bank: "七十七銀行",
    amount: 231263,
    status: "一致",
    score: 93,
    caseId: "44869",
    property: "アリエール泉",
    room: "103",
    customer: "法人 D",
    category: "一括受取",
    expected: 231263,
    reasons: ["入金額が一致", "社宅代行会社の名義履歴と一致"],
  },
  {
    id: 11,
    date: "7月16日",
    payer: "法人 E",
    bank: "七十七銀行",
    amount: 257329,
    status: "一部入金",
    score: 88,
    caseId: "44992",
    property: "Anela",
    room: "101",
    customer: "法人 E",
    category: "一括受取",
    expected: 333779,
    reasons: ["振込名義が一致", "請求額より76,450円少ない"],
  },
  {
    id: 12,
    date: "7月16日",
    payer: "管理会社 B",
    bank: "杜の都信用金庫",
    amount: 37000,
    status: "未一致",
    reasons: ["同じ金額の候補が複数、名義だけでは判断できません"],
  },
];

const statusClass = {
  一致: "matched",
  要確認: "review",
  一部入金: "partial",
  未一致: "unmatched",
  確認済: "confirmed",
};

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

let selectedId = 6;
let currentFilter = "すべて";

const rows = document.getElementById("paymentRows");
const detail = document.getElementById("detailPanel");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

function badge(status) {
  return `<span class="status status-${statusClass[status]}">${status}</span>`;
}

function notify(message) {
  toastMessage.textContent = message;
  toast.hidden = false;
}

function visiblePayments() {
  const query = searchInput.value.trim().toLowerCase();
  return payments.filter((payment) => {
    const filterMatch =
      currentFilter === "すべて" || payment.status === currentFilter;
    const text = [
      payment.payer,
      payment.bank,
      payment.caseId,
      payment.property,
      payment.customer,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return filterMatch && (!query || text.includes(query));
  });
}

function renderRows() {
  const visible = visiblePayments();
  rows.innerHTML = visible
    .map(
      (payment) => `
        <tr data-id="${payment.id}" class="${selectedId === payment.id ? "selected" : ""}">
          <td>${badge(payment.status)}</td>
          <td><strong>${payment.date}</strong><small>${payment.bank}</small></td>
          <td>${payment.payer}</td>
          <td class="amount">${yen.format(payment.amount)}</td>
          <td>
            ${
              payment.caseId
                ? `<strong>${payment.property}</strong><small>ID ${payment.caseId} / ${payment.category}</small>`
                : '<span class="empty-candidate">候補なし</span>'
            }
          </td>
          <td><button type="button" aria-label="${payment.payer}の詳細を見る">›</button></td>
        </tr>`,
    )
    .join("");

  document.getElementById("visibleCount").textContent = `${visible.length}件を表示`;
  document.getElementById("emptyState").hidden = visible.length > 0;

  rows.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      selectedId = Number(row.dataset.id);
      renderRows();
      renderDetail();
    });
  });
}

function renderDetail() {
  const payment = payments.find((item) => item.id === selectedId) || payments[0];
  const remaining = Math.max((payment.expected || 0) - payment.amount, 0);

  if (!payment.caseId) {
    detail.innerHTML = `
      <div class="detail-heading">
        <div>
          <p class="section-kicker">選択中の入金</p>
          <h3>${payment.payer}</h3>
        </div>
        ${badge(payment.status)}
      </div>
      <div class="bank-card">
        <div><span>銀行の入金額</span><strong>${yen.format(payment.amount)}</strong></div>
        <dl>
          <div><dt>入金日</dt><dd>${payment.date}</dd></div>
          <div><dt>入金先</dt><dd>${payment.bank}</dd></div>
        </dl>
      </div>
      <div class="no-match-card">
        <span class="no-match-icon">?</span>
        <h4>候補を一つに絞れませんでした</h4>
        <p>${payment.reasons[0]}</p>
        <button class="primary-action" type="button" data-action="search">未決済案件から探す</button>
        <button class="secondary-action" type="button" data-action="hold">分からないので保留</button>
      </div>`;
  } else {
    detail.innerHTML = `
      <div class="detail-heading">
        <div>
          <p class="section-kicker">選択中の入金</p>
          <h3>${payment.payer}</h3>
        </div>
        ${badge(payment.status)}
      </div>
      <div class="bank-card">
        <div><span>銀行の入金額</span><strong>${yen.format(payment.amount)}</strong></div>
        <dl>
          <div><dt>入金日</dt><dd>${payment.date}</dd></div>
          <div><dt>入金先</dt><dd>${payment.bank}</dd></div>
        </dl>
      </div>
      <div class="match-line">
        <span></span>
        <p>${payment.score}%一致<small>機械が選んだ候補</small></p>
      </div>
      <div class="case-card">
        <div class="case-card-head">
          <span>進捗くんの候補案件</span>
          <button type="button" data-action="shinchoku">進捗くんで見る ↗</button>
        </div>
        <h4>${payment.property}　${payment.room}</h4>
        <dl>
          <div><dt>進捗くんID</dt><dd>${payment.caseId}</dd></div>
          <div><dt>契約者</dt><dd>${payment.customer}</dd></div>
          <div><dt>入金区分</dt><dd>${payment.category}</dd></div>
          <div><dt>請求額</dt><dd>${yen.format(payment.expected || 0)}</dd></div>
        </dl>
        ${
          remaining
            ? `<div class="balance-box"><span>今回の入金後に残る金額</span><strong>${yen.format(remaining)}</strong></div>`
            : ""
        }
      </div>
      <div class="reason-box">
        <span>この候補を出した理由</span>
        <ul>${payment.reasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>
      </div>
      <div class="detail-actions">
        <button class="primary-action" type="button" data-action="confirm">この案件で確認済みにする</button>
        <button class="secondary-action" type="button" data-action="alternative">別の候補を探す</button>
      </div>`;
  }

  detail.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "confirm") {
        payment.status = "確認済";
        notify("この組み合わせを「確認済」にしました。");
        renderRows();
        renderDetail();
      } else if (action === "hold") {
        payment.status = "要確認";
        notify("この入金を保留にしました。");
        renderRows();
        renderDetail();
      } else if (action === "shinchoku") {
        notify("本番では進捗くんの該当画面を開く想定です。");
      } else {
        notify("この機能は次の打ち合わせで必要性を確認する想定です。");
      }
    });
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document
      .querySelectorAll("[data-filter]")
      .forEach((item) => item.classList.toggle("active", item === button));
    renderRows();
  });
});

searchInput.addEventListener("input", renderRows);

document.getElementById("toastClose").addEventListener("click", () => {
  toast.hidden = true;
});

[
  ["shinchokuInput", "shinchokuFile"],
  ["bankInput", "bankFile"],
].forEach(([inputId, labelId]) => {
  document.getElementById(inputId).addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById(labelId).textContent = file.name;
    notify(`${file.name} を選択しました。このモックではファイル名のみ反映します。`);
  });
});

renderRows();
renderDetail();
