# Quick Note for Docmost

A small Firefox extension that creates a new note in your self-hosted [Docmost](https://docmost.com) and opens it in a pop-out browser window. Unofficial; not affiliated with Docmost.

## Use
1. Install, then set your Docmost URL (e.g. `https://docmost.example.com`) on the settings page. Firefox will ask you to allow access to that one address.
2. Optionally set a default title (`{date}` is replaced with today's date) and the pop-out window size.
3. Click the toolbar button (or press `Alt+Shift+N`), type a title, and pick a space. The note is created and opens in a pop-out window.

To change settings later, click the toolbar button and choose **⚙ Settings** (or use `about:addons` → the extension → Preferences).

You must be signed in to Docmost in the same Firefox profile; the extension uses your existing session.

## Privacy
The extension talks only to the Docmost address you configure, using your existing login session. It collects no data, has no analytics, and sends nothing anywhere else. Settings are stored with `storage.sync` (synced by Firefox Sync if you use it).

## How it works
It calls Docmost's `POST /api/spaces` to list spaces and `POST /api/pages/create` to create the page, then opens `/s/<space-slug>/p/<slugId>` with `windows.create({type: "popup"})`. These are Docmost's internal web-app endpoints, not a documented public API, so a future Docmost release could break them.

## Develop
No build step. Load `manifest.json` via `about:debugging#/runtime/this-firefox`, or run `npx web-ext lint` / `npx web-ext build`.

## License
MIT
