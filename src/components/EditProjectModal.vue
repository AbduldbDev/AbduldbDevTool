<script setup>
import { ref } from "vue";
import { FolderOpen, ImagePlus, X } from "lucide-vue-next";
import {
  pickFolder,
  pickImage,
  copyImageToLocal,
  imagePathToDataUrl,
} from "../lib/tauri.js";
import { STATUS_OPTIONS } from "../store/useStore.js";

const props = defineProps({
  project: { type: Object, required: true },
});
const emit = defineEmits(["close", "save"]);

const name = ref(props.project.name);
const path = ref(props.project.path);
const status = ref(props.project.status);
const imageLocalPath = ref(props.project.image || null);
const busy = ref(false);
const error = ref("");
const imagePreview = ref(null);

async function choosePath() {
  const chosen = await pickFolder();
  if (chosen) path.value = chosen;
}

async function chooseImage() {
  const chosen = await pickImage();
  if (chosen) {
    try {
      busy.value = true;
      // Copy image to a local assets folder in the selected project path
      const assetsDir = `${path.value}\\assets`;
      const imagePath = await copyImageToLocal(chosen, assetsDir);
      imageLocalPath.value = imagePath;
      // Convert to base64 for display
      imagePreview.value = await imagePathToDataUrl(imagePath);
    } catch (err) {
      console.error(err);
      error.value = "Couldn't copy that image.";
    } finally {
      busy.value = false;
    }
  }
}

function removeImage() {
  imageLocalPath.value = null;
}

function save() {
  error.value = "";
  if (!name.value.trim()) {
    error.value = "Give the project a name.";
    return;
  }
  if (!path.value.trim()) {
    error.value = "Choose the project's folder.";
    return;
  }
  emit("save", {
    name: name.value.trim(),
    path: path.value.trim(),
    status: status.value,
    image: imageLocalPath.value,
  });
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="emit('close')">
    <div class="modal-panel">
      <h2 class="modal-title">Edit project</h2>
      <p class="modal-subtitle">
        Update its cover image, name, folder or status.
      </p>

      <div class="field">
        <label>Cover image</label>
        <div v-if="imagePreview" class="preview-wrap">
          <img :src="imagePreview" class="preview" alt="" />
          <button
            class="icon-btn danger remove-image"
            title="Remove image"
            @click="removeImage"
          >
            <X :size="14" />
          </button>
        </div>
        <button class="btn path-btn" @click="chooseImage" :disabled="busy">
          <ImagePlus :size="15" />
          <span>{{ imageLocalPath ? "Change image…" : "Choose image…" }}</span>
        </button>
      </div>

      <div class="field">
        <label>Project folder</label>
        <button class="btn path-btn" @click="choosePath">
          <FolderOpen :size="15" />
          <span class="mono">{{ path || "Choose folder…" }}</span>
        </button>
      </div>

      <div class="field">
        <label>Name</label>
        <input v-model="name" type="text" placeholder="My Project" />
      </div>

      <div class="field">
        <label>Status</label>
        <select v-model="status">
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn btn-ghost" @click="emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="save">Save changes</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.preview-wrap {
  position: relative;
  margin-bottom: 8px;
}

.preview {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  display: block;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
}

.error {
  color: var(--danger);
  font-size: 12.5px;
  margin-top: -4px;
  margin-bottom: 8px;
}
</style>
