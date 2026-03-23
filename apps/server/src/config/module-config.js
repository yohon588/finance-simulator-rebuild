import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(currentDir, "../../../../data/module-config.example.json");

export function loadModuleConfig() {
  const raw = fs.readFileSync(configPath, "utf8");
  return JSON.parse(raw);
}
