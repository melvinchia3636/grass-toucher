import * as vscode from "vscode";

export const LOCKDOWN_VIEW_TYPE = "grass-toucher.lockdownView";

export interface LockdownConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export function getConfig(): LockdownConfig {
  const config = vscode.workspace.getConfiguration("grass-toucher.lockdown");
  return {
    enabled: config.get<boolean>("enabled", true),
    startTime: config.get<string>("startTime", "19:00"),
    endTime: config.get<string>("endTime", "21:00"),
  };
}
