# Windows Auto-Installer, GitHub Auto-Updater & Free Multi-Host Plan

## 1. Windows 1-Command Auto-Installer (`$0`, Zero Electron Bloat)

Install SOCIALKILLER on any Windows 10/11 PC with a single PowerShell command (no 200MB Electron binary or paid code-signing certificate required):

```powershell
irm https://raw.githubusercontent.com/dr-week/SOCIALKILLER/main/launcher/windows/install.ps1 | iex
```

**What [`launcher/windows/install.ps1`](../../launcher/windows/install.ps1) does:**
1. Verifies/installs **Git** (`Git.Git`) and **Node.js LTS** (`OpenJS.NodeJS.LTS`) via native `winget`.
2. Clones (or fast-forwards) `dr-week/SOCIALKILLER` into `%LOCALAPPDATA%\SOCIALKILLER`.
3. Runs `npm ci --no-audit --no-fund`.
4. Creates **Desktop** and **Start Menu** shortcuts pointing to `Launch FoundryDesk.cmd` and launches the app immediately.

---

## 2. GitHub Auto-Updater (`scripts/updater/github-updater.mjs`)

Built-in zero-dependency self-updater comparing local `HEAD` against `https://api.github.com/repos/dr-week/SOCIALKILLER/commits/main`:

```sh
npm run update:check    # Non-destructive check returning JSON { localSha, remoteSha, updateAvailable }
npm run update:apply    # Safe fast-forward pull; aborts if dirty; runs npm ci only if package-lock.json changed
```

---

## 3. Free Multi-Host Distribution Matrix (`$0.00/month`)

| Host Surface | Primary Free Provider | Mirror / Fallback | Limits & Notes |
| :--- | :--- | :--- | :--- |
| **Web PWA & Status Portal** | **GitHub Pages** (`deploy-pages.yml`) | **Cloudflare Pages** (Unlimited bandwidth) | Live at `https://dr-week.github.io/SOCIALKILLER/` + offline `sw.js` |
| **Edge API Gateway** | **Cloudflare Workers** (`workers/api-gateway/`) | **Render / Fly.io** free container | `100,000 req/day`, `10ms` CPU/req, global edge CORS |
| **Cloud Database Sync** | **Cloudflare D1** (SQLite at Edge) | **Turso libSQL** (`9 GB`, `500 DBs`) | Optional backup; local SQLite WAL remains primary |
| **Media & Asset Storage** | **Cloudflare R2** (`10 GB`, `$0` egress) | Local `.data/media/` vault | Zero bandwidth egress fees |
| **Windows Desktop** | **PowerShell `install.ps1`** + `update:apply` | Portable ZIP from GitHub Releases | Zero packaging fees, instant Git fast-forward updates |
| **Android Mobile** | **Capacitor APK / AAB** (`Android Build Studio`) | Installed PWA (`Add to Home Screen`) | Local JDK/SDK fixed build commands |
| **Chrome Extension** | Unpacked `extension/` folder | `npm run package:extension` ZIP on Releases | Manifest V3, 8 clean department subfolders |
