<script setup>
import { computed } from "vue";
import {
  FolderGit2,
  FolderCode,
  Trash2,
  Folder,
  Pencil,
} from "lucide-vue-next";
import { STATUS_OPTIONS } from "../store/useStore.js";

const props = defineProps({
  project: { type: Object, required: true },
});

const emit = defineEmits([
  "open-vscode",
  "open-git",
  "delete",
  "status-change",
  "edit",
]);

const statusColors = {
  Active: "var(--accent-green)",
  "In Progress": "var(--accent-cyan)",
  "On Hold": "var(--accent-blue)",
  Completed: "var(--text-secondary)",
  Archived: "var(--text-faint)",
};

const accent = computed(
  () => statusColors[props.project.status] || "var(--text-faint)",
);
</script>

<template>
  <article class="card" :style="{ '--accent': accent }">
    <div class="thumb">
      <img v-if="project.image" :src="project.image" alt="" />
      <div v-else class="thumb-placeholder">
        <Folder :size="26" />
      </div>
    </div>

    <div class="body">
      <h3 class="name" :title="project.name">{{ project.name }}</h3>
      <p class="path mono" :title="project.path">{{ project.path }}</p>
      <span
        class="status-badge"
        :style="{ borderColor: accent, color: accent }"
      >
        {{ project.status }}
      </span>
    </div>

    <div class="actions">
      <button
        class="icon-btn"
        title="Open in VS Code"
        @click="emit('open-vscode')"
      >
        <img src="../assets/vscode.svg" alt="VS Code" width="16" height="16" />
      </button>
      <button
        class="icon-btn"
        title="Open Git CLI here"
        @click="emit('open-git')"
      >
        <img src="../assets/git.svg" alt="Git" width="16" height="16" />
      </button>
      <button
        class="icon-btn danger delete"
        title="Delete project"
        @click="emit('delete')"
      >
        <Trash2 :size="16" />
      </button>
      <button class="icon-btn" title="Edit project" @click="emit('edit')">
        <Pencil :size="16" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-top: 2px solid var(--accent);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.status-badge {
  border: 1px solid;
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 800;
  width: fit-content;
}

.card:hover {
  border-color: var(--border-strong);
}

.thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-panel-raised);
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
}

.body {
  padding: 14px 14px 6px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name {
  font-size: 14.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path {
  font-size: 11.5px;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-select {
  padding: 6px 8px;
  font-size: 12px;
  border-color: var(--border);
  background: var(--bg-panel-raised);
  color: var(--accent);
  width: fit-content;
  max-width: 100%;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 12px 14px 14px 14px;
  margin-top: auto;
}

.delete {
  margin-left: auto;
}
</style>
