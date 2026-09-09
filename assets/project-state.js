(function (global) {
  "use strict";

  const STORAGE_KEY = "heiwaPrototypeGalleryState:v1";

  const statuses = [
    { id: "done", label: "実装済み", shortLabel: "実装済み", color: "#17765a" },
    { id: "active", label: "着手中", shortLabel: "着手中", color: "#0879b7" },
    { id: "review", label: "確認待ち", shortLabel: "確認待ち", color: "#a45d12" },
    { id: "hold", label: "保留中", shortLabel: "保留中", color: "#6f7782" },
    { id: "planned", label: "未着手", shortLabel: "未着手", color: "#7b55a5" },
  ];

  const categories = {
    operations: "新着・業務改善",
    forms: "アンケート・入力フォーム",
    dashboards: "集計・管理画面",
  };

  const projects = [
    { id: "ai-room-staging", title: "AIお部屋ステージング", category: "operations", defaultStatus: "active" },
    { id: "room-tracker-schedule", title: "Room Tracker 活動スケジュール", category: "operations", defaultStatus: "active" },
    { id: "shift-planner", title: "シフト自動作成システム", category: "operations", defaultStatus: "active" },
    { id: "invoice-check", title: "請求金額照合ツール", category: "operations", defaultStatus: "active" },
    { id: "workspace-manuals", title: "Google Workspace 基本操作マニュアル", category: "operations", defaultStatus: "done" },
    { id: "tenant-guide", title: "住まいのお困りごとナビ", category: "operations", defaultStatus: "review" },
    { id: "external-inspection", title: "外部点検クラウド", category: "operations", defaultStatus: "active" },
    { id: "waitlist", title: "2027年春入居 空き待ち予約システム", category: "operations", defaultStatus: "done" },
    { id: "payment-reconciliation", title: "未決済照合システム", category: "operations", defaultStatus: "hold" },
    { id: "inventory-management", title: "備品在庫管理システム", category: "operations", defaultStatus: "review" },
    { id: "construction-priority", title: "工事優先順位ダッシュボード", category: "operations", defaultStatus: "review" },
    { id: "insurance-new", title: "保険加入確認書類 提出フォーム（新規）", category: "forms", defaultStatus: "done" },
    { id: "insurance-renewal", title: "保険加入確認書類 提出フォーム（更新）", category: "forms", defaultStatus: "done" },
    { id: "tenant-contact", title: "不具合・お困りごと お問い合わせフォーム", category: "forms", defaultStatus: "active" },
    { id: "existing-owner-survey", title: "創業50周年記念 既存オーナーアンケート", category: "forms", defaultStatus: "hold" },
    { id: "new-owner-survey", title: "新規賃貸住宅管理受託契約 確認事項アンケート", category: "forms", defaultStatus: "hold" },
    { id: "room-check", title: "入居時室内チェック 写真アップロードフォーム", category: "forms", defaultStatus: "review" },
    { id: "survey-dashboard", title: "アンケート集計ダッシュボード", category: "dashboards", defaultStatus: "hold" },
    { id: "survey-admin", title: "アンケート管理ダッシュボード", category: "dashboards", defaultStatus: "hold" },
  ];

  function defaultProjectState(project) {
    return {
      status: project.defaultStatus,
      visible: true,
      priority: false,
      note: "",
    };
  }

  function getDefaultState() {
    return {
      version: 1,
      updatedAt: null,
      projects: Object.fromEntries(
        projects.map((project) => [project.id, defaultProjectState(project)]),
      ),
    };
  }

  function sanitizeProjectState(value, project) {
    const fallback = defaultProjectState(project);
    const validStatus = statuses.some((status) => status.id === value?.status);
    return {
      status: validStatus ? value.status : fallback.status,
      visible: typeof value?.visible === "boolean" ? value.visible : fallback.visible,
      priority: typeof value?.priority === "boolean" ? value.priority : fallback.priority,
      note: typeof value?.note === "string" ? value.note.slice(0, 120) : fallback.note,
    };
  }

  function normalizeState(value) {
    const fallback = getDefaultState();
    const sourceProjects = value && typeof value.projects === "object" ? value.projects : {};
    fallback.updatedAt = typeof value?.updatedAt === "string" ? value.updatedAt : null;
    fallback.projects = Object.fromEntries(
      projects.map((project) => [
        project.id,
        sanitizeProjectState(sourceProjects[project.id], project),
      ]),
    );
    return fallback;
  }

  function loadState() {
    try {
      const stored = global.localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeState(JSON.parse(stored)) : getDefaultState();
    } catch (error) {
      console.warn("プロジェクト設定を読み込めませんでした。", error);
      return getDefaultState();
    }
  }

  function saveState(state) {
    const normalized = normalizeState(state);
    normalized.updatedAt = new Date().toISOString();
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function resetState() {
    global.localStorage.removeItem(STORAGE_KEY);
    return getDefaultState();
  }

  function normalizeTitle(value) {
    return String(value || "").replace(/\s+/g, "").toLowerCase();
  }

  global.HeiwaProjectState = Object.freeze({
    STORAGE_KEY,
    statuses,
    categories,
    projects,
    getDefaultState,
    normalizeState,
    loadState,
    saveState,
    resetState,
    normalizeTitle,
  });
})(window);
