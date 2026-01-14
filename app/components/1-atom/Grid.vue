<template>
  <component :is="is" class="grid">
    <slot></slot>
  </component>
</template>

<script setup>
const props = defineProps({
  is: {
    type: String,
    default: "div",
  },
});
</script>
