const STORAGE_KEY = "heiwaOwnerSurveyDraft";
const SUBMITTED_KEY = "heiwaOwnerSurveySubmitted";
const GOOGLE_APPS_SCRIPT_ENDPOINT = "";

const purchaseIntentValues = [
  "積極的に収益不動産を追加取得したい",
  "良いものがあれば、収益不動産を追加取得したい",
];

const steps = [
  {
    id: "intro",
    kicker: "ご案内",
    title: "オーナーアンケート実施についてのご案内",
    navTitle: "ご案内",
    type: "intro",
  },
  {
    id: "q1",
    kicker: "設問 1",
    title: "外壁・屋根等の修繕方針",
    navTitle: "外壁・屋根",
    fields: [
      {
        id: "q1_exterior_policy",
        type: "radio",
        required: true,
        label: "所有物件の外壁・屋根等の修繕方針について",
        options: [
          "大幅に耐用年数を伸長させるような美観形成・建物保全を積極的に進めたい",
          "耐用年数を伸長させるような建物保全を行なっていきたい",
          "安全面を維持できる程度の最低限必要な修繕のみ行いたい",
          "近い将来の解体を見据えて原則的に保全は行わない",
          "まだ具体的には決まっていない",
          "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
        ],
      },
    ],
  },
  {
    id: "q2",
    kicker: "設問 2",
    title: "室内等の修繕方針",
    navTitle: "室内修繕",
    fields: [
      {
        id: "q2_interior_policy",
        type: "radio",
        required: true,
        label: "所有物件の室内等修繕方針について",
        options: [
          "家賃上昇または維持を目的としたリノベーションやリフォームを積極的に行っていきたい（予算1室あたり80万円以上）",
          "家賃を維持できるようにリフォームしていきたい（予算1室あたり40万円以上）",
          "多少賃料が下がっても現状維持程度の修繕に留める",
          "基本的に修繕はせず賃料を下げて対応していく",
          "近い将来の建替、解体を見据えて積極的に室内補修は行わない",
          "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
        ],
      },
    ],
  },
  {
    id: "q3",
    kicker: "設問 3",
    title: "入居者募集の方針",
    navTitle: "募集方針",
    fields: [
      {
        id: "q3_recruitment_policy",
        type: "radio",
        required: true,
        label: "入居者募集の方針について",
        options: [
          "リフォームの実施や募集条件の緩和（賃料値下げ等）等あらゆる手段を尽くして早く入居してもらうことを優先",
          "リフォームを積極的に行うことで募集条件は緩和せず、なるべく維持することを優先",
          "リフォームよりも募集条件を緩和させてでも早く入居してもらうことを優先",
          "リフォームも募集条件の緩和もせず、入居したい人がでてくるまで待つ",
          "解体等を見据えて募集は積極的には行わない",
          "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
        ],
      },
    ],
  },
  {
    id: "q4",
    kicker: "設問 4",
    title: "募集条件の緩和",
    navTitle: "条件緩和",
    fields: [
      {
        id: "q4_condition_relaxation",
        type: "checkbox",
        required: true,
        label: "募集条件（値下げ裁量・初期費用等）の緩和について",
        help: "複数選択可",
        options: [
          "早期成約のため、弊社に一定の賃料値下げの裁量を委ねる",
          "賃料の値下げ（金額については都度相談）",
          "フリーレント（家賃無料期間）を利用した初期費用軽減の導入",
          "トリプルゼロ（仲介手数料貸主負担・礼金0・敷金0）の導入",
          "トリプルゼロ＋（仲介手数料貸主負担・家賃1ヶ月フリーレント・礼金0・敷金0）の導入",
          "プレミアムゼロ（仲介手数料貸主負担・初回保証会社保証料貸主負担・家賃1ヶ月フリーレント・礼金0・敷金0）の導入",
          "募集条件緩和は原則行わない（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
        ],
      },
      {
        id: "q4_discretion_amount",
        type: "currency",
        label: "弊社に委ねる裁量幅",
        placeholder: "例：5,000",
        showIf: (data) =>
          Array.isArray(data.q4_condition_relaxation) &&
          data.q4_condition_relaxation.includes("早期成約のため、弊社に一定の賃料値下げの裁量を委ねる"),
      },
    ],
  },
  {
    id: "q5",
    kicker: "設問 5",
    title: "来春入居申込受付",
    navTitle: "来春予約",
    fields: [
      {
        id: "q5_spring_move_in",
        type: "radio",
        required: true,
        label: "来春入居申込受付について",
        help: "近年の入試改革（10月から12月の合格発表増加）や企業の早期内定に伴い、10月頃から来春入居を探す層が急増しています。",
        options: [
          "現在空室のお部屋について、10月からの「来春入居予約（4月契約開始）」を積極的に受付けたい（「来春入居可物件」として表示・紹介されます）",
          "前向きではあるが、受付けについては都度相談したい（「来春入居可物件」として表示されませんので、紹介機会が減少する恐れがあります）",
          "消極的ではあるが、受付けについては条件によって都度相談したい",
          "現在空室のお部屋は、即入居可能な申込のみを優先したい（来春予約は受け付けない）",
          "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
        ],
      },
    ],
  },
  {
    id: "q6",
    kicker: "設問 6",
    title: "不動産投資の方針",
    navTitle: "投資方針",
    fields: [
      {
        id: "q6_investment_policy",
        type: "radio",
        required: true,
        label: "不動産投資の方針について",
        options: [
          "積極的に収益不動産を追加取得したい",
          "良いものがあれば、収益不動産を追加取得したい",
          "現状維持（購入も売却もしない）",
          "将来売却方針",
          "直ちに売却",
        ],
      },
    ],
  },
  {
    id: "q7",
    kicker: "設問 7",
    title: "購入したい収益不動産の種別",
    navTitle: "購入種別",
    when: (data) => purchaseIntentValues.includes(data.q6_investment_policy),
    fields: [
      {
        id: "q7_purchase_types",
        type: "checkbox",
        label: "収益不動産の購入したい種別について",
        help: "「収益不動産を取得したい」を選択された方が対象です。複数選択可",
        options: [
          "アパート（木造・鉄骨）",
          "マンション（鉄筋コンクリート・鉄骨）",
          "分譲マンション1室",
          "戸建住宅",
          "商業ビル・店舗・事務所",
          "駐車場・更地",
        ],
      },
    ],
  },
  {
    id: "q8",
    kicker: "設問 8",
    title: "購入予算",
    navTitle: "購入予算",
    when: (data) => purchaseIntentValues.includes(data.q6_investment_policy),
    fields: [
      {
        id: "q8_purchase_budget",
        type: "checkbox",
        label: "収益不動産の購入予算について",
        help: "複数選択可。ご回答いただいた方には、適宜ご予算に該当する物件情報をご提供します。",
        options: ["〜3000万円", "3001万円〜6000万円", "6001万円〜1億円", "1〜3億円", "3億円以上"],
      },
      {
        id: "q8_no_property_info",
        type: "singleCheckbox",
        label: "物件情報の提供",
        option: "物件情報の提供は不要",
      },
    ],
  },
  {
    id: "q9",
    kicker: "設問 9",
    title: "購入希望条件",
    navTitle: "希望条件",
    when: (data) => purchaseIntentValues.includes(data.q6_investment_policy),
    fields: [
      {
        id: "q9_purchase_conditions",
        type: "textarea",
        label: "収益不動産の購入にあたりご希望条件などあれば、ご入力ください。",
        placeholder: "エリア、利回り、築年数、規模感、融資条件など",
      },
    ],
  },
  {
    id: "q10",
    kicker: "設問 10",
    title: "スタッフに相談したい事項",
    navTitle: "相談事項",
    fields: [
      {
        id: "q10_consultation_topics",
        type: "checkbox",
        label: "弊社スタッフに相談したい事項はありますか",
        help: "複数選択可",
        options: [
          "空室対策",
          "所有不動産の修繕計画",
          "所有不動産の査定（売却・資産価値把握）",
          "新規物件の購入支援・情報提供",
          "相続・家族信託や生前贈与を含む事業承継対策",
          "銀行融資の借り換えや資金調達",
          "弊社以外の管理会社に委託、または自ら管理する物件の管理について",
        ],
      },
    ],
  },
  {
    id: "q11",
    kicker: "設問 11",
    title: "ご相談・ご意見・ご要望",
    navTitle: "ご要望",
    fields: [
      {
        id: "q11_free_comment",
        type: "textarea",
        label: "弊社にご相談、ご意見、ご要望等がございましたら、ご入力ください。",
        placeholder: "ご自由にご記入ください。",
      },
    ],
  },
  {
    id: "owner",
    kicker: "回答者情報",
    title: "オーナー様情報",
    navTitle: "基本情報",
    fields: [
      {
        id: "owner_property",
        type: "text",
        required: true,
        label: "所有物件名（1棟の表記で可）",
        placeholder: "例：平和レジデンス一番町",
      },
      {
        id: "owner_name",
        type: "text",
        required: true,
        label: "氏名",
        placeholder: "例：山田 太郎",
      },
      {
        id: "owner_mobile",
        type: "tel",
        required: true,
        label: "携帯電話番号",
        placeholder: "例：090-0000-0000",
      },
      {
        id: "owner_email",
        type: "email",
        required: true,
        label: "E-mailアドレス",
        placeholder: "example@example.com",
      },
      {
        id: "owner_birthdate",
        type: "date",
        label: "生年月日（法人の場合は代表者様）",
      },
    ],
    note: "企業の社宅契約になる場合、企業側から貸主が暴力団等の反社会的勢力に関わりが無いことを照会（属性確認）する為に、貸主や代表者の生年月日の情報を求められるケースが増えておりますので、ご協力をお願いいたします。",
  },
  {
    id: "summary",
    kicker: "確認",
    title: "入力内容の確認",
    navTitle: "確認",
    type: "summary",
  },
];

let formData = loadDraft();
let currentStepIndex = 0;
let errors = {};
let toastTimer = null;

const els = {
  stepNav: document.getElementById("stepNav"),
  stepKicker: document.getElementById("stepKicker"),
  stepTitle: document.getElementById("stepTitle"),
  stepContent: document.getElementById("stepContent"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  saveState: document.getElementById("saveState"),
  backBtn: document.getElementById("backBtn"),
  saveBtn: document.getElementById("saveBtn"),
  nextBtn: document.getElementById("nextBtn"),
  nextLabel: document.getElementById("nextLabel"),
  formActions: document.querySelector(".form-actions"),
  toast: document.getElementById("toast"),
};

render();

els.backBtn.addEventListener("click", () => {
  if (currentStepIndex <= 0) return;
  currentStepIndex -= 1;
  errors = {};
  render();
});

els.nextBtn.addEventListener("click", async () => {
  const step = getCurrentStep();

  if (step.type === "intro") {
    currentStepIndex += 1;
    render();
    return;
  }

  if (step.type === "summary") {
    if (!formData.policy_agreement) {
      errors = { policy_agreement: "内容をご確認の上、同意にチェックしてください。" };
      render();
      return;
    }
    await submitSurvey();
    return;
  }

  if (!validateStep(step)) {
    render();
    focusFirstError();
    return;
  }

  errors = {};
  saveDraft("自動保存済");
  currentStepIndex = Math.min(currentStepIndex + 1, getVisibleSteps().length - 1);
  render();
});

els.saveBtn.addEventListener("click", () => {
  saveDraft("下書きを保存しました");
  showToast("入力内容をこのブラウザに保存しました。");
});

els.stepContent.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.name) return;
  updateDataFromControl(target);
  errors[target.name] = "";
  saveDraft("自動保存済");

  if (target.type === "radio" || target.type === "checkbox") {
    render();
  }
});

els.stepContent.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.name || target.type === "checkbox" || target.type === "radio") return;
  updateDataFromControl(target);
  errors[target.name] = "";
  saveDraft("自動保存済");
});

function render() {
  const visibleSteps = getVisibleSteps();
  if (currentStepIndex >= visibleSteps.length) {
    currentStepIndex = visibleSteps.length - 1;
  }

  const step = visibleSteps[currentStepIndex];
  els.stepKicker.textContent = step.kicker;
  els.stepTitle.textContent = step.title;
  renderProgress(visibleSteps);
  renderNav(visibleSteps);
  renderActions(step);

  if (step.type === "intro") {
    renderIntro();
    return;
  }

  if (step.type === "summary") {
    renderSummary();
    return;
  }

  renderFields(step);
}

function renderIntro() {
  els.stepContent.innerHTML = `
    <div class="intro-copy">
      <div class="lead-box">
        <p>平素は格別のご高配を賜り、厚く御礼申し上げます。</p>
        <p>弊社のサービスを信頼し、大切なご資産をお預けくださっているオーナー様のご支援とお引き立てに、心より深く感謝申し上げます。</p>
        <p>弊社は、今年で創業50周年を迎えることとなりました。この大きな節目にあたり、私どもは「オーナー様お一人おひとりの『未来のビジョン』に寄り添った管理」を、これまで以上に強化していきたいと考えております。</p>
        <p>皆様が描かれている将来の展望や、現状の運用に対する率直なご意向をお聞かせいただき、これからのサービス向上のための指針とさせていただきたく存じます。</p>
      </div>
      <div class="note-box">
        <strong>ご回答いただいた方には、創業50周年の感謝を込めまして「QUOカード（3,000円分）」を進呈いたします。</strong>
        <span>QUOカードは契約書類等の送付先に送付となります。</span>
      </div>
    </div>
  `;
}

function renderFields(step) {
  const html = [];
  const regularFields = getRenderableFields(step);

  if (step.id === "owner") {
    html.push(`<div class="field-grid">`);
  }

  regularFields.forEach((field) => {
    html.push(renderField(field, step.id === "owner"));
  });

  if (step.id === "owner") {
    html.push(`</div>`);
    html.push(`
      <div class="note-box" style="margin-top: 22px">
        <strong>生年月日について</strong>
        <span>${escapeHtml(step.note)}</span>
      </div>
      <div class="policy-row">
        <a href="https://www.heiwajuutaku.com/contact_page/644105" target="_blank" rel="noopener">プライバシーポリシーを表示</a>
      </div>
    `);
  }

  els.stepContent.innerHTML = html.join("");
}

function renderField(field, compact = false) {
  if (field.showIf && !field.showIf(formData)) return "";

  if (["text", "tel", "email", "date", "currency"].includes(field.type)) {
    return renderTextField(field, compact);
  }

  if (field.type === "textarea") {
    return renderTextarea(field);
  }

  if (field.type === "singleCheckbox") {
    return renderSingleCheckbox(field);
  }

  return `
    <div class="field-group" data-field="${escapeAttr(field.id)}">
      ${renderFieldHead(field)}
      <div class="option-grid">
        ${field.options
          .map((option) => renderOption(field, option))
          .join("")}
      </div>
      ${renderError(field.id)}
    </div>
  `;
}

function renderFieldHead(field) {
  return `
    <div class="field-head">
      <p class="field-label">
        <span>${escapeHtml(field.label)}</span>
        ${field.required ? `<span class="required">必須</span>` : ""}
      </p>
      ${field.help ? `<p class="field-help">${escapeHtml(field.help)}</p>` : ""}
    </div>
  `;
}

function renderOption(field, option) {
  const value = typeof option === "string" ? option : option.value;
  const title = typeof option === "string" ? option : option.title;
  const desc = typeof option === "string" ? "" : option.desc || "";
  const checked =
    field.type === "checkbox"
      ? Array.isArray(formData[field.id]) && formData[field.id].includes(value)
      : formData[field.id] === value;

  return `
    <label class="option-card">
      <input
        type="${field.type === "checkbox" ? "checkbox" : "radio"}"
        name="${escapeAttr(field.id)}"
        value="${escapeAttr(value)}"
        ${checked ? "checked" : ""}
      />
      <span class="option-text">
        <span class="option-title">${escapeHtml(title)}</span>
        ${desc ? `<span class="option-desc">${escapeHtml(desc)}</span>` : ""}
      </span>
    </label>
  `;
}

function renderTextField(field, compact) {
  const value = formData[field.id] || "";
  const type = field.type === "currency" ? "text" : field.type;
  const inputMode = field.type === "currency" ? "numeric" : "";
  const control = `
    <input
      class="text-control"
      type="${type}"
      name="${escapeAttr(field.id)}"
      value="${escapeAttr(value)}"
      placeholder="${escapeAttr(field.placeholder || "")}"
      ${inputMode ? `inputmode="${inputMode}"` : ""}
      ${field.required ? "aria-required=\"true\"" : ""}
    />
  `;

  const fieldHtml = `
    <label class="input-field" data-field="${escapeAttr(field.id)}">
      <span class="input-label">
        ${escapeHtml(field.label)}
        ${field.required ? `<span class="required">必須</span>` : ""}
      </span>
      ${field.type === "currency" ? `<span class="prefix-control">${control}</span>` : control}
      ${renderError(field.id)}
    </label>
  `;

  if (compact) return fieldHtml;

  return `
    <div class="field-group">
      ${fieldHtml}
    </div>
  `;
}

function renderTextarea(field) {
  const value = formData[field.id] || "";
  return `
    <div class="field-group" data-field="${escapeAttr(field.id)}">
      ${renderFieldHead(field)}
      <textarea
        class="textarea-control"
        name="${escapeAttr(field.id)}"
        placeholder="${escapeAttr(field.placeholder || "")}"
      >${escapeHtml(value)}</textarea>
      ${renderError(field.id)}
    </div>
  `;
}

function renderSingleCheckbox(field) {
  const checked = Boolean(formData[field.id]);
  return `
    <div class="field-group" data-field="${escapeAttr(field.id)}">
      <p class="field-label">${escapeHtml(field.label)}</p>
      <label class="option-card">
        <input type="checkbox" name="${escapeAttr(field.id)}" value="true" ${checked ? "checked" : ""} />
        <span class="option-text">
          <span class="option-title">${escapeHtml(field.option)}</span>
        </span>
      </label>
      ${renderError(field.id)}
    </div>
  `;
}

function renderSummary() {
  const rows = buildSummaryRows();
  const policyChecked = formData.policy_agreement ? "checked" : "";

  els.stepContent.innerHTML = `
    <div class="summary-list">
      ${rows
        .map(
          (row) => `
            <div class="summary-item">
              <span class="summary-label">${escapeHtml(row.label)}</span>
              <p class="summary-value">${escapeHtml(row.value || "未入力")}</p>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="field-group">
      <label class="option-card">
        <input type="checkbox" name="policy_agreement" value="true" ${policyChecked} />
        <span class="option-text">
          <span class="option-title">入力内容とプライバシーポリシーを確認し、送信に同意します。</span>
          <span class="option-desc">送信後、回答内容は管理用スプレッドシートへ記録されます。</span>
        </span>
      </label>
      ${renderError("policy_agreement")}
      <div class="policy-row">
        <a href="https://www.heiwajuutaku.com/contact_page/644105" target="_blank" rel="noopener">プライバシーポリシーを表示</a>
      </div>
    </div>
  `;
}

function renderComplete(payload) {
  els.stepKicker.textContent = "送信完了";
  els.stepTitle.textContent = "ご回答ありがとうございました";
  els.progressText.textContent = "完了";
  els.progressBar.style.width = "100%";
  els.formActions.classList.add("is-hidden");
  els.stepNav.innerHTML = "";
  els.stepContent.innerHTML = `
    <div class="complete-panel">
      <div class="complete-badge" aria-hidden="true">✓</div>
      <h3>送信が完了しました。</h3>
      <p>創業50周年記念「QUOカード（3,000円分）」は契約書類等の送付先に送付となります。</p>
      <div class="sheet-preview">
        <strong>Googleスプレッドシート登録予定データ</strong>
        <span>受付日時：${escapeHtml(payload.submitted_at)}</span>
        <span>所有物件名：${escapeHtml(formData.owner_property || "")}</span>
        <span>氏名：${escapeHtml(formData.owner_name || "")}</span>
      </div>
    </div>
  `;
}

function renderError(id) {
  return `<p class="error-message">${errors[id] ? escapeHtml(errors[id]) : ""}</p>`;
}

function renderActions(step) {
  els.formActions.classList.remove("is-hidden");
  els.backBtn.disabled = currentStepIndex === 0;
  els.backBtn.style.visibility = currentStepIndex === 0 ? "hidden" : "visible";

  if (step.type === "intro") {
    els.nextLabel.textContent = "回答を始める";
  } else if (step.type === "summary") {
    els.nextLabel.textContent = "確認、同意して送信";
  } else {
    els.nextLabel.textContent = "次へ";
  }
}

function renderProgress(visibleSteps) {
  const total = visibleSteps.length;
  const current = currentStepIndex + 1;
  const progress = Math.round((current / total) * 100);
  els.progressText.textContent = `${current} / ${total}`;
  els.progressBar.style.width = `${progress}%`;
}

function renderNav(visibleSteps) {
  els.stepNav.innerHTML = visibleSteps
    .map((step, index) => {
      const status = index === currentStepIndex ? "is-active" : index < currentStepIndex ? "is-complete" : "";
      const dot = index < currentStepIndex ? "✓" : index + 1;
      return `
        <li class="${status}">
          <span class="step-dot">${dot}</span>
          <span>${escapeHtml(step.navTitle)}</span>
        </li>
      `;
    })
    .join("");
}

function getVisibleSteps() {
  return steps.filter((step) => !step.when || step.when(formData));
}

function getCurrentStep() {
  return getVisibleSteps()[currentStepIndex];
}

function getRenderableFields(step) {
  return (step.fields || []).filter((field) => !field.showIf || field.showIf(formData));
}

function updateDataFromControl(target) {
  const name = target.name;

  if (target.type === "checkbox") {
    const step = getCurrentStep();
    const field = (step.fields || []).find((item) => item.id === name);

    if (field && field.type === "checkbox") {
      const values = Array.isArray(formData[name]) ? [...formData[name]] : [];
      if (target.checked && !values.includes(target.value)) values.push(target.value);
      if (!target.checked) {
        const index = values.indexOf(target.value);
        if (index >= 0) values.splice(index, 1);
      }
      formData[name] = values;
      return;
    }

    formData[name] = target.checked;
    return;
  }

  formData[name] = target.value;
}

function validateStep(step) {
  errors = {};
  const fields = getRenderableFields(step);

  fields.forEach((field) => {
    const value = formData[field.id];
    if (field.required && isEmptyValue(value)) {
      errors[field.id] = "この項目を入力してください。";
      return;
    }

    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.id] = "有効なE-mailアドレスを入力してください。";
    }
  });

  return Object.values(errors).filter(Boolean).length === 0;
}

function isEmptyValue(value) {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === "";
}

function focusFirstError() {
  const firstKey = Object.keys(errors).find((key) => errors[key]);
  const target = firstKey ? document.querySelector(`[data-field="${CSS.escape(firstKey)}"]`) : null;
  if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function buildSummaryRows() {
  const rows = [];
  getVisibleSteps().forEach((step) => {
    if (!step.fields) return;
    getRenderableFields(step).forEach((field) => {
      rows.push({
        label: field.label,
        value: formatValue(field, formData[field.id]),
      });
    });
  });
  return rows;
}

function formatValue(field, value) {
  if (field.type === "singleCheckbox") return value ? field.option : "";
  if (Array.isArray(value)) return value.join("\n");
  if (field.type === "currency" && value) return `${value}円`;
  return value || "";
}

function buildSheetPayload() {
  const rows = buildSummaryRows();
  const payload = {
    submitted_at: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    source: "existing_owner_50th_anniversary_survey",
  };

  rows.forEach((row) => {
    payload[row.label] = row.value || "";
  });

  return payload;
}

async function submitSurvey() {
  const payload = buildSheetPayload();

  if (GOOGLE_APPS_SCRIPT_ENDPOINT) {
    await fetch(GOOGLE_APPS_SCRIPT_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(payload));
  localStorage.removeItem(STORAGE_KEY);
  renderComplete(payload);
}

function saveDraft(label) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  els.saveState.textContent = label;
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
