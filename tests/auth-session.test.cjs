/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node regression tests load TypeScript modules without a browser or credentials. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToString } = require("react-dom/server");

const root = path.resolve(__dirname, "..");
class Cookies {
  values = new Map();
  set(name, value, options = {}) {
    const cookie = typeof name === "object" ? name : { name, value, ...options };
    this.values.set(cookie.name, cookie);
  }
  getAll() { return Array.from(this.values.values()); }
}
class NextResponse extends Response {
  cookies = new Cookies();
  static next() { return new NextResponse(null); }
  static json(value, options = {}) { return new NextResponse(JSON.stringify(value), options); }
  static redirect(url) { return new NextResponse(null, { status: 307, headers: { location: String(url) } }); }
}

function modules(overrides = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const loadedModule = { exports: {} };
    cache.set(absolute, loadedModule);
    const js = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      fileName: absolute,
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const localRequire = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === "next/server") return { NextResponse };
      if (name.startsWith("@/components/") || name === "lucide-react" || name === "next/link" || name === "next/image") return new Proxy({}, { get: (_, key) => String(key) });
      if (name === "@/lib/utils") return { cn: (...classes) => classes.filter(Boolean).join(" ") };
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(absolute), name);
        const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
        if (!resolved) throw new Error(`Cannot resolve ${name}`);
        return load(resolved);
      }
      return require(name);
    };
    vm.runInNewContext(js, {
      module: loadedModule, exports: loadedModule.exports, require: localRequire,
      console, URL, Response, Request, Date, Intl, Event, AbortController,
      process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://project.example.test", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-public-key" } },
      ...globals,
    }, { filename: absolute });
    return loadedModule.exports;
  }
  return load;
}

function client({ user = { id: "user-1", user_metadata: { nama: "Nama Lama" }, email: "user@example.test" }, authError = null, profile = { status: "active", role: "client", nama: "Nama Baru" }, profileError = null, refresh, exchangeError = null } = {}) {
  const selected = [];
  return {
    selected,
    auth: {
      async getUser() { refresh?.(); return { data: { user }, error: authError }; },
      async exchangeCodeForSession() { return { data: { user }, error: exchangeError }; },
    },
    from(table) {
      assert.equal(table, "profiles");
      const query = {
        select(columns) { selected.push(columns); return this; },
        eq(key, id) { assert.equal(key, "id"); assert.equal(id, user.id); return this; },
        async maybeSingle() { return { data: profile, error: profileError }; },
        async single() { return this.maybeSingle(); },
      };
      return query;
    },
  };
}

function request(pathname) {
  const url = new URL(`https://wedding.example.test${pathname}`);
  url.clone = () => new URL(url);
  return { nextUrl: url, cookies: new Cookies() };
}

function hookRunner() {
  const states = [], effects = [], cleanups = [];
  let cursor = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      if (!(index in states)) {
        states[index] = dependencies;
        effects.push(effect);
      }
    },
  };
  return {
    hooks, states,
    render(Component, props) { cursor = 0; return Component(props); },
    mountEffects() { while (effects.length) { const cleanup = effects.shift()(); if (cleanup) cleanups.push(cleanup); } },
    unmount() { for (const cleanup of cleanups) cleanup(); },
  };
}

function find(node, predicate, output = []) {
  if (!node || typeof node !== "object") return output;
  if (predicate(node)) output.push(node);
  const children = node.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) find(child, predicate, output);
  return output;
}

test("active-account guard rejects missing sessions, unknown profiles, inactive statuses, and lookup errors", async () => {
  const cases = [
    [{ user: null }, 401],
    [{ authError: { message: "expired token" } }, 401],
    [{ profile: null }, 403],
    [{ profile: { status: "pending" } }, 403],
    [{ profile: { status: "rejected" } }, 403],
    [{ profile: { status: "unexpected" } }, 403],
    [{ profileError: { message: "database unavailable" } }, 503],
  ];
  for (const [options, status] of cases) {
    const db = client(options);
    const { requireActiveUser } = modules({ "@/lib/supabase-server": { createSupabaseServerClient: async () => db } })("lib/api-auth.ts");
    const result = await requireActiveUser();
    assert.equal(result.response.status, status);
    assert.equal(result.supabase, undefined);
  }
});

test("active-account guard allows active users and restricts admin-only calls by the profile role", async () => {
  for (const role of ["client", "admin"]) {
    const db = client({ profile: { status: "active", role } });
    const { requireActiveUser } = modules({ "@/lib/supabase-server": { createSupabaseServerClient: async () => db } })("lib/api-auth.ts");
    const regular = await requireActiveUser();
    assert.equal(regular.supabase, db);
    assert.equal(regular.user.id, "user-1");
    const admin = await requireActiveUser({ adminOnly: true });
    assert.equal(admin.response?.status ?? 200, role === "admin" ? 200 : 403);
  }
});

test("middleware fails closed for dashboard entry and retains refreshed cookies on every redirect", async () => {
  const cases = [
    [{ profile: null }, "/dashboard/budget", "/pending"],
    [{ profileError: { message: "offline" } }, "/dashboard", "/pending"],
    [{ profile: { status: "pending" } }, "/login", "/pending"],
    [{ profile: { status: "rejected" } }, "/dashboard", "/rejected"],
    [{ profile: { status: "active" } }, "/pending", "/dashboard"],
    [{ user: null }, "/dashboard", "/login"],
  ];
  for (const [options, pathname, destination] of cases) {
    let cookieAdapter;
    const db = client({ ...options, refresh: () => cookieAdapter.setAll([{ name: "refreshed-session", value: "fixture-token", options: { httpOnly: true, path: "/", sameSite: "lax", secure: true } }]) });
    const { middleware } = modules({ "@supabase/ssr": { createServerClient: (_url, _key, config) => { cookieAdapter = config.cookies; return db; } } })("middleware.ts");
    const req = request(pathname);
    const response = await middleware(req);
    assert.equal(new URL(response.headers.get("location")).pathname, destination);
    assert.deepEqual(response.cookies.getAll(), [{ name: "refreshed-session", value: "fixture-token", httpOnly: true, path: "/", sameSite: "lax", secure: true }]);
    assert.equal(req.cookies.getAll()[0].value, "fixture-token");
  }
});

test("middleware permits active dashboard traffic and preserves its session refresh", async () => {
  let cookieAdapter;
  const db = client({ refresh: () => cookieAdapter.setAll([{ name: "session", value: "fresh", options: { path: "/" } }]) });
  const { middleware } = modules({ "@supabase/ssr": { createServerClient: (_url, _key, config) => { cookieAdapter = config.cookies; return db; } } })("middleware.ts");
  const response = await middleware(request("/dashboard/budget"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.cookies.getAll()[0].value, "fresh");
});

test("OAuth callback sends active, rejected, unknown, and missing profiles to the correct destination", async () => {
  for (const [options, destination] of [
    [{ profile: { status: "active" } }, "/dashboard"],
    [{ profile: { status: "pending" } }, "/pending"],
    [{ profile: { status: "rejected" } }, "/rejected"],
    [{ profile: null }, "/pending"],
    [{ profile: { status: "unknown" } }, "/pending"],
    [{ profileError: { message: "offline" } }, "/pending"],
    [{ exchangeError: { message: "invalid code" } }, "/login?error=auth_callback_failed"],
  ]) {
    const db = client(options);
    const { GET } = modules({ "@/lib/supabase-server": { createSupabaseServerClient: async () => db } })("app/auth/callback/route.ts");
    assert.equal((await GET(new Request("https://wedding.example.test/auth/callback?code=fixture"))).headers.get("location"), `https://wedding.example.test${destination}`);
  }
  const { GET } = modules({ "@/lib/supabase-server": { createSupabaseServerClient: () => { throw new Error("No code must not start an exchange"); } } })("app/auth/callback/route.ts");
  assert.equal((await GET(new Request("https://wedding.example.test/auth/callback"))).headers.get("location"), "https://wedding.example.test/login?error=auth_callback_failed");
});

test("Providers gates children on session initialization and scopes actual stores across account changes", async () => {
  const hooks = hookRunner();
  let listener, resolveOldRequest, unsubscribed = false;
  const oldRequest = new Promise((resolve) => { resolveOldRequest = resolve; });
  const load = modules({
    react: hooks.hooks,
    "react-redux": { Provider: "AccountProvider" },
    sonner: { Toaster: "Toaster" },
    "@/lib/axiosClient": { default: { get: () => oldRequest } },
    "@/lib/supabase-browser": { createSupabaseBrowserClient: () => ({ auth: { onAuthStateChange: (callback) => { listener = callback; return { data: { subscription: { unsubscribe: () => { unsubscribed = true; } } } }; } } }) },
  });
  const { Providers } = load("components/providers.tsx");
  const props = { children: "protected-child" };
  assert.equal(hooks.render(Providers, props).props.role, "status");
  hooks.mountEffects();
  listener("INITIAL_SESSION", { user: { id: "account-a" } });
  const first = hooks.render(Providers, props);
  const storeA = first.props.store;
  assert.equal(first.key, "account-a");
  const { fetchGuests } = load("redux/slices/guestSlice.ts");
  const pending = storeA.dispatch(fetchGuests());
  assert.equal(storeA.getState().guests.loading, true);
  listener("TOKEN_REFRESHED", { user: { id: "account-a" } });
  assert.equal(hooks.render(Providers, props).props.store, storeA);
  listener("SIGNED_IN", { user: { id: "account-b" } });
  const second = hooks.render(Providers, props);
  const storeB = second.props.store;
  assert.notEqual(storeB, storeA);
  assert.equal(second.key, "account-b");
  assert.equal(storeB.getState().guests.list.length, 0);
  resolveOldRequest({ data: [{ id: "old-private-guest", nama: "Private account A" }] });
  await pending;
  assert.equal(storeA.getState().guests.list.length, 1);
  assert.equal(storeB.getState().guests.list.length, 0);
  assert.equal(storeB.getState().guests.loading, false);
  listener("SIGNED_OUT", null);
  const anonymous = hooks.render(Providers, props);
  assert.notEqual(anonymous.props.store, storeB);
  assert.equal(anonymous.key, "anonymous");
  listener("SIGNED_IN", { user: { id: "account-a" } });
  const backToA = hooks.render(Providers, props).props.store;
  assert.notEqual(backToA, storeA);
  assert.equal(backToA.getState().guests.list.length, 0);
  hooks.unmount();
  assert.equal(unsubscribed, true);
});

test("separate makeStore calls never share mutable account data", () => {
  const { makeStore } = modules({ "@/lib/axiosClient": { default: {} } })("redux/store.ts");
  const first = makeStore(), second = makeStore();
  first.dispatch({ type: "guests/fetchGuests/fulfilled", payload: [{ id: "private" }] });
  assert.equal(first.getState().guests.list.length, 1);
  assert.equal(second.getState().guests.list.length, 0);
});

test("Sidebar and dashboard prefer the editable profile name to stale auth metadata", async () => {
  for (const [file, exportName] of [["components/layout/Sidebar.tsx", "Sidebar"], ["app/dashboard/page.tsx", "default"]]) {
    const hooks = hookRunner();
    const db = client();
    const state = { guests: { list: [{ is_invited: false }, { is_invited: true }, { is_invited: false }] }, checklist: { list: [] }, seserahan: { list: [] }, souvenir: { list: [] } };
    const load = modules({
      react: hooks.hooks,
      "@/lib/supabase-browser": { createSupabaseBrowserClient: () => db },
      "@/lib/axiosClient": { default: {} },
      "@/redux/hooks": { useAppDispatch: () => () => {}, useAppSelector: (select) => select(state) },
      "next/navigation": { usePathname: () => "/dashboard", useRouter: () => ({}) },
    });
    const Component = load(file)[exportName];
    hooks.render(Component, { isMinimized: false, onToggle() {} });
    hooks.mountEffects();
    await new Promise(setImmediate);
    const tree = hooks.render(Component, { isMinimized: false, onToggle() {} });
    assert.equal(hooks.states[0], "Nama Baru");
    assert.ok(db.selected.some((selection) => selection.includes("nama")));
    if (file === "app/dashboard/page.tsx") {
      const invitationCards = find(tree, (element) => Array.isArray(element.props?.children) && element.props.children.some((child) => child?.props?.children === "Belum Diundang"));
      assert.equal(invitationCards.length, 1);
      assert.equal(invitationCards[0].props.children[0].props.children, 2);
      assert.equal(JSON.stringify(tree).includes('"Hadir"'), false);
    }
    hooks.unmount();
  }
});

test("sidebar preference uses a stable server snapshot despite a persisted minimized preference", () => {
  const Sidebar = ({ isMinimized }) => React.createElement("nav", null, isMinimized ? "minimized" : "expanded");
  const overrides = { "@/components/layout/Sidebar": { Sidebar } };
  const serverLayout = modules(overrides)("app/dashboard/layout.tsx").default;
  const browserLayout = modules(overrides, { window: {}, localStorage: { getItem: () => "true" } })("app/dashboard/layout.tsx").default;
  const serverMarkup = renderToString(React.createElement(serverLayout, null, "content"));
  const hydrationMarkup = renderToString(React.createElement(browserLayout, null, "content"));
  assert.equal(hydrationMarkup, serverMarkup);
  assert.match(serverMarkup, /w-72/);
  let clientSnapshot, serverSnapshot;
  const Layout = modules({ ...overrides, react: { ...React, useSyncExternalStore: (_subscribe, getClientSnapshot, getServerSnapshot) => { clientSnapshot = getClientSnapshot(); serverSnapshot = getServerSnapshot(); return clientSnapshot; } } }, { localStorage: { getItem: () => "true" } })("app/dashboard/layout.tsx").default;
  assert.equal(find(Layout({ children: "content" }), (element) => element.type === "aside")[0].props.className.includes("w-16"), true);
  assert.equal(serverSnapshot, false);
  assert.equal(clientSnapshot, true);
});

test("register route defers Supabase Admin initialization until request time", async () => {
  let createClientCalls = 0;
  const load = modules(
    {
      "@supabase/supabase-js": {
        createClient() {
          createClientCalls += 1;
          return {};
        },
      },
    },
    { console: { ...console, error() {} } }
  );

  const { POST } = load("app/api/auth/register/route.ts");
  assert.equal(createClientCalls, 0);

  const response = await POST({
    async json() {
      return {
        email: "user@example.test",
        password: "password-valid",
        nama: "User Test",
      };
    },
  });

  assert.equal(response.status, 503);
  assert.deepEqual(JSON.parse(await response.text()), {
    error: "Layanan pendaftaran belum dikonfigurasi",
  });
  assert.equal(createClientCalls, 0);
});
