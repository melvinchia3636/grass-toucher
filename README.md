# grass-toucher

An extension that forces you to leave your workspace alone and go touch some grass.

Configures a daily lockdown window where the workspace is replaced with a gentle reminder to take a break. You can unlock by providing a reason, which gets logged to a local database.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `grass-toucher.lockdown.enabled` | `true` | Enable workspace lockdown |
| `grass-toucher.lockdown.startTime` | `19:00` | Lockdown start time (24h) |
| `grass-toucher.lockdown.endTime` | `21:00` | Lockdown end time (24h) |

## Commands

- `I need to work — Unlock Workspace` — Unlock the workspace during lockdown
- `View Unlock History` — Show a log of all unlock reasons
