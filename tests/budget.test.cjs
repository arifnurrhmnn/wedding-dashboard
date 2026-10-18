/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in test runner loads this CommonJS harness directly. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");

const root = path.resolve(__dirname, "..");
function modules(overrides = {}, reactHooks = false) {
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const tsModule = { exports: {} };
    cache.set(absolute, tsModule);
    const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const localRequire = (name) => {
      if (name in overrides) return overrides[name];
      if (name === "next/server") return { NextResponse: { json: (data, options = {}) => new Response(JSON.stringify(data), { status: options.status ?? 200 }) } };
      if (name === "react" && reactHooks) return {
        ...React,
        useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
        useEffect: () => {},
        useMemo: (compute) => compute(),
      };
      if (reactHooks && name === "@/lib/utils") return { cn: (...classes) => classes.filter(Boolean).join(" ") };
      if (reactHooks && (name.startsWith("@/components/") || name === "lucide-react" || name === "next/link")) return new Proxy({}, { get: (_, key) => key });
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(absolute), name);
        const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
        return load(resolved);
      }
      return require(name);
    };
    vm.runInNewContext(source, { module: tsModule, exports: tsModule.exports, require: localRequire, Date, Intl, Response, Request, SyntaxError, console });
    return tsModule.exports;
  }
  return load;
}

function memoryDatabase(seed = {}) {
  const tables = structuredClone(seed);
  return {
    tables,
    from(table) {
      tables[table] ??= [];
      const query = {
        operation: "select", filters: [],
        select(_columns, options) { this.options = options; return this; },
        eq(key, value) { this.filters.push((row) => row[key] === value); return this; },
        order(key, options) { this.sort = [key, options?.ascending !== false]; return this; },
        insert(rows) { this.operation = "insert"; this.rows = rows; return this; },
        upsert(rows, options) { this.operation = "upsert"; this.rows = Array.isArray(rows) ? rows : [rows]; this.upsertOptions = options; return this; },
        update(data) { this.operation = "update"; this.data = data; return this; },
        delete() { this.operation = "delete"; return this; },
        execute() {
          let selected = tables[table].filter((row) => this.filters.every((filter) => filter(row)));
          if (this.operation === "update") for (const row of selected) Object.assign(row, this.data);
          if (this.operation === "delete") tables[table] = tables[table].filter((row) => !selected.includes(row));
          if (this.operation === "insert" || this.operation === "upsert") {
            selected = [];
            for (const entry of this.rows) {
              const conflictKey = this.upsertOptions?.onConflict ?? "id";
              const existing = tables[table].find((row) => entry[conflictKey] && row[conflictKey] === entry[conflictKey]);
              if (existing && this.upsertOptions?.ignoreDuplicates) continue;
              const row = existing ?? { id: `item-${tables[table].length + 1}` };
              Object.assign(row, entry);
              if (!existing) tables[table].push(row);
              selected.push(row);
            }
          }
          if (this.sort) selected = [...selected].sort((a, b) => (a[this.sort[0]] > b[this.sort[0]] ? 1 : -1) * (this.sort[1] ? 1 : -1));
          return { data: structuredClone(selected), count: selected.length, error: null };
        },
        then(resolve, reject) { return Promise.resolve(this.execute()).then(resolve, reject); },
        async maybeSingle() { const result = this.execute(); return { ...result, data: result.data[0] ?? null }; },
        async single() { return this.maybeSingle(); },
      };
      return query;
    },
  };
}

function api(db, response) {
  return modules({ "@/lib/api-auth": { requireActiveUser: async () => response ? { response } : { supabase: db, user: { id: "user-1" } } } });
}
function request(body, method = "PATCH") {
  return new Request("http://localhost/api/budget/item-1", { method, body: JSON.stringify(body) });
}
function find(node, predicate, output = []) {
  if (!node || typeof node !== "object") return output;
  if (predicate(node)) output.push(node);
  const children = node.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) find(child, predicate, output);
  return output;
}

test("DP, cumulative installments, and legacy records share payment/status semantics", () => {
  const { getBudgetPaid, getBudgetStatus } = modules()("lib/budget.ts");
  for (const [dp, realisasi, paid, status] of [[20, 0, 20, "dp"], [20, 60, 60, "dp"], [20, 100, 100, "lunas"], [100, 0, 100, "lunas"], [0, 0, 0, "belum_bayar"]]) {
    const item = { dp, realisasi, estimasi: 100 };
    assert.equal(getBudgetPaid(item), paid);
    assert.equal(getBudgetStatus(item), status);
  }
});

test("a partial PATCH preserves payment amounts, clears nullable fields, and ignores protected columns", async () => {
  const old = { id: "item-1", user_id: "user-1", category_id: "category-1", nama: "Venue", estimasi: 100, dp: 20, realisasi: 0, vendor_id: "vendor-1", catatan: "old", tanggal_dp: "2026-10-01", tanggal_lunas: "2026-10-02", tanggal_bayar: "2026-10-01" };
  const db = memoryDatabase({ budget_items: [old] });
  const { PATCH } = api(db)("app/api/budget/[id]/route.ts");
  let response = await PATCH(request({ estimasi: 120, user_id: "other-user", id: "replacement" }), { params: Promise.resolve({ id: "item-1" }) });
  assert.equal(response.status, 200);
  let data = await response.json();
  assert.equal(data.status, "dp");
  assert.equal(data.realisasi, 20);
  assert.equal(data.user_id, "user-1");
  assert.equal(data.id, "item-1");
  response = await PATCH(request({ vendor_id: null, catatan: null, tanggal_dp: null, tanggal_lunas: null, tanggal_bayar: null }), { params: Promise.resolve({ id: "item-1" }) });
  assert.equal(response.status, 200);
  data = await response.json();
  for (const key of ["vendor_id", "catatan", "tanggal_dp", "tanggal_lunas", "tanggal_bayar"]) assert.equal(data[key], null);
  assert.equal(data.dp, 20);
  assert.equal(data.realisasi, 20);
});

test("budget POST validates amounts and category/vendor ownership before inserting", async () => {
  const db = memoryDatabase({ budget_categories: [{ id: "own", user_id: "user-1" }, { id: "foreign", user_id: "user-2" }], vendors: [{ id: "foreign", user_id: "user-2" }] });
  const { POST } = api(db)("app/api/budget/route.ts");
  for (const body of [{ category_id: "foreign", nama: "item" }, { category_id: "own", nama: "item", vendor_id: "foreign" }, { category_id: "own", nama: "item", dp: -1 }]) {
    assert.equal((await POST(request(body, "POST"))).status, 400);
  }
  assert.equal(db.tables.budget_items?.length ?? 0, 0);
  const response = await POST(request({ category_id: "own", nama: "Item", estimasi: 100, dp: 20, realisasi: 0 }, "POST"));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).realisasi, 20);
});

test("all budget API handlers honor the active-account guard", async () => {
  const blocked = new Response("forbidden", { status: 403 });
  const load = api(null, blocked);
  for (const file of ["app/api/budget/route.ts", "app/api/budget/[id]/route.ts", "app/api/budget/settings/route.ts", "app/api/budget/categories/route.ts", "app/api/budget/categories/[id]/route.ts", "app/api/budget/categories/generate-default/route.ts"]) {
    for (const handler of Object.values(load(file))) assert.equal(await handler(request({}), { params: Promise.resolve({ id: "id" }) }), blocked);
  }
});

test("default generation is repeatable, preserves existing categories, and handles renamed defaults", async () => {
  const load = modules();
  const { budgetCategoryId } = load("lib/budget-server.ts");
  const db = memoryDatabase({ budget_categories: [
    { id: "legacy-s", nama: "Seserahan", user_id: "user-1", urutan: 0 },
    { id: "custom", nama: "Custom", user_id: "user-1", urutan: 1 },
    { id: budgetCategoryId("user-1", "Venue & Gedung"), nama: "Hotel pilihan", user_id: "user-1", urutan: 2 },
  ] });
  const { POST } = api(db)("app/api/budget/categories/generate-default/route.ts");
  const first = await (await POST()).json();
  const second = await (await POST()).json();
  assert.equal(first.length, 15);
  assert.equal(second.length, first.length);
  assert.equal(second.filter((category) => category.nama === "Seserahan").length, 1);
  assert.ok(second.some((category) => category.id === "custom"));
  assert.ok(second.some((category) => category.nama === "Hotel pilihan"));
  assert.ok(second.some((category) => category.nama === "Venue & Gedung"));
});

test("canonical category creation is idempotent, including simultaneous initializers", async () => {
  const db = memoryDatabase();
  const { POST } = api(db)("app/api/budget/categories/route.ts");
  const responses = await Promise.all([POST(request({ nama: "Souvenir", icon: "x" }, "POST")), POST(request({ nama: " souvenir ", icon: "y" }, "POST"))]);
  for (const response of responses) assert.equal(response.status, 200);
  assert.equal(db.tables.budget_categories.length, 1);
  assert.equal(db.tables.budget_categories[0].nama, "Souvenir");
});

test("Redux merges generated categories and repeated canonical creation", () => {
  const { default: reducer } = modules({ "@/lib/axiosClient": { default: {} } })("redux/slices/budgetSlice.ts");
  let state = reducer(undefined, { type: "init" });
  const souvenir = { id: "s", nama: "Souvenir", urutan: 0 };
  state = reducer(state, { type: "budget/addCategory/fulfilled", payload: souvenir });
  state = reducer(state, { type: "budget/addCategory/fulfilled", payload: souvenir });
  state = reducer(state, { type: "budget/generateDefault/fulfilled", payload: [{ id: "v", nama: "Venue", urutan: 1 }] });
  assert.deepEqual(Array.from(state.categories, (category) => category.id), ["s", "v"]);
});

test("a DP-only form sends cumulative payments and explicit nulls, and the hero counts that payment", async () => {
  const load = modules({}, true);
  const { BudgetFormModal } = load("app/dashboard/budget/components/BudgetFormModal.tsx");
  let saved;
  const item = { id: "item", category_id: "venue", nama: "Venue", estimasi: 100000000, dp: 20000000, realisasi: 0, status: "dp" };
  const content = BudgetFormModal({ open: true, item, categories: [], vendors: [], onSubmit: async (data) => { saved = data; } });
  const tree = content.type(content.props);
  await find(tree, (element) => element.type === "form")[0].props.onSubmit({ preventDefault() {} });
  assert.equal(saved.realisasi, 20000000);
  assert.equal(saved.status, "dp");
  for (const key of ["vendor_id", "catatan", "tanggal_dp", "tanggal_lunas", "tanggal_bayar"]) assert.equal(saved[key], null);
  const { BudgetHero } = load("app/dashboard/budget/components/BudgetHero.tsx");
  const hero = BudgetHero({ settings: { total_budget: 150000000 }, items: [item] });
  const paid = find(hero, (element) => element.props?.label === "Sudah Dibayar")[0];
  const remaining = find(hero, (element) => element.props?.label === "Sisa Budget")[0];
  assert.match(paid.props.value, /20/);
  assert.match(remaining.props.value, /130/);
});

test("manual linked items remain visible and editable while module totals count once", () => {
  const categories = [{ id: "a", nama: "Souvenir", urutan: 0 }, { id: "b", nama: "SOuvENIR", urutan: 1 }, { id: "c", nama: "Packing Souvenir", urutan: 2 }];
  const manual = { id: "manual", category_id: "a", nama: "Packing tambahan", estimasi: 100000, realisasi: 100000, dp: 0, status: "lunas" };
  const state = { budget: { settings: null, categories, items: [manual], loading: false }, vendor: { list: [] }, seserahan: { list: [] }, souvenir: { list: [{ id: "source", nama_souvenir: "Souvenir", total_harga: 5000000, status_pengadaan: "Sudah Dibeli" }] } };
  const load = modules({
    "@/redux/hooks": { useAppDispatch: () => () => {}, useAppSelector: (select) => select(state) },
    "./components/BudgetHero": { BudgetHero: "BudgetHero" },
    "./components/BudgetCategoryCard": { BudgetCategoryCard: "BudgetCategoryCard" },
    "./components/BudgetFormModal": { BudgetFormModal: "BudgetFormModal" },
  }, true);
  const tree = load("app/dashboard/budget/page.tsx").default();
  const hero = find(tree, (element) => element.type === "BudgetHero")[0];
  assert.equal(hero.props.autoLinkedEstimasi, 5000000);
  assert.equal(hero.props.autoLinkedRealisasi, 5000000);
  assert.equal(hero.props.items[0].estimasi + hero.props.autoLinkedEstimasi, 5100000);
  const cards = find(tree, (element) => element.type === "BudgetCategoryCard");
  assert.equal(cards.filter((card) => card.props.linkedSummary).length, 1);
  assert.equal(cards[2].props.linkedSummary, undefined);
  const { BudgetCategoryCard } = load("app/dashboard/budget/components/BudgetCategoryCard.tsx");
  const rendered = BudgetCategoryCard(cards[0].props);
  assert.ok(JSON.stringify(rendered).includes("Packing tambahan"));
  const editButton = find(rendered, (element) => element.props?.onClick && element.props.children?.type === "Pencil");
  assert.ok(editButton.length > 0);
});
