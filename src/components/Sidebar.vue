<script setup>
import { FolderKanban, Wrench, Boxes, Settings2 } from "lucide-vue-next";
import { useStore } from "../store/useStore.js";
import { openTool } from "../lib/tauri.js";

const props = defineProps({
  currentView: { type: String, required: true },
});
const emit = defineEmits(["navigate"]);

const { state } = useStore();

async function launchTool(tool) {
  try {
    await openTool(tool.exePath);
  } catch (err) {
    console.error(err);
    alert(
      `Couldn't launch "${tool.name}". Check its .exe path in the Tools tab.`,
    );
  }
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark"><img src="../assets/AbduldbDevWhite.png" /></div>
      <div class="brand-text">
        <h1>AbduldbDev</h1>
        <span>Project Manager</span>
      </div>
    </div>

    <nav class="nav">
      <button
        class="nav-item"
        :class="{ active: currentView === 'projects' }"
        @click="emit('navigate', 'projects')"
      >
        <FolderKanban :size="17" />
        <span>Projects</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: currentView === 'tools' }"
        @click="emit('navigate', 'tools')"
      >
        <Wrench :size="17" />
        <span>Tools</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: currentView === 'settings' }"
        @click="emit('navigate', 'settings')"
      >
        <Settings2 :size="17" />
        <span>Settings</span>
      </button>
    </nav>

    <div class="divider"></div>

    <div class="tools-section">
      <div class="tools-heading">
        <Boxes :size="14" />
        <span>Your tools</span>
      </div>

      <div v-if="state.tools.length === 0" class="tools-empty">
        No tools added yet. Add one from the Tools tab.
      </div>

      <button
        v-for="tool in state.tools"
        :key="tool.id"
        class="tool-item"
        :title="tool.exePath"
        @click="launchTool(tool)"
      >
        <span class="tool-icon">
          <img v-if="tool.icon" :src="tool.icon" alt="" />
          <Wrench v-else :size="14" />
        </span>
        <span class="tool-name">{{ tool.name }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 232px;
  min-width: 232px;
  height: 100%;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 20px 6px;
}

.brand-mark img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: contain;
}

.brand-text h1 {
  font-size: 14.5px;
  line-height: 1.2;
}

.brand-text span {
  font-size: 11.5px;
  color: var(--text-faint);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
  text-align: left;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(173, 198, 255, 0.1);
  color: var(--accent-blue);
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 18px 4px;
}

.tools-section {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tools-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-faint);
  font-size: 11.5px;
  padding: 0 10px 8px 10px;
}

.tools-empty {
  font-size: 12px;
  color: var(--text-faint);
  padding: 4px 10px 8px 10px;
  line-height: 1.5;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  text-align: left;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.tool-item:hover {
  background: var(--bg-hover);
  color: var(--accent-cyan);
}

.tool-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--bg-panel-raised);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
