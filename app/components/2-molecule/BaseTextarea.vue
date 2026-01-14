<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label t-micro-1 mb-tiny">{{
      label
    }}</label>
    <div class="input-group">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        :class="['input-base', inputClasses]"
        :rows="rows"
        :disabled="disabled"
      ></textarea>
      <div class="resize-icon">
        <Iconography name="chevron-up-down" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  label?: string;
  size?: "small" | "medium" | "large";
  rows?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  size: "medium",
  rows: 6,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

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
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};
</script>

<style scoped>
.input-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.input-group {
  position: relative;
}

textarea.input-base {
  resize: vertical;
  min-width: 100%;
  max-width: 100%;
  min-height: 80px;
  max-height: 50vh;
  font-family: inherit;
  line-height: 1.5;
  padding-right: var(--unit-big);
}

.resize-icon {
  position: absolute;
  bottom: var(--unit-tinier);
  right: var(--unit-tinier);
  color: var(--foreground-secondary);
  pointer-events: none;
  transform: rotate(-45deg);
  opacity: 0.5;
  z-index: 1;
}

textarea.input-base:hover + .resize-icon,
textarea.input-base:focus + .resize-icon {
  color: var(--foreground-primary);
  opacity: 1;
}

/* Style the resize handle */
textarea.input-base::-webkit-resizer {
  border-width: 8px;
  border-style: solid;
  border-color: transparent;
  background-color: transparent;
}
</style>
