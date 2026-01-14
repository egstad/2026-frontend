<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input-label t-micro-1 mb-tinier">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="['input-base', inputClasses]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import "@/assets/styles/atoms/inputs.scss";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    size?: "small" | "medium" | "large";
  }>(),
  {
    type: "text",
    required: false,
    disabled: false,
    size: "medium",
  }
);

defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputId = computed(() => {
  if (props.id) return `input-${props.id}`;
  if (props.label)
    return `input-${props.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return "input-field";
});

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
</script>

<style scoped lang="scss">
.input-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: var(--small) 0;
}

.input-label {
  display: block;
}
</style>
