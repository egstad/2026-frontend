<template>
  <div>
    <Grid>
      <Column>
        <BaseButton size="small" @click="changeText">Change text</BaseButton>
      </Column>
    </Grid>
    <Grid is="ul" class="demo-type">
      <Column
        is="li"
        v-for="typeStyle in typeStyles"
        :key="typeStyle.name"
        span="12"
        span-tablet="6"
        span-laptop="4"
        span-desktop="3"
      >
        <Text is="h3" class="name" size="caption-2">
          {{ typeStyle.displayName }}&nbsp;&nbsp;
        </Text>
        <Text is="p" class="class" size="micro-2" color="dim">
          .{{ typeStyle.name }}
        </Text>
        <div class="type-sample">
          <span :class="typeStyle.name">
            {{ currentSample }}
          </span>
        </div>
      </Column>
    </Grid>
  </div>
</template>

<script setup>
import { ref } from "vue";

const typeStyles = [
  {
    name: "t-micro-2",
    displayName: "Micro 2",
  },
  {
    name: "t-micro-1",
    displayName: "Micro 1",
  },
  {
    name: "t-caption-2",
    displayName: "Caption 2",
  },
  {
    name: "t-caption-1",
    displayName: "Caption 1",
  },
  {
    name: "t-body-2",
    displayName: "Body 2",
  },
  {
    name: "t-body-1",
    displayName: "Body 1",
  },
  {
    name: "t-headline-2",
    displayName: "Headline 2",
  },
  {
    name: "t-headline-1",
    displayName: "Headline 1",
  },
];

// Sample text cycling
const sampleTexts = [
  "Aa",
  "Hamburgefontsiv",
  "0123456789",
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi voluptatem dolorum natus? Illum inventore distinctio in incidunt dignissimos? Totam ipsum facere culpa ducimus dicta eum itaque officia natus aliquid quae!",
];
const currentSample = ref(sampleTexts[0]);
let currentIndex = 0;

const changeText = () => {
  currentIndex = (currentIndex + 1) % sampleTexts.length;
  currentSample.value = sampleTexts[currentIndex];
};
</script>

<style lang="scss" scoped>
.demo-type {
  .column {
    overflow: hidden;
    margin-bottom: var(--unit-huge);

    > * {
      padding-right: var(--unit-small);
    }
  }

  .name {
    margin-bottom: var(--unit-tiniest);
  }
}

.type-sample {
  display: flex;
  align-items: baseline;
  width: 100%;
  overflow: hidden;
  padding-top: var(--unit-tinier);
  margin-top: var(--unit-tiny);
  border-top: 1px solid var(--border-primary);
  overflow: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
