import { listSubfolders } from "./tauri.js";
import { useStore } from "../store/useStore.js";

/** Scans one root folder and adds a project card for every subfolder not already tracked
 * (matched by path). Returns how many new project cards were created. */
export async function syncRootFolder(root) {
  const { state, addProject } = useStore();
  const subfolders = await listSubfolders(root.path);
  const existingPaths = new Set(state.projects.map((p) => p.path));

  let added = 0;
  for (const folder of subfolders) {
    if (!existingPaths.has(folder.path)) {
      addProject({ name: folder.name, path: folder.path, status: "Active", source: root.id });
      added += 1;
    }
  }
  return added;
}

/** Syncs every registered root folder. Folders that fail to read (e.g. moved/deleted)
 * are skipped and reported back rather than throwing. */
export async function syncAllRootFolders() {
  const { state } = useStore();
  let added = 0;
  const failed = [];

  for (const root of state.rootFolders) {
    try {
      added += await syncRootFolder(root);
    } catch (err) {
      console.error(`Failed to sync root folder ${root.path}`, err);
      failed.push(root);
    }
  }
  return { added, failed };
}
