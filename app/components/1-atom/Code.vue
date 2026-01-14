<template>
  <div class="code-block t-caption-2">
    <ClientOnly>
      <div v-html="highlightedCode" class="code-content"></div>
      <template #fallback>
        <pre><code>{{ code }}</code></pre>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { codeToHtml } from "shiki";

interface Props {
  code: string;
  language?: string;
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: "javascript",
  theme: "github-dark",
});

const highlightedCode = ref("");

const highlightCode = async () => {
  try {
    const html = await codeToHtml(props.code, {
      lang: props.language,
      theme: props.theme,
    });
    highlightedCode.value = html;
  } catch (error) {
    console.error("Error highlighting code:", error);
    // Fallback to plain code
    highlightedCode.value = `<pre><code>${props.code}</code></pre>`;
  }
};

// Watch for prop changes
watch(() => [props.code, props.language, props.theme], highlightCode, {
  deep: true,
});

onMounted(() => {
  highlightCode();
});
</script>

<style lang="scss" scoped>
.code-block {
  margin: var(--grid-gap) 0;
  overflow: hidden;

  :deep(pre) {
    margin: 0;
    padding: var(--unit-small);
    overflow-x: auto;
    font-family: "Monaco", "Consolas", monospace;
    line-height: 1.5;

    code {
      font-family: inherit;
    }
  }

  // Fallback styles for non-highlighted code
  pre {
    color: var(--foreground-primary);
    margin: 0;
    padding: var(--unit-small);
    overflow-x: auto;
    font-family: "Monaco", "Consolas", monospace;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  :deep(.github-dark) {
    border-radius: var(--radii-tiny);
    // border: 1px solid var(--border-primary);
    // background-color: transparent !important;
    background-color: var(--background-secondary) !important;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
