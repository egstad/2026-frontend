<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Client } from "~/types/sanity";

const props = defineProps<{ clients: Client[] }>();

const clientsListEl = ref<HTMLElement | null>(null);
const clientsExpanded = ref(false);
const moreCount = computed(
  () => props.clients.filter((c) => !c.featured).length,
);

const triggers: ScrollTrigger[] = [];

function addIndentTriggers(items: NodeListOf<Element> | Element[]) {
  items.forEach((item) => {
    const tl = gsap
      .timeline({
        scrollTrigger: {
          trigger: item,
          start: "center center+=100",
          end: "center center-=100",
          scrub: 0.5,
        },
      })
      .to(item, { x: 40, duration: 0.5, ease: "none" })
      .to(item, { x: 0, duration: 0.5, ease: "none" });

    if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);

    const toggle = ScrollTrigger.create({
      trigger: item,
      start: "top center",
      end: "bottom center",
      toggleClass: "is-active",
    });

    triggers.push(toggle);
  });
}

onMounted(() => {
  const more =
    clientsListEl.value?.querySelectorAll<HTMLElement>(".client--more");
  if (more?.length) {
    gsap.set(more, { height: 0, overflow: "hidden", opacity: 0 });
    more.forEach((item) => item.setAttribute("inert", ""));
  }

  const featured = clientsListEl.value?.querySelectorAll(
    "li:not(.client--more)",
  );
  if (featured?.length) addIndentTriggers(featured);

  ScrollTrigger.refresh();
});

onUnmounted(() => {
  triggers.forEach((t) => t.kill());
});

async function expandClients() {
  if (clientsExpanded.value || !clientsListEl.value) return;
  clientsExpanded.value = true;
  await nextTick();

  const items = clientsListEl.value?.querySelectorAll(".client--more");
  if (!items?.length) return;

  gsap.to(items, {
    height: "auto",
    opacity: 1,
    duration: 0.35,
    stagger: 0.025,
    ease: "power2.out",
    clearProps: "height,overflow,opacity",
    onComplete: () => {
      items.forEach((item) => item.removeAttribute("inert"));
      addIndentTriggers(Array.from(items));
      ScrollTrigger.refresh();
    },
  });
}
</script>

<template>
  <div class="clients-wrap">
    <ul ref="clientsListEl" class="clients">
      <li
        v-for="client in clients"
        :key="client._id"
        :class="{ 'client--more': !client.featured }"
      >
        <Text>
          <a
            v-if="client.website"
            :href="client.website"
            target="_blank"
            rel="noopener"
            class="client-link"
            ><span>{{ client.name }}</span></a
          >
          <span v-else>{{ client.name }}</span>
        </Text>
      </li>
    </ul>

    <button
      v-if="!clientsExpanded && moreCount"
      class="clients-more"
      @click="expandClients"
    >
      <Text> +{{ moreCount }} more </Text>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.clients-wrap {
  margin-bottom: var(--unit-bigger);
}

.clients {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    color: var(--foreground-tertiary);
    // transition: font-variation-settings ease-out 0.2s;

    &.is-active {
      color: var(--foreground-primary);
      // font-variation-settings: "wght" 1000;

      .client-link {
        color: var(--foreground-primary);
      }
    }
  }
}

.client-link {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;

  span {
    display: inline-block;

    &::after {
      content: "";
      display: block;
      height: 1px;
      background: var(--foreground-quaternary);
      opacity: 0.2;
      transform: scaleX(0);
      transform-origin: left;
      transition-delay: 100ms;
      transition:
        transform 250ms ease-out,
        opacity 200ms ease-in-out;
    }
  }

  &:hover span::after {
    transform: scaleX(1);
    opacity: 1;
  }
}

.clients-more {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--foreground-tertiary);
  font: inherit;
  margin-top: 0.15em;

  &:hover {
    color: var(--foreground-primary);
  }
}
</style>
