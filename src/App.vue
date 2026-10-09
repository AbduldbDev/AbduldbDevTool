<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "./components/Sidebar.vue";
import ProjectsView from "./components/ProjectsView.vue";
import ToolsView from "./components/ToolsView.vue";
import SettingsView from "./components/SettingsView.vue";
import { syncAllRootFolders } from "./lib/projectSync.js";
import UpdateGate from "./components/UpdateGate.vue";

const currentView = ref("projects");

function navigate(view) {
  currentView.value = view;
}

// Pick up any folders that were created inside a tracked projects folder
// since the app was last opened.
onMounted(() => {
  syncAllRootFolders();
});
</script>

<template>
  <UpdateGate>
    <div class="shell">
      <Sidebar :current-view="currentView" @navigate="navigate" />
      <main class="content">
        <ProjectsView v-if="currentView === 'projects'" @navigate="navigate" />
        <ToolsView v-else-if="currentView === 'tools'" @navigate="navigate" />
        <SettingsView
          v-else-if="currentView === 'settings'"
          @navigate="navigate"
        />
      </main>
    </div>
  </UpdateGate>
</template>

<style scoped>
.shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--bg-app);
}

.content {
  flex: 1;
  min-width: 0;
  height: 100%;
}
</style>
