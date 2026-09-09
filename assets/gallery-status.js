(function () {
  "use strict";

  const store = window.HeiwaProjectState;
  if (!store) return;

  const statusById = Object.fromEntries(store.statuses.map((status) => [status.id, status]));
  const projectByTitle = new Map(
    store.projects.map((project) => [store.normalizeTitle(project.title), project]),
  );
  let activeFilter = "all";

  function findCards() {
    return Array.from(document.querySelectorAll("article.featured-card, article.mock-card"))
      .map((card, index) => {
        const title = card.querySelector("h3");
        const project = projectByTitle.get(store.normalizeTitle(title?.textContent));
        if (!project) {
          console.warn(`プロジェクト設定が見つかりません: ${title?.textContent || index}`);
          return null;
        }
        card.dataset.projectId = project.id;
        card.dataset.originalOrder = String(index);
        return { card, project };
      })
      .filter(Boolean);
  }

  const cardEntries = findCards();

  function makeStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = `project-status status-${status.id}`;
    badge.dataset.statusBadge = "";
    badge.innerHTML = `<i aria-hidden="true"></i>${status.label}`;
    return badge;
  }

  function applyCardState(entry, state) {
    const projectState = state.projects[entry.project.id];
    const status = statusById[projectState.status];
    const content = entry.card.querySelector(".featured-content, .card-content");
    let badge = entry.card.querySelector("[data-status-badge]");
    if (!badge) {
      badge = makeStatusBadge(status);
      const categoryTag = content?.querySelector(".tag");
      categoryTag?.insertAdjacentElement("afterend", badge);
    }
    badge.className = `project-status status-${status.id}`;
    badge.innerHTML = `<i aria-hidden="true"></i>${status.label}`;

    entry.card.classList.remove(...store.statuses.map((item) => `project-is-${item.id}`));
    entry.card.classList.add(`project-is-${status.id}`);
    entry.card.dataset.projectStatus = status.id;
    entry.card.dataset.priority = projectState.priority ? "true" : "false";

    let note = entry.card.querySelector("[data-project-note]");
    if (projectState.note && !note) {
      note = document.createElement("p");
      note.dataset.projectNote = "";
      note.className = "project-note";
      entry.card.querySelector("h3")?.insertAdjacentElement("afterend", note);
    }
    if (note) {
      note.textContent = projectState.note;
      note.hidden = !projectState.note;
    }
  }

  function reorderCards(state) {
    Object.keys(store.categories).forEach((categoryId) => {
      const section = document.getElementById(categoryId);
      if (!section) return;
      const container = section.querySelector(".card-grid") || section;
      cardEntries
        .filter((entry) => entry.project.category === categoryId)
        .sort((a, b) => {
          const aState = state.projects[a.project.id];
          const bState = state.projects[b.project.id];
          if (aState.priority !== bState.priority) return aState.priority ? -1 : 1;
          return Number(a.card.dataset.originalOrder) - Number(b.card.dataset.originalOrder);
        })
        .forEach((entry) => container.appendChild(entry.card));
    });
  }

  function getVisibleEntries(state) {
    return cardEntries.filter((entry) => state.projects[entry.project.id].visible);
  }

  function updateCounts(state) {
    const visibleEntries = getVisibleEntries(state);
    const counts = Object.fromEntries(store.statuses.map((status) => [status.id, 0]));
    visibleEntries.forEach((entry) => {
      counts[state.projects[entry.project.id].status] += 1;
    });

    document.querySelectorAll("[data-project-total]").forEach((node) => {
      node.textContent = String(visibleEntries.length);
    });
    store.statuses.forEach((status) => {
      document.querySelectorAll(`[data-count="${status.id}"]`).forEach((node) => {
        node.textContent = String(counts[status.id]);
      });
      const percent = visibleEntries.length ? (counts[status.id] / visibleEntries.length) * 100 : 0;
      document.querySelectorAll(`[data-progress="${status.id}"]`).forEach((node) => {
        node.style.width = `${percent}%`;
      });
    });

    Object.keys(store.categories).forEach((categoryId) => {
      const categoryCount = visibleEntries.filter(
        (entry) => entry.project.category === categoryId,
      ).length;
      document.querySelectorAll(`[data-category-count="${categoryId}"]`).forEach((node) => {
        node.textContent = String(categoryCount);
      });
    });
  }

  function applyFilter(state) {
    cardEntries.forEach((entry) => {
      const projectState = state.projects[entry.project.id];
      const matches = activeFilter === "all" || projectState.status === activeFilter;
      entry.card.classList.toggle("is-filtered-out", !projectState.visible || !matches);
    });

    Object.keys(store.categories).forEach((categoryId) => {
      const section = document.getElementById(categoryId);
      if (!section) return;
      const hasResult = cardEntries.some(
        (entry) =>
          entry.project.category === categoryId &&
          !entry.card.classList.contains("is-filtered-out"),
      );
      section.classList.toggle("is-filtered-out", !hasResult);
    });
  }

  function render() {
    const state = store.loadState();
    cardEntries.forEach((entry) => applyCardState(entry, state));
    reorderCards(state);
    updateCounts(state);
    applyFilter(state);

  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        const selected = item === button;
        item.setAttribute("aria-pressed", String(selected));
      });
      applyFilter(store.loadState());
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key === store.STORAGE_KEY) render();
  });

  render();
})();
