/* eslint-disable @typescript-eslint/no-require-imports -- Node's built-in test runner uses isolated CommonJS fixtures. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Keep the fixture in the user's timezone so local date regressions are observable.
process.env.TZ = "Asia/Jakarta";
const project = path.resolve(__dirname, "..");
const plain = (value) => JSON.parse(JSON.stringify(value));

function loader(overrides = {}) {
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(project, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const fixture = { exports: {} };
    cache.set(filename, fixture);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const localRequire = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith("@/")) {
        for (const extension of [".ts", ".tsx"]) {
          const file = name.slice(2) + extension;
          if (fs.existsSync(path.join(project, file))) return load(file);
        }
      }
      return require(name);
    };
    vm.runInNewContext(code, { module: fixture, exports: fixture.exports, require: localRequire, Date, URL, URLSearchParams, AbortController, console: { error() {} } }, { filename });
    return fixture.exports;
  }
  return load;
}

function apiHarness(initial = {}, options = {}) {
  const tables = structuredClone(initial);
  const calls = [];
  const supabase = { from(table) {
    let operation = "select";
    let payload;
    const filters = [];
    const execute = (single = false) => {
      calls.push({ table, operation, filters: plain(filters), payload: plain(payload ?? null) });
      if (options.databaseError) return { data: null, error: { message: "Database unavailable" } };
      const rows = tables[table] ?? (tables[table] = []);
      const matches = rows.filter((row) => filters.every(([operator, key, value]) => {
        if (operator === "eq") return row[key] === value;
        if (operator === "gte") return Date.parse(row[key]) >= Date.parse(value);
        return Date.parse(row[key]) < Date.parse(value);
      }));
      let result = matches;
      if (operation === "update") for (const row of matches) Object.assign(row, plain(payload));
      if (operation === "delete") tables[table] = rows.filter((row) => !matches.includes(row));
      if (operation === "insert") {
        result = (Array.isArray(payload) ? payload : [payload]).map((row, index) => ({ id: `new-${rows.length + index}`, ...plain(row) }));
        rows.push(...result);
      }
      return { data: single ? result[0] ?? null : result, error: null };
    };
    const query = {
      select() { return query; }, order() { return query; },
      eq(key, value) { filters.push(["eq", key, value]); return query; },
      gte(key, value) { filters.push(["gte", key, value]); return query; },
      lt(key, value) { filters.push(["lt", key, value]); return query; },
      insert(data) { operation = "insert"; payload = data; return query; },
      update(data) { operation = "update"; payload = data; return query; },
      delete() { operation = "delete"; return query; },
      single: async () => execute(true), maybeSingle: async () => execute(true),
      then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
    };
    return query;
  } };
  const load = loader({
    "@/lib/api-auth": { requireActiveUser: async () => options.denied ? { response: { status: 403, body: { error: "Account is not active" } } } : { user: { id: "owner" }, supabase } },
    "next/server": { NextResponse: { json: (body, init) => ({ body: plain(body), status: init?.status ?? 200 }) } },
  });
  return { load, calls, tables };
}

const schedule = { id: "event-1", user_id: "owner", title: "Meeting vendor", start_datetime: "2026-10-20T02:00:00.000Z", end_datetime: "2026-10-20T03:00:00.000Z" };
const task = { id: "task-1", user_id: "owner", title: "Book venue", category: "venue", timeline_phase: "phase_1", status: "todo", priority: "medium", due_date: "2026-10-20" };
const request = (body) => ({ json: async () => body });
const params = (id) => ({ params: Promise.resolve({ id }) });

test("local calendar dates and month bounds preserve WIB rather than the previous UTC day", () => {
  const { localDateInput, localMonthRange, utcMonthRange } = loader()("lib/schedule.ts");
  assert.equal(localDateInput(new Date(2026, 9, 20)), "2026-10-20");
  assert.deepEqual(plain(localMonthRange(2026, 9)), { start: "2026-09-30T17:00:00.000Z", end: "2026-10-31T17:00:00.000Z" });
  assert.deepEqual(plain(utcMonthRange("2026-10")), { start: "2026-10-01T00:00:00.000Z", end: "2026-11-01T00:00:00.000Z" });
});

test("explicit WIB month ranges include late last-day events and exclude next-month midnight", async () => {
  const events = [
    { ...schedule, id: "first", start_datetime: "2026-09-30T17:00:00.000Z" },
    { ...schedule, id: "last", start_datetime: "2026-10-31T16:59:59.999Z" },
    { ...schedule, id: "next", start_datetime: "2026-10-31T17:00:00.000Z" },
    { ...schedule, id: "other-account", user_id: "someone-else", start_datetime: "2026-10-10T02:00:00Z" },
  ];
  const harness = apiHarness({ schedules: events });
  const search = new URLSearchParams({ month: "2026-10", start: "2026-09-30T17:00:00.000Z", end: "2026-10-31T17:00:00.000Z" });
  const result = await harness.load("app/api/schedule/route.ts").GET({ url: `https://local.test/api/schedule?${search}` });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map((event) => event.id), ["first", "last"]);
});

test("month-only requests include the whole final UTC day", async () => {
  const harness = apiHarness({ schedules: [{ ...schedule, start_datetime: "2026-10-31T23:59:59.999Z" }, { ...schedule, id: "next", start_datetime: "2026-11-01T00:00:00.000Z" }] });
  const result = await harness.load("app/api/schedule/route.ts").GET({ url: "https://local.test/api/schedule?month=2026-10" });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map((event) => event.id), ["event-1"]);
});

test("invalid schedule ranges are rejected before database access", async () => {
  for (const search of ["month=2026-13", "start=2026-10-01T00%3A00%3A00Z", "start=bad&end=bad", "start=2026-11-01T00%3A00%3A00Z&end=2026-10-01T00%3A00%3A00Z"]) {
    const harness = apiHarness();
    const result = await harness.load("app/api/schedule/route.ts").GET({ url: `https://local.test/api/schedule?${search}` });
    assert.equal(result.status, 400);
    assert.equal(harness.calls.length, 0);
  }
});

test("partial schedule PATCH validates against the stored start and end", async () => {
  for (const patch of [{ start_datetime: "2026-10-20T04:00:00Z" }, { end_datetime: "2026-10-20T01:00:00Z" }]) {
    const harness = apiHarness({ schedules: [schedule] });
    const result = await harness.load("app/api/schedule/[id]/route.ts").PATCH(request(patch), params(schedule.id));
    assert.equal(result.status, 400);
    assert.deepEqual(harness.tables.schedules, [schedule]);
  }
});

test("schedule PATCH clears an end time with null and preserves omitted fields", async () => {
  const harness = apiHarness({ schedules: [schedule] });
  const result = await harness.load("app/api/schedule/[id]/route.ts").PATCH(request({ end_datetime: null }), params(schedule.id));
  assert.equal(result.status, 200);
  assert.deepEqual(harness.tables.schedules, [{ ...schedule, end_datetime: null }]);
});

test("schedule input rejects invalid calendar dates, timezone-free timestamps and immutable fields", async () => {
  for (const body of [
    { title: "Bad", start_datetime: "2026-02-30T09:00:00Z" },
    { title: "Bad", start_datetime: "2026-10-20T09:00:00" },
    { title: "Bad", start_datetime: schedule.start_datetime, user_id: "other" },
  ]) {
    const harness = apiHarness();
    const result = await harness.load("app/api/schedule/route.ts").POST(request(body));
    assert.equal(result.status, 400);
    assert.equal(harness.calls.length, 0);
  }
});

test("schedule edits cannot load another account's event", async () => {
  const harness = apiHarness({ schedules: [{ ...schedule, user_id: "other" }] });
  const result = await harness.load("app/api/schedule/[id]/route.ts").PATCH(request({ title: "Change" }), params(schedule.id));
  assert.equal(result.status, 404);
  assert.equal(harness.tables.schedules[0].title, schedule.title);
});

test("checklist PATCH clears due dates and rejects invalid status, date and immutable fields", async () => {
  const harness = apiHarness({ checklist: [task] });
  const route = harness.load("app/api/checklist/[id]/route.ts");
  assert.equal((await route.PATCH(request({ due_date: null }), params(task.id))).status, 200);
  assert.equal(harness.tables.checklist[0].due_date, null);
  for (const invalid of [{ status: "finished" }, { due_date: "2026-02-30" }, { user_id: "other" }]) {
    assert.equal((await route.PATCH(request(invalid), params(task.id))).status, 400);
  }
  assert.equal(harness.tables.checklist[0].status, "todo");
});

test("checklist list/create/delete are scoped to the active owner", async () => {
  const harness = apiHarness({ checklist: [task, { ...task, id: "other-task", user_id: "other" }] });
  const route = harness.load("app/api/checklist/route.ts");
  assert.deepEqual((await route.GET()).body.map((row) => row.id), [task.id]);
  const created = await route.POST(request({ title: "New task", category: "other", timeline_phase: "phase_1" }));
  assert.equal(created.status, 200);
  assert.equal(created.body.user_id, "owner");
  await harness.load("app/api/checklist/[id]/route.ts").DELETE(request(), params("other-task"));
  assert.ok(harness.tables.checklist.some((row) => row.id === "other-task"));
});

test("inactive accounts and database failures return explicit HTTP errors", async () => {
  for (const file of ["app/api/schedule/route.ts", "app/api/checklist/route.ts"]) {
    const denied = apiHarness({}, { denied: true });
    assert.equal((await denied.load(file).GET({ url: "https://local.test/api/schedule" })).status, 403);
    assert.equal(denied.calls.length, 0);
    const failed = apiHarness({}, { databaseError: true });
    assert.equal((await failed.load(file).GET({ url: "https://local.test/api/schedule" })).status, 500);
  }
});

function formFixture(file, componentName) {
  const values = [];
  let cursor = 0;
  let previousKey;
  const react = { useState(initial) {
    const index = cursor++;
    if (!(index in values)) values[index] = typeof initial === "function" ? initial() : initial;
    return [values[index], (next) => { values[index] = typeof next === "function" ? next(values[index]) : next; }];
  } };
  const jsx = (type, props, key) => ({ type, props, key });
  const stub = new Proxy({}, { get: (_target, field) => String(field) });
  const overrides = { react, "react/jsx-runtime": { jsx, jsxs: jsx }, "lucide-react": stub };
  for (const name of ["dialog", "button", "input", "label", "select"]) overrides[`@/components/ui/${name}`] = stub;
  const Component = loader(overrides)(file)[componentName];
  return (props) => {
    const content = Component(props);
    if (!content) { values.length = 0; previousKey = undefined; return null; }
    if (previousKey !== content.key) { values.length = 0; previousKey = content.key; }
    cursor = 0;
    return content.type(content.props);
  };
}

function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return undefined;
  if (predicate(tree)) return tree;
  for (const child of [tree.props?.children].flat(2)) {
    const match = find(child, predicate);
    if (match) return match;
  }
}
const input = (tree, id) => find(tree, (node) => node.props?.id === id);
const form = (tree) => find(tree, (node) => node.type === "form");

test("schedule modal resets edit targets, preserves early-morning WIB dates and sends UTC/null", () => {
  const render = formFixture("app/dashboard/kalender/components/ScheduleFormModal.tsx", "ScheduleFormModal");
  const submitted = [];
  const props = { open: false, schedule: null, initialDate: null, loading: false, onOpenChange() {}, onSubmit: (data) => submitted.push(plain(data)) };
  render(props);
  props.open = true;
  props.schedule = { ...schedule, start_datetime: "2026-10-19T23:00:00.000Z" };
  let tree = render(props);
  assert.equal(input(tree, "title").props.value, schedule.title);
  assert.equal(input(tree, "start_date").props.value, "2026-10-20");
  assert.equal(input(tree, "start_time").props.value, "06:00");
  input(tree, "end_date").props.onChange({ target: { value: "" } });
  tree = render(props);
  form(tree).props.onSubmit({ preventDefault() {} });
  assert.equal(submitted[0].start_datetime, "2026-10-19T23:00:00.000Z");
  assert.equal(submitted[0].end_datetime, null);
  props.open = false; render(props);
  props.open = true; props.schedule = null; props.initialDate = new Date(2026, 9, 24);
  tree = render(props);
  assert.equal(input(tree, "title").props.value, "");
  assert.equal(input(tree, "start_date").props.value, "2026-10-24");
});

test("checklist modal clears old add drafts and reloads the selected task", () => {
  const render = formFixture("app/dashboard/checklist/components/ChecklistFormModal.tsx", "ChecklistFormModal");
  const props = { open: true, item: null, loading: false, onOpenChange() {}, onSubmit() {} };
  let tree = render(props);
  input(tree, "title").props.onChange({ target: { value: "Old draft" } });
  tree = render(props);
  assert.equal(input(tree, "title").props.value, "Old draft");
  props.open = false; render(props);
  props.open = true; tree = render(props);
  assert.equal(input(tree, "title").props.value, "");
  props.item = task; tree = render(props);
  assert.equal(input(tree, "title").props.value, task.title);
});

test("calendar ignores an older month response that arrives after the current month", async () => {
  const requests = [];
  const source = loader({ "@/lib/axiosClient": { get: (url, options) => new Promise((resolve, reject) => { requests.push({ url, ...options, resolve, reject }); }) } });
  const { default: reducer, fetchSchedules } = source("redux/slices/scheduleSlice.ts");
  const { configureStore } = require("@reduxjs/toolkit");
  const store = configureStore({ reducer });
  const october = store.dispatch(fetchSchedules({ month: "2026-10" }));
  const november = store.dispatch(fetchSchedules({ month: "2026-11" }));
  requests[1].resolve({ data: [{ ...schedule, id: "november", start_datetime: "2026-11-02T02:00:00Z" }] });
  await november;
  requests[0].resolve({ data: [schedule] });
  await october;
  assert.deepEqual(plain(store.getState().list.map((event) => event.id)), ["november"]);
  assert.equal(store.getState().loading, false);
  assert.equal(store.getState().error, null);
  assert.equal(store.getState().fetchRequestId, null);
});

test("a stale calendar rejection cannot clear loading or add an error to a newer request", async () => {
  const requests = [];
  const source = loader({ "@/lib/axiosClient": { get: () => new Promise((resolve, reject) => { requests.push({ resolve, reject }); }) } });
  const { default: reducer, fetchSchedules } = source("redux/slices/scheduleSlice.ts");
  const { configureStore } = require("@reduxjs/toolkit");
  const store = configureStore({ reducer });
  const first = store.dispatch(fetchSchedules({ month: "2026-10" }));
  const second = store.dispatch(fetchSchedules({ month: "2026-11" }));
  requests[0].reject(new Error("Old month failed"));
  await first;
  assert.equal(store.getState().loading, true);
  assert.equal(store.getState().error, null);
  assert.equal(store.getState().fetchRequestId, second.requestId);
  requests[1].resolve({ data: [] });
  await second;
  assert.equal(store.getState().loading, false);
});

test("aborting calendar navigation cancels the Axios request without a user-facing error", async () => {
  let axiosSignal;
  const source = loader({ "@/lib/axiosClient": { get: (_url, { signal }) => {
    axiosSignal = signal;
    return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("Request canceled")), { once: true }));
  } } });
  const { default: reducer, fetchSchedules } = source("redux/slices/scheduleSlice.ts");
  const { configureStore } = require("@reduxjs/toolkit");
  const store = configureStore({ reducer });
  const pending = store.dispatch(fetchSchedules({ month: "2026-10" }));
  pending.abort();
  const action = await pending;
  assert.equal(axiosSignal.aborted, true);
  assert.equal(action.meta.aborted, true);
  assert.equal(store.getState().error, null);
  assert.equal(store.getState().loading, false);
  assert.equal(store.getState().fetchRequestId, null);
});

test("the calendar effect aborts its month request when replaced or unmounted", () => {
  const effects = [];
  let aborted = false;
  let requestedRange;
  const stub = new Proxy({}, { get: (_target, field) => String(field) });
  const jsx = (type, props, key) => ({ type, props, key });
  const mocks = {
    react: { useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}], useEffect: (effect) => effects.push(effect) },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "lucide-react": stub,
    "@/redux/hooks": { useAppSelector: (select) => select({ schedules: { list: [], loading: false } }), useAppDispatch: () => (action) => { requestedRange = action; return { abort: () => { aborted = true; } }; } },
    "@/redux/slices/scheduleSlice": { fetchSchedules: (range) => range },
    "./components/ScheduleFormModal": stub,
    "./components/CalendarGrid": stub,
    "./components/DailyEventDrawer": stub,
    "./components/EventDetailModal": stub,
  };
  for (const name of ["button", "dialog"]) mocks[`@/components/ui/${name}`] = stub;
  loader(mocks)("app/dashboard/kalender/page.tsx").default();
  const cleanup = effects[0]();
  assert.match(requestedRange.month, /^\d{4}-\d{2}$/);
  assert.ok(requestedRange.start.endsWith("Z"));
  cleanup();
  assert.equal(aborted, true);
});
