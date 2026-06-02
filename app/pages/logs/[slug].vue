<script setup lang="ts">
import { sanityClient, urlFor } from "~/utils/sanity";
import { formatDate } from "~/utils/formatDate";
import type {
  Log,
  LogArtifactRef,
  LogGallery,
  LogGallerySize,
  LogInlineMedia,
  LogMediaSize,
  PortableTextBlock,
} from "~/types/sanity";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const route = useRoute();

const { data: log } = await useAsyncData(`log-${route.params.slug}`, () =>
  sanityClient.fetch<Log>(
    `
    *[_type == "log" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      date,
      content[] {
        ...,
        _type == "artifactRef" => {
          _key,
          _type,
          size,
          "artifact": artifact-> {
            _id,
            _type,
            title,
            mediaType,
            alt,
            autoplay,
            "imageUrl": image.asset->url,
            "imageMeta": { "dimensions": image.asset->metadata.dimensions },
            "muxPlaybackId": video.asset->playbackId
          }
        },
        _type == "media" => {
          ...,
          image {
            crop,
            hotspot,
            asset
          },
          "imageUrl": image.asset->url,
          "imageMeta": { "dimensions": image.asset->metadata.dimensions },
          "muxPlaybackId": video.asset->playbackId,
          caption[] {
            ...,
            markDefs[] {
              ...,
              _type == "internalLink" => {
                ...,
                "reference": reference->{ _type, slug, title }
              }
            }
          }
        },
        _type == "gallery" => {
          _key,
          _type,
          size,
          items[] {
            ...,
            _type == "reference" => @-> {
              _id,
              _type,
              mediaType,
              alt,
              autoplay,
              "imageUrl": image.asset->url,
              "imageMeta": { "dimensions": image.asset->metadata.dimensions },
              "muxPlaybackId": video.asset->playbackId,
              caption[] {
                ...,
                markDefs[] {
                  ...,
                  _type == "internalLink" => {
                    ...,
                    "reference": reference->{ _type, slug, title }
                  }
                }
              }
            },
            _type == "galleryMedia" => {
              ...,
              "imageUrl": image.asset->url,
              "imageMeta": { "dimensions": image.asset->metadata.dimensions },
              "muxPlaybackId": video.asset->playbackId,
              caption[] {
                ...,
                markDefs[] {
                  ...,
                  _type == "internalLink" => {
                    ...,
                    "reference": reference->{ _type, slug, title }
                  }
                }
              }
            }
          }
        },
        markDefs[] {
          ...,
          _type == "internalLink" => {
            ...,
            "reference": reference->{ _type, slug, title }
          }
        }
      }
    }
  `,
    { slug: route.params.slug },
  ),
);

if (!log.value) {
  throw createError({ statusCode: 404, message: "Log not found" });
}

PageSetup({
  seoMeta: { title: log.value?.title || "Log" },
});

// Maps a media size to Column props
function mediaColumns(size?: LogMediaSize) {
  switch (size) {
    case "small":
      return {
        spanMobile: "6",
        startMobile: "4",
        spanTablet: "4",
        startTablet: "3",
        spanLaptop: "4",
        startLaptop: "5",
        spanDesktop: "2",
        startDesktop: "6",
      };
    case "large":
      return {
        spanTablet: "12",
        startLaptop: "2",
        spanLaptop: "10",
        startDesktop: "3",
        spanDesktop: "8",
      };
    case "full":
      return { span: "12" };
    default:
      return {
        spanTablet: "9",
        startLaptop: "3",
        spanLaptop: "8",
        startDesktop: "4",
        spanDesktop: "6",
      };
  }
}

function asGallery(block: unknown): LogGallery {
  return block as LogGallery;
}

// 4+ items → full grid width (padding preserved — no grid--full)
// small = text column, large = wide media column
function galleryColumns(size?: LogGallerySize, count = 0) {
  if (count >= 4) return { span: "12" };
  return size === "large"
    ? {
        spanTablet: "12",
        startLaptop: "2",
        spanLaptop: "10",
        startDesktop: "3",
        spanDesktop: "8",
      }
    : {
        spanTablet: "9",
        startLaptop: "3",
        spanLaptop: "8",
        startDesktop: "4",
        spanDesktop: "6",
      };
}

function isEmptyParagraph(block: unknown): boolean {
  const b = block as PortableTextBlock;
  return b._type === "block" && !b.children?.some((c) => c.text?.trim());
}

// Group consecutive list items into { type: 'list' } groups so we can
// wrap them in <ul> / <ol>. All other blocks pass through as-is.
type LogBlock = NonNullable<Log["content"]>[number];
type ContentGroup =
  | { type: "block"; block: LogBlock; key: string }
  | {
      type: "list";
      listType: "bullet" | "number";
      items: PortableTextBlock[];
      key: string;
    };

const processedContent = computed<ContentGroup[]>(() => {
  const result: ContentGroup[] = [];
  for (const block of log.value?.content ?? []) {
    const b = block as PortableTextBlock;
    if (b._type === "block" && b.listItem) {
      const last = result[result.length - 1];
      if (last?.type === "list" && last.listType === b.listItem) {
        last.items.push(b);
      } else {
        result.push({
          type: "list",
          listType: b.listItem,
          items: [b],
          key: b._key ?? `list-${result.length}`,
        });
      }
    } else {
      // Strip empty paragraphs — CSS spacing handles rhythm, not empty blocks
      if (isEmptyParagraph(block)) continue;
      result.push({
        type: "block",
        block,
        key: (block as any)._key ?? `block-${result.length}`,
      });
    }
  }
  return result;
});

const readingStats = computed(() => {
  let words = 0;
  for (const block of log.value?.content ?? []) {
    if (block._type === "block") {
      for (const child of (block as PortableTextBlock).children ?? []) {
        if (child.text)
          words += child.text.trim().split(/\s+/).filter(Boolean).length;
      }
    }
  }
  if (!words) return null;
  const mins = Math.ceil(words / 200);
  return { words, mins };
});
</script>

<template>
  <article v-if="log">
    <!-- Header -->
    <Grid class="log-header">
      <Column
        span-tablet="9"
        start-laptop="3"
        span-laptop="8"
        start-desktop="4"
        span-desktop="6"
      >
        <Space size="big" />
        <Text is="h1" size="headline-1">{{ log.title }}</Text>
        <Space size="tiny" />
        <div class="log-meta">
          <Text is="time" color="dimmer" size="caption-2">{{
            formatDate(log.date)
          }}</Text>
          <template v-if="readingStats">
            <Text color="dimmer" size="caption-2">•</Text>
            <Text color="dimmer" size="caption-2"
              >{{ readingStats.words.toLocaleString() }} words</Text
            >
            <Text color="dimmer" size="caption-2">•</Text>
            <Text color="dimmer" size="caption-2"
              >{{ readingStats.mins }} minutes</Text
            >
          </template>
        </div>
      </Column>
    </Grid>

    <!-- Content -->
    <template v-if="log.content">
      <template v-for="group in processedContent" :key="group.key">
        <!-- List (ul/ol) -->
        <Grid
          v-if="group.type === 'list'"
          class="block block--text block--list"
        >
          <Column
            span-tablet="9"
            start-laptop="3"
            span-laptop="8"
            start-desktop="4"
            span-desktop="6"
          >
            <component
              :is="group.listType === 'bullet' ? 'ul' : 'ol'"
              class="portable-list"
            >
              <PortableTextBlock
                v-for="item in group.items"
                :key="item._key"
                :block="item"
                font="times-seven"
              />
            </component>
          </Column>
        </Grid>

        <!-- Rich text -->
        <Grid
          v-else-if="
            group.type === 'block' && (group.block as any)._type === 'block'
          "
          class="block block--text"
        >
          <Column
            span-tablet="9"
            start-laptop="3"
            span-laptop="8"
            start-desktop="4"
            span-desktop="6"
          >
            <PortableTextBlock
              :block="group.block as PortableTextBlock"
              font="times-seven"
            />
          </Column>
        </Grid>

        <!-- Artifact reference (linked work) -->
        <Grid
          v-else-if="
            group.type === 'block' &&
            (group.block as any)._type === 'artifactRef'
          "
          :class="[
            'block block--artifact',
            { 'grid--full': (group.block as LogArtifactRef).size === 'full' },
          ]"
        >
          <Column v-bind="mediaColumns((group.block as LogArtifactRef).size)">
            <MediaEmbed
              v-if="(group.block as LogArtifactRef).artifact"
              :media="(group.block as LogArtifactRef).artifact!"
            />
          </Column>
        </Grid>

        <!-- Inline media (untethered image/video) -->
        <Grid
          v-else-if="
            group.type === 'block' && (group.block as any)._type === 'media'
          "
          :class="[
            'block block--media',
            { 'grid--full': (group.block as LogInlineMedia).size === 'full' },
          ]"
        >
          <Column v-bind="mediaColumns((group.block as LogInlineMedia).size)">
            <figure>
              <MediaEmbed
                :media="{
                  ...(group.block as LogInlineMedia),
                  imageUrl: (group.block as LogInlineMedia).image
                    ? urlFor((group.block as LogInlineMedia).image!).url()
                    : (group.block as LogInlineMedia).imageUrl,
                }"
              />
              <Text
                is="figcaption"
                size="caption-2"
                color="dim"
                v-if="(group.block as LogInlineMedia).caption?.length"
              >
                <template
                  v-for="captionBlock in (group.block as LogInlineMedia)
                    .caption"
                  :key="captionBlock._key"
                >
                  <PortableTextSpan
                    v-for="child in captionBlock.children"
                    :key="child._key"
                    :span="child"
                    :markDefs="captionBlock.markDefs"
                    size="caption-2"
                  />
                </template>
              </Text>
            </figure>
          </Column>
        </Grid>

        <!-- Gallery -->
        <Grid
          v-else-if="
            group.type === 'block' && (group.block as any)._type === 'gallery'
          "
          class="block block--gallery"
        >
          <Column
            v-bind="
              galleryColumns(
                asGallery(group.block).size,
                asGallery(group.block).items?.length ?? 0,
              )
            "
          >
            <LogGallery :gallery="asGallery(group.block)" />
          </Column>
        </Grid>
      </template>
    </template>
  </article>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

// ── Header ────────────────────────────────────────────────────────────────────

.log-header {
  padding-top: var(--unit-base);
  margin-bottom: var(--unit-big);
}

.log-meta {
  display: flex;
  gap: var(--unit-tinier);
}

// ── Block spacing ─────────────────────────────────────────────────────────────
// Single source of truth: every block has a uniform trailing margin.
// Media blocks use padding-block for symmetric breathing room — the math:
//   above media = text.margin-bottom + media.padding-top
//   below media = media.padding-bottom + media.margin-bottom
//   both sides are identical → truly symmetric.

.block {
  margin-bottom: var(--unit-smaller);
}

// Heading text: extra space above, tighter below
.block--text:has(h2) {
  padding-block-start: var(--unit-bigger);
  margin-bottom: var(--unit-tinier);
}

.block--text:has(h3) {
  padding-block-start: var(--unit-small);
  margin-bottom: var(--unit-tiniest);
}

.block--text:has(h2, h3) + .block--text:has(p) {
  padding-block-start: var(--unit-tinier);
}

// Media + gallery: symmetric padding for equal breathing room on both sides
.block--media,
.block--artifact,
.block--gallery {
  padding-block: var(--unit-bigger);
}

// ── Blocks ────────────────────────────────────────────────────────────────────

.block {
  &--text {
    .portable-list {
      margin-left: var(--unit-smaller);
      padding-left: var(--unit-small);

      :deep(li) {
        margin-bottom: var(--unit-tinier);
      }
    }

    :deep(h2) {
      font-family: "DBC Metaphor", Arial, Helvetica, sans-serif;
    }

    :deep(h3) {
      font-family: "DBC Metaphor", Arial, Helvetica, sans-serif;
      color: var(--foreground-secondary);
    }

    ul.portable-list {
      list-style-type: disc;
    }

    ol.portable-list {
      list-style: none;
      counter-reset: list-counter;

      :deep(li) {
        counter-increment: list-counter;

        &::before {
          content: counter(list-counter, decimal-leading-zero);
          font-family: "DBC Metaphor", sans-serif;
          font-variant-numeric: tabular-nums;
          color: var(--foreground-secondary);
          letter-spacing: 0.04em;
          margin-right: var(--unit-tiny);
        }
      }
    }

    :deep(blockquote) {
      position: relative;
      padding-inline: var(--unit-smaller);
      border-left: 1px solid var(--border-primary);
    }

    code {
      background: var(--background-secondary);
      padding: 0.1em 0.3em;
      border-radius: var(--radii-tiny);
      font-size: 0.9em;
    }
  }

  &--artifact,
  &--media {
    // :deep(.pic__image) {
    //   width: auto !important;
    //   height: auto !important;
    //   max-width: min(90vh, 100%);
    //   max-height: 90vh;
    // }

    // :deep(.vid-wrapper) {
    //   max-width: min(90vh, 100%);
    //   max-height: 90vh;
    //   min-width: min(300px, 100%);
    // }

    :deep(figcaption) {
      margin-top: var(--unit-tiny);
    }

    // Full-width: caption gets grid margin so text doesn't touch screen edges
    &.grid--full :deep(figcaption) {
      padding-left: var(--grid-margin);
      padding-right: var(--grid-margin);
    }
  }
}
</style>
