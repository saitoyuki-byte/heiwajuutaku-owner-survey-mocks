const STORAGE_KEY = "heiwaRoomCheckDraft";

const initialPlaces = [
  "玄関",
  "トイレ",
  "浴室・洗面所",
  "キッチン",
  "居室1",
  "居室2",
  "その他",
];

let state = {
  meta: {
    propertyNo: "",
    propertyName: "",
    roomNo: "",
    tenantName: "",
    shootDate: new Date().toISOString().slice(0, 10),
  },
  places: initialPlaces.map((name, index) => ({
    id: `place-${index + 1}`,
    name,
    comment: "",
    photos: [],
    removable: false,
  })),
  repairRequested: false,
};

let toastTimer = null;

const els = {
  metaForm: document.getElementById("metaForm"),
  placeList: document.getElementById("placeList"),
  totalPhotos: document.getElementById("totalPhotos"),
  filledPlaces: document.getElementById("filledPlaces"),
  pdfName: document.getElementById("pdfName"),
  folderName: document.getElementById("folderName"),
  addPlaceBtn: document.getElementById("addPlaceBtn"),
  customPlaceInput: document.getElementById("customPlaceInput"),
  saveDraftBtn: document.getElementById("saveDraftBtn"),
  demoBtn: document.getElementById("demoBtn"),
  generateBtn: document.getElementById("generateBtn"),
  reportPanel: document.getElementById("reportPanel"),
  reportContent: document.getElementById("reportContent"),
  printBtn: document.getElementById("printBtn"),
  toast: document.getElementById("toast"),
};

hydrateDraft();
renderAll();

els.metaForm.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.name) return;
  state.meta[target.name] = target.value;
  saveDraft(false);
  renderSummary();
});

els.placeList.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.classList.contains("file-input")) return;
  const place = getPlace(target.dataset.placeId);
  if (!place) return;

  Array.from(target.files || []).forEach((file) => {
    const photo = {
      id: `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      comment: "",
    };
    place.photos.push(photo);
  });

  target.value = "";
  saveDraft(false);
  renderAll();
});

els.placeList.addEventListener("input", (event) => {
  const target = event.target;
  const placeId = target.dataset.placeId;
  const place = getPlace(placeId);
  if (!place) return;

  if (target.classList.contains("place-comment")) {
    place.comment = target.value;
  }

  if (target.classList.contains("photo-comment")) {
    const photo = getPhoto(place, target.dataset.photoId);
    if (photo) photo.comment = target.value;
  }

  saveDraft(false);
  renderSummary();
});

els.placeList.addEventListener("click", (event) => {
  const removePhotoBtn = event.target.closest(".remove-photo");
  if (removePhotoBtn) {
    const place = getPlace(removePhotoBtn.dataset.placeId);
    if (!place) return;
    const photo = getPhoto(place, removePhotoBtn.dataset.photoId);
    if (photo?.url?.startsWith("blob:")) URL.revokeObjectURL(photo.url);
    place.photos = place.photos.filter((item) => item.id !== removePhotoBtn.dataset.photoId);
    saveDraft(false);
    renderAll();
    return;
  }

  const removePlaceBtn = event.target.closest(".remove-place");
  if (removePlaceBtn) {
    state.places = state.places.filter((place) => place.id !== removePlaceBtn.dataset.placeId);
    saveDraft(false);
    renderAll();
  }
});

els.addPlaceBtn.addEventListener("click", addCustomPlace);
els.customPlaceInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomPlace();
  }
});

els.saveDraftBtn.addEventListener("click", () => {
  saveDraft(true);
});

els.demoBtn.addEventListener("click", () => {
  applyDemoData();
});

els.generateBtn.addEventListener("click", () => {
  const missing = requiredMissing();
  if (missing.length) {
    showToast(`必須項目が未入力です：${missing.join("、")}`);
    return;
  }

  if (countPhotos() === 0) {
    showToast("写真を1枚以上登録してください。");
    return;
  }

  renderReport();
  els.reportPanel.classList.remove("is-hidden");
  els.reportPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("PDF台帳プレビューを生成しました。");
});

els.printBtn.addEventListener("click", () => {
  window.print();
});

els.reportContent.addEventListener("change", (event) => {
  const target = event.target;
  if (target.name !== "repairRequested") return;
  state.repairRequested = target.checked;
  saveDraft(false);
});

function addCustomPlace() {
  const name = els.customPlaceInput.value.trim();
  if (!name) {
    showToast("追加する場所名を入力してください。");
    return;
  }

  state.places.push({
    id: `custom-${Date.now()}`,
    name,
    comment: "",
    photos: [],
    removable: true,
  });

  els.customPlaceInput.value = "";
  saveDraft(false);
  renderAll();
  showToast(`${name}を追加しました。`);
}

function applyDemoData() {
  state.meta = {
    propertyNo: state.meta.propertyNo || "A01234",
    propertyName: state.meta.propertyName || "平和レジデンス一番町",
    roomNo: state.meta.roomNo || "203",
    tenantName: state.meta.tenantName || "山田 太郎",
    shootDate: state.meta.shootDate || new Date().toISOString().slice(0, 10),
  };

  const demos = {
    "玄関": [
      ["玄関ドア内側_擦り傷.jpg", "ドア内側下部に入居時から擦り傷あり"],
      ["玄関床_小傷.jpg", "床タイルに薄い小傷あり"],
    ],
    "キッチン": [
      ["キッチン天板_シミ.jpg", "天板右奥に薄いシミあり"],
      ["シンク下収納_汚れ.jpg", "収納内部に軽微な汚れあり"],
    ],
    "居室1": [
      ["居室1床_へこみ.jpg", "窓側の床に小さなへこみあり"],
    ],
  };

  state.places.forEach((place) => {
    if (!demos[place.name]) return;
    place.comment = place.comment || `${place.name}の入居時確認`;
    place.photos = demos[place.name].map(([name, comment], index) => ({
      id: `demo-${place.id}-${index}`,
      name,
      size: 0,
      url: makeDemoImage(place.name, index + 1),
      comment,
    }));
  });

  saveDraft(false);
  renderAll();
  showToast("デモ写真を配置しました。");
}

function makeDemoImage(label, index) {
  const safeLabel = escapeHtml(label);
  const colors = [
    ["#003b88", "#0ea5e9"],
    ["#28765d", "#0ea5e9"],
    ["#d5932e", "#003b88"],
  ][index % 3];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${colors[0]}"/>
          <stop offset="1" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <rect x="72" y="72" width="656" height="456" rx="24" fill="rgba(255,255,255,0.88)"/>
      <rect x="118" y="120" width="564" height="310" rx="16" fill="#eef5f8"/>
      <path d="M150 390 L284 270 L372 342 L462 230 L650 390 Z" fill="#b9d9e8"/>
      <circle cx="610" cy="168" r="42" fill="#f7c76f"/>
      <text x="400" y="486" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#003b88">${safeLabel} ${index}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderAll() {
  renderMeta();
  renderPlaces();
  renderSummary();
}

function renderMeta() {
  Object.entries(state.meta).forEach(([key, value]) => {
    const input = els.metaForm.elements[key];
    if (input && input.value !== value) input.value = value;
  });
}

function renderPlaces() {
  els.placeList.innerHTML = state.places.map(renderPlace).join("");
}

function renderPlace(place, index) {
  const photoCount = place.photos.length;
  const fileId = `${place.id}-file`;
  return `
    <article class="place-card card" data-place-id="${escapeAttr(place.id)}">
      <div class="place-head">
        <div class="place-title">
          <span class="place-icon">${index + 1}</span>
          <div>
            <h3>${escapeHtml(place.name)}</h3>
            <p>${photoCount}枚登録済み</p>
          </div>
        </div>
        <div class="place-actions">
          <label class="file-label" for="${escapeAttr(fileId)}">写真を追加</label>
          <input class="file-input" id="${escapeAttr(fileId)}" data-place-id="${escapeAttr(place.id)}" type="file" accept="image/*" multiple />
          ${place.removable ? `<button class="danger-btn remove-place" data-place-id="${escapeAttr(place.id)}" type="button">場所を削除</button>` : ""}
        </div>
      </div>
      <div class="place-body">
        <label class="input-field">
          <span>場所コメント</span>
          <textarea class="place-comment" data-place-id="${escapeAttr(place.id)}" placeholder="例：玄関ドア内側に擦り傷あり">${escapeHtml(place.comment)}</textarea>
        </label>
        ${
          place.photos.length
            ? `<div class="photo-grid">${place.photos.map((photo) => renderPhoto(place, photo)).join("")}</div>`
            : `<div class="empty-state">この場所の写真はまだ登録されていません。</div>`
        }
      </div>
    </article>
  `;
}

function renderPhoto(place, photo) {
  const img = photo.url
    ? `<img src="${escapeAttr(photo.url)}" alt="${escapeAttr(photo.name)}" />`
    : `<div class="thumb-placeholder">写真プレビュー</div>`;

  return `
    <article class="photo-card">
      <div class="thumb-wrap">${img}</div>
      <div class="photo-meta">
        <span class="photo-name" title="${escapeAttr(photo.name)}">${escapeHtml(photo.name)}</span>
        <button class="remove-photo" data-place-id="${escapeAttr(place.id)}" data-photo-id="${escapeAttr(photo.id)}" type="button">削除</button>
      </div>
      <label class="input-field">
        <span>写真コメント</span>
        <textarea class="photo-comment" data-place-id="${escapeAttr(place.id)}" data-photo-id="${escapeAttr(photo.id)}" placeholder="例：入居時より床に小傷あり">${escapeHtml(photo.comment)}</textarea>
      </label>
    </article>
  `;
}

function renderSummary() {
  const total = countPhotos();
  const filled = state.places.filter((place) => place.photos.length || place.comment.trim()).length;
  els.totalPhotos.textContent = `${total}枚`;
  els.filledPlaces.textContent = `${filled}箇所`;
  els.pdfName.textContent = buildPdfName();
  els.folderName.textContent = buildFolderName();
}

function renderReport() {
  const placesWithContent = state.places.filter((place) => place.photos.length || place.comment.trim());
  els.reportContent.innerHTML = `
    <dl class="report-meta">
      ${metaItem("物件番号", state.meta.propertyNo)}
      ${metaItem("物件名", state.meta.propertyName)}
      ${metaItem("号室", state.meta.roomNo)}
      ${metaItem("契約者名", state.meta.tenantName)}
      ${metaItem("撮影日", state.meta.shootDate)}
    </dl>
    <div class="notice-line">
      <strong>保存ファイル名：</strong>${escapeHtml(buildPdfName())}<br />
      <strong>保存先：</strong>${escapeHtml(buildFolderName())}
    </div>
    ${placesWithContent.map(renderReportPlace).join("")}
    ${renderRepairRequest()}
  `;
}

function metaItem(label, value) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "-")}</dd></div>`;
}

function renderReportPlace(place) {
  return `
    <section class="report-place">
      <h3>${escapeHtml(place.name)}</h3>
      ${place.comment ? `<p>${escapeHtml(place.comment)}</p>` : ""}
      ${
        place.photos.length
          ? `<div class="report-photos">${place.photos.map(renderReportPhoto).join("")}</div>`
          : `<p>写真なし</p>`
      }
    </section>
  `;
}

function renderReportPhoto(photo) {
  const img = photo.url ? `<img src="${escapeAttr(photo.url)}" alt="${escapeAttr(photo.name)}" />` : "";
  return `
    <article class="report-photo">
      ${img}
      <strong>${escapeHtml(photo.name)}</strong>
      <span>${escapeHtml(photo.comment || "コメントなし")}</span>
    </article>
  `;
}

function renderRepairRequest() {
  return `
    <section class="repair-request">
      <div>
        <p class="kicker">AFTER SUBMISSION</p>
        <h3>修繕対応の希望確認</h3>
        <p>写真台帳の提出とは別に、実際に修繕対応を希望する場合のみチェックしてください。</p>
      </div>
      <label class="repair-check">
        <input type="checkbox" name="repairRequested" ${state.repairRequested ? "checked" : ""} />
        <span>修繕対応を希望する</span>
      </label>
    </section>
  `;
}

function countPhotos() {
  return state.places.reduce((sum, place) => sum + place.photos.length, 0);
}

function requiredMissing() {
  const labels = {
    propertyNo: "物件番号",
    propertyName: "物件名",
    roomNo: "号室",
    tenantName: "契約者名",
    shootDate: "撮影日",
  };

  return Object.entries(labels)
    .filter(([key]) => !state.meta[key]?.trim())
    .map(([, label]) => label);
}

function buildPdfName() {
  const { propertyNo, propertyName, roomNo, tenantName, shootDate } = state.meta;
  if (!propertyNo && !propertyName && !roomNo && !tenantName) return "未入力";
  return `${sanitize(propertyNo || "物件番号未入力")}_${sanitize(propertyName || "物件名未入力")}_${sanitize(roomNo || "号室未入力")}_${sanitize(tenantName || "契約者未入力")}_${shootDate || "撮影日未入力"}_入居時室内チェック.pdf`;
}

function buildFolderName() {
  const { propertyNo, propertyName, roomNo } = state.meta;
  if (!propertyNo && !propertyName && !roomNo) return "未入力";
  return `/入居時チェック/${sanitize(propertyNo || "物件番号未入力")}_${sanitize(propertyName || "物件名未入力")}/${sanitize(roomNo || "号室未入力")}/`;
}

function sanitize(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "");
}

function getPlace(id) {
  return state.places.find((place) => place.id === id);
}

function getPhoto(place, id) {
  return place.photos.find((photo) => photo.id === id);
}

function saveDraft(showMessage) {
  const serializable = {
    ...state,
    places: state.places.map((place) => ({
      ...place,
      photos: place.photos.map((photo) => ({
        ...photo,
        url: "",
      })),
    })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  if (showMessage) showToast("下書きを保存しました。写真プレビューは再読み込み後に再選択が必要です。");
}

function hydrateDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!draft) return;
    state = {
      meta: { ...state.meta, ...(draft.meta || {}) },
      places: Array.isArray(draft.places) ? draft.places : state.places,
      repairRequested: Boolean(draft.repairRequested),
    };
  } catch {
    return;
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2400);
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
