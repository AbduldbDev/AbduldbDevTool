import { reactive, watch } from "vue";

const STORAGE_KEYS = {
  projects: "abduldbdev_projects",
  tools: "abduldbdev_tools",
  rootFolders: "abduldbdev_root_folders",
};

export const STATUS_OPTIONS = ["Active", "In Progress", "On Hold", "Completed", "Archived"];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage`, err);
    return fallback;
  }
}

// Singleton reactive state shared across every component that calls useStore().
const state = reactive({
  projects: load(STORAGE_KEYS.projects, []),
  tools: load(STORAGE_KEYS.tools, []),
  rootFolders: load(STORAGE_KEYS.rootFolders, []),
});

watch(
  () => state.projects,
  (val) => localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(val)),
  { deep: true }
);

watch(
  () => state.tools,
  (val) => localStorage.setItem(STORAGE_KEYS.tools, JSON.stringify(val)),
  { deep: true }
);

watch(
  () => state.rootFolders,
  (val) => localStorage.setItem(STORAGE_KEYS.rootFolders, JSON.stringify(val)),
  { deep: true }
);

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useStore() {
  // ---- Projects ----
  function addProject({ name, path, image = null, status = "Active", source = null }) {
    state.projects.unshift({
      id: uid(),
      name,
      path,
      image,
      status,
      source,
      createdAt: new Date().toISOString(),
    });
  }

  function updateProjectStatus(id, status) {
    const project = state.projects.find((p) => p.id === id);
    if (project) project.status = status;
  }

  function updateProject(id, patch) {
    const project = state.projects.find((p) => p.id === id);
    if (project) Object.assign(project, patch);
  }

  function deleteProject(id) {
    const idx = state.projects.findIndex((p) => p.id === id);
    if (idx !== -1) state.projects.splice(idx, 1);
  }

  // ---- Tools ----
  function addTool({ name, exePath, icon = null }) {
    state.tools.push({ id: uid(), name, exePath, icon });
  }

  function updateTool(id, patch) {
    const tool = state.tools.find((t) => t.id === id);
    if (tool) Object.assign(tool, patch);
  }

  function deleteTool(id) {
    const idx = state.tools.findIndex((t) => t.id === id);
    if (idx !== -1) state.tools.splice(idx, 1);
  }

  // ---- Root project folders ----
  function addRootFolder(path) {
    if (state.rootFolders.some((r) => r.path === path)) return null;
    const folder = { id: uid(), path };
    state.rootFolders.push(folder);
    return folder;
  }

  function removeRootFolder(id) {
    const idx = state.rootFolders.findIndex((r) => r.id === id);
    if (idx !== -1) state.rootFolders.splice(idx, 1);
  }

  return {
    state,
    addProject,
    updateProjectStatus,
    updateProject,
    deleteProject,
    addTool,
    updateTool,
    deleteTool,
    addRootFolder,
    removeRootFolder,
  };
}
