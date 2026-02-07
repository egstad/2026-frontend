<script setup lang="ts">
interface Span {
  _type: string
  _key?: string
  text?: string
  marks?: string[]
}

defineProps<{
  span: Span
}>()
</script>

<template>
  <template v-if="span._type === 'span'">
    <strong v-if="span.marks?.includes('strong')">{{ span.text }}</strong>
    <em v-else-if="span.marks?.includes('em')">{{ span.text }}</em>
    <code v-else-if="span.marks?.includes('code')">{{ span.text }}</code>
    <span v-else>{{ span.text }}</span>
  </template>
</template>
