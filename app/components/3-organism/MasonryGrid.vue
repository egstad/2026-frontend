<template>
  <div ref="containerEl" class="masonry" :style="cssVars">
    <div
      v-for="(item, i) in items"
      :key="item._id"
      class="masonry__item"
      :style="{ gridRowEnd: `span ${spans[i] ?? 50}` }"
    >
      <slot :item="item" :index="i" />
    </div>
  </div>
</template>

<script setup lang="ts">
// CSS grid masonry: grid-auto-rows + per-item span calculated from aspect ratio.
// Items flow left-to-right (row order) — no reordering as new items load.

const ROW_PX = 2  // matches grid-auto-rows
const GAP_PX = 2  // matches gap

interface MasonryItem {
  _id: string
  aspectRatio: number
}

const props = defineProps<{
  items: MasonryItem[]
  columns: number
}>()

const containerEl = ref<HTMLElement | null>(null)
const containerWidth = ref(0)

const colWidth = computed(() => {
  const w = containerWidth.value
  if (!w) return 200
  return (w - (props.columns - 1) * GAP_PX) / props.columns
})

// span = ceil((itemHeight + GAP) / (ROW + GAP))
// This ensures the item fits in its grid area with correct row gaps.
const spans = computed(() =>
  props.items.map((item) => {
    const h = colWidth.value / (item.aspectRatio || 1)
    return Math.ceil((h + GAP_PX) / (ROW_PX + GAP_PX))
  }),
)

const cssVars = computed(() => ({ "--masonry-cols": props.columns }))

onMounted(() => {
  if (!containerEl.value) return
  const ro = new ResizeObserver((entries) => {
    containerWidth.value = entries[0]?.contentRect.width ?? 0
  })
  ro.observe(containerEl.value)
  onUnmounted(() => ro.disconnect())
})
</script>

<style lang="scss" scoped>
.masonry {
  display: grid;
  grid-template-columns: repeat(var(--masonry-cols, 2), 1fr);
  grid-auto-rows: 2px;
  gap: 2px;
}

.masonry__item {
  overflow: hidden;

  // Force the slotted card to fill the computed grid area exactly
  :deep(.media-card) {
    display: block;
    width: 100%;
    height: 100%;
    aspect-ratio: unset;
    margin: 0;
    max-width: unset;
  }

  :deep(img),
  :deep(video) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
