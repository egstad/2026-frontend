<template>
  <div
    class="select-wrapper"
    :class="{ 'select-wrapper--text': variant === 'text' }"
  >
    <label
      v-if="label && variant === 'default'"
      :for="inputId"
      class="input-label pb-tinier"
    >
      <Text is="span" size="micro-1">{{ label }}</Text>
    </label>
    <div
      class="select-container"
      :class="{ 'is-open': isOpen && filteredOptions.length > 0 }"
    >
      <!-- Default variant: styled input -->
      <template v-if="variant === 'default'">
        <input
          :id="inputId"
          :value="selectedLabel"
          @focus="isOpen = true"
          @blur="handleBlur"
          @keydown="handleKeyDown"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          readonly
          :class="[
            'input-base',
            inputClasses,
            { 'is-open': isOpen && filteredOptions.length > 0 },
          ]"
        />
        <Iconography name="arrow" class="arrow-icon" />
      </template>

      <!-- Text variant: plain button trigger -->
      <button
        v-else
        class="text-trigger"
        @click="isOpen = !isOpen"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      >
        <span v-if="label" class="text-label">{{ label }}:</span>
        <span class="text-value">{{ selectedLabel }}</span>
      </button>

      <div
        v-show="isOpen && filteredOptions.length > 0"
        :class="['dropdown', { 'dropdown--text': variant === 'text', 'dropdown--right': variant === 'text' && dropdownAlign === 'right' }]"
      >
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          class="option"
          :class="[
            inputClasses,
            { 'is-selected': option.value === modelValue },
            { 'is-highlighted': index === highlightedIndex },
          ]"
          @mousedown="selectOption(option)"
        >
          {{ option.label }}
          <Iconography
            v-if="option.value === modelValue"
            name="check"
            class="check-icon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import "@/assets/styles/atoms/inputs.scss";

interface Option {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: Option[];
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    size?: "small" | "medium" | "large";
    variant?: "default" | "text";
    dropdownAlign?: "left" | "right";
  }>(),
  {
    required: false,
    disabled: false,
    size: "medium",
    variant: "default",
    dropdownAlign: "left",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputId = computed(() => {
  if (props.id) return `select-${props.id}`;
  if (props.label)
    return `select-${props.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return "select-field";
});

const inputClasses = computed(() => {
  if (props.variant === "text") return "input-small t-caption-1";
  switch (props.size) {
    case "small":
      return "input-small t-micro-1";
    case "large":
      return "input-large t-body-2";
    default:
      return "input-medium t-caption-2";
  }
});

const isOpen = ref(false);
const highlightedIndex = ref(-1);

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue);
  return selected?.label || props.placeholder || "";
});

const filteredOptions = computed(() => {
  return props.options;
});

const handleBlur = () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
};

const selectOption = (option: Option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
  highlightedIndex.value = -1;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.variant === "text" && !isOpen.value) {
    if (event.key === "ArrowDown" || event.key === "Enter") {
      event.preventDefault();
      isOpen.value = true;
    }
    return;
  }

  if (!isOpen.value || filteredOptions.value.length === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredOptions.value.length - 1,
      );
      nextTick(() => {
        document
          .querySelector(".option.is-highlighted")
          ?.scrollIntoView({ block: "nearest" });
      });
      break;
    case "ArrowUp":
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      nextTick(() => {
        document
          .querySelector(".option.is-highlighted")
          ?.scrollIntoView({ block: "nearest" });
      });
      break;
    case "Enter":
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value]!);
      }
      break;
    case "Escape":
      event.preventDefault();
      isOpen.value = false;
      highlightedIndex.value = -1;
      break;
  }
};
</script>

<style scoped>
.select-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.select-wrapper--text {
  width: auto;
  height: auto;
}

.select-container {
  display: flex;
  position: relative;
}

/* ── Default variant ──────────────────────────────────────────────────────── */

.arrow-icon {
  position: absolute;
  right: var(--unit-tiny);
  top: 50%;
  transform: translateY(-50%);
  color: var(--foreground-secondary);
  pointer-events: none;
  transition: color 150ms ease-out;
}

.select-container.is-open .arrow-icon {
  transform: translateY(-50%) rotate(180deg);
  color: var(--foreground-primary);
}

.input-base:hover + .arrow-icon {
  color: var(--foreground-primary);
}

.input-base:focus + .arrow-icon {
  color: var(--foreground-primary);
}

.check-icon {
  color: var(--foreground-secondary);
  flex-shrink: 0;
}

.input-base.is-open {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

/* ── Text variant ─────────────────────────────────────────────────────────── */

.text-trigger {
  display: flex;
  align-items: baseline;
  gap: 0.25em;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);
}

.text-label {
  color: var(--foreground-quaternary);
}

.text-value {
  color: var(--foreground-primary);
  transition: color var(--transition-fast);
  min-width: var(--select-value-min-width, auto);
  display: inline-block;
  text-align: left;
}

.text-trigger:hover .text-value {
  color: var(--foreground-secondary);
}

.dropdown--text {
  left: 0;
  right: auto;
  min-width: 7rem;
  z-index: 100;
  top: 2em;
}

@media (min-width: 650px) {
  .dropdown--right {
    left: auto;
    right: 0;
  }
}
</style>
