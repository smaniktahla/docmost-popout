const $ = (id) => document.getElementById(id);
const status = (t) => ($("status").textContent = t);

(async () => {
  const c = await browser.storage.sync.get({ baseUrl: "", title: "", width: 900, height: 800 });
  $("baseUrl").value = c.baseUrl;
  $("title").value = c.title;
  $("width").value = c.width;
  $("height").value = c.height;
})();

$("save").onclick = async () => {
  const baseUrl = $("baseUrl").value.trim();
  let origin;
  try { origin = new URL(baseUrl).origin; } catch { origin = ""; }
  if (!/^https?:\/\//.test(baseUrl) || !origin) return status("Enter the full Docmost URL, including http:// or https://");
  // Must be the first await so it counts as a user gesture. Grants access to this one origin only.
  const granted = await browser.permissions.request({ origins: [origin + "/*"] });
  if (!granted) return status("Permission to access " + origin + " was denied; the extension can't work without it.");
  await browser.storage.sync.set({
    configured: true,
    baseUrl,
    title: $("title").value,
    width: +$("width").value || 900,
    height: +$("height").value || 800,
  });
  status("Saved. Click the toolbar button to create a note.");
};
