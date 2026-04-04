<template>
  <component
    :is="is"
    :class="[
      `t-${size}`,
      { '--indent': indent },
      { 't-dim': color === 'dim' },
      { 't-dimmer': color === 'dimmer' },
      { '--font-seven': font === 'times-seven' },
      { '--font-ten': font === 'times-ten' },
    ]"
    v-bind="$attrs"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { type PropType } from "vue";

type SizeType =
  | "micro-1"
  | "micro-2"
  | "caption-1"
  | "caption-2"
  | "body-1"
  | "body-2"
  | "headline-1"
  | "headline-2"
  | "headline-3";

type ColorType = "normal" | "dim" | "dimmer";
type FontType = "sans" | "times-seven" | "times-ten";

defineProps({
  size: {
    type: String as PropType<SizeType>,
    default: "body-2",
    validator: (value: SizeType): boolean =>
      [
        "micro-1",
        "micro-2",
        "caption-1",
        "caption-2",
        "body-1",
        "body-2",
        "headline-1",
        "headline-2",
      ].includes(value),
  },
  is: {
    type: String as PropType<string>,
    required: false,
    default: "p",
  },
  indent: {
    type: Boolean,
    required: false,
    default: false,
  },
  color: {
    type: String as PropType<ColorType>,
    default: "normal",
    validator: (value: ColorType): boolean =>
      ["normal", "dim", "dimmer"].includes(value),
  },
  font: {
    type: String as PropType<FontType>,
    default: "sans",
    validator: (value: FontType): boolean =>
      ["sans", "times-seven", "times-ten"].includes(value),
  },
});
</script>

<style scoped>
.--indent {
  text-indent: var(--unit-bigger);
}

.--mono {
  font-variant-numeric: tabular-nums;
}

.--font-seven {
  font-family: "Times Seven", serif;
}

.--font-ten {
  font-family: "Times Ten", serif;
}
</style>
