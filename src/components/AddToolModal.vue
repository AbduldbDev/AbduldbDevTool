<script setup>
import { ref } from "vue";
import { ImagePlus, FolderOpen, Wrench } from "lucide-vue-next";
import { pickImage, pickExecutable, fileToDataUrl } from "../lib/tauri.js";

const props = defineProps({
  tool: { type: Object, default: null }, // when set, we're editing
});
const emit = defineEmits(["close", "save"]);

const name = ref(props.tool?.name || "");
const exePath = ref(props.tool?.exePath || "");
const icon = ref(props.tool?.icon || null);
const busy = ref(false);
const error = ref("");

async function chooseIcon() {
  const chosen = await pickImage();
  if (chosen) {
    try {
      busy.value = true;
      icon.value = await fileToDataUrl(chosen);
    } catch (err) {
      console.error(err);
      error.value = "Couldn't read that icon image.";
    } finally {
      busy.value = false;
    }
  }
}

async function chooseExe() {
  const chosen = await pickExecutable();
  if (chosen) {
    exePath.value = chosen;
    if (!name.value) {
      const base = chosen.split(/[\\/]/).pop();
      name.value = base.replace(/\.(exe|bat|cmd)$/i, "");
    }
  }
}

function save() {
  error.value = "";
  if (!name.value.trim()) {
    error.value = "Give the tool a name.";
    return;
  }
  if (!exePath.value.trim()) {
    error.value = "Choose the tool's .exe path.";
    return;
  }
  emit("save", { name: name.value.trim(), exePath: exePath.value.trim(), icon: icon.value });
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="emit('close')">
    <div class="modal-panel">
      <h2 class="modal-title">{{ tool ? "Edit tool" : "Add tool" }}</h2>
      <p class="modal-subtitle">Tools you add here also show up in the sidebar for quick launch.</p>

      <div class="field">
        <label>Icon (optional)</label>
        <div class="icon-row">
          <div class="icon-preview">
            <img v-if="icon" :src="icon" alt="" />
            <Wrench v-else :size="18" />
          </div>
          <button class="btn" @click="chooseIcon" :disabled="busy">
            <ImagePlus :size="15" />
            <span>Choose icon…</span>
          </button>
        </div>
      </div>

      <div class="field">
        <label>Name</label>
        <input v-model="name" type="text" placeholder="Git Bash" />
      </div>

      <div class="field">
        <label>Executable path</label>
        <button class="btn path-btn" @click="chooseExe">
          <FolderOpen :size="15" />
          <span class="mono">{{ exePath || "Choose .exe…" }}</span>
        </button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="save">{{ tool ? "Save changes" : "Add tool" }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-preview {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--bg-panel-raised);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  overflow: hidden;
  flex-shrink: 0;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.path-btn {
  width: 100%;
  justify-content: flex-start;
  overflow: hidden;
}

.path-btn span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error {
  color: var(--danger);
  font-size: 12.5px;
  margin-top: -4px;
  margin-bottom: 8px;
}
</style>
