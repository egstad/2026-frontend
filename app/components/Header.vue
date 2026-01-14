<template>
  <Grid>
    <Column>
      <header
        :class="[
          'site-header',
          {
            'is-visible': headerIsVisible,
            'is-transparent': isTransparent,
          },
        ]"
      >
        <div class="wrapper">
          <HeaderNav />
        </div>
      </header>
      <Debug />
    </Column>
  </Grid>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from "vue";
import { useDeviceStore } from "~/stores/device";
const isDev = process.dev;

const deviceStore = useDeviceStore();
const headerIsVisible = ref(true);
const isMounted = ref(false);

// Only apply transparent class after component is mounted to avoid hydration mismatch
const isTransparent = computed(() => {
  return isMounted.value && deviceStore.scrollNearTop;
});

// watch main window event
const nuxt = useNuxtApp();
const scroll = nuxt.$scroll;
const scrollEl = ref({});
const handleScroll = () => {
  if (
    deviceStore.scrollNearTop ||
    deviceStore.scrollAtTop ||
    deviceStore.scrollDirection === "up"
  ) {
    headerIsVisible.value = true;
  } else {
    headerIsVisible.value = false;
  }
};

onMounted(() => {
  isMounted.value = true;
  scrollEl.value = scroll.instance.el;
  scrollEl.value.addEventListener("scrollY", handleScroll);
});

onUnmounted(() => {
  scrollEl.value.removeEventListener("scrollY", handleScroll);
});
</script>

<style lang="scss" scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  .wrapper {
    transition: transform var(--transition);
    transform: translate3d(0, -150%, 0);
  }

  &.is-visible .wrapper {
    transform: translate3d(0, 0, 0);
  }

  nav {
    transition: background-color var(--transition);
    background-color: var(--background-primary);
  }

  &.is-transparent {
    nav {
      background-color: transparent;
    }
  }
}
</style>
