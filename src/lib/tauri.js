import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile, readDir } from "@tauri-apps/plugin-fs";

/** Open a native "select folder" dialog. Returns the chosen path or null. */
export async function pickFolder() {
  const result = await open({ directory: true, multiple: false });
  return typeof result === "string" ? result : null;
}

/** Open a native "select image" dialog. Returns the chosen path or null. */
export async function pickImage() {
  const result = await open({
    multiple: false,
    filters: [
      {
        name: "Image",
        extensions: ["png", "jpg", "jpeg", "webp", "gif", "ico"],
      },
    ],
  });
  return typeof result === "string" ? result : null;
}

/** Open a native "select executable" dialog. Returns the chosen path or null. */
export async function pickExecutable() {
  const filters = navigator.platform.toLowerCase().includes("win")
    ? [{ name: "Executable", extensions: ["exe", "bat", "cmd"] }]
    : [{ name: "Executable", extensions: ["*"] }];
  const result = await open({ multiple: false, filters });
  return typeof result === "string" ? result : null;
}

function guessMime(path) {
  const ext = path.split(".").pop().toLowerCase();
  const map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    ico: "image/x-icon",
  };
  return map[ext] || "image/png";
}

/** Reads a local file from disk and returns it as a base64 data URL, so it can be safely
 * persisted in localStorage (Tauri's asset protocol paths are not stable identifiers). */
export async function fileToDataUrl(path) {
  const bytes = await readFile(path);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:${guessMime(path)};base64,${base64}`;
}

/** Launches VS Code (`code`) pointed at the given project folder. */
export async function openInVSCode(path) {
  return invoke("open_in_vscode", { path });
}

/** Opens a terminal (with Git CLI available on PATH) inside the given directory. */
export async function openGitCli(path) {
  return invoke("open_git_cli", { path });
}

/** Launches an arbitrary tool executable, optionally inside a working directory. */
export async function openTool(exePath, cwd = null) {
  return invoke("open_tool", { exePath, cwd });
}

/** Joins a folder name onto a base path, matching the base path's separator style. */
function joinPath(base, name) {
  const sep = base.includes("\\") && !base.includes("/") ? "\\" : "/";
  const trimmed =
    base.endsWith("/") || base.endsWith("\\") ? base.slice(0, -1) : base;
  return `${trimmed}${sep}${name}`;
}

/** Lists the immediate subfolders of `rootPath`, e.g. every project folder inside
 * a "Projects" directory. Returns [{ name, path }, ...] sorted by name. */
export async function listSubfolders(rootPath) {
  const entries = await readDir(rootPath);
  return entries
    .filter((entry) => entry.isDirectory)
    .map((entry) => ({
      name: entry.name,
      path: joinPath(rootPath, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
