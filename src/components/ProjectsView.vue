<script setup>
import { ref, computed } from "vue";
import { Plus, FolderKanban, Settings2, Search } from "lucide-vue-next";
import { useStore } from "../store/useStore.js";
import { openInVSCode, openGitCli } from "../lib/tauri.js";
import ProjectCard from "./ProjectCard.vue";
import AddProjectModal from "./AddProjectModal.vue";
import EditProjectModal from "./EditProjectModal.vue";
import DeleteConfirmModal from "./DeleteConfirmModal.vue";

const emit = defineEmits(["navigate"]);
const { state, addProject, updateProject, updateProjectStatus, deleteProject } =
  useStore();

const showAddModal = ref(false);
const editingProject = ref(null);
const deletingProject = ref(null);
const searchQuery = ref("");

const visibleProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const filtered = query
    ? state.projects.filter((p) => p.name.toLowerCase().includes(query))
    : state.projects;

  return [...filtered].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
});

function handleSave(payload) {
  addProject(payload);
  showAddModal.value = false;
}

function handleEditSave(payload) {
  updateProject(editingProject.value.id, payload);
  editingProject.value = null;
}

async function handleOpenVSCode(project) {
  try {
    await openInVSCode(project.path);
  } catch (err) {
    console.error(err);
    alert(
      `Couldn't open VS Code for "${project.name}". Make sure the "code" command is on your PATH.`,
    );
  }
}

async function handleOpenGit(project) {
  try {
    await openGitCli(project.path);
  } catch (err) {
    console.error(err);
    alert(`Couldn't open a terminal for "${project.name}".`);
  }
}

function confirmDelete(project) {
  deletingProject.value = project;
}

async function onDeleted() {
  try {
    await deleteProject(deletingProject.value.id);
  } catch (err) {
    console.error(err);
    alert(`Couldn't delete "${deletingProject.value.name}" from disk.`);
  } finally {
    deletingProject.value = null;
  }
}
</script>

<template>
  <section class="view">
    <header class="view-header">
      <div class="titles">
        <h2>Projects</h2>
        <p>Every workspace you're tracking, in one board.</p>
      </div>

      <div class="search-box">
        <Search :size="14" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects…"
        />
      </div>

      <button class="btn btn-primary" @click="showAddModal = true">
        <Plus :size="15" />
        <span>Add project</span>
      </button>
    </header>

    <div v-if="state.projects.length === 0" class="empty">
      <FolderKanban :size="22" />
      <p>
        No projects yet. Add one below, or track a projects folder in Settings
        so every folder inside it becomes a card automatically.
      </p>
      <button
        class="btn btn-ghost settings-link"
        @click="emit('navigate', 'settings')"
      >
        <Settings2 :size="14" />
        <span>Go to Settings</span>
      </button>
    </div>

    <div v-else-if="visibleProjects.length === 0" class="empty">
      <Search :size="22" />
      <p>No projects match "{{ searchQuery }}".</p>
    </div>

    <div v-else class="grid">
      <ProjectCard
        v-for="project in visibleProjects"
        :key="project.id"
        :project="project"
        @open-vscode="handleOpenVSCode(project)"
        @open-git="handleOpenGit(project)"
        @delete="confirmDelete(project)"
        @edit="editingProject = project"
        @status-change="(s) => updateProjectStatus(project.id, s)"
      />
    </div>

    <AddProjectModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @save="handleSave"
    />

    <EditProjectModal
      v-if="editingProject"
      :project="editingProject"
      @close="editingProject = null"
      @save="handleEditSave"
    />

    <DeleteConfirmModal
      v-if="deletingProject"
      :target-name="deletingProject.name"
      @cancel="deletingProject = null"
      @deleted="onDeleted"
    />
  </section>
</template>

<style scoped>
.view {
  padding: 0px 32px;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 50px;
}

.view-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--bg-app);
  padding-top: 28px;
  padding-bottom: 1px;
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

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 7px 10px;
  color: var(--text-faint);
  min-width: 220px;
}

.search-box input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-primary, inherit);
  flex: 1;
}

.search-box input::placeholder {
  color: var(--text-faint);
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.settings-link {
  padding: 6px 10px;
  margin-top: 2px;
}
</style>
