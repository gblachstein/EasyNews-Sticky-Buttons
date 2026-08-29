# Easy NZB Button (VS Code Workspace)

This folder contains a ready-to-open **VS Code workspace** for developing and testing your Chrome/Edge extension.

## Open in VS Code
1. Install **Visual Studio Code**.
2. Double-click `EasyNZBButton.code-workspace` (or open it from VS Code: File → Open Workspace).
3. Edit `manifest.json`, `content.js`, and `content.css` as needed.

## Test in Chrome/Edge
1. Go to `chrome://extensions` (or `edge://extensions` in Edge).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the `EasyNZBButton` folder (the same folder that contains `manifest.json`).
4. After edits, click **Reload** on the extension card, then refresh your target site.

## Configure
- Replace `https://example.com/*` in **both** `matches` and `host_permissions` in `manifest.json` with your real site(s).
- If the default selector doesn't catch the NZB button, let me know the site's CSS selector or HTML snippet and I'll update `content.js` for you.

## Optional: Recommended VS Code extensions
- ESLint
- Prettier
- JSON Tools
- Path Intellisense

Enjoy!