<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'button',
      `button--${variant}`,
      `button-${size}`,
      { 'button--loading': loading },
      buttonClasses,
    ]"
  >
    <span v-if="loading" class="button__loader"></span>
    <span :class="{ 'button__content--loading': loading }">
      <Iconography
        v-if="icon && iconPosition === 'leading'"
        :name="icon"
        :size="iconSize"
        class="button-icon leading"
      />
      <slot></slot>
      <Iconography
        v-if="icon && iconPosition === 'trailing'"
        :name="icon"
        :size="iconSize"
        class="button-icon trailing"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import "@/assets/styles/atoms/buttons.scss";
import { computed } from "vue";

interface Props {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  icon?:
    | "arrow"
    | "check"
    | "document"
    | "search"
    | "loading"
    | "close"
    | "chevron-up-down";
  iconPosition?: "leading" | "trailing";
}

const props = withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  disabled: false,
  loading: false,
  size: "medium",
  iconPosition: "leading",
});

const buttonClasses = computed(() => {
  switch (props.size) {
    case "small":
      return "button-small t-micro-1";
    case "large":
      return "button-large t-body-2";
    default:
      return "button-medium t-caption-2";
  }
});

const iconSize = computed(() => {
  switch (props.size) {
    case "small":
      return "small";
    case "large":
      return "large";
    default:
      return "medium";
  }
});
</script>
