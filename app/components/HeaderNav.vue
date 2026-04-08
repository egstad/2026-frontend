<template>
  <nav ref="navEl" class="nav" :class="{ 'is-open': isOpen }">
    <!-- Bar -->
    <div class="nav__bar">
      <NuxtLink class="nav__wordmark" to="/" @click="close">
        <h1 class="sr-only">Egstad</h1>
        <svg
          class="logo"
          viewBox="0 0 115 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.000906292 21.4888V19.6038H2.75591V2.20377H0.000906292V0.318769H15.0809V6.98877H13.0509V2.20377H4.93091V9.45377H8.70091V6.69877H10.5859V14.0938H8.70091V11.3388H4.93091V19.6038H13.6309V14.0938H15.6609V21.4888H0.000906292ZM29.0487 21.8078C23.0747 21.8078 18.6957 17.2548 18.6957 10.9038C18.6957 4.58177 23.0747 -0.0002321 29.0487 -0.0002321C32.1227 -0.0002321 34.6167 1.15977 36.2117 3.36377V0.318769H38.0967V8.03277H36.3567C35.4867 4.46577 32.7317 2.02977 29.0487 2.02977C24.3217 2.02977 20.8707 5.74177 20.8707 10.9038C20.8707 16.0948 24.3217 19.7778 29.0487 19.7778C33.1087 19.7778 35.8057 17.0228 35.9217 13.0788V12.7888H30.2667V10.9038H39.9817V12.7888H37.9517V21.4888H35.9217V18.5308C34.4427 20.5608 32.0937 21.8078 29.0487 21.8078ZM50.2581 21.8078C47.8221 21.8078 45.9081 20.6478 44.7481 19.0238V21.4888H42.8631V14.2388H44.6031C45.0091 17.5158 47.6481 19.7778 50.2581 19.7778C52.6651 19.7778 54.1731 18.3278 54.1731 16.4428C54.1731 13.9778 51.7951 13.1368 49.3301 12.0638L48.4021 11.6578C45.7631 10.4978 42.9211 9.13477 42.9211 5.48077C42.9211 2.00077 45.5021 -0.0002321 48.5471 -0.0002321C50.4031 -0.0002321 52.0851 0.869769 53.0711 2.46477V0.318769H54.9561V6.98877H53.2161C52.7811 3.74077 50.7511 2.02977 48.5471 2.02977C46.6041 2.02977 45.0961 3.27677 45.0961 5.33577C45.0961 7.88777 47.2131 8.64177 49.5041 9.65677L50.4321 10.0628C52.5781 10.9908 56.3481 12.2378 56.3481 16.2978C56.3481 19.6038 53.9411 21.8078 50.2581 21.8078ZM61.4342 21.4888V19.6038H65.3492V2.20377H60.9992V9.59877H58.9692V0.318769H73.9042V9.59877H71.8742V2.20377H67.5242V19.6038H71.4392V21.4888H61.4342ZM73.9194 21.4888V19.6038H76.2104L83.3734 0.173769H84.6784L91.7834 19.6038H94.0744V21.4888H87.5494V19.6038H89.6374L87.8394 14.5288H80.1544L78.3564 19.6038H80.4444V21.4888H73.9194ZM80.8214 12.6438H87.1724L84.0114 3.68277L80.8214 12.6438ZM95.3527 21.4888V19.6038H98.3977V2.20377H95.3527V0.318769H104.604C110.955 0.318769 114.783 5.04577 114.783 10.9038C114.783 16.7618 110.955 21.4888 104.604 21.4888H95.3527ZM100.573 19.6038H104.459C109.418 19.6038 112.608 15.7468 112.608 10.9038C112.608 6.08977 109.418 2.20377 104.459 2.20377H100.573V19.6038Z"
          />
        </svg>
      </NuxtLink>
      <button
        class="nav__toggle"
        @click="toggle"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? 'Close navigation' : 'Open navigation'"
      >
        <span class="nav__dots">
          <span v-for="i in 9" :key="i" class="nav__dot" />
        </span>
      </button>
    </div>

    <!-- Menu -->
    <Transition name="menu">
      <div v-if="isOpen" class="nav__menu">
        <!-- 2×2 nav tiles -->
        <div class="nav__tiles">
          <NuxtLink class="nav__tile" to="/work" @click="close">
            <span class="nav__tile-label t-caption-2">work</span>
            <div class="nav__tile-icon">
              <!-- paste work SVG here -->
            </div>
          </NuxtLink>
          <NuxtLink class="nav__tile" to="/about" @click="close">
            <span class="nav__tile-label t-caption-2">about</span>
            <div class="nav__tile-icon">
              <!-- paste about SVG here -->
            </div>
          </NuxtLink>
          <NuxtLink class="nav__tile" to="/logs" @click="close">
            <span class="nav__tile-label t-caption-2">logs</span>
            <div class="nav__tile-icon">
              <!-- paste logs SVG here -->
            </div>
          </NuxtLink>
          <NuxtLink class="nav__tile" to="/contact" @click="close">
            <span class="nav__tile-label t-caption-2">contact</span>
            <div class="nav__tile-icon">
              <!-- paste contact SVG here -->
            </div>
          </NuxtLink>
        </div>

        <!-- Settings rows -->
        <div class="nav__settings">
          <Text size="caption-1" is="div" class="nav__setting">
            <span>{{ currentPageLabel }}</span>
            <span class="nav__setting-value">→</span>
          </Text>
          <button class="nav__setting" @click="app.toggleTheme()">
            <Text size="caption-1" is="div">
              <span>theme</span>
              <span class="nav__setting-value">{{ app.theme }}</span>
            </Text>
          </button>
          <button class="nav__setting" @click="app.toggleAutoplayVideos()">
            <Text size="caption-1" is="div">
              <span>autoplay videos</span>
              <span class="nav__setting-value">{{
                app.autoplayVideos ? "on" : "off"
              }}</span>
            </Text>
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { useAppStore } from "~/stores/app";

const isOpen = ref(false);
const navEl = ref<HTMLElement | null>(null);
const route = useRoute();
const app = useAppStore();

const currentPageLabel = computed(() => {
  const name = route.name?.toString() ?? "";
  return name.charAt(0).toUpperCase() + name.slice(1);
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (navEl.value && !navEl.value.contains(e.target as Node)) {
    close();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") close();
};

watch(() => route.path, close);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="scss" scoped>
.nav {
  background: color-mix(
    in srgb,
    var(--foreground-primary) 9%,
    var(--background-primary)
  );
  border-radius: var(--unit-tiniest);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 360px;
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

.nav__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--unit-tinier) var(--unit-tiny);
  padding-right: var(--unit-tinier);
  gap: var(--unit-small);
  height: 40px;
}

.nav__wordmark {
  display: flex;
  align-items: center;
}

.logo {
  height: calc(var(--unit-smaller) * 0.8);
  width: auto;
  color: var(--foreground-primary);
}

h1 {
  @include sr-only;
}

.nav__toggle {
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.nav__dots {
  display: grid;
  grid-template-columns: repeat(3, 4px);
  grid-template-rows: repeat(3, 4px);
  gap: 4px;
  width: 18px;
  height: 18px;
  transition: transform var(--fast) var(--ease-in-out);

  .is-open & {
    transform: rotate(90deg);
  }
}

.nav__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--foreground-tertiary);
  transition:
    opacity var(--transition),
    transform var(--transition);

  .is-open & {
    &:nth-child(2),
    &:nth-child(4),
    &:nth-child(6),
    &:nth-child(8) {
      opacity: 0;
    }
  }
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

.nav__menu {
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

// ─── Tiles ────────────────────────────────────────────────────────────────────

.nav__tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 2px;
  padding-bottom: 0;
}

.nav__tile {
  position: relative;
  aspect-ratio: 1;
  background: color-mix(
    in srgb,
    var(--foreground-primary) 5%,
    var(--background-primary)
  );
  border-radius: calc(var(--unit-tiniest) - 2px);
  overflow: hidden;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);

  &:hover {
    background: color-mix(
      in srgb,
      var(--foreground-primary) 9%,
      var(--background-primary)
    );
  }

  &.router-link-exact-active {
    background: var(--interactive-primary);

    .nav__tile-label {
      color: #fff;
    }

    .nav__tile-icon {
      color: #fff;
    }
  }
}

.nav__tile-label {
  position: absolute;
  top: var(--unit-tinier);
  left: var(--unit-tinier);
  color: var(--foreground-tertiary);
  line-height: 1;

  .nav__tile:hover & {
    color: var(--foreground-secondary);
  }
}

.nav__tile-icon {
  width: 70%;
  color: var(--foreground-quaternary);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: auto;
  }

  .nav__tile:hover & {
    color: var(--foreground-tertiary);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

.nav__settings {
  padding: 2px;
  padding-top: var(--unit-tinier);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav__setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--unit-tinier) var(--unit-tinier);
  background: none;
  border: none;
  border-radius: calc(var(--unit-tiniest) - 2px);
  color: var(--foreground-tertiary);
  text-align: left;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    background: color-mix(
      in srgb,
      var(--foreground-primary) 5%,
      var(--background-primary)
    );
    color: var(--foreground-secondary);
  }
}

.nav__setting-value {
  color: var(--foreground-quaternary);
  flex-shrink: 0;
  margin-left: var(--unit-small);
}

// ─── Transition ───────────────────────────────────────────────────────────────

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
