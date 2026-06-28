<script setup lang="ts">
import type { Artifact } from "~/types/sanity";
import { formatDate } from "~/utils/formatDate";

defineProps<{ media: Artifact }>();
</script>

<template>
  <div class="meta-panel">
    <div class="meta-panel__header">
      <h2 class="meta-panel__title t-body-1">{{ media.title }}</h2>
      <p v-if="media.caption?.length" class="meta-panel__caption t-body-2">
        <template v-for="block in media.caption" :key="block._key">
          <PortableTextSpan
            v-for="child in block.children"
            :key="child._key"
            :span="child"
            :markDefs="block.markDefs"
          />
        </template>
      </p>
    </div>

    <dl
      v-if="
        media.dateTaken ||
        media.categories?.length ||
        media.tags?.length ||
        media.locationName ||
        media.camera ||
        media.lens ||
        media.focalLength ||
        media.aperture ||
        media.shutterSpeed ||
        media.iso
      "
      class="meta-panel__grid t-caption-1"
    >
      <div v-if="media.dateTaken" class="meta-panel__row">
        <dt>Date</dt>
        <dd>{{ formatDate(media.dateTaken, { long: true }) }}</dd>
      </div>
      <div v-if="media.categories?.length || media.tags?.length" class="meta-panel__row">
        <dt>Filed as</dt>
        <dd class="meta-panel__tags">
          <span
            v-for="cat in media.categories"
            :key="cat._id"
            class="meta-panel__tag meta-panel__tag--cat"
            >{{ cat.name }}</span
          >
          <span v-for="tag in media.tags" :key="tag._id" class="meta-panel__tag">{{
            tag.name
          }}</span>
        </dd>
      </div>
      <div v-if="media.locationName" class="meta-panel__row">
        <dt>Location</dt>
        <dd>{{ media.locationName }}</dd>
      </div>
      <div v-if="media.camera" class="meta-panel__row">
        <dt>Camera</dt>
        <dd>{{ media.camera.name ?? JSON.stringify(media.camera) }}</dd>
      </div>
      <div v-if="media.lens" class="meta-panel__row">
        <dt>Lens</dt>
        <dd>{{ media.lens.name ?? JSON.stringify(media.lens) }}</dd>
      </div>
      <div
        v-if="media.focalLength || media.aperture || media.shutterSpeed || media.iso"
        class="meta-panel__row"
      >
        <dt>Camera settings</dt>
        <dd>
          {{
            [
              media.focalLength,
              media.aperture,
              media.shutterSpeed,
              media.iso ? `ISO ${media.iso}` : "",
            ]
              .filter(Boolean)
              .join(" · ")
          }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<style lang="scss" scoped>
.meta-panel {
  display: flex;
  flex-direction: column;
}

.meta-panel__header {
  display: flex;
  flex-direction: column;
  gap: var(--unit-smaller);
  padding-top: var(--unit-bigger);
}

.meta-panel__title {
  font-weight: normal;
  margin: 0;
  color: var(--foreground-primary);
}

.meta-panel__caption {
  color: var(--foreground-secondary);
  margin: 0;
}

.meta-panel__grid {
  display: flex;
  flex-direction: column;
  gap: var(--unit-smaller);
  padding-top: var(--unit-bigger);
  padding-bottom: var(--unit-bigger);
  list-style: none;
  margin: 0;
  padding-left: 0;
}

.meta-panel__row {
  display: flex;
  flex-direction: column;
  gap: 0;

  dt {
    color: var(--foreground-secondary);
  }

  dd {
    margin: 0;
    color: var(--foreground-primary);
  }
}

.meta-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--unit-tinier);
}

.meta-panel__tag {
  color: var(--foreground-primary);

  &::before {
    content: "#";
  }

  &--cat {
    color: var(--foreground-primary);
  }
}
</style>
