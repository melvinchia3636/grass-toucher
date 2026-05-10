import * as fs from "fs";
import * as path from "path";

declare const HTML_DIR: string;

export function loadHtml(file: string, endTime: string): string {
  const filePath = path.join(HTML_DIR, file);
  let content = fs.readFileSync(filePath, "utf-8");
  content = content.replace("{{endTime}}", endTime);
  return content;
}
