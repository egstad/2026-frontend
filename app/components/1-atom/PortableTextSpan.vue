<script setup lang="ts">
import type { PortableTextSpanNode, PortableTextMarkDef } from '~/types/sanity'

const props = defineProps<{
  span: PortableTextSpanNode
  markDefs?: PortableTextMarkDef[]
}>()

const linkDef = computed(() => {
  if (!props.span.marks?.length || !props.markDefs?.length) return null
  for (const key of props.span.marks) {
    const def = props.markDefs.find(d => d._key === key && d._type === 'link')
    if (def) return def
  }
  return null
})
</script>

<template>
  <template v-if="span._type === 'span'">
    <strong v-if="span.marks?.includes('strong')">{{ span.text }}</strong>
    <em v-else-if="span.marks?.includes('em')">{{ span.text }}</em>
    <code v-else-if="span.marks?.includes('code')">{{ span.text }}</code>
    <a v-else-if="linkDef" :href="linkDef.href" target="_blank" rel="noopener noreferrer">{{ span.text }}</a>
    <span v-else>{{ span.text }}</span>
  </template>
</template>
