<script setup>
import { ref } from "vue";
import { ArrowLeft, Plus, Pencil, Trash2, Wrench } from "lucide-vue-next";
import { useStore } from "../store/useStore.js";
import AddToolModal from "./AddToolModal.vue";
import DeleteConfirmModal from "./DeleteConfirmModal.vue";

const emit = defineEmits(["navigate"]);
const { state, addTool, updateTool, deleteTool } = useStore();

const showAddModal = ref(false);
const editingTool = ref(null);
const deletingTool = ref(null);

function openAdd() {
  editingTool.value = null;
  showAddModal.value = true;
}

function openEdit(tool) {
  editingTool.value = tool;
  showAddModal.value = true;
}

function handleSave(payload) {
  if (editingTool.value) {
    updateTool(editingTool.value.id, payload);
  } else {
    addTool(payload);
  }
  showAddModal.value = false;
  editingTool.value = null;
}

function confirmDelete(tool) {
  deletingTool.value = tool;
}

function onDeleted() {
  deleteTool(deletingTool.value.id);
  deletingTool.value = null;
}
</script>

<template>
  <section class="view">
    <header class="view-header">
      <button class="icon-btn back-btn" title="Back to projects" @click="emit('navigate', 'projects')">
        <ArrowLeft :size="16" />
      </button>
      <div class="titles">
        <h2>Tools</h2>
        <p>Register the apps you use so they're one click away from every project.</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <Plus :size="15" />
        <span>Add tool</span>
      </button>
    </header>

    <div v-if="state.tools.length === 0" class="empty">
      <Wrench :size="22" />
      <p>No tools yet. Add VS Code, Git Bash, XAMPP — whatever you open on every project.</p>
    </div>

    <ul v-else class="tool-list">
      <li v-for="tool in state.tools" :key="tool.id" class="tool-row">
        <div class="tool-icon">
          <img v-if="tool.icon" :src="tool.icon" alt="" />
          <Wrench v-else :size="16" />
        </div>
        <div class="tool-info">
          <span class="tool-name">{{ tool.name }}</span>
          <span class="tool-path mono">{{ tool.exePath }}</span>
        </div>
        <div class="tool-actions">
          <button class="icon-btn" title="Edit tool" @click="openEdit(tool)">
            <Pencil :size="15" />
          </button>
          <button class="icon-btn danger" title="Remove tool" @click="confirmDelete(tool)">
            <Trash2 :size="15" />
          </button>
        </div>
      </li>
    </ul>

    <AddToolModal
      v-if="showAddModal"
      :tool="editingTool"
      @close="showAddModal = false"
      @save="handleSave"
    />

    <DeleteConfirmModal
      v-if="deletingTool"
      :target-name="deletingTool.name"
      @cancel="deletingTool = null"
      @deleted="onDeleted"
    />
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
  margin-bottom: 24px;
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-faint);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  padding: 28px;
  max-width: 420px;
  font-size: 13px;
  line-height: 1.6;
}

.tool-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 640px;
}

.tool-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.tool-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--bg-panel-raised);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  overflow: hidden;
  flex-shrink: 0;
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 13.5px;
  font-weight: 500;
}

.tool-path {
  font-size: 11px;
  color: var(--text-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
