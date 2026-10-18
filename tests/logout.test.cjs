/* eslint-disable @typescript-eslint/no-require-imports -- Node fixtures execute the original TypeScript components without a browser. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const jsx = (type, props) => ({ type, props });

function componentFixture(file, options = {}) {
  const calls = { success: [], error: [], info: [], push: [], replace: [], refresh: 0, signOut: 0 };
  const router = { push: (target) => calls.push.push(target), refresh: () => { calls.refresh++; } };
  const ui = new Proxy({}, { get: (_target, key) => String(key) });
  const query = {
    select() { return query; }, eq() { return query; },
    maybeSingle: async () => ({ data: options.profile ?? null, error: options.profileError ?? null }),
  };
  const supabase = {
    auth: {
      async signOut() {
        calls.signOut++;
        if (options.throws) throw new Error("Connection lost");
        return { error: options.error ?? null };
      },
      getUser: async () => ({ data: { user: { id: "owner" } } }),
    },
    from: () => query,
  };
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
      useEffect() {}, useCallback: (callback) => callback,
    },
    "next/navigation": { useRouter: () => router, usePathname: () => "/dashboard" },
    "@/lib/supabase-browser": { createSupabaseBrowserClient: () => supabase },
    "@/lib/utils": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    sonner: { toast: Object.fromEntries(["success", "error", "info"].map((kind) => [kind, (message) => calls[kind].push(message)])) },
  };
  const fixture = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, {
    module: fixture, exports: fixture.exports,
    window: { location: { replace: (target) => calls.replace.push(target) } },
    require(name) {
      if (Object.hasOwn(imports, name)) return imports[name];
      if (name.startsWith("@/components/") || ["lucide-react", "next/link", "next/image"].includes(name)) return ui;
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const Component = file.includes("Sidebar") ? fixture.exports.Sidebar : fixture.exports.default;
  return { calls, tree: Component({ isMinimized: false, onToggle() {} }) };
}

function children(node) {
  return [node?.props?.children].flat(2).filter((child) => child != null);
}
function includesText(node, text) {
  if (typeof node === "string") return node.includes(text);
  return children(node).some((child) => includesText(child, text));
}
function findButton(node, label) {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === "Button" && node.props.onClick && includesText(node, label)) return node;
  for (const child of children(node)) { const found = findButton(child, label); if (found) return found; }
}

for (const file of ["components/layout/Sidebar.tsx", "app/pending/page.tsx", "app/rejected/page.tsx"]) {
  test(`${file}: returned logout errors keep the current page and show no success`, async () => {
    const { tree, calls } = componentFixture(file, { error: { message: "Auth server unavailable" } });
    await findButton(tree, "Logout").props.onClick();
    assert.equal(calls.signOut, 1);
    assert.equal(calls.error.length, 1);
    assert.deepEqual(calls.success, []);
    assert.deepEqual(calls.push, []);
    assert.equal(calls.refresh, 0);
  });

  test(`${file}: thrown logout errors are handled without navigation`, async () => {
    const { tree, calls } = componentFixture(file, { throws: true });
    await findButton(tree, "Logout").props.onClick();
    assert.equal(calls.error.length, 1);
    assert.deepEqual(calls.success, []);
    assert.deepEqual(calls.push, []);
  });

  test(`${file}: successful logout navigates to login`, async () => {
    const { tree, calls } = componentFixture(file);
    await findButton(tree, "Logout").props.onClick();
    assert.equal(calls.signOut, 1);
    assert.deepEqual(calls.error, []);
    assert.equal(calls.success.length, 1);
    assert.deepEqual(calls.replace, ["/login"]);
    assert.deepEqual(calls.push, []);
    assert.equal(calls.refresh, 0);
  });
}

test("pending status lookup distinguishes unavailable queries from a missing profile", async () => {
  for (const [options, message] of [
    [{ profileError: { message: "Database unavailable" } }, "Gagal mengecek status. Coba lagi."],
    [{ profile: null }, "Profil tidak ditemukan"],
  ]) {
    const { tree, calls } = componentFixture("app/pending/page.tsx", options);
    await findButton(tree, "Cek Status").props.onClick();
    assert.deepEqual(calls.error, [message]);
    assert.deepEqual(calls.push, []);
  }
});

test("an approved pending account performs a fresh dashboard navigation", async () => {
  const { tree, calls } = componentFixture("app/pending/page.tsx", {
    profile: { status: "active" },
  });
  await findButton(tree, "Cek Status").props.onClick();
  assert.equal(calls.success.length, 1);
  assert.deepEqual(calls.replace, ["/dashboard"]);
  assert.deepEqual(calls.push, []);
});

test("a rejected pending account performs a fresh rejected-page navigation", async () => {
  const { tree, calls } = componentFixture("app/pending/page.tsx", {
    profile: { status: "rejected" },
  });
  await findButton(tree, "Cek Status").props.onClick();
  assert.equal(calls.error.length, 1);
  assert.deepEqual(calls.replace, ["/rejected"]);
  assert.deepEqual(calls.push, []);
});

test("a re-approved rejected account performs a fresh dashboard navigation", async () => {
  const { tree, calls } = componentFixture("app/rejected/page.tsx", {
    profile: { status: "active" },
  });
  await findButton(tree, "Cek Status").props.onClick();
  assert.equal(calls.success.length, 1);
  assert.deepEqual(calls.replace, ["/dashboard"]);
});

test("a rejected account moved back to pending opens the pending page", async () => {
  const { tree, calls } = componentFixture("app/rejected/page.tsx", {
    profile: { status: "pending" },
  });
  await findButton(tree, "Cek Status").props.onClick();
  assert.equal(calls.info.length, 1);
  assert.deepEqual(calls.replace, ["/pending"]);
});
