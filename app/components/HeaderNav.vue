<template>
  <nav>
    <Text is="ul" size="caption-2">
      <li>construct</li>
    </Text>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  position: relative;
  margin-bottom: 2rem;
  z-index: 999;
}

ul {
  display: flex;
  padding: var(--unit-smallest) var(--grid-margin);

  li {
    display: block;
    margin-right: var(--unit-smallest);
  }

  a {
    display: block;
    text-decoration: none;
    text-underline-offset: 0.15em;

    &.router-link-exact-active {
      color: var(--interactive-primary);
      text-decoration: underline;
      text-decoration-color: var(--interactive-primary);
    }

    &:hover {
      color: var(--interactive-secondary);
      // text-decoration: underline;
    }
  }
}
</style>
