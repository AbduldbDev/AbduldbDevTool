<script setup>
import { ref, onBeforeUnmount } from "vue";
import { TriangleAlert } from "lucide-vue-next";

const props = defineProps({
  targetName: { type: String, required: true },
});
const emit = defineEmits(["cancel", "deleted"]);

const stage = ref("confirm"); // 'confirm' | 'deleting'
const progress = ref(0);
let timer = null;

const DURATION_MS = 1600;
const STEP_MS = 40;

function startDeleting() {
  stage.value = "deleting";
  progress.value = 0;
  const increment = (100 * STEP_MS) / DURATION_MS;

  timer = setInterval(() => {
    progress.value = Math.min(100, progress.value + increment);
    if (progress.value >= 100) {
      clearInterval(timer);
      timer = null;
      emit("deleted");
    }
  }, STEP_MS);
}

function cancelDeleting() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  emit("cancel");
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="stage === 'confirm' && emit('cancel')">
    <div class="modal-panel">
      <template v-if="stage === 'confirm'">
        <div class="warn-icon">
          <TriangleAlert :size="18" />
        </div>
        <h2 class="modal-title">Delete "{{ targetName }}"?</h2>
        <p class="modal-subtitle">
          This removes it from your board. Your files on disk are not touched.
        </p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="emit('cancel')">Cancel</button>
          <button class="btn btn-danger" @click="startDeleting">Delete project</button>
        </div>
      </template>

      <template v-else>
        <h2 class="modal-title">Removing "{{ targetName }}"…</h2>
        <p class="modal-subtitle">You can cancel while this is in progress.</p>

        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-label">{{ Math.round(progress) }}%</p>

        <div class="modal-actions">
          <button class="btn btn-ghost" @click="cancelDeleting">Cancel</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.warn-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: rgba(255, 107, 107, 0.1);
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.progress-track {
  height: 8px;
  border-radius: 999px;
  background: var(--bg-panel-raised);
  border: 1px solid var(--border);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--danger));
  transition: width 0.04s linear;
}

.progress-label {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}
</style>
