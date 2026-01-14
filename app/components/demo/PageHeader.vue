<template>
  <Grid is="header" class="demo-header">
    <Space size="huger" />
    <DemoPageBody class="title">
      <Text is="h1" size="headline-1">
        <slot name="title"></slot>
      </Text>
    </DemoPageBody>
    <DemoPageBody class="copy">
      <Text is="p" color="dim" size="headline-2">
        <slot name="copy"></slot>
      </Text>
    </DemoPageBody>
    <Space size="bigger" />
  </Grid>
</template>

<script setup>
import DemoPageBody from "~/components/demo/PageBody.vue";
</script>

<style lang="scss">
.demo-header {
  > .column {
    // padding-top: var(--unit-huger);
    // padding-bottom: var(--unit-huge);
  }

  .title {
    text-align: center;
    width: 100%;
    display: block;
  }

  .copy {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}
</style>
