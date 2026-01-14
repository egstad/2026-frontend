<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label t-micro-1 mb-tiny">{{
      label
    }}</label>
    <div class="input-group" :class="size">
      <input
        ref="inputRef"
        type="text"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        :class="[
          'input-base',
          inputClasses,
          { 'is-open': showResults && results.length > 0 },
        ]"
        @focus="showResults = true"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />
      <div class="icon-wrapper" @mousedown.prevent>
        <Iconography v-if="isLoading" name="loading" class="search-icon" />
        <Iconography
          v-else-if="modelValue"
          name="close"
          class="search-icon clear-icon"
          @click="clearInput"
        />
        <Iconography v-else name="search" class="search-icon" />
      </div>
      <div v-if="showResults && results.length > 0" class="dropdown">
        <div
          v-for="(result, index) in results"
          :key="result.value"
          class="option"
          :class="[
            inputClasses,
            { 'is-highlighted': index === highlightedIndex },
          ]"
          @mousedown="selectResult(result)"
        >
          {{ result.label }}
        </div>
      </div>
      <div
        v-else-if="showResults && searchQuery && !isLoading"
        class="no-results"
      >
        No results found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";

interface SearchResult {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string;
  placeholder?: string;
  label?: string;
  size?: "small" | "medium" | "large";
  results: SearchResult[];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Search...",
  size: "medium",
  results: () => [],
  isLoading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  search: [query: string];
  select: [result: SearchResult];
  clear: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const showResults = ref(false);
const searchQuery = ref(props.modelValue);
const highlightedIndex = ref(-1);

const inputClasses = computed(() => {
  switch (props.size) {
    case "small":
      return "input-small t-micro-1";
    case "large":
      return "input-large t-body-2";
    default:
      return "input-medium t-caption-2";
  }
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  emit("update:modelValue", target.value);
  emit("search", target.value);
  showResults.value = true;
  highlightedIndex.value = -1;
};

const handleBlur = () => {
  showResults.value = false;
  highlightedIndex.value = -1;
};

const selectResult = (result: SearchResult) => {
  searchQuery.value = result.label;
  emit("update:modelValue", result.label);
  emit("select", result);
  showResults.value = false;
  highlightedIndex.value = -1;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (!showResults.value || props.results.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        props.results.length - 1
      );
      // Scroll highlighted option into view
      nextTick(() => {
        const highlightedOption = document.querySelector(
          ".option.is-highlighted"
        );
        if (highlightedOption) {
          highlightedOption.scrollIntoView({ block: "nearest" });
        }
      });
      break;
    case "ArrowUp":
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      // Scroll highlighted option into view
      nextTick(() => {
        const highlightedOption = document.querySelector(
          ".option.is-highlighted"
        );
        if (highlightedOption) {
          highlightedOption.scrollIntoView({ block: "nearest" });
        }
      });
      break;
    case "Enter":
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectResult(props.results[highlightedIndex.value]);
      }
      break;
    case "Escape":
      event.preventDefault();
      showResults.value = false;
      highlightedIndex.value = -1;
      break;
  }
};

const clearInput = () => {
  searchQuery.value = "";
  emit("update:modelValue", "");
  emit("search", "");
  emit("clear");
  showResults.value = false;
  highlightedIndex.value = -1;
  if (inputRef.value) {
    inputRef.value.value = "";
  }
};
</script>

<style scoped>
.input-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: var(--unit-small) 0;
}

.input-label {
  margin-bottom: var(--unit-tiny);
}

.input-group {
  display: flex;
  position: relative;
}

.icon-wrapper {
  position: absolute;
  right: var(--unit-tiny);
  top: 50%;
  transform: translateY(-50%);
  color: var(--foreground-secondary);
  transition: color 150ms ease-out;
}

.search-icon {
  pointer-events: none;
}

.clear-icon {
  pointer-events: auto;
  cursor: pointer;
}

.input-base:hover + .icon-wrapper {
  color: var(--foreground-primary);
}

.input-base:focus + .icon-wrapper {
  color: var(--foreground-primary);
}

.input-base.is-open {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
