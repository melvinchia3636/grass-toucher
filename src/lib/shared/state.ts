import * as vscode from "vscode";


function createState<T extends Record<string, unknown>>(
  defaults: T,
): { [K in keyof T]: T[K] } {
  const store = { ...defaults };
  return new Proxy(store, {
    get(target, key) {
      return target[key as keyof typeof target];
    },
    set(target, key, value) {
      target[key as keyof typeof target] = value as any;
      return true;
    },
  }) as any;
}

export const state = createState({
  // Whether the workspace is currently in lockdown.
  // Set by enterLockdown, cleared by exitLockdown and handleUnlockFlow.
  isLocked: false,

  // Set by handleUnlockFlow after successful unlock.
  // Checked by checkAndApplyLockdown to skip re-entering lockdown for the session.
  isUnlockedForSession: false,

  // The currently active webview panel (lockdown grass screen, unlock form, or history).
  // Used by locker.ts to enforce lockdown, by unlocker.ts to dismiss and restore.
  currentPanel: null as vscode.WebviewPanel | null,

  // Prevents enterLockdown's onDidDispose callback from re-creating the grass panel
  // while handleUnlockFlow is running. Set true before disposing, restored to false after.
  suspendReentry: false,
});
