import * as vscode from "vscode";
import { getAllUnlockReasons } from "./database";
import { LOCKDOWN_VIEW_TYPE } from "../shared/config";
import { loadHtml } from "../shared/html";

async function handleHistory(): Promise<void> {
  const logs = getAllUnlockReasons();
  const panel = vscode.window.createWebviewPanel(
    LOCKDOWN_VIEW_TYPE + ".history",
    "Unlock History",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  panel.webview.html = loadHtml("history.html", "");

  panel.webview.onDidReceiveMessage((msg) => {
    if (msg.command === "getHistory") {
      panel.webview.postMessage({ command: "history", data: logs });
    }
  });
}

export function registerHistoryCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("grass-toucher.history", handleHistory),
  );
}
