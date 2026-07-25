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

const state = {
  formMode: "standard",
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
};

const membershipState = {
  step: 1,
  complete: false,
  services: [],
  lastName: "",
  firstName: "",
  property: "",
  room: "",
  phone: "",
  email: "",
  error: "",
};

const membershipServices = [
  { id: "support", label: "安心入居サポート" },
  { id: "mamorocca", label: "Mamorocca（マモロッカ）" },
];

const mockSubmissionDate = new Date();
const mockDateParts = {
  year: mockSubmissionDate.getFullYear(),
  month: String(mockSubmissionDate.getMonth() + 1).padStart(2, "0"),
  day: String(mockSubmissionDate.getDate()).padStart(2, "0"),
  hour: String(mockSubmissionDate.getHours()).padStart(2, "0"),
  minute: String(mockSubmissionDate.getMinutes()).padStart(2, "0"),
};
const mockSubmissionTime =
  `${mockDateParts.year}/${mockDateParts.month}/${mockDateParts.day} ` +
  `${mockDateParts.hour}:${mockDateParts.minute}`;
const generalTicketNumber =
  `HC-${mockDateParts.year}${mockDateParts.month}${mockDateParts.day}-0012`;
const membershipTicketNumber =
  `HM-${mockDateParts.year}${mockDateParts.month}${mockDateParts.day}-0001`;

const formCard = document.getElementById("formCard");
const guideModal = document.getElementById("guideModal");
const guideTitle = document.getElementById("guideTitle");
const guideImage = document.getElementById("guideImage");
const welcomeBackdrop = document.getElementById("welcomeBackdrop");
const welcomeDialog = document.getElementById("welcomeDialog");
const startFormButtons = document.querySelectorAll("[data-start-form]");

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

function membershipStepper() {
  const labels = ["入居者情報の入力", "入力内容の確認"];
  return `
    <ol class="stepper membership-stepper" aria-label="入力の進み具合">
      ${labels
        .map((label, index) => {
          const number = index + 1;
          const classes = [
            number === membershipState.step ? "active" : "",
            number < membershipState.step ? "done" : "",
          ].join(" ");
          return `<li class="${classes}"><span>${number < membershipState.step ? "✓" : number}</span><small>${label}</small></li>`;
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
      ${navigation(true, "入力内容を確認する")}
    </section>`;
}

function summaryRow(label, value) {
  return `<div class="summary-row"><dt>${label}</dt><dd>${esc(value || "—")}</dd></div>`;
}

function renderStep4() {
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
      </dl>
      <div class="privacy-policy-card">
        <div>
          <strong>プライバシーポリシー</strong>
          <p>送信前に、個人情報の利用目的および取り扱いについてご確認ください。</p>
        </div>
        <a
          href="https://www.heiwajuutaku.com/privacy_policy"
          target="_blank"
          rel="noreferrer"
        >プライバシーポリシーを確認する <span aria-hidden="true">↗</span></a>
      </div>
      <p class="response-time-note">
        お問合せ頂いた2営業日を目安に回答させて頂きます。回答の連絡がない場合は、改めてお問合せ頂けますようお願い申し上げます。
      </p>
      <div class="navigation">
        <button type="button" class="button button-secondary" data-action="back">戻る</button>
        <button type="button" class="button button-primary" id="submitMock" data-action="submit">
          上記を確認・同意して、送信<span aria-hidden="true">→</span>
        </button>
      </div>
      <p class="mock-note">※画面確認用モックのため、実際の送信・保存は行われません。</p>
    </section>`;
}

function membershipServiceLabels() {
  return membershipServices
    .filter((service) => membershipState.services.includes(service.id))
    .map((service) => service.label)
    .join("、");
}

function emailPreview(subject, recipientName, body) {
  return `
    <details class="email-preview" open>
      <summary>
        <span>自動返信メールの内容を確認</span>
        <small>Gmail APIで送信する想定のプレビュー</small>
      </summary>
      <div class="email-preview-content">
        <dl class="email-meta">
          <div><dt>宛先</dt><dd>${esc(recipientName)} 様</dd></div>
          <div><dt>件名</dt><dd>${subject}</dd></div>
        </dl>
        <div class="email-body">${body}</div>
      </div>
    </details>`;
}

function generalInquirySummary() {
  const rows = [`お問い合わせ種類：${selectedInquiry().label}`];
  if (state.inquiryType === "room") {
    rows.push(`対象設備：${selectedEquipment().label}`);
  }
  if (state.manufacturer || state.modelNumber) {
    rows.push(`機器情報：${[state.manufacturer, state.modelNumber].filter(Boolean).join(" / ")}`);
  }
  rows.push(`お問い合わせ内容：${state.detail || "（未入力）"}`);
  return esc(rows.join("\n")).replaceAll("\n", "<br />");
}

function generalReplyEmail() {
  const recipientName = `${state.lastName} ${state.firstName}`.trim() || "〇〇 〇〇";
  const subject = "【お困りごと・建物の不具合お問い合わせフォーム】お問い合わせを承りました";
  const body = `
    <p>${esc(recipientName)} 様</p>
    <p>
      お客様のお問い合わせを以下の内容で承りました。<br />
      本件のお問い合わせ番号は【${generalTicketNumber}】です。<br />
      現在、順次対応を行なっております。通常2営業日以内にご返信いたしますので、今しばらくお待ちください。<br />
      なお、よくあるご質問については下記FAQページにも記載がございます。解決の手助けとなる場合もございますので、併せてご確認ください。
    </p>
    <p class="email-link-line">
      ▼ よくあるご質問（FAQ）<br />
      <a href="https://heiwajuutaku.tayori.com/faq/13d179e934b2d688df6270b53bba1294f072580c/" target="_blank" rel="noreferrer">
        https://heiwajuutaku.tayori.com/faq/13d179e934b2d688df6270b53bba1294f072580c/
      </a>
    </p>
    <section class="email-service-section">
      <strong>◆緊急時・近隣トラブルの窓口もご利用頂けます※加入者の方が対象◆</strong>
      <p>
        ＜24時間対応＞水漏れ・鍵の紛失など緊急の場合<br />
        ◎安心入居サポート　0120－024－377<br />
        <span>※賃貸住宅総合補償スタンダード・ライト・安心入居サポート（2年版・月額版）等に加入の方</span><br />
        <a href="https://wmp3-cf.njc-web.jp/users/12600/files/651213/674c3b061fa04.pdf" target="_blank" rel="noreferrer">サービス内容はこちら</a>
      </p>
      <p>
        ◎学生110番　0120－555－560<br />
        <span>※大学生協提供サービスに加入の方</span><br />
        <a href="https://www.univcoop.or.jp/gakusei110/index.html" target="_blank" rel="noreferrer">サービス内容はこちら</a>
      </p>
      <p>
        ＜元警察官による解決支援＞騒音・迷惑行為・不法侵入・ストーカー等の近隣トラブル<br />
        ◎Mamorocca（マモロッカ）　0570-007-001（平日 10:00～18:30）<br />
        <span>※賃貸住宅総合補償スタンダード・ライト、大学生協加入者向け、マモロッカプラン加入の方</span><br />
        <a href="https://www.v-smith.co.jp/contact-trouble" target="_blank" rel="noreferrer">時間外専用相談受付フォームはこちら</a><br />
        <a href="https://saitoyuki-byte.github.io/heiwajuutaku-owner-survey-mocks/tenant-contact-mock/assets/mamorocca-service.pdf" target="_blank" rel="noreferrer">サービス内容はこちら</a>
      </p>
    </section>
    <section class="email-inquiry-section">
      <strong>■ お問い合わせ内容</strong>
      <p>
        【受付番号】${generalTicketNumber}<br />
        【お問い合わせ日時】${mockSubmissionTime}<br />
        【ご内容】<br />
        ${generalInquirySummary()}
      </p>
    </section>
    <p>
      お問合せ頂いた2営業日を目安に回答させて頂きます。<br />
      回答の連絡がない場合は、改めてお問合せ頂けますようお願い申し上げます。
    </p>
    <p>株式会社平和住宅情報センター<br />管理センター</p>`;

  return emailPreview(subject, recipientName, body);
}

function membershipReplyEmail() {
  const recipientName =
    `${membershipState.lastName} ${membershipState.firstName}`.trim() || "〇〇 〇〇";
  const subject =
    "【安心入居サポート・Mamorocca（マモロッカ）加入確認問合せフォーム】お問い合わせを承りました";
  const membershipContent = esc(
    [
      `加入確認したいサービス：${membershipServiceLabels()}`,
      `入居者名：${recipientName}`,
      `物件・号室：${membershipState.property} ${membershipState.room}号室`,
      `電話番号：${membershipState.phone}`,
      `メールアドレス：${membershipState.email}`,
    ].join("\n"),
  ).replaceAll("\n", "<br />");
  const body = `
    <p>${esc(recipientName)} 様</p>
    <p>
      お客様のお問い合わせを以下の内容で承りました。<br />
      本件のお問い合わせ番号は【${membershipTicketNumber}】です。<br />
      現在、順次対応を行なっております。通常2営業日以内にご返信いたしますので、今しばらくお待ちください。
    </p>
    <section class="email-inquiry-section">
      <strong>■ お問い合わせ内容</strong>
      <p>
        【受付番号】${membershipTicketNumber}<br />
        【お問い合わせ日時】${mockSubmissionTime}<br />
        【ご内容】<br />
        ${membershipContent}
      </p>
    </section>
    <p>
      お問合せ頂いた2営業日を目安に回答させて頂きます。<br />
      回答の連絡がない場合は、改めてお問合せ頂けますようお願い申し上げます。
    </p>
    <p>株式会社平和住宅情報センター<br />管理センター</p>`;

  return emailPreview(subject, recipientName, body);
}

function membershipInputReady() {
  return (
    membershipState.services.length > 0 &&
    membershipState.lastName.trim() &&
    membershipState.firstName.trim() &&
    membershipState.property.trim() &&
    membershipState.room.trim() &&
    membershipState.phone.trim() &&
    membershipState.email.trim()
  );
}

function renderMembershipInput() {
  return `
    <section class="form-section membership-form-section">
      ${heading("01", "サービスの加入状況を確認する", "確認したいサービスと、現在お住まいの方の情報をご入力ください。")}
      ${
        membershipState.error
          ? `<p class="form-error" role="alert">${membershipState.error}</p>`
          : ""
      }
      <fieldset class="membership-service-fieldset">
        <legend>加入確認したいサービス ${required()} <small>複数選択可</small></legend>
        <div class="membership-service-grid">
          ${membershipServices
            .map(
              (service) => `
                <label class="membership-service-choice ${membershipState.services.includes(service.id) ? "selected" : ""}">
                  <input
                    type="checkbox"
                    value="${service.id}"
                    data-membership-service
                    ${membershipState.services.includes(service.id) ? "checked" : ""}
                  />
                  <span>${service.label}</span>
                  <b aria-hidden="true">✓</b>
                </label>`,
            )
            .join("")}
        </div>
      </fieldset>

      <div class="membership-resident-heading">
        <h3>入居者情報</h3>
        <p>※契約者ではありませんので、ご注意ください。</p>
      </div>
      <div class="two-column">
        <label class="field"><span class="field-label">姓 ${required()}</span>
          <input id="membershipLastName" value="${esc(membershipState.lastName)}" placeholder="平和" autocomplete="family-name" />
        </label>
        <label class="field"><span class="field-label">名 ${required()}</span>
          <input id="membershipFirstName" value="${esc(membershipState.firstName)}" placeholder="太郎" autocomplete="given-name" />
        </label>
      </div>
      <label class="field"><span class="field-label">物件名 ${required()}</span>
        <input
          id="membershipProperty"
          list="membership-property-options"
          value="${esc(membershipState.property)}"
          placeholder="物件名を入力すると候補が表示されます"
        />
        <datalist id="membership-property-options">
          <option value="ピースフル五橋"></option>
          <option value="ピースフル旭ヶ丘"></option>
          <option value="ピースフル泉中央"></option>
        </datalist>
        <span class="field-hint">例：「ピースフル」と入力して候補から選択</span>
      </label>
      <div class="two-column">
        <label class="field"><span class="field-label">号室 ${required()}</span>
          <input id="membershipRoom" value="${esc(membershipState.room)}" placeholder="101" inputmode="numeric" />
        </label>
        <label class="field"><span class="field-label">電話番号 ${required()}</span>
          <input id="membershipPhone" value="${esc(membershipState.phone)}" placeholder="090-1234-5678" inputmode="tel" autocomplete="tel" />
        </label>
      </div>
      <label class="field"><span class="field-label">メールアドレス ${required()}</span>
        <input id="membershipEmail" value="${esc(membershipState.email)}" placeholder="example@email.com" inputmode="email" autocomplete="email" />
      </label>
      <div class="navigation membership-navigation">
        <span></span>
        <button type="button" class="button button-primary" data-action="membership-next">
          入力を確認する<span aria-hidden="true">→</span>
        </button>
      </div>
    </section>`;
}

function renderMembershipConfirmation() {
  return `
    <section class="form-section membership-form-section">
      ${heading("02", "入力された内容をご確認ください", "内容を修正する場合は「戻る」を押してください。")}
      <dl class="summary-card">
        ${summaryRow("加入確認したいサービス", membershipServiceLabels())}
        ${summaryRow("お名前", `${membershipState.lastName} ${membershipState.firstName}`.trim())}
        ${summaryRow("物件・号室", `${membershipState.property} ${membershipState.room ? `${membershipState.room}号室` : ""}`.trim())}
        ${summaryRow("電話番号", membershipState.phone)}
        ${summaryRow("メールアドレス", membershipState.email)}
      </dl>
      <div class="privacy-policy-card">
        <div>
          <strong>プライバシーポリシー</strong>
          <p>送信前に、個人情報の利用目的および取り扱いについてご確認ください。</p>
        </div>
        <a
          href="https://www.heiwajuutaku.com/privacy_policy"
          target="_blank"
          rel="noreferrer"
        >プライバシーポリシーを確認する <span aria-hidden="true">↗</span></a>
      </div>
      <div class="membership-caution">
        <p>
          入居者情報が入居申込書、または変更のご連絡を頂いた情報と相違する場合は、お電話等で本人確認または契約者様に確認させて頂く場合がございます。
          確認できない場合は回答できない場合もありますので、予めご了承ください。
        </p>
        <p>
          お問合せ頂いた2営業日を目安に回答させて頂きます。<br />
          回答の連絡がない場合は、改めてお問合せ頂けますようお願い申し上げます。
        </p>
      </div>
      <div class="navigation">
        <button type="button" class="button button-secondary" data-action="membership-back">戻る</button>
        <button type="button" class="button button-primary" data-action="membership-submit">
          上記を確認・同意して、送信<span aria-hidden="true">→</span>
        </button>
      </div>
      <p class="mock-note">※画面確認用モックのため、実際の送信・保存は行われません。</p>
    </section>`;
}

function renderMembershipSuccess() {
  const current = document.getElementById("formCard");
  current.outerHTML = `
    <section class="success-card membership-success with-email-preview" id="formCard">
      <div class="success-icon" aria-hidden="true">✓</div>
      <p class="eyebrow">加入状況確認受付</p>
      <h1>送信が完了しました</h1>
      <p class="success-lead">受付番号は <strong>${membershipTicketNumber}</strong> です。</p>
      <div class="success-info">
        <p>入力いただいたメールアドレス宛に受付内容をお送りします。</p>
        <p>お問合せ頂いた2営業日を目安に回答いたします。</p>
      </div>
      ${membershipReplyEmail()}
      <button class="button button-primary" data-action="membership-restart" type="button">入力画面に戻る</button>
      <p class="mock-note">※モックのため、メール送信やデータ保存は行われません。</p>
    </section>`;
}

function renderMembershipForm() {
  const current = document.getElementById("formCard");
  if (membershipState.complete) {
    renderMembershipSuccess();
    return;
  }
  current.innerHTML = `${membershipStepper()}${
    membershipState.step === 1 ? renderMembershipInput() : renderMembershipConfirmation()
  }`;
}

function renderSuccess() {
  document.getElementById("formCard").outerHTML = `
    <section class="success-card with-email-preview" id="formCard">
      <div class="success-icon" aria-hidden="true">✓</div>
      <p class="eyebrow">お問い合わせ受付</p>
      <h1>送信が完了しました</h1>
      <p class="success-lead">受付番号は <strong>${generalTicketNumber}</strong> です。</p>
      <div class="success-info">
        <p>入力いただいたメールアドレス宛に受付内容をお送りします。</p>
        <p>営業時間外のご連絡は、翌営業日以降に確認いたします。</p>
      </div>
      ${generalReplyEmail()}
      <button class="button button-primary" data-action="restart" type="button">入力画面に戻る</button>
      <p class="mock-note">※モックのため、メール送信やデータ保存は行われません。</p>
    </section>`;
}

function render() {
  if (state.formMode === "membership") {
    renderMembershipForm();
    return;
  }
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
  } else if (target.dataset.action === "membership-next") {
    if (!membershipInputReady()) {
      membershipState.error = "必須項目を入力してください。";
      render();
      document.querySelector(".form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    membershipState.error = "";
    membershipState.step = 2;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "membership-back") {
    membershipState.step = 1;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "membership-submit") {
    membershipState.complete = true;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "membership-restart") {
    membershipState.complete = false;
    membershipState.step = 1;
    membershipState.error = "";
    document.querySelector(".success-card").outerHTML =
      '<section class="form-card" id="formCard" aria-live="polite"></section>';
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "next") {
    state.step = Math.min(4, state.step + 1);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "back") {
    state.step = Math.max(1, state.step - 1);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target.dataset.action === "submit") {
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
  const membershipFieldMap = {
    membershipLastName: "lastName",
    membershipFirstName: "firstName",
    membershipProperty: "property",
    membershipRoom: "room",
    membershipPhone: "phone",
    membershipEmail: "email",
  };
  if (membershipFieldMap[target.id]) {
    membershipState[membershipFieldMap[target.id]] = target.value;
    membershipState.error = "";
  }
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
  if (target.matches("[data-membership-service]")) {
    membershipState.services = target.checked
      ? [...new Set([...membershipState.services, target.value])]
      : membershipState.services.filter((service) => service !== target.value);
    membershipState.error = "";
    render();
  } else if (target.id === "photoFiles" || target.id === "videoFiles") {
    const names = Array.from(target.files || []).map((file) => file.name);
    if (target.id === "photoFiles") state.photos = names;
    if (target.id === "videoFiles") state.videos = names;
    render();
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

const pageBehindWelcome = document.querySelectorAll(
  ".site-header, .demo-ribbon, .intro, #formCard, footer",
);

document.body.classList.add("modal-open");
pageBehindWelcome.forEach((element) => {
  element.inert = true;
});
welcomeDialog.focus({ preventScroll: true });

startFormButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.formMode = button.dataset.route === "membership" ? "membership" : "standard";
    render();
    welcomeBackdrop.hidden = true;
    document.body.classList.remove("modal-open");
    pageBehindWelcome.forEach((element) => {
      element.inert = false;
    });
    const firstField =
      state.formMode === "membership"
        ? document.querySelector("[data-membership-service]")
        : document.querySelector("[data-inquiry]");
    firstField?.focus({ preventScroll: true });
  });
});
