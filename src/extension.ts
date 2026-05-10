import * as vscode from "vscode";
import { initDatabase, closeDatabase } from "./lib/history/database";
import { state } from "./lib/shared/state";
import {
  checkAndApplyLockdown,
  registerLockEnforcers,
} from "./lib/core/locker";
import { registerUnlockCommand } from "./lib/core/unlocker";
import { registerHistoryCommand } from "./lib/history/viewer";

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export async function activate(context: vscode.ExtensionContext) {
  try {
    console.log('Extension "grass-toucher" is now active!');
    await initDatabase(context);
  } catch (e) {
    console.error("[grass-toucher] Failed to initialize database:", e);
    return;
  }

  registerUnlockCommand(context);
  registerHistoryCommand(context);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("grass-toucher.lockdown")) {
        checkAndApplyLockdown();
      }
    }),
  );

  registerLockEnforcers(context);

  checkAndApplyLockdown();
  intervalHandle = setInterval(checkAndApplyLockdown, 30_000);

  context.subscriptions.push({
    dispose: () => {
      if (intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
      }
      if (state.currentPanel) {
        state.currentPanel.dispose();
        state.currentPanel = null;
      }
      closeDatabase();
    },
  });
}

export function deactivate() {}
