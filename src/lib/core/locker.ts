import * as vscode from "vscode";
import { state } from "../shared/state";
import { getConfig, LOCKDOWN_VIEW_TYPE } from "../shared/config";
import { loadHtml } from "../shared/html";
import { isInLockdownWindow } from "./scheduler";

function enforceLockdown(): void {
  if (!state.isLocked || !state.currentPanel) {
    return;
  }

  void vscode.commands.executeCommand("workbench.action.closeAllEditors");
  void vscode.commands.executeCommand("workbench.action.closeSidebar");
  void vscode.commands.executeCommand("workbench.action.closePanel");
  void vscode.commands.executeCommand("workbench.action.closeAuxiliaryBar");
}

export function enterLockdown(): void {
  const config = getConfig();
  state.isLocked = true;
  state.isUnlockedForSession = false;

  if (state.currentPanel) {
    state.currentPanel.dispose();
  }

  const panel = vscode.window.createWebviewPanel(
    LOCKDOWN_VIEW_TYPE,
    "Touch Grass",
    vscode.ViewColumn.One,
    {
      enableScripts: false,
      retainContextWhenHidden: true,
    },
  );

  panel.webview.html = loadHtml("lockdown.html", config.endTime);
  enforceLockdown();

  panel.onDidDispose(() => {
    state.currentPanel = null;
    if (state.isLocked && !state.suspendReentry) {
      enterLockdown();
    }
  });

  state.currentPanel = panel;
}

export function exitLockdown(): void {
  state.isLocked = false;
  state.isUnlockedForSession = false;

  if (state.currentPanel) {
    state.currentPanel.dispose();
    state.currentPanel = null;
  }
}

export function registerLockEnforcers(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(() => {
      if (state.isLocked) {
        enforceLockdown();
      }
    }),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeWindowState(() => {
      if (state.isLocked) {
        enforceLockdown();
      }
    }),
  );
}

export function checkAndApplyLockdown(): void {
  const config = getConfig();

  if (!config.enabled) {
    exitLockdown();
    return;
  }

  const inWindow = isInLockdownWindow(config);

  if (inWindow) {
    enterLockdown();
  } else {
    exitLockdown();
  }
}
