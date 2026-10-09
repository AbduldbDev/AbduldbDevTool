import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import {
  readBinaryFile,
  writeBinaryFile,
  createDir,
  readDir,
} from "@tauri-apps/api/fs";

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
  const result = await open({
    multiple: false,
    filters: navigator.platform.toLowerCase().includes("win")
      ? [{ name: "Executable", extensions: ["exe", "bat", "cmd"] }]
      : [],
  });
  return typeof result === "string" ? result : null;
}

/** Joins a name onto a base path, matching the base path's separator style. */
function joinPath(base, name) {
  const sep = base.includes("\\") && !base.includes("/") ? "\\" : "/";
  const trimmed =
    base.endsWith("/") || base.endsWith("\\") ? base.slice(0, -1) : base;
  return `${trimmed}${sep}${name}`;
}

/** Copies an image file into targetDir and returns the path of the copy. */
export async function copyImageToLocal(imagePath, targetDir) {
  const ext = (imagePath.split(".").pop() || "png").toLowerCase();
  const targetPath = joinPath(targetDir, `project_${Date.now()}.${ext}`);

  try {
    await createDir(targetDir, { recursive: true });
  } catch {
    // directory may already exist
  }

  const bytes = await readBinaryFile(imagePath);
  await writeBinaryFile(targetPath, bytes);
  return targetPath;
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
    svg: "image/svg+xml",
  };
  return map[ext] || "image/png";
}

/** Reads a local file from disk and returns it as a base64 data URL. */
export async function fileToDataUrl(path) {
  const bytes = await readBinaryFile(path);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return `data:${guessMime(path)};base64,${btoa(binary)}`;
}

/** Name the components import. Returns null if the image can't be read. */
export async function imagePathToDataUrl(path) {
  if (!path) return null;
  try {
    return await fileToDataUrl(path);
  } catch (err) {
    console.error("imagePathToDataUrl failed:", path, err);
    return null;
  }
}

/** Lists immediate subfolders of rootPath as [{ name, path }], sorted by name. */
// export async function listSubfolders(rootPath) {
//   const entries = await readDir(rootPath, { recursive: false });
//   return entries
//     .filter((e) => e.children !== undefined && e.children !== null) // dirs only
//     .map((e) => ({ name: e.name, path: e.path }))
//     .sort((a, b) => a.name.localeCompare(b.name));
// }

/** Launches VS Code pointed at the given project folder. */
export async function openInVSCode(path) {
  return invoke("open_in_vscode", { path });
}

/** Opens a terminal (with Git CLI on PATH) inside the given directory. */
export async function openGitCli(path) {
  return invoke("open_git_cli", { path });
}

/** Launches an arbitrary tool executable, optionally inside a working directory. */
export async function openTool(exePath, cwd = null) {
  return invoke("open_tool", { exePath, cwd });
}

export async function deleteProjectFolder(path) {
  return invoke("delete_project_folder", { path });
}

export async function openInExplorer(path) {
  return invoke("open_in_explorer", { path });
}

// async function readBinaryFile(path) {
//   const bytes = await invoke("read_binary_file", { path });
//   return new Uint8Array(bytes);
// }

export async function listSubfolders(rootPath) {
  return invoke("list_subfolders", { rootPath });
}
