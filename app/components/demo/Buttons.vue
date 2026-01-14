<template>
  <Grid>
    <!-- Variants -->
    <Column span="12">
      <Text size="body-1" class="section-title">Button Variants</Text>
      <div class="row">
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Primary</Text>
          <BaseButton variant="primary">Click me</BaseButton>
        </div>
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Secondary</Text>
          <BaseButton variant="secondary">Click me</BaseButton>
        </div>
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Ghost</Text>
          <BaseButton variant="ghost">Click me</BaseButton>
        </div>
      </div>
    </Column>

    <!-- Sizes -->
    <Column span="12">
      <Text size="body-1" class="section-title">Button Sizes</Text>
      <div class="row">
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Small</Text>
          <BaseButton size="small">Click me</BaseButton>
        </div>
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Default</Text>
          <BaseButton>Click me</BaseButton>
        </div>
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Large</Text>
          <BaseButton size="large">Click me</BaseButton>
        </div>
      </div>
    </Column>

    <!-- States -->
    <Column span="12">
      <Text size="body-1" class="section-title">Button States</Text>
      <div class="row">
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Default</Text>
          <BaseButton>Click me</BaseButton>
        </div>
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Disabled</Text>
          <BaseButton disabled>Click me</BaseButton>
        </div>
      </div>
    </Column>

    <!-- With Icons Section -->
    <Column span="12">
      <Text size="body-1" class="section-title">Buttons with Icons</Text>
      <div class="row">
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Leading Icon</Text>
          <BaseButton icon="check" icon-position="leading"
            >Save Changes</BaseButton
          >
        </div>
        <div class="button-demo">
          <Text size="micro-2" class="demo-label">Trailing Icon</Text>
          <BaseButton icon="arrow" icon-position="trailing"
            >Continue</BaseButton
          >
        </div>
      </div>
    </Column>
  </Grid>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.section-title {
  margin-top: var(--unit-big);
  margin-bottom: var(--unit-small);
  color: var(--foreground-primary);

  &:first-child {
    margin-top: 0;
  }
}

.button-demo {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tinier);
  margin-bottom: var(--unit-small);
}

.row {
  display: flex;
  width: 100%;
  gap: var(--unit-smallest);
}
</style>
