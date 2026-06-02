<script setup lang="ts">
import type { PortableTextSpanNode, PortableTextMarkDef } from "~/types/sanity";

const props = defineProps<{
  span: PortableTextSpanNode;
  markDefs?: PortableTextMarkDef[];
  size?: string;
}>();

const sizeClass = computed(() => `t-${props.size ?? 'body-2'}`);

function findMark(type: string) {
  if (!props.span.marks?.length || !props.markDefs?.length) return null;
  for (const key of props.span.marks) {
    const def = props.markDefs.find((d) => d._key === key && d._type === type);
    if (def) return def;
  }
  return null;
}

const linkDef = computed(() => {
  const def = findMark("link");
  return def?._type === "link" ? def : null;
});

const internalLinkDef = computed(() => {
  const def = findMark("internalLink");
  return def?._type === "internalLink" ? def : null;
});

function resolveInternalPath(ref: {
  _type: string;
  slug: { current: string };
}): string {
  switch (ref._type) {
    case "log":
      return `/logs/${ref.slug.current}`;
    case "artifact":
      return `/work/${ref.slug.current}`;
    case "page":
      return `/${ref.slug.current}`;
    default:
      return "/";
  }
}

// Escape HTML entities then convert soft returns (\n) to <br>
function renderText(text?: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}
</script>

<template>
  <template v-if="span._type === 'span'">
    <Text is="strong" :size="size" v-if="span.marks?.includes('strong')">
      <span v-html="renderText(span.text)" />
    </Text>
    <Text is="em" :size="size" v-else-if="span.marks?.includes('em')">
      <span v-html="renderText(span.text)" />
    </Text>
    <Text is="code" :size="size" v-else-if="span.marks?.includes('code')">
      <span v-html="renderText(span.text)" />
    </Text>
    <a v-else-if="linkDef" :class="sizeClass" :href="linkDef.href" target="_blank" rel="noopener noreferrer">
      <span v-html="renderText(span.text)" />
    </a>
    <NuxtLink v-else-if="internalLinkDef" :class="sizeClass" :to="resolveInternalPath(internalLinkDef.reference)">
      <span v-html="renderText(span.text)" />
    </NuxtLink>
    <Text is="span" :size="size" v-else>
      <span v-html="renderText(span.text)" />
    </Text>
  </template>
</template>
