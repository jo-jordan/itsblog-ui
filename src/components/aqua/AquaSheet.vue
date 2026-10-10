<template>
  <transition name="aqua-sheet">
    <div v-if="open" class="aqua-sheet-backdrop" @keydown.esc="$emit('close')">
      <div class="aqua-sheet pinstripe" role="dialog" aria-modal="true" :aria-label="label" :style="{ width }">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
// A Mac OS X sheet: a dialog that slides down out of its window's title bar
// and blocks that window (only) until it is dismissed.
export default {
  name: 'AquaSheet',
  props: {
    open: { type: Boolean, default: false },
    label: { type: String, default: '' },
    width: { type: String, default: '520px' }
  },
  emits: ['close']
}
</script>

<style lang="scss">
.aqua-sheet-backdrop {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
}

.aqua-sheet {
  max-width: calc(100% - 24px);
  max-height: calc(100% - 12px);
  overflow: auto;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-top: 0;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5);
}

.aqua-sheet-enter-active,
.aqua-sheet-leave-active {
  transition: background 0.25s;

  .aqua-sheet {
    transition: transform 0.25s ease-out;
  }
}

.aqua-sheet-enter-from,
.aqua-sheet-leave-to {
  background: transparent;

  .aqua-sheet {
    transform: translateY(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .aqua-sheet-enter-active .aqua-sheet,
  .aqua-sheet-leave-active .aqua-sheet {
    transition: none;
  }
}
</style>
