const STORAGE_KEY = "heiwaNewOwnerSurveyDraft";
const SUBMITTED_KEY = "heiwaNewOwnerSurveySubmitted";
const GOOGLE_APPS_SCRIPT_ENDPOINT = "";
const ZIPCLOUD_ENDPOINT = "https://zipcloud.ibsnet.co.jp/api/search";

const PURCHASE_INTENTS = ["積極的に収益不動産を追加取得したい", "良いものがあれば、収益不動産を追加取得したい"];

const steps = [
  {
    id: "intro",
    navTitle: "ご案内",
    kicker: "ご案内",
    title: "入力前のご案内",
    type: "intro",
  },
  {
    id: "contract",
    navTitle: "契約方法",
    kicker: "STEP 1",
    title: "重要事項説明書・契約書の取り交わし方法",
    fields: [
      {
        id: "contract_method",
        type: "radio",
        required: true,
        label: "ご希望の取り交わし方法を選択ください。",
        options: [
          {
            value: "電子契約による締結（印紙税対象外）",
            title: "電子契約による締結（印紙税対象外）",
            desc: "Box Signを通じてPDFを閲覧・ダウンロードし、電子署名で締結します。",
          },
          {
            value: "書面契約による締結（印紙税対象）",
            title: "書面契約による締結（印紙税対象）",
            desc: "印紙税対象となるため、お客様に収入印紙4,000円分をご用意いただく必要があります。",
          },
        ],
      },
      {
        id: "electronic_consent",
        type: "singleCheckbox",
        required: true,
        label: "電磁的方法による提供に関する承諾",
        option: "電子契約締結にあたり、下記の承諾事項に同意します。",
        help: "対象書面：賃貸住宅管理受託契約 重要事項説明書、賃貸住宅管理受託契約書。提供方法：Box Signを通じた閲覧・ダウンロード。",
        showIf: (data) => data.contract_method === "電子契約による締結（印紙税対象外）",
      },
    ],
  },
  {
    id: "owner",
    navTitle: "委託者情報",
    kicker: "STEP 2",
    title: "委託者様について",
    grid: "two",
    fields: [
      { id: "owner_name", type: "text", required: true, label: "氏名（会社名）", placeholder: "例：山田 太郎 / 株式会社〇〇" },
      { id: "owner_name_kana", type: "text", required: true, label: "氏名（フリガナ）", placeholder: "例：ヤマダ タロウ" },
      { id: "corp_rep_title", type: "text", label: "法人の代表者役職", placeholder: "例：代表取締役" },
      { id: "corp_rep_name", type: "text", label: "法人の代表者氏名", placeholder: "例：山田 太郎" },
      { id: "corp_rep_name_kana", type: "text", label: "法人の代表者氏名（フリガナ）", placeholder: "例：ヤマダ タロウ" },
      { id: "birthdate", type: "date", required: true, label: "生年月日（法人の場合は代表者の生年月日）" },
      {
        id: "address",
        type: "addressLookup",
        required: true,
        label: "住所",
        postalId: "postal_code",
        detailId: "address_detail",
        postalPlaceholder: "例：981-0908",
        placeholder: "郵便番号検索で町域まで自動反映されます。",
        detailPlaceholder: "例：2丁目21-4 ○○マンション101",
      },
      { id: "landline", type: "tel", label: "固定電話", placeholder: "例：022-000-0000" },
      { id: "mobile", type: "tel", required: true, label: "携帯番号", placeholder: "例：090-0000-0000" },
      { id: "email", type: "email", required: true, label: "E-mailアドレス", placeholder: "example@example.com" },
      {
        id: "preferred_contact",
        type: "radio",
        required: true,
        label: "希望連絡手段（緊急時は除く）",
        options: [
          "メール",
          "LINE（お友達登録のURLを後日送信します）",
          "電話",
        ],
      },
      {
        id: "invoice_status",
        type: "radio",
        required: true,
        label: "インボイス登録の有無",
        options: ["有", "無"],
      },
      {
        id: "invoice_number",
        type: "invoice",
        label: "インボイス登録番号",
        placeholder: "13桁の番号",
        showIf: (data) => data.invoice_status === "有",
      },
      { id: "fiscal_month", type: "text", label: "決算月（法人の場合）", placeholder: "例：3月" },
    ],
  },
  {
    id: "contact",
    navTitle: "連絡窓口",
    kicker: "STEP 3",
    title: "ご連絡窓口について",
    fields: [
      {
        id: "contact_person_type",
        type: "radio",
        required: true,
        label: "弊社からのご連絡窓口についてご選択ください。",
        options: [
          "委託者様本人",
          "委託者様以外を指定（法人の代表者以外のご担当者様、ご子息、ご息女様等）",
        ],
      },
      { id: "contact_name", type: "text", label: "氏名（法人の場合は担当者様）", placeholder: "例：山田 花子", showIf: isOtherContact },
      { id: "contact_name_kana", type: "text", label: "氏名（フリガナ）", placeholder: "例：ヤマダ ハナコ", showIf: isOtherContact },
      { id: "contact_relation", type: "text", label: "続柄（法人の場合は所属部署と役職）", placeholder: "例：長女 / 総務部 部長", showIf: isOtherContact },
      { id: "contact_address", type: "textarea", label: "住所", placeholder: "窓口となる方の住所", showIf: isOtherContact },
      { id: "contact_mobile", type: "tel", label: "携帯番号", placeholder: "例：090-0000-0000", showIf: isOtherContact },
      { id: "contact_email", type: "email", label: "E-mailアドレス", placeholder: "contact@example.com", showIf: isOtherContact },
      { id: "contact_birthdate", type: "date", label: "生年月日（法人の場合、入力不要）", showIf: isOtherContact },
    ],
  },
  {
    id: "documents",
    navTitle: "提出書類",
    kicker: "STEP 4",
    title: "委託者様にご提出いただく書類",
    fields: [
      {
        id: "document_method",
        type: "radio",
        required: true,
        label: "本人確認書類のご提出方法",
        help: "該当する必要書類をご確認の上、アップロードまたは後日提出をご選択ください。",
        options: [
          "本人確認書類をアップロード",
          "別の手段で後日提出",
        ],
      },
      {
        id: "document_file",
        type: "file",
        label: "本人確認書類をアップロード",
        help: "個人：マイナンバーカード（表面）、運転免許証等の本人確認書類（表面・裏面）いずれか一点。法人：代表者の本人確認書類。マイナンバーカードの場合、性別・臓器提供意思表示欄はマスキングしてください。",
        showIf: (data) => data.document_method === "本人確認書類をアップロード",
      },
    ],
  },
  {
    id: "bank",
    navTitle: "送金口座",
    kicker: "STEP 5",
    title: "賃料送金口座に関して",
    grid: "two",
    fields: [
      {
        id: "bank_status",
        type: "radio",
        required: true,
        label: "賃料の送金先口座に関してご選択ください。",
        options: ["下記口座を送金先とする", "送金先口座が未定の為、後日連絡"],
      },
      { id: "bank_name", type: "text", label: "金融機関名", placeholder: "例：〇〇銀行", showIf: hasBank },
      { id: "branch_name", type: "text", label: "本支店名", placeholder: "例：仙台支店", showIf: hasBank },
      { id: "account_type", type: "radio", label: "口座種別", options: ["普通", "当座"], showIf: hasBank },
      { id: "account_number", type: "text", label: "口座番号", placeholder: "例：1234567", showIf: hasBank },
      { id: "account_holder_kana", type: "text", label: "名義（フリガナ）", placeholder: "例：ヤマダ タロウ", showIf: hasBank },
    ],
  },
  surveyStep("q1", "運用方針 1", "外壁・屋根", "所有物件の外壁・屋根等の修繕方針について", [
    "大幅に耐用年数を伸長させるような美観形成・建物保全を積極的に進めたい",
    "耐用年数を伸長させるような建物保全を行なっていきたい",
    "安全面を維持できる程度の最低限必要な修繕のみ行いたい",
    "近い将来の解体を見据えて原則的に保全は行わない",
    "まだ具体的には決まっていない",
    "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
  ], "q1_exterior_policy"),
  surveyStep("q2", "運用方針 2", "室内修繕", "所有物件の室内等修繕方針について", [
    "家賃上昇または維持を目的としたリノベーションやリフォームを積極的に行っていきたい（予算1室あたり80万円以上）",
    "家賃を維持できるようにリフォームしていきたい（予算1室あたり40万円以上）",
    "多少賃料が下がっても現状維持程度の修繕に留める",
    "基本的に修繕はせず賃料を下げて対応していく",
    "近い将来の建替、解体を見据えて積極的に室内補修は行わない",
    "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
  ], "q2_interior_policy"),
  surveyStep("q3", "運用方針 3", "募集方針", "入居者募集の方針について", [
    "リフォームの実施や募集条件の緩和（賃料値下げ等）等あらゆる手段を尽くして早く入居してもらうことを優先",
    "リフォームを積極的に行うことで募集条件は緩和せず、なるべく維持することを優先",
    "リフォームよりも募集条件を緩和させてでも早く入居してもらうことを優先",
    "リフォームも募集条件の緩和もせず、入居したい人がでてくるまで待つ",
    "解体等を見据えて募集は積極的には行わない",
    "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
  ], "q3_recruitment_policy"),
  {
    id: "q4",
    navTitle: "条件緩和",
    kicker: "運用方針 4",
    title: "募集条件の緩和",
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
        showIf: (data) => Array.isArray(data.q4_condition_relaxation) && data.q4_condition_relaxation.includes("早期成約のため、弊社に一定の賃料値下げの裁量を委ねる"),
      },
    ],
  },
  surveyStep("q5", "運用方針 5", "来春予約", "来春入居申込受付について", [
    "現在空室のお部屋について、10月からの「来春入居予約（4月契約開始）」を積極的に受付けたい（「来春入居可物件」として表示・紹介されます）",
    "前向きではあるが、受付けについては都度相談したい（「来春入居可物件」として表示されませんので、紹介機会が減少する恐れがあります）",
    "消極的ではあるが、受付けについては条件によって都度相談したい",
    "現在空室のお部屋は、即入居可能な申込のみを優先したい（来春予約は受け付けない）",
    "該当なし（駐車場・倉庫等のみをご委託頂いているオーナー様はこちらを選択下さい）",
  ], "q5_spring_move_in", "近年の入試改革（10月から12月の合格発表増加）や企業の早期内定に伴い、10月頃から来春入居を探す層が急増しています。"),
  surveyStep("q6", "投資方針", "投資方針", "不動産投資の方針について", [
    "積極的に収益不動産を追加取得したい",
    "良いものがあれば、収益不動産を追加取得したい",
    "現状維持（購入も売却もしない）",
    "将来売却方針",
    "直ちに売却",
  ], "q6_investment_policy"),
  {
    id: "q7",
    navTitle: "購入種別",
    kicker: "投資方針 2",
    title: "購入したい収益不動産の種別",
    when: (data) => PURCHASE_INTENTS.includes(data.q6_investment_policy),
    fields: [
      {
        id: "q7_purchase_types",
        type: "checkbox",
        label: "収益不動産の購入したい種別について",
        help: "「収益不動産を取得したい」を選択された方が対象です。複数選択可",
        options: ["アパート（木造・鉄骨）", "マンション（鉄筋コンクリート・鉄骨）", "分譲マンション1室", "戸建住宅", "商業ビル・店舗・事務所", "駐車場・更地"],
      },
    ],
  },
  {
    id: "q8",
    navTitle: "購入予算",
    kicker: "投資方針 3",
    title: "購入予算",
    when: (data) => PURCHASE_INTENTS.includes(data.q6_investment_policy),
    fields: [
      {
        id: "q8_purchase_budget",
        type: "checkbox",
        label: "収益不動産の購入予算について",
        help: "複数選択可。ご回答いただいた方には、適宜ご予算に該当する物件情報をご提供します。",
        options: ["〜3000万円", "3001万円〜6000万円", "6001万円〜1億円", "1〜3億円", "3億円以上"],
      },
      { id: "q8_no_property_info", type: "singleCheckbox", label: "物件情報の提供", option: "物件情報の提供は不要" },
    ],
  },
  {
    id: "q9",
    navTitle: "希望条件",
    kicker: "投資方針 4",
    title: "購入希望条件",
    when: (data) => PURCHASE_INTENTS.includes(data.q6_investment_policy),
    fields: [
      { id: "q9_purchase_conditions", type: "textarea", label: "収益不動産の購入にあたりご希望条件などあれば、ご入力ください。", placeholder: "エリア、利回り、築年数、規模感、融資条件など" },
    ],
  },
  {
    id: "inheritance",
    navTitle: "相続",
    kicker: "承継方針",
    title: "保有不動産の相続について",
    fields: [
      {
        id: "q10_inheritance_policy",
        type: "radio",
        label: "将来的なご意向について、現時点で当てはまるものを選択ください。",
        help: "法人の場合は入力不要です。ご親族間でのお話合いが進んでいない場合でも、現時点でのご意向でご回答ください。",
        options: [
          "不動産のまま（賃貸経営を継続して）後継者への相続を検討している",
          "売却などにより現金化して後継者への相続を検討している",
          "まだ何も決まっていない、わからない",
          "相続について相談したい",
          "その他",
        ],
      },
      { id: "q10_inheritance_other", type: "text", label: "その他の内容", placeholder: "具体的にご入力ください", showIf: (data) => data.q10_inheritance_policy === "その他" },
    ],
  },
  {
    id: "successor",
    navTitle: "後継者",
    kicker: "承継方針 2",
    title: "後継者様に関して",
    fields: [
      {
        id: "q11_successor_status",
        type: "radio",
        required: true,
        label: "現時点で、将来的に不動産賃貸事業の後継者様はお決まりですか？",
        options: ["決まっている", "検討中・未定", "将来売却予定につき後継者不要"],
      },
    ],
  },
  {
    id: "successor_info",
    navTitle: "後継者情報",
    kicker: "承継方針 3",
    title: "後継者様の情報に関して",
    when: (data) => data.q11_successor_status === "決まっている",
    grid: "two",
    fields: [
      { id: "successor_name", type: "text", label: "氏名", placeholder: "例：山田 花子" },
      { id: "successor_name_kana", type: "text", label: "氏名（フリガナ）", placeholder: "例：ヤマダ ハナコ" },
      { id: "successor_relation", type: "text", label: "続柄", placeholder: "例：長男" },
      { id: "successor_birthdate", type: "date", label: "生年月日" },
      { id: "successor_address", type: "textarea", label: "住所", placeholder: "後継者様の住所" },
      { id: "successor_mobile", type: "tel", label: "携帯番号", placeholder: "例：090-0000-0000" },
      { id: "successor_email", type: "email", label: "E-mailアドレス", placeholder: "successor@example.com" },
    ],
  },
  {
    id: "summary",
    navTitle: "確認",
    kicker: "確認",
    title: "入力内容の確認",
    type: "summary",
  },
];

let formData = loadDraft();
let currentStepIndex = 0;
let errors = {};
let toastTimer = null;
let addressLookupState = { loading: false, message: "", type: "" };

const els = {
  stepNav: document.getElementById("stepNav"),
  stepKicker: document.getElementById("stepKicker"),
  stepTitle: document.getElementById("stepTitle"),
  stepContent: document.getElementById("stepContent"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
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
  saveDraft();
  currentStepIndex = Math.min(currentStepIndex + 1, getVisibleSteps().length - 1);
  render();
});

els.saveBtn.addEventListener("click", () => {
  saveDraft();
  showToast("入力内容をこのブラウザに保存しました。");
});

els.stepContent.addEventListener("click", (event) => {
  const trigger = event.target.closest?.("[data-action='lookup-address']");
  if (!trigger) return;
  lookupAddressFromPostal();
});

els.stepContent.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.name) return;
  updateDataFromControl(target);
  errors[target.name] = "";
  if (["postal_code", "address", "address_detail"].includes(target.name)) errors.address = "";
  saveDraft();

  if (["radio", "checkbox", "file"].includes(target.type)) {
    render();
  }
});

els.stepContent.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.name || ["checkbox", "radio", "file"].includes(target.type)) return;
  updateDataFromControl(target);
  errors[target.name] = "";
  if (["postal_code", "address", "address_detail"].includes(target.name)) errors.address = "";
  if (target.name === "postal_code") {
    addressLookupState = { loading: false, message: "", type: "" };
  }
  saveDraft();
});

function surveyStep(id, kicker, navTitle, label, options, fieldId, help = "") {
  return {
    id,
    navTitle,
    kicker,
    title: label.replace("について", ""),
    fields: [
      {
        id: fieldId,
        type: "radio",
        required: true,
        label,
        help,
        options,
      },
    ],
  };
}

function isOtherContact(data) {
  return data.contact_person_type === "委託者様以外を指定（法人の代表者以外のご担当者様、ご子息、ご息女様等）";
}

function hasBank(data) {
  return data.bank_status === "下記口座を送金先とする";
}

function render() {
  const visibleSteps = getVisibleSteps();
  if (currentStepIndex >= visibleSteps.length) currentStepIndex = visibleSteps.length - 1;

  const step = visibleSteps[currentStepIndex];
  els.stepKicker.textContent = step.kicker;
  els.stepTitle.textContent = step.title;
  renderNav(visibleSteps);
  renderProgress(visibleSteps);
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
    <div class="intro-stack">
      <div class="lead-panel">
        <p>このフォームでは、賃貸住宅管理受託契約に伴う確認事項、契約書類作成に必要な情報、本人確認書類、賃料送金口座、今後の不動産運用方針を順にご入力いただきます。</p>
        <p>ご回答内容は、契約手続きおよび管理開始後のご提案・ご連絡の基礎情報として使用します。</p>
      </div>
      <div class="mini-grid">
        <div class="mini-card"><strong>契約方法</strong><span>電子契約または書面契約を選択</span></div>
        <div class="mini-card"><strong>必要情報</strong><span>委託者・窓口・送金口座を入力</span></div>
        <div class="mini-card"><strong>運用方針</strong><span>修繕・募集・投資・承継方針を確認</span></div>
      </div>
      <div class="notice-box">本番実装時は、送信された回答を自社Googleスプレッドシートへ自動蓄積する想定です。</div>
    </div>
  `;
}

function renderFields(step) {
  const fields = getRenderableFields(step);
  const html = [];

  if (step.grid) {
    html.push(`<div class="field-grid ${step.grid === "three" ? "three" : ""}">`);
  }

  fields.forEach((field) => html.push(renderField(field, Boolean(step.grid))));

  if (step.grid) html.push(`</div>`);

  if (step.id === "documents") {
    html.push(`<div class="notice-box" style="margin-top: 22px">マイナンバーカードを提出される場合は、機微情報（性別・臓器提供意思表示欄）が映らないよう、マスキングの上アップロードをお願いいたします。</div>`);
  }

  els.stepContent.innerHTML = html.join("");
}

function renderField(field, compact = false) {
  if (field.showIf && !field.showIf(formData)) return "";

  if (["text", "tel", "email", "date", "invoice", "currency"].includes(field.type)) {
    return renderTextField(field, compact);
  }

  if (field.type === "addressLookup") return renderAddressLookup(field, compact);
  if (field.type === "textarea") return renderTextarea(field, compact);
  if (field.type === "singleCheckbox") return renderSingleCheckbox(field);
  if (field.type === "file") return renderFile(field);

  return `
    <div class="field-group" data-field="${escapeAttr(field.id)}">
      ${renderFieldHead(field)}
      <div class="option-grid">
        ${field.options.map((option) => renderOption(field, option)).join("")}
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
      <input type="${field.type === "checkbox" ? "checkbox" : "radio"}" name="${escapeAttr(field.id)}" value="${escapeAttr(value)}" ${checked ? "checked" : ""} />
      <span>
        <span class="option-title">${escapeHtml(title)}</span>
        ${desc ? `<span class="option-desc">${escapeHtml(desc)}</span>` : ""}
      </span>
    </label>
  `;
}

function renderTextField(field, compact) {
  const value = formData[field.id] || "";
  const inputType = field.type === "invoice" || field.type === "currency" ? "text" : field.type;
  const inputMode = field.type === "invoice" || field.type === "currency" ? "numeric" : "";
  const control = `
    <input
      class="text-control"
      type="${inputType}"
      name="${escapeAttr(field.id)}"
      value="${escapeAttr(value)}"
      placeholder="${escapeAttr(field.placeholder || "")}"
      ${inputMode ? `inputmode="${inputMode}"` : ""}
      ${field.required ? `aria-required="true"` : ""}
    />
  `;
  const wrapped = field.type === "invoice"
    ? `<span class="prefix-field">${control}</span>`
    : field.type === "currency"
      ? `<span class="currency-field">${control}</span>`
      : control;

  const html = `
    <label class="input-field" data-field="${escapeAttr(field.id)}">
      <span class="input-label">
        ${escapeHtml(field.label)}
        ${field.required ? `<span class="required">必須</span>` : ""}
      </span>
      ${wrapped}
      ${renderError(field.id)}
    </label>
  `;

  return compact ? html : `<div class="field-group">${html}</div>`;
}

function renderTextarea(field, compact) {
  const html = `
    <label class="input-field" data-field="${escapeAttr(field.id)}">
      <span class="input-label">
        ${escapeHtml(field.label)}
        ${field.required ? `<span class="required">必須</span>` : ""}
      </span>
      <textarea class="textarea-control" name="${escapeAttr(field.id)}" placeholder="${escapeAttr(field.placeholder || "")}">${escapeHtml(formData[field.id] || "")}</textarea>
      ${renderError(field.id)}
    </label>
  `;

  return compact ? html : `<div class="field-group">${html}</div>`;
}

function renderAddressLookup(field, compact) {
  const postalValue = formData[field.postalId] || "";
  const addressValue = formData[field.id] || "";
  const detailValue = formData[field.detailId] || "";
  const status = addressLookupState.message
    ? `<p class="lookup-status ${escapeAttr(addressLookupState.type)}">${escapeHtml(addressLookupState.message)}</p>`
    : `<p class="lookup-status">郵便番号を入力して「住所へ反映」を押すと、町域まで自動入力されます。</p>`;
  const disabled = addressLookupState.loading ? "disabled" : "";

  const html = `
    <div class="address-lookup-field" data-field="${escapeAttr(field.id)}">
      <div class="address-lookup-head">
        <span class="input-label">
          ${escapeHtml(field.label)}
          ${field.required ? `<span class="required">必須</span>` : ""}
        </span>
      </div>
      <div class="postal-search-row">
        <label class="input-field postal-code-field">
          <span class="input-label">郵便番号</span>
          <input
            class="text-control"
            type="text"
            name="${escapeAttr(field.postalId)}"
            value="${escapeAttr(postalValue)}"
            placeholder="${escapeAttr(field.postalPlaceholder || "")}"
            inputmode="numeric"
            autocomplete="postal-code"
          />
        </label>
        <button class="lookup-btn" type="button" data-action="lookup-address" ${disabled}>
          ${addressLookupState.loading ? "検索中..." : "住所へ反映"}
        </button>
      </div>
      ${status}
      <label class="input-field">
        <span class="input-label">住所（自動反映）</span>
        <textarea class="textarea-control address-base-control" name="${escapeAttr(field.id)}" placeholder="${escapeAttr(field.placeholder || "")}">${escapeHtml(addressValue)}</textarea>
      </label>
      <label class="input-field">
        <span class="input-label">番地・建物名</span>
        <input
          class="text-control"
          type="text"
          name="${escapeAttr(field.detailId)}"
          value="${escapeAttr(detailValue)}"
          placeholder="${escapeAttr(field.detailPlaceholder || "")}"
        />
      </label>
      ${renderError(field.id)}
    </div>
  `;

  return compact ? html : `<div class="field-group">${html}</div>`;
}

function renderSingleCheckbox(field) {
  return `
    <div class="field-group" data-field="${escapeAttr(field.id)}">
      ${renderFieldHead(field)}
      <label class="option-card">
        <input type="checkbox" name="${escapeAttr(field.id)}" value="true" ${formData[field.id] ? "checked" : ""} />
        <span>
          <span class="option-title">${escapeHtml(field.option)}</span>
          ${field.help ? `<span class="option-desc">${escapeHtml(field.help)}</span>` : ""}
        </span>
      </label>
      ${renderError(field.id)}
    </div>
  `;
}

function renderFile(field) {
  const saved = Array.isArray(formData[field.id]) ? formData[field.id].join("、") : "";
  return `
    <div class="field-group" data-field="${escapeAttr(field.id)}">
      ${renderFieldHead(field)}
      <input class="file-control" type="file" name="${escapeAttr(field.id)}" multiple />
      ${saved ? `<p class="field-help">選択済み：${escapeHtml(saved)}</p>` : ""}
      ${renderError(field.id)}
    </div>
  `;
}

function renderSummary() {
  const rows = buildSummaryRows();
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
        <input type="checkbox" name="policy_agreement" value="true" ${formData.policy_agreement ? "checked" : ""} />
        <span>
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
      <p>ご入力いただいた情報をもとに、契約書類の作成および管理開始手続きを進めます。</p>
      <div class="sheet-preview">
        <strong>Googleスプレッドシート登録予定データ</strong>
        <span>受付日時：${escapeHtml(payload.submitted_at)}</span>
        <span>氏名（会社名）：${escapeHtml(formData.owner_name || "")}</span>
        <span>契約方法：${escapeHtml(formData.contract_method || "")}</span>
      </div>
    </div>
  `;
}

function renderActions(step) {
  els.formActions.classList.remove("is-hidden");
  els.backBtn.disabled = currentStepIndex === 0;
  els.backBtn.style.visibility = currentStepIndex === 0 ? "hidden" : "visible";

  if (step.type === "intro") {
    els.nextLabel.textContent = "入力を始める";
  } else if (step.type === "summary") {
    els.nextLabel.textContent = "確認、同意して送信";
  } else {
    els.nextLabel.textContent = "次へ";
  }
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

function renderProgress(visibleSteps) {
  const total = visibleSteps.length;
  const current = currentStepIndex + 1;
  els.progressText.textContent = `${current} / ${total}`;
  els.progressBar.style.width = `${Math.round((current / total) * 100)}%`;
}

function renderError(id) {
  return `<p class="error-message">${errors[id] ? escapeHtml(errors[id]) : ""}</p>`;
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

  if (target.type === "file") {
    formData[name] = Array.from(target.files || []).map((file) => file.name);
    return;
  }

  if (target.type === "checkbox") {
    const field = findCurrentField(name);
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

function findCurrentField(id) {
  const step = getCurrentStep();
  return (step.fields || []).find((field) => field.id === id);
}

function validateStep(step) {
  errors = {};

  getRenderableFields(step).forEach((field) => {
    const value = formData[field.id];

    if (field.type === "addressLookup") {
      if (field.required && (isEmptyValue(value) || isEmptyValue(formData[field.detailId]))) {
        errors[field.id] = "郵便番号検索で住所を反映し、番地・建物名まで入力してください。";
      }
      return;
    }

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
      rows.push({ label: field.label, value: formatValue(field, formData[field.id]) });
    });
  });
  return rows;
}

function formatValue(field, value) {
  if (field.type === "singleCheckbox") return value ? field.option : "";
  if (field.type === "addressLookup") {
    return [formData[field.postalId], value, formData[field.detailId]].filter(Boolean).join("\n");
  }
  if (Array.isArray(value)) return value.join("\n");
  if (field.type === "invoice" && value) return `T${value}`;
  if (field.type === "currency" && value) return `${value}円`;
  return value || "";
}

async function lookupAddressFromPostal() {
  const postalInput = document.querySelector('[name="postal_code"]');
  const rawPostal = postalInput ? postalInput.value : formData.postal_code || "";
  const zipcode = normalizePostalCode(rawPostal);

  if (!/^\d{7}$/.test(zipcode)) {
    formData.postal_code = rawPostal;
    addressLookupState = { loading: false, message: "郵便番号は7桁で入力してください。", type: "error" };
    render();
    return;
  }

  formData.postal_code = formatPostalCode(zipcode);
  addressLookupState = { loading: true, message: "住所を検索しています。", type: "info" };
  render();

  try {
    const response = await fetch(`${ZIPCLOUD_ENDPOINT}?zipcode=${encodeURIComponent(zipcode)}`);
    if (!response.ok) throw new Error("network");

    const data = await response.json();
    const result = Array.isArray(data.results) ? data.results[0] : null;

    if (data.status !== 200 || !result) {
      addressLookupState = { loading: false, message: "該当する住所が見つかりませんでした。郵便番号をご確認ください。", type: "error" };
      render();
      return;
    }

    formData.address = `${result.address1}${result.address2}${result.address3}`;
    errors.address = "";
    addressLookupState = { loading: false, message: "住所を反映しました。番地・建物名を追記してください。", type: "success" };
    saveDraft();
    render();
  } catch {
    addressLookupState = { loading: false, message: "住所検索に失敗しました。時間をおいて再度お試しください。", type: "error" };
    render();
  }
}

function normalizePostalCode(value) {
  return String(value || "")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[^\d]/g, "");
}

function formatPostalCode(value) {
  return `${value.slice(0, 3)}-${value.slice(3)}`;
}

function buildSheetPayload() {
  const payload = {
    submitted_at: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    source: "new_owner_management_contract_survey",
  };

  buildSummaryRows().forEach((row) => {
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

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
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
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
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
