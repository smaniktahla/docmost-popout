const DEFAULTS = { configured: false, baseUrl: "", title: "", width: 900, height: 800 };

async function getConfig() {
  return { ...DEFAULTS, ...(await browser.storage.sync.get(DEFAULTS)) };
}

async function api(base, path, body) {
  const res = await fetch(`${base}/api${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  const json = await res.json();
  return json.data ?? json;
}

const trim = (u) => u.replace(/\/+$/, "");
const popup = (url, cfg) =>
  browser.windows.create({ url, type: "popup", width: cfg.width, height: cfg.height });

async function listSpaces(baseUrl) {
  const data = await api(trim(baseUrl), "/spaces", { limit: 100 });
  return (data.items || []).map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
}

async function newNote(space, rawTitle) {
  const cfg = await getConfig();
  const base = trim(cfg.baseUrl);
  const title = (rawTitle || "").replace("{date}", new Date().toLocaleDateString()).trim();
  const page = await api(base, "/pages/create", { spaceId: space.id, ...(title ? { title } : {}) });
  await popup(`${base}/s/${space.slug}/p/${page.slugId}`, cfg);
}

// First run: open the settings page.
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener(async (msg) => {
  const cfg = await getConfig();
  switch (msg?.type) {
    case "openOptions":
      return browser.runtime.openOptionsPage();
    case "getState":
      return { configured: cfg.configured, baseUrl: cfg.baseUrl, title: cfg.title };
    case "listSpaces":
      return listSpaces(msg.baseUrl || cfg.baseUrl);
    case "newNote":
      try {
        await newNote(msg.space, msg.title);
        return { ok: true };
      } catch (e) {
        // Most likely not signed in: open Docmost so the user can log in.
        await popup(trim(cfg.baseUrl), cfg);
        return { ok: false, error: e.message };
      }
  }
});
