const inquiryTypes = [
  { id: "room", label: "室内の不具合", icon: "室", hint: "水回り・設備・建具など" },
  { id: "common", label: "共用部の不具合", icon: "共", hint: "廊下・階段・駐車場など" },
  { id: "light", label: "共用灯切れの報告", icon: "灯", hint: "場所が分かる写真が便利です" },
  { id: "notice", label: "注意文配布依頼", icon: "文", hint: "騒音・マナーなど" },
  { id: "key", label: "鍵紛失・交換希望", icon: "鍵", hint: "費用負担が発生します" },
  { id: "other", label: "その他", icon: "他", hint: "上記に当てはまらない内容" },
];

const equipmentList = [
  { id: "aircon", label: "エアコン", icon: "空", image: "aircon.jpg" },
  { id: "faucet", label: "水栓", icon: "水", image: "faucet.jpg" },
  { id: "toilet", label: "トイレ", icon: "便", image: "toilet.jpg" },
  { id: "door", label: "ドア・建具", icon: "戸", image: "door.jpg" },
  { id: "kitchen", label: "キッチン・洗面化粧台", icon: "台", image: "kitchen-vanity.jpg" },
  { id: "ventilation", label: "換気扇", icon: "換", image: "ventilation.jpg" },
  { id: "lighting", label: "照明器具", icon: "灯", image: "lighting.jpg" },
  { id: "other-equipment", label: "その他", icon: "他", image: "" },
];

const steps = ["お問い合わせ内容", "状況・添付", "入居者情報", "確認"];
const timeOptions = ["9:30〜11:00", "11:00〜12:30", "12:30〜14:00", "14:00〜15:30", "15:30〜17:00"];

const state = {
  step: 1,
  complete: false,
  inquiryType: "room",
  equipment: "aircon",
  detail: "",
  locationDetail: "",
  manufacturer: "",
  modelNumber: "",
  photos: [],
  videos: [],
  lastName: "",
  firstName: "",
  property: "",
  room: "",
  phone: "",
  email: "",
  responseMethod: "report",
  visitDates: [
    { date: "", time: "" },
    { date: "", time: "" },
    { date: "", time: "" },
  ],
  privacy: false,
};

const formCard = document.getElementById("formCard");
const guideModal = document.getElementById("guideModal");
const guideTitle = document.getElementById("guideTitle");
const guideImage = document.getElementById("guideImage");

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const required = () => '<em class="required">必須</em>';

function selectedInquiry() {
  return inquiryTypes.find((item) => item.id === state.inquiryType) || inquiryTypes[0];
}

function selectedEquipment() {
  return equipmentList.find((item) => item.id === state.equipment) || equipmentList[0];
}

function managementNumber() {
  if (state.property === "ピースフル五橋") return "H-10582";
  return state.property ? "確認中" : "—";
}

function heading(number, title, description) {
  return `
    <div class="section-heading">
      <span>${number}</span>
      <div><h2>${title}</h2><p>${description}</p></div>
    </div>`;
}

function stepper() {
  return `
    <ol class="stepper" aria-label="入力の進み具合">
      ${steps
        .map((label, index) => {
          const number = index + 1;
          const classes = [
            number === state.step ? "active" : "",
            number < state.step ? "done" : "",
          ].join(" ");
          return `<li class="${classes}"><span>${number < state.step ? "✓" : number}</span><small>${label}</small></li>`;
        })
        .join("")}
    </ol>`;
}

function navigation(showBack = true, nextLabel = "次へ進む") {
  return `
    <div class="navigation">
      ${showBack ? '<button type="button" class="button button-secondary" data-action="back">戻る</button>' : "<span></span>"}
      <button type="button" class="button button-primary" data-action="next">
        ${nextLabel}<span aria-hidden="true">→</span>
      </button>
    </div>`;
}

function renderStep1() {
  const equipment = selectedEquipment();
  return `
    <section class="form-section">
      ${heading("01", "お問い合わせ内容を選択してください", "もっとも近いものを1つ選んでください。")}
      <div class="choice-grid">
        ${inquiryTypes
          .map(
            (item) => `
              <button type="button" class="choice-card ${state.inquiryType === item.id ? "selected" : ""}"
                data-inquiry="${item.id}" aria-pressed="${state.inquiryType === item.id}">
                <span class="choice-icon" aria-hidden="true">${item.icon}</span>
                <span><strong>${item.label}</strong><small>${item.hint}</small></span>
                <span class="radio-dot"></span>
              </button>`,
          )
          .join("")}
      </div>
      ${
        state.inquiryType === "room"
          ? `
            <div class="sub-panel">
              <p class="field-label">不具合がある設備</p>
              <p class="field-hint">設備を選ぶと品番の確認方法を表示できます。</p>
              <div class="equipment-grid">
                ${equipmentList
                  .map(
                    (item) => `
                      <button type="button" class="equipment-button ${state.equipment === item.id ? "selected" : ""}"
                        data-equipment="${item.id}"><span aria-hidden="true">${item.icon}</span>${item.label}</button>`,
                  )
                  .join("")}
              </div>
              ${
                equipment.image
                  ? `<button type="button" class="guide-link" data-guide="${equipment.id}">
                      <span aria-hidden="true">＋</span>${equipment.label}の品番確認方法を見る
                    </button>`
                  : ""
              }
            </div>`
          : ""
      }
      ${navigation(false)}
    </section>`;
}

function renderStep2() {
  const equipment = selectedEquipment();
  return `
    <section class="form-section">
      ${heading("02", "状況を詳しく教えてください", "担当者が状況を判断できる範囲でご入力ください。")}
      ${
        state.inquiryType === "light"
          ? `<label class="field">
              <span class="field-label">共用灯が切れている箇所 ${required()}</span>
              <input id="locationDetail" value="${esc(state.locationDetail)}" placeholder="例）101号室前の廊下、駐輪場の入口" />
            </label>`
          : ""
      }
      <label class="field">
        <span class="field-label">不具合の状況 ${required()}</span>
        <textarea id="detail" rows="6" maxlength="1000"
          placeholder="いつから、どこで、どのような症状が出ているかをご入力ください。例）昨日から台所の蛇口を閉めても水が少しずつ垂れます。">${esc(state.detail)}</textarea>
        <span class="character-count" id="characterCount">${state.detail.length} / 1,000文字</span>
      </label>
      ${
        state.inquiryType === "room" && state.equipment !== "other-equipment"
          ? `<div class="machine-panel">
              <p class="field-label">機器の情報</p>
              <p class="field-hint">分かる範囲でご入力ください。品番が写った写真でも構いません。</p>
              <div class="two-column">
                <label class="field compact"><span>メーカー名</span>
                  <input id="manufacturer" value="${esc(state.manufacturer)}" placeholder="例）TOTO、LIXIL" />
                </label>
                <label class="field compact"><span>品番・型番</span>
                  <input id="modelNumber" value="${esc(state.modelNumber)}" placeholder="例）ABC-12345" />
                </label>
              </div>
              ${
                equipment.image
                  ? `<button type="button" class="guide-link" data-guide="${equipment.id}">
                      <span aria-hidden="true">＋</span>品番の場所をイラストで確認
                    </button>`
                  : ""
              }
            </div>`
          : ""
      }
      <div class="upload-panel">
        <p class="field-label">写真・動画を追加</p>
        <p class="field-hint">不具合箇所のアップ、全体、品番が分かる写真を送るとスムーズです。</p>
        <div class="upload-grid">
          <label class="upload-box">
            <input id="photoFiles" type="file" accept="image/*,.pdf" multiple />
            <span class="upload-icon" aria-hidden="true">写真</span>
            <strong>写真・PDFを選ぶ</strong><small>複数選択できます</small>
          </label>
          <label class="upload-box">
            <input id="videoFiles" type="file" accept="video/*" multiple />
            <span class="upload-icon" aria-hidden="true">動画</span>
            <strong>動画を選ぶ</strong><small>症状の音や動きが分かる動画</small>
          </label>
        </div>
        <div class="file-rule"><span aria-hidden="true">i</span>
          <p>写真・動画を合わせて50MBまで。モックではファイル名のみ表示します。</p>
        </div>
        ${
          state.photos.length || state.videos.length
            ? `<ul class="file-list">${[...state.photos, ...state.videos]
                .map((file) => `<li><span>✓</span>${esc(file)}</li>`)
                .join("")}</ul>`
            : ""
        }
      </div>
      ${navigation(true)}
    </section>`;
}

function responseChoices() {
  return `
    <fieldset class="field fieldset">
      <legend class="field-label">ご希望の対応 ${required()}</legend>
      <label class="response-choice ${state.responseMethod === "report" ? "selected" : ""}">
        <input type="radio" name="response" value="report" ${state.responseMethod === "report" ? "checked" : ""} />
        <span><strong>対応結果の報告のみを希望する</strong><small>立会い不要で対応できる場合</small></span>
      </label>
      <label class="response-choice ${state.responseMethod === "visit" ? "selected" : ""}">
        <input type="radio" name="response" value="visit" ${state.responseMethod === "visit" ? "checked" : ""} />
        <span><strong>現地立会いで訪問対応を希望する</strong><small>室内への入室・確認が必要な場合</small></span>
      </label>
    </fieldset>`;
}

function visitFields() {
  if (state.responseMethod !== "visit") return "";
  return `
    <div class="visit-panel">
      <p class="field-label">訪問希望日時</p>
      <p class="field-hint">ご希望に沿えない場合があります。担当者から確定日時をご連絡します。</p>
      ${state.visitDates
        .map(
          (visit, index) => `
            <div class="visit-row">
              <strong>第${index + 1}希望</strong>
              <input type="date" data-visit-date="${index}" value="${esc(visit.date)}" aria-label="第${index + 1}希望日" />
              <select data-visit-time="${index}" aria-label="第${index + 1}希望時間">
                <option value="">時間帯を選択</option>
                ${timeOptions
                  .map((time) => `<option value="${time}" ${visit.time === time ? "selected" : ""}>${time}</option>`)
                  .join("")}
              </select>
            </div>`,
        )
        .join("")}
    </div>`;
}

function renderStep3() {
  return `
    <section class="form-section">
      ${heading("03", "入居者様の情報を入力してください", "管理物件との確認と、担当者からの連絡に使用します。")}
      <div class="two-column">
        <label class="field"><span class="field-label">姓 ${required()}</span>
          <input id="lastName" value="${esc(state.lastName)}" placeholder="平和" />
        </label>
        <label class="field"><span class="field-label">名 ${required()}</span>
          <input id="firstName" value="${esc(state.firstName)}" placeholder="太郎" />
        </label>
      </div>
      <label class="field"><span class="field-label">物件名 ${required()}</span>
        <input id="property" list="property-options" value="${esc(state.property)}"
          placeholder="物件名を入力すると候補が表示されます" />
        <datalist id="property-options">
          <option value="ピースフル五橋"></option>
          <option value="ピースフル旭ヶ丘"></option>
          <option value="ピースフル泉中央"></option>
        </datalist>
        <span class="field-hint">例：「ピースフル」と入力して候補から選択</span>
      </label>
      <div class="property-status">
        <div><span>管理番号</span><strong id="managementNumber">${managementNumber()}</strong></div>
        <p id="propertyMessage">${state.property ? "入力された物件名を管理物件データと照合します。" : "物件名を選択すると管理番号が自動表示されます。"}</p>
      </div>
      <div class="two-column">
        <label class="field"><span class="field-label">号室 ${required()}</span>
          <input id="room" value="${esc(state.room)}" placeholder="101" inputmode="numeric" />
        </label>
        <label class="field"><span class="field-label">電話番号 ${required()}</span>
          <input id="phone" value="${esc(state.phone)}" placeholder="090-1234-5678" inputmode="tel" />
        </label>
      </div>
      <label class="field"><span class="field-label">メールアドレス ${required()}</span>
        <input id="email" value="${esc(state.email)}" placeholder="example@email.com" inputmode="email" />
      </label>
      ${responseChoices()}
      ${visitFields()}
      ${navigation(true, "入力内容を確認する")}
    </section>`;
}

function summaryRow(label, value) {
  return `<div class="summary-row"><dt>${label}</dt><dd>${esc(value || "—")}</dd></div>`;
}

function renderStep4() {
  const visitSummary =
    state.responseMethod === "visit"
      ? state.visitDates
          .filter((item) => item.date || item.time)
          .map((item, index) => `第${index + 1}希望：${item.date || "日付未選択"} ${item.time || ""}`)
          .join("\n") || "訪問希望（日時未選択）"
      : "対応結果の報告のみを希望";

  return `
    <section class="form-section">
      ${heading("04", "入力内容をご確認ください", "内容を修正する場合は「戻る」を押してください。")}
      <dl class="summary-card">
        ${summaryRow("お問い合わせ種類", selectedInquiry().label)}
        ${summaryRow("対象設備", state.inquiryType === "room" ? selectedEquipment().label : "—")}
        ${summaryRow("不具合の状況", state.detail)}
        ${summaryRow("機器情報", [state.manufacturer, state.modelNumber].filter(Boolean).join(" / "))}
        ${summaryRow("添付ファイル", [...state.photos, ...state.videos].join("\n"))}
        ${summaryRow("お名前", `${state.lastName} ${state.firstName}`.trim())}
        ${summaryRow("物件・号室", `${state.property} ${state.room ? `${state.room}号室` : ""}`.trim())}
        ${summaryRow("管理番号", managementNumber())}
        ${summaryRow("電話番号", state.phone)}
        ${summaryRow("メールアドレス", state.email)}
        ${summaryRow("ご希望の対応", visitSummary)}
      </dl>
      <details class="privacy-details">
        <summary>個人情報の取り扱いについて</summary>
        <p>
          ご入力いただいた情報は、お問い合わせへの対応、修繕手配、管理物件との照合のために利用します。
          法令に基づく場合を除き、ご本人の同意なく目的外に利用しません。
        </p>
      </details>
      <label class="privacy-check">
        <input id="privacy" type="checkbox" ${state.privacy ? "checked" : ""} />
        <span>個人情報の取り扱いに同意します</span>
      </label>
      <div class="navigation">
        <button type="button" class="button button-secondary" data-action="back">戻る</button>
        <button type="button" class="button button-primary" id="submitMock" data-action="submit"
          ${state.privacy ? "" : "disabled"}>この内容で送信する<span aria-hidden="true">→</span></button>
      </div>
      <p class="mock-note">※画面確認用モックのため、実際の送信・保存は行われません。</p>
    </section>`;
}

function renderSuccess() {
  document.getElementById("formCard").outerHTML = `
    <section class="success-card" id="formCard">
      <div class="success-icon" aria-hidden="true">✓</div>
      <p class="eyebrow">お問い合わせ受付</p>
      <h1>送信が完了しました</h1>
      <p class="success-lead">受付番号は <strong>HC-2026-0720-0012</strong> です。</p>
      <div class="success-info">
        <p>入力いただいたメールアドレス宛に受付内容をお送りします。</p>
        <p>営業時間外のご連絡は、翌営業日以降に確認いたします。</p>
      </div>
      <button class="button button-primary" data-action="restart" type="button">入力画面に戻る</button>
      <p class="mock-note">※モックのため、メール送信やデータ保存は行われません。</p>
    </section>`;
}

function render() {
  if (state.complete) {
    renderSuccess();
    return;
  }
  const current = document.getElementById("formCard");
  current.innerHTML = `${stepper()}${
    state.step === 1
      ? renderStep1()
      : state.step === 2
        ? renderStep2()
        : state.step === 3
          ? renderStep3()
          : renderStep4()
  }`;
}

function syncField(id) {
  const element = document.getElementById(id);
  if (!element) return;
  state[id] = element.value;
}

function showGuide(id) {
  const equipment = equipmentList.find((item) => item.id === id);
  if (!equipment?.image) return;
  guideTitle.textContent = equipment.label;
  guideImage.src = `./assets/${equipment.image}`;
  guideImage.alt = `${equipment.label}の品番確認方法`;
  guideModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeGuide() {
  guideModal.hidden = true;
  document.body.classList.remove("modal-open");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.inquiry) {
    state.inquiryType = target.dataset.inquiry;
    render();
  } else if (target.dataset.equipment) {
    state.equipment = target.dataset.equipment;
    render();
  } else if (target.dataset.guide) {
    showGuide(target.dataset.guide);
  } else if (target.dataset.action === "next") {
    state.step = Math.min(4, state.step + 1);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "back") {
    state.step = Math.max(1, state.step - 1);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "submit" && state.privacy) {
    state.complete = true;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "restart") {
    state.complete = false;
    state.step = 1;
    document.querySelector(".success-card").outerHTML = '<section class="form-card" id="formCard" aria-live="polite"></section>';
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (["detail", "locationDetail", "manufacturer", "modelNumber", "lastName", "firstName", "property", "room", "phone", "email"].includes(target.id)) {
    state[target.id] = target.value;
  }
  if (target.id === "detail") {
    document.getElementById("characterCount").textContent = `${target.value.length} / 1,000文字`;
  }
  if (target.id === "property") {
    document.getElementById("managementNumber").textContent = managementNumber();
    document.getElementById("propertyMessage").textContent = target.value
      ? "入力された物件名を管理物件データと照合します。"
      : "物件名を選択すると管理番号が自動表示されます。";
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "photoFiles" || target.id === "videoFiles") {
    const names = Array.from(target.files || []).map((file) => file.name);
    if (target.id === "photoFiles") state.photos = names;
    if (target.id === "videoFiles") state.videos = names;
    render();
  } else if (target.name === "response") {
    state.responseMethod = target.value;
    render();
  } else if (target.id === "privacy") {
    state.privacy = target.checked;
    document.getElementById("submitMock").disabled = !state.privacy;
  } else if (target.dataset.visitDate !== undefined) {
    state.visitDates[Number(target.dataset.visitDate)].date = target.value;
  } else if (target.dataset.visitTime !== undefined) {
    state.visitDates[Number(target.dataset.visitTime)].time = target.value;
  }
});

document.getElementById("modalClose").addEventListener("click", closeGuide);
document.getElementById("modalConfirm").addEventListener("click", closeGuide);
guideModal.addEventListener("click", (event) => {
  if (event.target === guideModal) closeGuide();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !guideModal.hidden) closeGuide();
});

render();
