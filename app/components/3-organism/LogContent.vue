<script setup lang="ts">
import { urlFor } from '~/utils/sanity'
import type {
  Log,
  LogArtifactRef,
  LogGallery,
  LogGallerySize,
  LogInlineMedia,
  LogMediaSize,
  LogYouTube,
  PortableTextBlock,
} from '~/types/sanity'

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

const props = defineProps<{
  content: Log['content']
}>()

function mediaColumns(size?: LogMediaSize) {
  switch (size) {
    case 'small':
      return { spanMobile: '6', startMobile: '4', spanTablet: '6', startTablet: '4', spanLaptop: '4', startLaptop: '4', spanDesktop: '3', startDesktop: '3' }
    case 'large':
      return { spanTablet: '12', startLaptop: '2', spanLaptop: '11', startDesktop: '3', spanDesktop: '8' }
    case 'full':
      return { span: '12' }
    default:
      return { startTablet: '4', spanTablet: '9', startLaptop: '4', spanLaptop: '9', startDesktop: '3', spanDesktop: '8' }
  }
}

function asGallery(block: unknown): LogGallery { return block as LogGallery }

function galleryColumns(size?: LogGallerySize, count = 0) {
  if (count >= 4) return { span: '12' }
  return size === 'large'
    ? { spanTablet: '12', startLaptop: '4', spanLaptop: '9', startDesktop: '3', spanDesktop: '8' }
    : { startTablet: '4', spanTablet: '9', startLaptop: '4', spanLaptop: '9', startDesktop: '3', spanDesktop: '8' }
}

function isEmptyParagraph(block: unknown): boolean {
  const b = block as PortableTextBlock
  return b._type === 'block' && !b.children?.some((c) => c.text?.trim())
}

type LogBlock = NonNullable<Log['content']>[number]
type ContentGroup =
  | { type: 'block'; block: LogBlock; key: string }
  | { type: 'list'; listType: 'bullet' | 'number'; items: PortableTextBlock[]; key: string }

const processedContent = computed<ContentGroup[]>(() => {
  const result: ContentGroup[] = []
  for (const block of props.content ?? []) {
    const b = block as PortableTextBlock
    if (b._type === 'block' && b.listItem) {
      const last = result[result.length - 1]
      if (last?.type === 'list' && last.listType === b.listItem) {
        last.items.push(b)
      } else {
        result.push({ type: 'list', listType: b.listItem, items: [b], key: b._key ?? `list-${result.length}` })
      }
    } else {
      if (isEmptyParagraph(block)) continue
      result.push({ type: 'block', block, key: (block as any)._key ?? `block-${result.length}` })
    }
  }
  return result
})
</script>

<template>
  <template v-for="group in processedContent" :key="group.key">

    <!-- List (ul/ol) -->
    <Grid v-if="group.type === 'list'" class="block block--text block--list">
      <Column start-tablet="4" span-tablet="9" start-laptop="4" span-laptop="9" start-desktop="3" span-desktop="8">
        <component :is="group.listType === 'bullet' ? 'ul' : 'ol'" class="portable-list">
          <PortableTextBlock v-for="item in group.items" :key="item._key" :block="item" font="times-seven" />
        </component>
      </Column>
    </Grid>

    <!-- Rich text -->
    <Grid v-else-if="group.type === 'block' && (group.block as any)._type === 'block'" class="block block--text">
      <Column start-tablet="4" span-tablet="9" start-laptop="4" span-laptop="9" start-desktop="3" span-desktop="8">
        <PortableTextBlock :block="group.block as PortableTextBlock" font="times-seven" />
      </Column>
    </Grid>

    <!-- Artifact reference -->
    <Grid
      v-else-if="group.type === 'block' && (group.block as any)._type === 'artifactRef'"
      :class="['block block--artifact', { 'grid--full': (group.block as LogArtifactRef).size === 'full' }]"
    >
      <Column v-bind="mediaColumns((group.block as LogArtifactRef).size)">
        <MediaEmbed v-if="(group.block as LogArtifactRef).artifact" :media="(group.block as LogArtifactRef).artifact!" />
      </Column>
    </Grid>

    <!-- Inline media -->
    <Grid
      v-else-if="group.type === 'block' && (group.block as any)._type === 'media'"
      :class="['block block--media', { 'grid--full': (group.block as LogInlineMedia).size === 'full' }]"
    >
      <Column v-bind="mediaColumns((group.block as LogInlineMedia).size)">
        <figure>
          <MediaEmbed :media="{ ...(group.block as LogInlineMedia), imageUrl: (group.block as LogInlineMedia).image ? urlFor((group.block as LogInlineMedia).image!).url() : (group.block as LogInlineMedia).imageUrl }" />
          <Text is="figcaption" size="caption-2" color="dim" v-if="(group.block as LogInlineMedia).caption?.length">
            <template v-for="captionBlock in (group.block as LogInlineMedia).caption" :key="captionBlock._key">
              <PortableTextSpan v-for="child in captionBlock.children" :key="child._key" :span="child" :markDefs="captionBlock.markDefs" size="caption-2" />
            </template>
          </Text>
        </figure>
      </Column>
    </Grid>

    <!-- Gallery -->
    <Grid v-else-if="group.type === 'block' && (group.block as any)._type === 'gallery'" class="block block--gallery">
      <Column v-bind="galleryColumns(asGallery(group.block).size, asGallery(group.block).items?.length ?? 0)">
        <LogGallery :gallery="asGallery(group.block)" />
      </Column>
    </Grid>

    <!-- YouTube -->
    <Grid
      v-else-if="group.type === 'block' && (group.block as any)._type === 'youtube'"
      class="block block--media"
    >
      <Column v-bind="mediaColumns((group.block as LogYouTube).size)">
        <figure v-if="getYouTubeId((group.block as LogYouTube).url)">
          <div class="youtube-embed">
            <iframe
              :src="`https://www.youtube.com/embed/${getYouTubeId((group.block as LogYouTube).url)}`"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <Text is="figcaption" size="caption-2" color="dim" v-if="(group.block as LogYouTube).caption?.length">
            <template v-for="captionBlock in (group.block as LogYouTube).caption" :key="captionBlock._key">
              <PortableTextSpan v-for="child in captionBlock.children" :key="child._key" :span="child" :markDefs="captionBlock.markDefs" size="caption-2" />
            </template>
          </Text>
        </figure>
      </Column>
    </Grid>

  </template>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.block {
  margin-bottom: var(--unit-smaller);
}

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

.block--media,
.block--artifact,
.block--gallery {
  padding-block: var(--unit-bigger);
}

.block {
  &--text {
    .portable-list {
      margin-left: var(--unit-smaller);
      padding-left: var(--unit-small);

      :deep(li) { margin-bottom: var(--unit-tinier); }
    }

    :deep(h2) { font-family: "DBC Metaphor", Arial, Helvetica, sans-serif; }
    :deep(h3) { font-family: "DBC Metaphor", Arial, Helvetica, sans-serif; color: var(--foreground-secondary); }

    ul.portable-list { list-style-type: disc; }

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
    :deep(figcaption) { margin-top: var(--unit-tiny); }
  }
}

.block--artifact.grid--full,
.block--media.grid--full {
  :deep(figcaption) {
    padding-left: var(--grid-margin);
    padding-right: var(--grid-margin);
  }
}

.youtube-embed {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: var(--radii-tiny);
  overflow: hidden;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}
</style>
