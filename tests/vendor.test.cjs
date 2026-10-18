/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node test and TypeScript VM loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { createTable, getCoreRowModel, getFilteredRowModel } = require("@tanstack/react-table");

const root = path.resolve(__dirname, "..");
function loadSource(relative, mocks = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} };
    cache.set(file, loadedModule);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const localRequire = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith("@/components/")) return new Proxy({}, { get: (_target, property) => String(property) });
      if (name === "next/link") return () => null;
      if (name.startsWith("@/") || name.startsWith(".")) {
        const target = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
        const resolved = [target, `${target}.ts`, `${target}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
        if (!resolved) throw new Error(`Cannot resolve ${name}`);
        return load(resolved);
      }
      return require(name);
    };
    vm.runInNewContext(source, { module: loadedModule, exports: loadedModule.exports, require: localRequire, console, AbortController }, { filename: file });
    return loadedModule.exports;
  }
  return load(path.join(root, relative));
}

function database() {
  return {
    vendors: [
      { id: "v1", user_id: "u1", status: "prospek", nama: "First" },
      { id: "v2", user_id: "u1", status: "negosiasi", nama: "Second" },
      { id: "v3", user_id: "u2", status: "prospek", nama: "Other account" },
    ],
    vendor_packages: [
      { id: "p1", vendor_id: "v1", user_id: "u1", nama_paket: "First package", harga: 100, is_final: true },
      { id: "p2", vendor_id: "v2", user_id: "u1", nama_paket: "Second package", harga: 200, is_final: false },
      { id: "p3", vendor_id: "v3", user_id: "u2", nama_paket: "Other account package", harga: 300, is_final: false },
    ],
    vendor_activity_logs: [{ id: "l2", vendor_id: "v2", user_id: "u1", aktivitas: "Meeting" }],
    vendor_documents: [{ id: "d2", vendor_id: "v2", user_id: "u1", nama: "Invoice" }],
  };
}

function fakeClient(db) {
  return {
    from(table) {
      let operation = "select";
      let changes;
      const filters = [];
      const query = {
        select() { return query; },
        order() { return query; },
        eq(key, value) { filters.push([key, value]); return query; },
        update(values) { operation = "update"; changes = values; return query; },
        delete() { operation = "delete"; return query; },
        insert(values) { operation = "insert"; changes = values; return query; },
        maybeSingle() { return execute(true); },
        single() { return execute(true); },
        then(resolve, reject) { return execute(false).then(resolve, reject); },
      };
      function execute(single) {
        let rows = db[table].filter((row) => filters.every(([key, value]) => row[key] === value));
        if (operation === "update") rows.forEach((row) => Object.assign(row, changes));
        if (operation === "delete") db[table] = db[table].filter((row) => !rows.includes(row));
        if (operation === "insert") {
          rows = changes.map((row, index) => ({ id: `inserted-${index}`, ...row }));
          db[table].push(...rows);
        }
        return Promise.resolve({ data: single ? rows[0] ?? null : rows, error: null });
      }
      return query;
    },
  };
}

function route(relative, client, authResponse) {
  return loadSource(relative, {
    "@/lib/api-auth": { requireActiveUser: async () => authResponse ? { response: authResponse } : { user: { id: "u1" }, supabase: client } },
    "next/server": { NextResponse: { json: (data, options) => ({ status: options?.status ?? 200, data }) } },
  });
}
const params = (values) => ({ params: Promise.resolve(values) });
const body = (values) => ({ json: async () => values });

test("vendor category filter uses the actual category accessor", () => {
  const { createVendorColumns } = loadSource("app/dashboard/vendor/components/VendorColumns.tsx");
  const table = createTable({
    data: [{ nama: "Photo", kategori: "Foto & Video" }, { nama: "Venue", kategori: "Venue & Gedung" }],
    columns: createVendorColumns(() => {}, () => {}),
    state: { columnFilters: [{ id: "kategori", value: "Foto & Video" }], columnVisibility: { kategori: false } },
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    onStateChange() {}, renderFallbackValue: null,
  });
  assert.equal(table.getFilteredRowModel().rows.length, 1);
  assert.equal(table.getFilteredRowModel().rows[0].original.nama, "Photo");
});

test("only deal vendors contribute to the contract total", () => {
  const { totalContractValue } = loadSource("app/dashboard/vendor/vendor-utils.ts");
  const vendors = ["deal", "batal", "prospek", "negosiasi"].map((status) => ({ status, vendor_packages: [{ is_final: true, harga: 12000000 }] }));
  assert.equal(totalContractValue(vendors), 12000000);
});

test("package update is scoped to both the URL vendor and account", async () => {
  const db = database();
  const handler = route("app/api/vendor/[id]/packages/[packageId]/route.ts", fakeClient(db));
  for (const values of [{ id: "v1", packageId: "p2" }, { id: "v3", packageId: "p3" }]) {
    const response = await handler.PATCH(body({ nama_paket: "Changed" }), params(values));
    assert.equal(response.status, 404);
  }
  assert.equal(db.vendor_packages[1].nama_paket, "Second package");
  assert.equal(db.vendor_packages[2].nama_paket, "Other account package");
  const response = await handler.PATCH(body({ nama_paket: "Updated", user_id: "u2", vendor_id: "v2", is_final: false }), params({ id: "v1", packageId: "p1" }));
  assert.equal(response.status, 200);
  assert.equal(db.vendor_packages[0].nama_paket, "Updated");
  assert.equal(db.vendor_packages[0].user_id, "u1");
  assert.equal(db.vendor_packages[0].vendor_id, "v1");
  assert.equal(db.vendor_packages[0].is_final, true);
});

for (const [segment, key, id, table] of [["packages", "packageId", "p2", "vendor_packages"], ["activity-logs", "logId", "l2", "vendor_activity_logs"], ["documents", "documentId", "d2", "vendor_documents"]]) {
  test(`${segment} deletion cannot delete another vendor's child`, async () => {
    const db = database();
    const before = db[table].length;
    const handler = route(`app/api/vendor/[id]/${segment}/[${key}]/route.ts`, fakeClient(db));
    const response = await handler.DELETE({}, params({ id: "v1", [key]: id }));
    assert.equal(response.status, 404);
    assert.equal(db[table].length, before);
  });
}

test("creating vendor children requires an owned parent", async () => {
  const db = database();
  const client = fakeClient(db);
  for (const [segment, values] of [["packages", { nama_paket: "New", harga: 100 }], ["activity-logs", { aktivitas: "Meeting", tanggal: "2026-10-17" }]]) {
    const handler = route(`app/api/vendor/[id]/${segment}/route.ts`, client);
    assert.equal((await handler.POST(body(values), params({ id: "v3" }))).status, 404);
  }
  assert.equal(db.vendor_packages.length, 3);
  assert.equal(db.vendor_activity_logs.length, 1);
});

test("final selection calls the atomic RPC and never falls back after a failure", async () => {
  const calls = [];
  const client = {
    from() { assert.fail("Final selection must not perform separate table mutations"); },
    rpc(name, args) {
      calls.push({ name, args });
      return { single: async () => ({ data: null, error: { code: "PGRST202" } }) };
    },
  };
  const handler = route("app/api/vendor/[id]/packages/[packageId]/set-final/route.ts", client);
  assert.equal((await handler.POST({}, params({ id: "v1", packageId: "p1" }))).status, 503);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "set_vendor_final_package");
  assert.equal(calls[0].args.p_vendor_id, "v1");
  assert.equal(calls[0].args.p_package_id, "p1");
});

test("vendor routes return the account guard response before any query", async () => {
  const denied = { status: 403, data: { error: "Forbidden" } };
  const client = { from() { assert.fail("Inactive accounts cannot query vendor data"); } };
  const handler = route("app/api/vendor/route.ts", client, denied);
  assert.equal(await handler.GET(), denied);
  assert.equal(await handler.POST(body({ nama: "Vendor", kategori: "Foto & Video" })), denied);
});

test("late or cancelled detail requests cannot replace the current vendor", () => {
  const { default: reducer, fetchVendorDetail, clearSelectedVendor } = loadSource("redux/slices/vendorSlice.ts", { "@/lib/axiosClient": {} });
  let state = reducer(undefined, { type: "init" });
  state = reducer(state, fetchVendorDetail.pending("request-a", "v1"));
  state = reducer(state, fetchVendorDetail.pending("request-b", "v2"));
  state = reducer(state, fetchVendorDetail.fulfilled({ id: "v2", nama: "Second" }, "request-b", "v2"));
  state = reducer(state, fetchVendorDetail.fulfilled({ id: "v1", nama: "First" }, "request-a", "v1"));
  assert.equal(state.selectedVendor.id, "v2");
  state = reducer(state, fetchVendorDetail.pending("request-c", "v3"));
  state = reducer(state, clearSelectedVendor());
  state = reducer(state, fetchVendorDetail.fulfilled({ id: "v3" }, "request-c", "v3"));
  assert.equal(state.selectedVendor, null);
});

test("cancelling detail loading also aborts the HTTP request", async () => {
  let httpSignal;
  const axios = {
    get(_url, { signal }) {
      httpSignal = signal;
      return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("cancelled")), { once: true }));
    },
  };
  const { configureStore } = require("@reduxjs/toolkit");
  const { default: reducer, fetchVendorDetail } = loadSource("redux/slices/vendorSlice.ts", { "@/lib/axiosClient": axios });
  const store = configureStore({ reducer });
  const request = store.dispatch(fetchVendorDetail("v1"));
  request.abort();
  const result = await request;
  assert.equal(httpSignal.aborted, true);
  assert.equal(result.meta.aborted, true);
  assert.equal(store.getState().selectedVendor, null);
  assert.equal(store.getState().detailLoading, false);
});
