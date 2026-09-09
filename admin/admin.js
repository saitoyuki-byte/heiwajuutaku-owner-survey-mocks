(function () {
  "use strict";

  const store = window.HeiwaProjectState;
  const list = document.querySelector("[data-project-list]");
  const template = document.getElementById("project-row-template");
  const search = document.querySelector("[data-search]");
  const statusFilter = document.querySelector("[data-status-filter]");
  const categoryFilter = document.querySelector("[data-category-filter]");
  const empty = document.querySelector("[data-empty]");
  const toast = document.querySelector("[data-toast]");
  let state = store.loadState();
  let toastTimer;

  const statusById = Object.fromEntries(store.statuses.map((status) => [status.id, status]));

  function addFilterOptions() {
    store.statuses.forEach((status) => {
      statusFilter.add(new Option(status.label, status.id));
    });
    Object.entries(store.categories).forEach(([id, label]) => {
      categoryFilter.add(new Option(label, id));
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  }

  function formatUpdatedAt(updatedAt) {
    if (!updatedAt) return "初期設定";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(updatedAt));
  }

  function updateSavedLabel() {
    document.querySelector("[data-updated-label]").textContent = formatUpdatedAt(state.updatedAt);
  }

  function updateSummary() {
    const visibleProjects = store.projects.filter((project) => state.projects[project.id].visible);
    document.querySelector("[data-visible-total]").textContent = String(visibleProjects.length);

    const counts = Object.fromEntries(store.statuses.map((status) => [status.id, 0]));
    visibleProjects.forEach((project) => {
      counts[state.projects[project.id].status] += 1;
    });

    const statusContainer = document.querySelector("[data-summary-statuses]");
    statusContainer.replaceChildren();
    store.statuses.forEach((status) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = `<span>${status.label}</span><strong>${counts[status.id]}</strong>`;
      statusContainer.appendChild(item);
    });

    const bar = document.querySelector("[data-summary-bar]");
    bar.replaceChildren();
    store.statuses.forEach((status) => {
      const segment = document.createElement("i");
      segment.style.width = visibleProjects.length
        ? `${(counts[status.id] / visibleProjects.length) * 100}%`
        : "0";
      segment.style.background = status.color;
      segment.title = `${status.label} ${counts[status.id]}件`;
      bar.appendChild(segment);
    });
  }

  function save(message) {
    state = store.saveState(state);
    updateSavedLabel();
    updateSummary();
    if (message) showToast(message);
  }

  function renderRow(project) {
    const projectState = state.projects[project.id];
    const row = template.content.firstElementChild.cloneNode(true);
    const statusSelect = row.querySelector('[data-field="status"]');
    row.dataset.projectId = project.id;
    row.dataset.title = store.normalizeTitle(project.title);
    row.dataset.category = project.category;

    row.querySelector("h2").textContent = project.title;
    row.querySelector(".category-label").textContent = store.categories[project.category];
    store.statuses.forEach((status) => statusSelect.add(new Option(status.label, status.id)));

    statusSelect.value = projectState.status;
    row.querySelector('[data-field="note"]').value = projectState.note;
    row.querySelector('[data-field="priority"]').checked = projectState.priority;
    row.querySelector('[data-field="visible"]').checked = projectState.visible;

    function paintRow() {
      const current = state.projects[project.id];
      const status = statusById[current.status];
      row.style.setProperty("--status-color", status.color);
      row.classList.toggle("is-hidden", !current.visible);
      row.querySelector("[data-visibility-label]").textContent = current.visible ? "表示中" : "非表示";
    }

    row.addEventListener("change", (event) => {
      const field = event.target.dataset.field;
      if (!field) return;
      state.projects[project.id][field] =
        event.target.type === "checkbox" ? event.target.checked : event.target.value;
      paintRow();
      save("変更を保存しました");
      applyFilters();
    });

    row.querySelector('[data-field="note"]').addEventListener("input", (event) => {
      state.projects[project.id].note = event.target.value;
      save();
    });

    paintRow();
    return row;
  }

  function renderRows() {
    list.replaceChildren(...store.projects.map(renderRow));
    applyFilters();
  }

  function applyFilters() {
    const query = store.normalizeTitle(search.value);
    const wantedStatus = statusFilter.value;
    const wantedCategory = categoryFilter.value;
    let count = 0;

    list.querySelectorAll(".project-row").forEach((row) => {
      const projectState = state.projects[row.dataset.projectId];
      const matchesQuery = !query || row.dataset.title.includes(query);
      const matchesStatus = wantedStatus === "all" || projectState.status === wantedStatus;
      const matchesCategory = wantedCategory === "all" || row.dataset.category === wantedCategory;
      const visible = matchesQuery && matchesStatus && matchesCategory;
      row.hidden = !visible;
      if (visible) count += 1;
    });

    document.querySelector("[data-result-count]").textContent = String(count);
    empty.hidden = count !== 0;
  }

  function exportSettings() {
    const payload = JSON.stringify(store.normalizeState(state), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `heiwa-prototype-settings-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("設定ファイルを書き出しました");
  }

  function importSettings(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        state = store.saveState(JSON.parse(reader.result));
        renderRows();
        updateSummary();
        updateSavedLabel();
        showToast("設定ファイルを読み込みました");
      } catch (error) {
        showToast("設定ファイルを読み込めませんでした");
      }
    });
    reader.readAsText(file);
  }

  search.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  document.querySelector("[data-export]").addEventListener("click", exportSettings);
  document.querySelector("[data-import]").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) importSettings(file);
    event.target.value = "";
  });

  document.querySelector("[data-reset]").addEventListener("click", () => {
    if (!window.confirm("すべての変更を消して初期設定に戻しますか？")) return;
    state = store.resetState();
    renderRows();
    updateSummary();
    updateSavedLabel();
    showToast("初期設定に戻しました");
  });

  addFilterOptions();
  document.querySelector("[data-project-capacity]").textContent = String(store.projects.length);
  renderRows();
  updateSummary();
  updateSavedLabel();
})();
