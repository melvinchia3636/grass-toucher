<center><h1 align="center">🌿 Grass Toucher</h1></center>

<p align="center">A VS Code extension that forces you to leave your workspace alone and go touch some grass. No excuses, no bypass — just go outside.</p>

> [!NOTE]
> **On Supervised Vibe Coding**
> This project is built using supervised vibe coding: where intuition drives exploration, and discipline shapes what stays.

## 🤔 The Problem

It's 11 PM. You've been "fixing one more bug" for the last four hours. Your eyes are dry, your neck hurts, and your dinner went cold two hours ago. You know you should stop, but there's always one more thing. The problem isn't that you don't know when to stop — it's that your tools don't stop you.

## ✅ The Solution

A VS Code extension that locks your entire workspace during a configured time window. No alerts you can dismiss, no snooze buttons — the editor is gone, replaced by a green screen reminding you to go outside. You can unlock, but only after writing down your reason (logged to a local SQLite database) and confirming three times that you really mean it.

## ✨ Features

- **Time-Based Workspace Lockdown** — Configure a start and end time; during that window, your editors, sidebar, and panels are replaced with a full-screen grass reminder
- **Unlock with Accountability** — Submit your reason (saved to a local database), then confirm three times before the workspace unlocks
- **Unlock History** — Browse all past unlock reasons with timestamps and workspace paths
- **Cross-Midnight Support** — Lockdown windows that cross midnight (e.g. 22:00–06:00) work correctly
- **Theme-Aware** — Uses VS Code's theme colors (background, foreground, buttons, inputs) so it blends in naturally
- **Session-Based Unlock** — Once unlocked, stays unlocked until you close VS Code; reopening within the lockdown window re-locks automatically

## 🖥 Screenshots

*(Screenshots coming soon)*

## 🔬 Technologies Used

![skills](https://img.shields.io/badge/-TYPESCRIPT-FF0000?style=for-the-badge&logo=typescript&logoColor=white&color=blue)
![skills](https://img.shields.io/badge/-VSCODE-FF0000?style=for-the-badge&logo=visualstudiocode&logoColor=white&color=007ACC)
![skills](https://img.shields.io/badge/-SQL.JS-FF0000?style=for-the-badge&logo=sqlite&logoColor=white&color=003B57)
![skills](https://img.shields.io/badge/-DAY.JS-FF0000?style=for-the-badge&logo=javascript&logoColor=white&color=FFC933)

**Runtime:** TypeScript, VS Code Extension API, sql.js (SQLite via WebAssembly), dayjs  
**Build:** esbuild, pnpm

## ⌨️ Setup

### Install from VSIX

```bash
vsce package --no-dependencies --allow-missing-repository
code --install-extension grass-toucher-0.0.1.vsix
```

### Development

```bash
git clone <repo>
cd grass-toucher
pnpm install
pnpm run compile
```

Press `F5` in VS Code to launch an Extension Development Host.

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `grass-toucher.lockdown.enabled` | `true` | Enable workspace lockdown |
| `grass-toucher.lockdown.startTime` | `19:00` | Lockdown start time (24h) |
| `grass-toucher.lockdown.endTime` | `21:00` | Lockdown end time (24h) |

### Commands

| Command | Description |
|---------|-------------|
| `I need to work — Unlock Workspace` | Unlock the workspace during lockdown |
| `View Unlock History` | Browse all past unlock reasons |

## 📁 Project Structure

```
src/
├── extension.ts              # Extension entry point (activate/deactivate)
├── html/                     # Webview HTML templates
│   ├── lockdown.html         # Full-screen grass reminder
│   ├── unlock.html           # Unlock reason form
│   └── history.html          # Unlock history table
└── lib/
    ├── state.ts              # Shared mutable state + createState helper
    ├── scheduler.ts          # Time-window checking logic (dayjs)
    ├── lockdown/
    │   ├── index.ts          # checkAndApplyLockdown function
    │   ├── locker.ts         # enterLockdown, exitLockdown, enforceLockdown
    │   └── unlocker.ts       # Unlock flow (reason prompt + 3 confirmations)
    ├── commands/
    │   ├── index.ts          # registerAllCommands
    │   ├── unlock.ts         # Unlock command registration
    │   └── history.ts        # History command + webview
    └── history/
        ├── index.ts          # History module
        └── database.ts       # SQLite database (sql.js)
```

## 🔌 API

This is a VS Code extension — no external API. All data is stored locally via sql.js in VS Code's global storage directory.

### Unlock Log Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-incrementing primary key |
| `timestamp` | TEXT | ISO 8601 timestamp |
| `workspace` | TEXT | Workspace folder path (or empty) |
| `reason` | TEXT | User-submitted unlock reason |

## 📈 Status

All core functionality is complete. The extension locks, unlocks with accountability logging, and persists unlock history. Bug reports and feature requests are welcome.

## 🙏 Credits

- **[OpenCode](https://opencode.ai)** — Assisted with construction of the extension architecture and implementation
- **sql.js** — SQLite compiled to WebAssembly, enabling local persistence without native dependencies
- **dayjs** — Lightweight date library for time-window calculations

## 📄 License

This project is licensed under the MIT License.
