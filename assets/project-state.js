(function (global) {
  "use strict";

  const STORAGE_KEY = "heiwaPrototypeGalleryState:v1";

  const statuses = [
    { id: "active", label: "着手中", color: "#0879b7", symbol: "◐", description: "制作・調整を進めているツール", noteLabel: "次のアクション" },
    { id: "review", label: "確認待ち", color: "#a45d12", symbol: "◎", description: "内容や動作の確認を待っているツール", noteLabel: "確認したいこと" },
    { id: "done", label: "実装済み", color: "#17765a", symbol: "✓", description: "実装済み・社内App Storeへの移行前", noteLabel: "次のアクション" },
    { id: "planned", label: "未着手", color: "#7b55a5", symbol: "○", description: "これから着手するツール", noteLabel: "着手に向けて" },
    { id: "hold", label: "保留中", color: "#8b6419", symbol: "Ⅱ", description: "いったん作業を止めているツール", noteLabel: "保留理由・再開条件" },
    { id: "migrated", label: "移行済み", color: "#606976", symbol: "↗", description: "テスト実装・本実装は社内App Storeで確認できます", noteLabel: "引き継ぎメモ" },
  ];

  const categories = {
    operations: "新着・業務改善",
    forms: "アンケート・入力フォーム",
    dashboards: "集計・管理画面",
  };

  const projects = [
    { id: "cancel-form", title: "解約・退去のお手続き", category: "forms", defaultStatus: "review" },
    { id: "admission-refund", title: "【合格前予約】不合格および契約金等返金口座の連絡", category: "forms", defaultStatus: "review" },
    { id: "admission-result", title: "【合格前予約】合格連絡", category: "forms", defaultStatus: "review" },
    { id: "meishi-desk", title: "名刺管理・DMリスト作成", category: "operations", defaultStatus: "review" },
    { id: "ai-room-staging", title: "AIお部屋ステージング", category: "operations", defaultStatus: "active" },
    { id: "room-tracker-schedule", title: "Room Tracker 活動スケジュール", category: "operations", defaultStatus: "active" },
    { id: "shift-planner", title: "シフト自動作成システム", category: "operations", defaultStatus: "active" },
    { id: "invoice-check", title: "請求金額照合ツール", category: "operations", defaultStatus: "migrated", defaultMigrationStage: "testing" },
    { id: "workspace-manuals", title: "Google Workspace 基本操作マニュアル", category: "operations", defaultStatus: "migrated", defaultMigrationStage: "production" },
    { id: "tenant-guide", title: "住まいのお困りごとナビ", category: "operations", defaultStatus: "review" },
    { id: "external-inspection", title: "外部点検クラウド", category: "operations", defaultStatus: "migrated", defaultMigrationStage: "testing" },
    { id: "waitlist", title: "2027年春入居 空き待ち予約システム", category: "operations", defaultStatus: "migrated", defaultMigrationStage: "production" },
    { id: "payment-reconciliation", title: "未決済照合システム", category: "operations", defaultStatus: "hold" },
    { id: "inventory-management", title: "備品在庫管理システム", category: "operations", defaultStatus: "migrated", defaultMigrationStage: "testing" },
    { id: "construction-priority", title: "工事優先順位ダッシュボード", category: "operations", defaultStatus: "review" },
    { id: "insurance-new", title: "保険加入確認書類 提出フォーム（新規）", category: "forms", defaultStatus: "done" },
    { id: "insurance-renewal", title: "保険加入確認書類 提出フォーム（更新）", category: "forms", defaultStatus: "done" },
    { id: "tenant-contact", title: "不具合・お困りごと お問い合わせフォーム", category: "forms", defaultStatus: "migrated", defaultMigrationStage: "testing" },
    { id: "existing-owner-survey", title: "創業50周年記念 既存オーナーアンケート", category: "forms", defaultStatus: "hold" },
    { id: "new-owner-survey", title: "新規賃貸住宅管理受託契約 確認事項アンケート", category: "forms", defaultStatus: "hold" },
    { id: "room-check", title: "入居時室内チェック 写真アップロードフォーム", category: "forms", defaultStatus: "migrated", defaultMigrationStage: "testing" },
    { id: "survey-dashboard", title: "アンケート集計ダッシュボード", category: "dashboards", defaultStatus: "hold" },
    { id: "survey-admin", title: "アンケート管理ダッシュボード", category: "dashboards", defaultStatus: "hold" },
  ];

  function defaultProjectState(project) {
    return {
      status: project.defaultStatus,
      visible: true,
      priority: false,
      note: "",
      migrationStage: project.defaultMigrationStage || "testing",
    };
  }

  function getDefaultState() {
    return {
      version: 2,
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
      migrationStage: ["testing", "production"].includes(value?.migrationStage)
        ? value.migrationStage : fallback.migrationStage,
    };
  }

  function normalizeState(value) {
    const fallback = getDefaultState();
    const sourceProjects = value?.projects && typeof value.projects === "object" ? value.projects : {};
    fallback.updatedAt = typeof value?.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt))
      ? value.updatedAt : null;
    fallback.projects = Object.fromEntries(
      projects.map((project) => [
        project.id,
        sanitizeProjectState(
          // Apply the verified App Store handoff once for legacy saved settings.
          // Version 2 preserves subsequent manual status choices, including undoing a handoff.
          value?.version !== 2 && project.defaultStatus === "migrated"
            ? { ...sourceProjects[project.id], status: "migrated", migrationStage: project.defaultMigrationStage }
            : sourceProjects[project.id],
          project,
        ),
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
