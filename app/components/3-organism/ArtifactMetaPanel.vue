<script setup lang="ts">
import type { Artifact } from "~/types/sanity";
import { formatDate } from "~/utils/formatDate";

defineProps<{ media: Artifact }>();
</script>

<template>
  <Text size="caption-2" class="meta-panel">
    <h2 class="meta-panel__title">{{ media.title }}</h2>

    <p v-if="media.captionText" class="meta-panel__caption">
      {{ media.captionText }}
    </p>

    <dl
      v-if="
        media.dateTaken ||
        media.locationName ||
        media.camera ||
        media.lens ||
        media.focalLength ||
        media.aperture ||
        media.shutterSpeed ||
        media.iso
      "
      class="meta-panel__grid"
    >
      <div v-if="media.dateTaken" class="meta-panel__row">
        <dt>Date</dt>
        <dd>{{ formatDate(media.dateTaken, { long: true }) }}</dd>
      </div>
      <div v-if="media.locationName" class="meta-panel__row">
        <dt>Location</dt>
        <dd>{{ media.locationName }}</dd>
      </div>
      <div v-if="media.camera" class="meta-panel__row">
        <dt>Camera</dt>
        <dd>{{ media.camera }}</dd>
      </div>
      <div v-if="media.lens" class="meta-panel__row">
        <dt>Lens</dt>
        <dd>{{ media.lens }}</dd>
      </div>
      <div
        v-if="
          media.focalLength || media.aperture || media.shutterSpeed || media.iso
        "
        class="meta-panel__row"
      >
        <dt>Settings</dt>
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

    <div
      v-if="media.categories?.length || media.tags?.length"
      class="meta-panel__tags"
    >
      <span
        v-for="cat in media.categories"
        :key="cat._id"
        class="meta-panel__tag meta-panel__tag--cat"
        >{{ cat.name }}</span
      >
      <span v-for="tag in media.tags" :key="tag._id" class="meta-panel__tag">{{
        tag.name
      }}</span>
    </div>
  </Text>
</template>

<style lang="scss" scoped>
// All text is caption-2 throughout — matching the feed card's text scale.
.meta-panel {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-panel__title {
  font-weight: normal;
  margin: 0;
  line-height: 1.4;
  color: var(--foreground-primary);
}

.meta-panel__caption {
  color: var(--foreground-secondary);
  margin: 0;
  line-height: 1.4;
}

.meta-panel__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--unit-small);
  margin-top: 2px;
}

.meta-panel__row {
  display: flex;
  flex-direction: column;
  gap: 0;

  dt {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--foreground-tertiary);
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
  margin-top: 2px;
}

.meta-panel__tag {
  color: var(--foreground-tertiary);

  &::before {
    content: "#";
  }

  &--cat {
    color: var(--foreground-secondary);
  }
}
</style>
