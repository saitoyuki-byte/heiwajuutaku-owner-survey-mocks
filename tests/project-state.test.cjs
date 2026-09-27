const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

function store() {
  const data = new Map();
  const window = { localStorage: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  }};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../assets/project-state.js"), "utf8"), { window, URL, console });
  return window.HeiwaProjectState;
}

test("verified App Store defaults have five test implementations and two production implementations", () => {
  const api = store();
  const migrated = Object.values(api.getDefaultState().projects).filter((p) => p.status === "migrated");
  assert.equal(migrated.length, 7);
  assert.equal(migrated.filter((p) => p.migrationStage === "testing").length, 5);
  assert.equal(migrated.filter((p) => p.migrationStage === "production").length, 2);
  assert.equal(api.getDefaultState().projects["insurance-new"].status, "done");
});

test("legacy settings receive verified handoffs without losing notes, visibility or priority", () => {
  const api = store();
  const result = api.normalizeState({ version: 1, projects: {
    "invoice-check": { status: "active", visible: false, priority: true, note: "保存済みメモ" },
    "shift-planner": { status: "hold", visible: true, note: "繁忙期後に再開" },
  }});
  assert.equal(result.version, 2);
  assert.equal(result.projects["invoice-check"].status, "migrated");
  assert.equal(result.projects["invoice-check"].visible, false);
  assert.equal(result.projects["invoice-check"].priority, true);
  assert.equal(result.projects["invoice-check"].note, "保存済みメモ");
  assert.equal(result.projects["shift-planner"].status, "hold");
});

test("version 2 choices can undo a handoff and round-trip through storage and JSON export", () => {
  const api = store();
  const state = api.getDefaultState();
  state.projects["invoice-check"].status = "active";
  state.projects["shift-planner"].status = "migrated";
  state.projects["shift-planner"].migrationStage = "production";
  api.saveState(state);
  const loaded = api.normalizeState(JSON.parse(JSON.stringify(api.loadState())));
  assert.equal(loaded.projects["invoice-check"].status, "active");
  assert.equal(loaded.projects["shift-planner"].migrationStage, "production");
});

test("old URL settings are ignored without losing migration status or notes", () => {
  const api = store();
  const result = api.normalizeState({ version: 2, projects: {
    "invoice-check": { status: "migrated", migrationStage: "production", note: "既存のメモ", migrationUrl: "https://example.com/old" },
  }});
  assert.equal(result.projects["invoice-check"].status, "migrated");
  assert.equal(result.projects["invoice-check"].migrationStage, "production");
  assert.equal(result.projects["invoice-check"].note, "既存のメモ");
  assert.equal(Object.hasOwn(result.projects["invoice-check"], "migrationUrl"), false);
  assert.doesNotThrow(() => api.normalizeState({ projects: null, updatedAt: "invalid" }));
});
