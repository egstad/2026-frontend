<script setup lang="ts">
import type { PortableTextBlock, PortableTextMarkDef } from "~/types/sanity";

const props = defineProps<{
  block: PortableTextBlock;
  font?: "sans" | "times-seven" | "times-ten";
}>();

const styleMap: Record<string, { element: string; size: string }> = {
  normal: { element: "p", size: "body-2" },
  h2: { element: "h2", size: "headline-2" },
  h3: { element: "h3", size: "caption-1" },
  blockquote: { element: "blockquote", size: "body-2" },
};

const resolved = computed(
  () => styleMap[props.block.style ?? "normal"] ?? styleMap.normal,
);
</script>

<template>
  <!-- List item — parent handles ul/ol wrapper -->
  <Text v-if="block.listItem" is="li" :size="resolved.size" :font="font">
    <PortableTextSpan
      v-for="child in block.children"
      :key="child._key"
      :span="child"
      :markDefs="block.markDefs"
      :size="resolved.size"
    />
  </Text>

  <!-- Blockquote — rendered directly; <component :is="'blockquote'"> via Text doesn't resolve correctly -->
  <blockquote
    v-else-if="block.style === 'blockquote'"
    :class="`t-${resolved.size}`"
  >
    <PortableTextSpan
      v-for="child in block.children"
      :key="child._key"
      :span="child"
      :markDefs="block.markDefs"
      :size="resolved.size"
    />
  </blockquote>

  <!-- Regular block -->
  <Text v-else :is="resolved.element" :size="resolved.size" :font="font">
    <PortableTextSpan
      v-for="child in block.children"
      :key="child._key"
      :span="child"
      :markDefs="block.markDefs"
      :size="resolved.size"
    />
  </Text>
</template>
