const msg = (t) => (document.getElementById("msg").textContent = t);

document.getElementById("settings").onclick = () => {
  // Background opens the page so it still happens after this popup is destroyed.
  browser.runtime.sendMessage({ type: "openOptions" });
  window.close();
};

(async () => {
  const state = await browser.runtime.sendMessage({ type: "getState" });
  if (!state.configured) {
    browser.runtime.sendMessage({ type: "openOptions" });
    return window.close();
  }
  const title = document.getElementById("title");
  title.value = state.title || "";
  title.focus();
  // Firefox match patterns don't support ports, so ask for scheme + host only.
  const u = new URL(state.baseUrl);
  const origin = `${u.protocol}//${u.hostname}/*`;
  if (!(await browser.permissions.contains({ origins: [origin] }))) {
    msg("");
    const g = document.createElement("button");
    g.className = "space";
    g.textContent = "Allow access to " + new URL(state.baseUrl).host;
    g.onclick = async () => {
      if (await browser.permissions.request({ origins: [origin] })) window.close();
    };
    return document.getElementById("list").append(g);
  }
  msg("Loading spaces…");
  try {
    const spaces = await browser.runtime.sendMessage({ type: "listSpaces" });
    msg(spaces.length ? "" : "No spaces found.");
    const list = document.getElementById("list");
    for (const s of spaces) {
      const b = document.createElement("button");
      b.className = "space";
      b.textContent = s.name;
      b.onclick = async () => {
        const r = await browser.runtime.sendMessage({ type: "newNote", space: s, title: title.value });
        if (r.ok) window.close();
        else msg("Couldn't create note (" + r.error + "). Opened Docmost so you can sign in.");
      };
      list.append(b);
    }
  } catch (e) {
    msg("Couldn't load spaces (" + e.message + "). Sign in to Docmost, or check the URL in settings.");
  }
})();
