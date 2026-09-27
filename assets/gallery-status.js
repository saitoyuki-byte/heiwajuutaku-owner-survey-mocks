(function () {
  "use strict";

  const store = window.HeiwaProjectState;
  if (!store) return;
  const board = document.querySelector("[data-progress-board]");
  const statusById = Object.fromEntries(store.statuses.map((status) => [status.id, status]));
  const byTitle = new Map(store.projects.map((project) => [store.normalizeTitle(project.title), project]));
  let activeFilter = "all";
  let categoryFilter = "all";
  let currentState = store.loadState();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeCard(card, project, index) {
    const source = card.querySelector(".featured-content, .card-content");
    const title = source.querySelector("h3");
    const category = source.querySelector(".tag");
    const sourceLink = source.querySelector("a.open-button, a.text-link");
    const sourceDescription = source.querySelector("p")?.textContent.trim().replace(/\s+/g, " ") || "";
    const preview = card.querySelector(".featured-preview, .card-visual");
    const categoryLabel = category?.textContent || store.categories[project.category];
    const badge = element("span", "progress-badge");
    const stage = element("span", "migration-stage");
    const top = element("div", "progress-card-top");
    top.append(badge, stage);
    const primary = sourceLink ? sourceLink.cloneNode(true) : element("a");
    primary.className = "progress-primary";
    const originalHref = sourceLink?.getAttribute("href");
    const originalTarget = sourceLink?.getAttribute("target");
    const originalRel = sourceLink?.getAttribute("rel");
    const description = element("p", "progress-description", sourceDescription);
    const note = element("div", "progress-next");
    const noteLabel = element("span");
    const noteValue = element("p");
    note.append(noteLabel, noteValue);
    const migration = element("p", "migration-message");
    const details = element("details", "progress-details");
    const summary = element("summary", "progress-detail-toggle", "説明・機能を見る");
    const archiveNote = element("p", "archive-note", "以下は移行前のプロトタイプです。テスト実装・本実装のツールは社内App Storeでご確認ください。");
    const detailBody = element("div", "progress-detail-body");
    category?.remove();
    title.textContent = project.title;
    title.id = `title-${project.id}`;
    source.className = "project-detail-content";
    detailBody.append(archiveNote, source);
    if (preview) detailBody.append(preview);
    details.append(summary, detailBody);
    card.className = "progress-card";
    card.id ||= `project-${project.id}`;
    card.dataset.projectId = project.id;
    card.setAttribute("aria-labelledby", title.id);
    card.replaceChildren(top, element("p", "progress-category", categoryLabel), title, description, note, migration, primary, details);
    return { card, project, index, badge, stage, note, noteLabel, noteValue, migration,
      primary, originalHref, originalTarget, originalRel, archiveNote, summary };
  }

  const entries = Array.from(document.querySelectorAll("article.featured-card, article.mock-card"))
    .map((card, index) => {
      const project = byTitle.get(store.normalizeTitle(card.querySelector("h3")?.textContent));
      return project ? makeCard(card, project, index) : null;
    }).filter(Boolean);

  const groups = new Map(store.statuses.map((status) => {
    const section = element("section", `progress-group group-${status.id}`);
    section.style.setProperty("--group-color", status.color);
    section.setAttribute("aria-labelledby", `group-${status.id}`);
    const heading = element("div", "progress-group-heading");
    const text = element("div");
    const title = element("h2", null, `${status.symbol} ${status.id === "migrated" ? "社内App Storeへ移行済み" : status.label}`);
    title.id = `group-${status.id}`;
    const count = element("span", "group-count");
    title.append(count);
    const description = element("p", null, status.description);
    text.append(title, description);
    heading.append(text);
    const grid = element("div", "progress-grid");
    section.append(heading, grid);
    board.append(section);
    return [status.id, { section, count, grid, description }];
  }));

  const filters = document.querySelector("[data-progress-filters]");
  filters.replaceChildren();
  [{ id: "all", label: "すべて", color: "#073d7f" }, ...store.statuses].forEach((status) => {
    const button = element("button", "status-filter");
    button.type = "button";
    button.dataset.filter = status.id;
    button.style.setProperty("--status-color", status.color);
    button.setAttribute("aria-pressed", String(status.id === activeFilter));
    const count = element("strong");
    count.dataset.count = status.id;
    button.append(element("span", null, status.label), count);
    button.addEventListener("click", () => {
      activeFilter = status.id;
      applyFilters();
    });
    filters.append(button);
  });

  function paintCard(entry) {
    const value = currentState.projects[entry.project.id];
    const status = statusById[value.status];
    const migrated = value.status === "migrated";
    entry.card.dataset.projectStatus = status.id;
    entry.card.dataset.priority = String(value.priority);
    entry.card.style.setProperty("--status-color", status.color);
    entry.card.classList.toggle("progress-card--migrated", migrated);
    entry.badge.textContent = `${status.symbol} ${migrated ? "社内App Storeへ移行済み" : status.label}`;
    entry.stage.hidden = !migrated;
    entry.stage.textContent = value.migrationStage === "production" ? "本実装" : "テスト実装";
    entry.note.hidden = migrated && !value.note;
    entry.noteLabel.textContent = status.noteLabel;
    entry.noteValue.textContent = value.note || "未設定";
    entry.note.classList.toggle("is-unset", !value.note);
    entry.migration.hidden = !migrated;
    entry.migration.textContent = `${entry.stage.textContent}のツールは社内App Storeでご確認ください。`;
    entry.primary.hidden = migrated || !entry.originalHref;
    entry.primary.href = entry.originalHref || "#";
    entry.primary.textContent = "プロトタイプを開く →";
    if (entry.originalTarget) entry.primary.target = entry.originalTarget;
    else entry.primary.removeAttribute("target");
    if (entry.originalRel) entry.primary.rel = entry.originalRel;
    else entry.primary.removeAttribute("rel");
    entry.archiveNote.hidden = !migrated;
    entry.summary.textContent = migrated ? "移行前の内容・リンク" : "説明・機能を見る";
  }

  function updateCounts() {
    const published = entries.filter((entry) => currentState.projects[entry.project.id].visible);
    const migrated = published.filter((entry) => currentState.projects[entry.project.id].status === "migrated");
    document.querySelectorAll("[data-project-total]").forEach((node) => { node.textContent = published.length; });
    document.querySelectorAll("[data-working-total]").forEach((node) => { node.textContent = published.length - migrated.length; });
    document.querySelectorAll("[data-migrated-total]").forEach((node) => { node.textContent = migrated.length; });
    Object.keys(store.categories).forEach((category) => {
      document.querySelectorAll(`[data-category-count="${category}"]`).forEach((node) => {
        node.textContent = published.filter((entry) => entry.project.category === category).length;
      });
    });
    const inCategory = published.filter((entry) => categoryFilter === "all" || entry.project.category === categoryFilter);
    filters.querySelector('[data-count="all"]').textContent = inCategory.length;
    store.statuses.forEach((status) => {
      filters.querySelector(`[data-count="${status.id}"]`).textContent = inCategory.filter((entry) => currentState.projects[entry.project.id].status === status.id).length;
    });
  }

  function applyFilters() {
    let count = 0;
    entries.forEach((entry) => {
      const value = currentState.projects[entry.project.id];
      entry.card.hidden = !value.visible ||
        (activeFilter !== "all" && value.status !== activeFilter) ||
        (categoryFilter !== "all" && entry.project.category !== categoryFilter);
      if (!entry.card.hidden) count += 1;
    });
    groups.forEach((group, id) => {
      const visible = entries.filter((entry) => !entry.card.hidden && currentState.projects[entry.project.id].status === id);
      group.section.hidden = visible.length === 0;
      group.count.textContent = `${visible.length}件`;
      if (id === "migrated") {
        const testing = visible.filter((entry) => currentState.projects[entry.project.id].migrationStage === "testing").length;
        group.description.textContent = `テスト実装 ${testing}件・本実装 ${visible.length - testing}件。移行先からご利用ください。`;
      }
    });
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
    });
    document.querySelectorAll("[data-category]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.category === categoryFilter));
    });
    document.querySelector("[data-progress-result]").textContent = `${categoryFilter === "all" ? "すべてのカテゴリー" : store.categories[categoryFilter]} / ${activeFilter === "all" ? "すべての状況" : statusById[activeFilter].label}：${count}件`;
    document.querySelector("[data-progress-empty]").hidden = count !== 0;
    updateCounts();
  }

  function render() {
    currentState = store.loadState();
    entries.forEach(paintCard);
    [...entries].sort((a, b) => Number(currentState.projects[b.project.id].priority) - Number(currentState.projects[a.project.id].priority) || a.index - b.index)
      .forEach((entry) => groups.get(currentState.projects[entry.project.id].status).grid.append(entry.card));
    // Keep original sections only if they contain an as-yet unregistered prototype.
    Object.keys(store.categories).forEach((id) => {
      const section = document.getElementById(id);
      section.hidden = !section.querySelector("article");
    });
    board.hidden = false;
    applyFilters();
  }

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      categoryFilter = button.dataset.category;
      applyFilters();
    });
  });
  document.querySelector("[data-clear-filters]").addEventListener("click", () => {
    activeFilter = categoryFilter = "all";
    applyFilters();
  });
  function followHash() {
    const id = location.hash.slice(1);
    if (Object.hasOwn(store.categories, id)) {
      categoryFilter = id;
      activeFilter = "all";
      applyFilters();
      board.scrollIntoView();
    } else {
      const target = entries.find((entry) => entry.card.id === id);
      if (target && currentState.projects[target.project.id].visible) {
        activeFilter = categoryFilter = "all";
        applyFilters();
        target.card.scrollIntoView();
      }
    }
  }
  window.addEventListener("storage", (event) => {
    if (event.key === store.STORAGE_KEY || event.key === null) render();
  });
  window.addEventListener("pageshow", render);
  window.addEventListener("hashchange", followHash);
  render();
  followHash();
})();
