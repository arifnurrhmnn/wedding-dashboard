/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS fixtures run with Node's built-in test runner. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const Papa = require("papaparse");

const project = path.resolve(__dirname, "..");
const plain = (value) => JSON.parse(JSON.stringify(value));

function moduleLoader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(project, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith("@/")) {
        const base = name.slice(2);
        for (const extension of [".ts", ".tsx"]) {
          if (fs.existsSync(path.join(project, base + extension))) return load(base + extension);
        }
      }
      return require(name);
    };
    vm.runInNewContext(compiled, {
      module: loadedModule, exports: loadedModule.exports, require: localRequire, URL,
      console: { error() {}, warn() {}, log() {} },
    }, { filename });
    return loadedModule.exports;
  }
  return load;
}

function importHarness(initialRows = [], options = {}) {
  const rows = structuredClone(initialRows);
  const calls = [];
  const supabase = {
    from(table) {
      let operation = "select";
      let payload;
      const filters = [];
      const execute = () => {
        calls.push({ table, operation, payload: plain(payload ?? null), filters: plain(filters) });
        if (operation === "select" && options.lookupError) {
          return { data: null, error: { message: "Lookup unavailable" } };
        }
        const matches = rows.filter((row) => filters.every(([key, value]) => row[key] === value));
        if (operation === "update") for (const row of matches) Object.assign(row, plain(payload));
        if (operation === "insert") {
          for (const input of Array.isArray(payload) ? payload : [payload]) {
            rows.push({ id: `new-${rows.length}`, ...plain(input) });
          }
        }
        return { data: matches[0] ?? null, error: null };
      };
      const query = {
        select() { return query; },
        eq(key, value) { filters.push([key, value]); return query; },
        update(data) { operation = "update"; payload = data; return query; },
        insert(data) { operation = "insert"; payload = data; return query; },
        maybeSingle: async () => execute(),
        single: async () => execute(),
        then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
      };
      return query;
    },
  };
  const denied = { status: 403, body: { error: "Account is not active" } };
  const load = moduleLoader({
    "@/lib/api-auth": {
      requireActiveUser: async () => options.denied ? { response: denied } : { supabase, user: { id: "owner" } },
    },
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
  });
  return {
    rows, calls, load, denied,
    import: (data) => load("app/api/tamu-undangan/import/route.ts").POST({ json: async () => ({ data }) }),
  };
}

const guest = {
  id: "guest-1", user_id: "owner", unique_id: "INV-000001", nama: "Nama Lama",
  kategori: "Keluarga Inti", skala_prioritas: "Wajib Hadir", tipe_undangan: "Digital",
  qty: 2, gift_type: "uang", gift_value: "500000", is_invited: true,
};

test("name-only CSV updates preserve quantity, gift, invitation status and classification", async () => {
  const harness = importHarness([guest]);
  const result = await harness.import([{ unique_id: guest.unique_id, nama: "Nama Baru" }]);
  assert.equal(result.status, 200);
  assert.equal(result.body.summary.updated, 1);
  assert.deepEqual(harness.rows[0], { ...guest, nama: "Nama Baru" });
  assert.ok(harness.calls.every((call) => call.filters.some(([field, value]) => field === "user_id" && value === "owner")));
});

test("explicit blank gifts clear them while omitted columns remain unchanged", async () => {
  const harness = importHarness([guest]);
  await harness.import([{ unique_id: guest.unique_id, nama: guest.nama, gift_type: "", gift_value: "", is_invited: "false" }]);
  assert.deepEqual(harness.rows[0], { ...guest, gift_type: null, gift_value: null, is_invited: false });
});

test("money gift validation uses the stored type for partial CSV updates", async () => {
  for (const giftValue of ["-500", "not-a-number"]) {
    const harness = importHarness([guest]);
    const result = await harness.import([
      { unique_id: guest.unique_id, gift_value: giftValue },
    ]);
    assert.equal(result.body.summary.skipped, 1);
    assert.equal(result.body.summary.updated, 0);
    assert.deepEqual(harness.rows, [guest]);
  }
});

test("a new CSV row cannot store a gift value without its type", async () => {
  const harness = importHarness();
  const result = await harness.import([{ nama: "Tamu", gift_value: "500" }]);
  assert.equal(result.body.summary.skipped, 1);
  assert.equal(result.body.summary.inserted, 0);
  assert.deepEqual(harness.rows, []);
});

test("partial guest and gift PATCH requests cannot bypass money validation", async () => {
  for (const routeFile of [
    "app/api/tamu-undangan/[id]/route.ts",
    "app/api/gift-tamu/[id]/route.ts",
  ]) {
    const harness = importHarness([guest]);
    const route = harness.load(routeFile);
    const response = await route.PATCH(
      { json: async () => ({ gift_value: "-500" }) },
      { params: Promise.resolve({ id: guest.id }) }
    );
    assert.equal(response.status, 400);
    assert.deepEqual(harness.rows, [guest]);
  }
});

test("exported CSV restores invitation booleans and gifts into a new guest list", async () => {
  const { guestExportRow } = moduleLoader()("lib/guest-import.ts");
  const source = [guest, { ...guest, id: "guest-2", unique_id: "INV-000002", nama: "Tamu Kedua", is_invited: false, gift_type: "kado", gift_value: "Blender" }];
  const csv = Papa.unparse(source.map(guestExportRow));
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  assert.equal(parsed.errors.length, 0);
  const harness = importHarness();
  const response = await harness.import(parsed.data);
  assert.equal(response.body.summary.inserted, 2);
  assert.deepEqual(harness.rows.map(({ is_invited, gift_type, gift_value, qty }) => ({ is_invited, gift_type, gift_value, qty })),
    source.map(({ is_invited, gift_type, gift_value, qty }) => ({ is_invited, gift_type, gift_value, qty })));
});

test("invalid invitation values, malformed rows and bad quantities report row errors without aborting", async () => {
  const harness = importHarness();
  const data = [null, { nama: "Bad boolean", is_invited: "yes" }, { nama: "Bad qty", qty: "-2" }, { nama: "Valid", is_invited: "false", qty: "3" }];
  const result = await harness.import(data);
  assert.equal(result.status, 200);
  assert.equal(result.body.summary.skipped, 3);
  assert.equal(result.body.summary.inserted, 1);
  assert.deepEqual(plain(result.body.summary.errors.map((error) => error.row)), [2, 3, 4]);
  assert.equal(harness.rows[0].is_invited, false);
  assert.equal(harness.rows[0].qty, 3);
});

test("database lookup failures do not turn an intended update into an insert", async () => {
  const harness = importHarness([guest], { lookupError: true });
  const result = await harness.import([{ unique_id: guest.unique_id, nama: "New" }]);
  assert.equal(result.body.summary.skipped, 1);
  assert.equal(harness.rows.length, 1);
  assert.ok(harness.calls.every((call) => call.operation !== "insert"));
});

test("inactive accounts are rejected before the importer accesses guest data", async () => {
  const harness = importHarness([], { denied: true });
  const response = await harness.import([{ nama: "Guest" }]);
  assert.equal(response, harness.denied);
  assert.equal(harness.calls.length, 0);
});

test("guest PATCH rejects immutable fields without mutating a record", async () => {
  const harness = importHarness([guest]);
  const route = harness.load("app/api/tamu-undangan/[id]/route.ts");
  const response = await route.PATCH({ json: async () => ({ user_id: "other", nama: "Changed" }) }, { params: Promise.resolve({ id: guest.id }) });
  assert.equal(response.status, 400);
  assert.deepEqual(harness.rows, [guest]);
});

test("inventory requests reject invalid quantities, negative costs, unsafe links and immutable fields", () => {
  const { parseInventoryInput } = moduleLoader()("lib/inventory-input.ts");
  for (const input of [{ jumlah: -1 }, { jumlah: 1.5 }, { harga_per_item: -100 }, { user_id: "other" }]) {
    assert.throws(() => parseInventoryInput(input, "souvenir", "patch"));
  }
  assert.throws(() => parseInventoryInput({ link_marketplace: "javascript:alert(1)" }, "seserahan", "patch"));
  assert.deepEqual(plain(parseInventoryInput({ catatan: "" }, "seserahan", "patch")), { catatan: null });
});

test("shrinking filtered guest results keeps the remaining ten rows accessible", () => {
  const { clampPage } = moduleLoader()("lib/pagination.ts");
  const remaining = Array.from({ length: 10 }, (_, index) => index);
  const page = clampPage(2, remaining.length, 10);
  assert.equal(page, 1);
  assert.equal(remaining.slice((page - 1) * 10, page * 10).length, 10);
  assert.equal(clampPage(3, 0, 10), 1);
});

function formRenderer(filename, componentName) {
  const values = [];
  const dependencies = [];
  let cursor;
  let effects;
  let changed;
  let previousKey;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in values)) values[index] = typeof initial === "function" ? initial() : initial;
      return [values[index], (value) => {
        const next = typeof value === "function" ? value(values[index]) : value;
        if (!Object.is(next, values[index])) { values[index] = next; changed = true; }
      }];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!dependencies[index] || deps.some((value, i) => !Object.is(value, dependencies[index][i]))) {
        dependencies[index] = deps;
        effects.push(effect);
      }
    },
  };
  const jsx = (type, props, key) => ({ type, props, key });
  const stub = new Proxy({}, { get: (_target, key) => String(key) });
  const overrides = { react, "react/jsx-runtime": { jsx, jsxs: jsx }, "lucide-react": stub };
  for (const name of ["dialog", "button", "input", "label", "select"]) overrides[`@/components/ui/${name}`] = stub;
  const Component = moduleLoader(overrides)(filename)[componentName];
  return (props) => {
    const content = Component(props);
    if (!content) {
      values.length = 0;
      dependencies.length = 0;
      previousKey = undefined;
      return null;
    }
    if (previousKey !== content.key) {
      values.length = 0;
      dependencies.length = 0;
      previousKey = content.key;
    }
    let tree;
    for (let iteration = 0; iteration < 5; iteration++) {
      cursor = 0; effects = []; changed = false;
      tree = content.type(content.props);
      for (const effect of effects) effect();
      if (!changed) return tree;
    }
    throw new Error("Form did not settle");
  };
}

function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return undefined;
  if (predicate(tree)) return tree;
  const children = tree.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    if (Array.isArray(child)) {
      for (const nested of child) { const match = find(nested, predicate); if (match) return match; }
    } else { const match = find(child, predicate); if (match) return match; }
  }
}

for (const [filename, name, field, recordProp] of [
  ["app/dashboard/tamu-undangan/components/GuestFormModal.tsx", "GuestFormModal", "nama", "guest"],
  ["app/dashboard/seserahan/components/SeserahanFormModal.tsx", "SeserahanFormModal", "nama_item", "item"],
  ["app/dashboard/souvenir/components/SouvenirFormModal.tsx", "SouvenirFormModal", "nama_souvenir", "item"],
]) {
  test(`${name} clears a previous add on reopen and loads a new edit target`, () => {
    const render = formRenderer(filename, name);
    const props = { open: false, [recordProp]: null, onOpenChange() {}, onSubmit() {}, loading: false };
    render(props);
    props.open = true;
    let tree = render(props);
    find(tree, (node) => node.props?.id === field).props.onChange({ target: { value: "Previously saved" } });
    tree = render(props);
    assert.equal(find(tree, (node) => node.props?.id === field).props.value, "Previously saved");
    props.open = false; render(props);
    props.open = true; tree = render(props);
    assert.equal(find(tree, (node) => node.props?.id === field).props.value, "");
    props[recordProp] = { id: "edit-target", [field]: "Current target" };
    tree = render(props);
    assert.equal(find(tree, (node) => node.props?.id === field).props.value, "Current target");
  });
}
