import * as vscode from "vscode";
import { state } from "../shared/state";
import { saveUnlockReason } from "../history/database";
import { getConfig, LOCKDOWN_VIEW_TYPE } from "../shared/config";
import { loadHtml } from "../shared/html";

function showLockdownPanel() {
  const config = getConfig();
  const lp = vscode.window.createWebviewPanel(
    LOCKDOWN_VIEW_TYPE,
    "Touch Grass",
    vscode.ViewColumn.One,
    { enableScripts: false, retainContextWhenHidden: true },
  );
  lp.webview.html = loadHtml("lockdown.html", config.endTime);
  state.currentPanel = lp;
}

function dismissGrassPanel() {
  state.suspendReentry = true;
  if (state.currentPanel) {
    state.currentPanel.dispose();
    state.currentPanel = null;
  }
  state.suspendReentry = false;
}

function createUnlockPanel(config: ReturnType<typeof getConfig>) {
  const panel = vscode.window.createWebviewPanel(
    LOCKDOWN_VIEW_TYPE + ".unlock",
    "Unlock Workspace",
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true },
  );
  panel.webview.html = loadHtml("unlock.html", config.endTime);
  return panel;
}

function waitForReason(panel: vscode.WebviewPanel): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const disposable = panel.webview.onDidReceiveMessage((msg) => {
      if (msg.command === "unlockReason") {
        disposable.dispose();
        resolve(msg.reason);
      }
    });
    panel.onDidDispose(() => {
      disposable.dispose();
      resolve(null);
    });
  });
}

async function confirmUnlock(): Promise<boolean> {
  for (let i = 1; i <= 3; i++) {
    const result = await vscode.window.showInformationMessage(
      `Are you sure you want to unlock? This is reminder #${i}/3.`,
      { modal: true },
      "Yes, I'm sure",
    );
    if (result !== "Yes, I'm sure") {
      return false;
    }
  }
  return true;
}

export async function handleUnlockFlow(): Promise<void> {
  if (!state.isLocked) {
    vscode.window.showWarningMessage("Workspace is not currently locked.");
    return;
  }

  dismissGrassPanel();

  const config = getConfig();
  const panel = createUnlockPanel(config);

  const reason = await waitForReason(panel);
  panel.dispose();

  if (!reason) {
    if (state.isLocked) {
      showLockdownPanel();
    }
    return;
  }

  saveUnlockReason(reason);

  if (!(await confirmUnlock())) {
    if (state.isLocked) {
      showLockdownPanel();
    }
    return;
  }

  state.isUnlockedForSession = true;
  state.isLocked = false;

  vscode.window.showInformationMessage(
    "Workspace unlocked until window is closed. Close and reopen VS Code to re-lock.",
  );
}

export function registerUnlockCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("grass-toucher.unlock", handleUnlockFlow),
  );
}
