<template>
  <Grid>
    <DemoPageBody>
      <article v-for="links in navLinks" class="demo-section-nav">
        <header class="title t-caption-1">{{ links.title }}</header>
        <ul class="links">
          <li v-for="page in links.page">
            <nuxt-link :to="page.link" class="t-caption-1">{{
              page.title
            }}</nuxt-link>
          </li>
        </ul>
      </article>
    </DemoPageBody>
  </Grid>
</template>

<script setup>
import DemoPageBody from "~/components/demo/PageBody.vue";

const navLinks = [
  {
    title: "foundation",
    page: [
      {
        title: "unit",
        link: "/demo/foundation/unit",
      },
      {
        title: "color",
        link: "/demo/foundation/color",
      },
      {
        title: "layout",
        link: "/demo/foundation/layout",
      },
      {
        title: "type",
        link: "/demo/foundation/type",
      },
      {
        title: "motion",
        link: "/demo/foundation/motion",
      },
      {
        title: "effects",
        link: "/demo/foundation/effects",
      },
    ],
  },
  {
    title: "atoms",
    page: [
      {
        title: "space",
        link: "/demo/atom/space",
      },
      {
        title: "text",
        link: "/demo/atom/text",
      },
      {
        title: "icons",
        link: "/demo/atom/icons",
      },
      {
        title: "pic(ture)",
        link: "/demo/atom/pic",
      },
      {
        title: "vid(eo)",
        link: "/demo/atom/vid",
      },
    ],
  },
  {
    title: "molecules",
    page: [
      {
        title: "chip",
        link: "/demo/molecule/chips",
      },
      {
        title: "button",
        link: "/demo/molecule/button",
      },
      {
        title: "input",
        link: "/demo/molecule/input",
      },
      {
        title: "tooltip",
        link: "/demo/molecule/tooltip",
      },
    ],
  },
  {
    title: "utilities",
    page: [
      {
        title: "observer",
        link: "/demo/utilities/observer",
      },
      {
        title: "three",
        link: "/demo/utilities/webcam",
      },
      {
        title: "webcam",
        link: "/demo/utilities/webcam",
      },
      {
        title: "p5",
        link: "/demo/utilities/p5",
      },
      {
        title: "tone",
        link: "/demo/utilities/tone",
      },
      {
        title: "tweakpane",
        link: "/demo/utilities/tweakpane",
      },
    ],
  },
];
</script>

<style lang="scss" scoped>
.demo-section-nav {
  border: 1px solid var(--border-primary);
  border-radius: var(--radii-tiny);
  margin: 0 auto var(--unit-tiny);
  transition: background-color var(--transition-fast);
  justify-self: center;
  width: 100%;

  @include tablet {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &:hover {
    background-color: var(--border-primary);

    a {
      color: var(--foreground-secondary);

      &:hover {
        color: var(--foreground-primary);
      }
    }
  }

  .t-caption-1 {
    padding: var(--unit-smaller);
  }

  .title {
    @media (max-width: $tablet) {
      padding-bottom: 0;
    }
  }

  ul {
    display: flex;
    margin-top: var(--unit-tiniest);

    li:first-child a {
      padding-left: var(--unit-smaller);
    }

    li:last-child a {
      padding-right: var(--unit-smaller);
    }

    @include tablet {
      margin-top: 0;
    }
  }

  a {
    display: block;
    transition: color var(--transition-fast);
    color: var(--foreground-tertiary);
    text-decoration: none;

    &.router-link-active {
      color: var(--foreground-primary);
      text-decoration: underline;
    }

    &.t-caption-1 {
      padding-left: var(--unit-tinier);
      padding-right: var(--unit-tinier);
    }

    &:hover {
      color: var(--foreground-secondary);
    }
  }
}
</style>
