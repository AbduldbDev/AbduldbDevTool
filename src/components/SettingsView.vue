<script setup>
import { ref } from "vue";
import { ArrowLeft, FolderPlus, RefreshCw, X, FolderTree } from "lucide-vue-next";
import { useStore } from "../store/useStore.js";
import { pickFolder } from "../lib/tauri.js";
import { syncRootFolder } from "../lib/projectSync.js";

const emit = defineEmits(["navigate"]);
const { state, addRootFolder, removeRootFolder } = useStore();

const syncing = ref(null); // id of the root folder currently syncing
const message = ref("");

async function handleAddFolder() {
  const chosen = await pickFolder();
  if (!chosen) return;

  const folder = addRootFolder(chosen);
  if (!folder) {
    message.value = "That folder is already registered.";
    return;
  }
  await handleSync(folder);
}

async function handleSync(root) {
  syncing.value = root.id;
  message.value = "";
  try {
    const added = await syncRootFolder(root);
    message.value =
      added > 0
        ? `Added ${added} project${added === 1 ? "" : "s"} from "${root.path}".`
        : `No new subfolders found in "${root.path}".`;
  } catch (err) {
    console.error(err);
    message.value = `Couldn't read "${root.path}". Make sure it still exists.`;
  } finally {
    syncing.value = null;
  }
}

function handleRemove(root) {
  removeRootFolder(root.id);
  message.value = "Folder removed from tracking. Project cards already created stay on your board.";
}
</script>

<template>
  <section class="view">
    <header class="view-header">
      <button class="icon-btn back-btn" title="Back to projects" @click="emit('navigate', 'projects')">
        <ArrowLeft :size="16" />
      </button>
      <div class="titles">
        <h2>Settings</h2>
        <p>Point at a projects folder and every folder inside it becomes a project card.</p>
      </div>
      <button class="btn btn-primary" @click="handleAddFolder">
        <FolderPlus :size="15" />
        <span>Add projects folder</span>
      </button>
    </header>

    <p v-if="message" class="message">{{ message }}</p>

    <div v-if="state.rootFolders.length === 0" class="empty">
      <FolderTree :size="22" />
      <p>
        No projects folders yet. Add one — like <span class="mono">E:\Projects</span> or
        <span class="mono">E:\Xampp\htdocs</span> — and each folder inside it will show up as its
        own project on the board.
      </p>
    </div>

    <ul v-else class="root-list">
      <li v-for="root in state.rootFolders" :key="root.id" class="root-row">
        <FolderTree :size="16" class="root-icon" />
        <span class="root-path mono" :title="root.path">{{ root.path }}</span>
        <div class="root-actions">
          <button
            class="icon-btn"
            title="Rescan for new folders"
            :disabled="syncing === root.id"
            @click="handleSync(root)"
          >
            <RefreshCw :size="15" :class="{ spinning: syncing === root.id }" />
          </button>
          <button class="icon-btn danger" title="Stop tracking this folder" @click="handleRemove(root)">
            <X :size="15" />
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.view {
  padding: 28px 32px;
  height: 100%;
  overflow-y: auto;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.back-btn {
  flex-shrink: 0;
}

.titles {
  flex: 1;
}

.titles h2 {
  font-size: 19px;
}

.titles p {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin-top: 3px;
}

.message {
  font-size: 12.5px;
  color: var(--accent-cyan);
  margin-bottom: 16px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-faint);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  padding: 28px;
  max-width: 480px;
  font-size: 13px;
  line-height: 1.6;
}

.root-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 640px;
}

.root-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.root-icon {
  color: var(--text-faint);
  flex-shrink: 0;
}

.root-path {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.root-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.spinning {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
