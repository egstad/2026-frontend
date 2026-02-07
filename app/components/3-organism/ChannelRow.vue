<script setup lang="ts">
import type {ArenaChannel, ArenaBlock} from '~/composables/useArena'
import {formatRelativeTime} from '~/utils/formatDate'

interface ChannelWithBlocks extends ArenaChannel {
  blocks: ArenaBlock[]
}

const props = defineProps<{
  channel: ChannelWithBlocks
  username?: string
}>()

const username = computed(() => props.username || 'jordan-egstad')

function formatBlockCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k blocks`
  }
  return `${count} blocks`
}

function getChannelUrl() {
  return `https://www.are.na/${username.value}/${props.channel.slug}`
}

function getBlockImage(block: ArenaBlock): string | null {
  if (block.image?.display?.url) return block.image.display.url
  if (block.image?.thumb?.url) return block.image.thumb.url
  return null
}
</script>

<template>
  <a :href="getChannelUrl()" target="_blank" rel="noopener" class="channel-row">
    <!-- Channel info -->
    <div class="channel-info item">
      <h2 class="channel-title">{{ channel.title }}</h2>
      <p class="channel-meta">Updated {{ formatRelativeTime(channel.updated_at) }}</p>
      <p class="channel-meta">{{ formatBlockCount(channel.length) }}</p>
    </div>

    <!-- Block thumbnails - flat siblings -->
    <div
      v-for="(block, index) in channel.blocks"
      :key="block.id"
      class="block-thumb item"
      :data-index="index"
    >
      <img
        v-if="getBlockImage(block)"
        :src="getBlockImage(block)!"
        :alt="block.title || ''"
        loading="lazy"
      />
      <div v-else-if="block.class === 'Text'" class="block-text">
        {{ block.content?.slice(0, 120) }}
      </div>
      <div v-else-if="block.class === 'Link'" class="block-link">
        {{ block.title || block.source?.title || 'Link' }}
      </div>
      <div v-else class="block-placeholder" />
    </div>
  </a>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.channel-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  text-decoration: none;
  color: inherit;
  gap: var(--unit-small);
  border: 1px solid var(--border-primary);
  padding: var(--unit-small);
  transition: border-color var(--transition-fast);

  &:hover {
    border-color: var(--foreground-secondary);
  }
}

/* All items share same sizing */
.item {
  aspect-ratio: 1;
}

/* Channel info */
.channel-info {
  padding: var(--unit-tiny);
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.channel-title {
  font-size: var(--body-1);
  font-weight: 400;
  margin-bottom: var(--unit-tiny);
  line-height: 1.2;
  color: var(--foreground-primary);
}

.channel-meta {
  font-size: var(--caption-1);
  color: var(--foreground-tertiary);
  line-height: 1.5;
}

/* Block thumbnails */
.block-thumb {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.block-text {
  width: 100%;
  height: 100%;
  padding: var(--unit-tiny);
  font-size: var(--caption-2);
  line-height: 1.5;
  color: var(--foreground-secondary);
  overflow: hidden;
  border: 1px solid var(--border-primary);
  box-sizing: border-box;
}

.block-link {
  padding: var(--unit-tiny);
  font-size: var(--caption-1);
  line-height: 1.4;
  color: var(--foreground-tertiary);
  height: 100%;
}

.block-placeholder {
  height: 100%;
  width: 100%;
  background: var(--background-secondary);
}

/* Progressive reveal: mobile-first */
/* Mobile: only channel info */
.block-thumb {
  display: none;
}

/* 500px+: show 1 block */
@include phablet {
  .block-thumb[data-index='0'] {
    display: flex;
  }
}

/* 768px+: show 2 blocks */
@include tablet {
  .block-thumb[data-index='1'] {
    display: flex;
  }
}

/* 1024px+: show 3 blocks */
@include laptop {
  .block-thumb[data-index='2'] {
    display: flex;
  }
}

/* 1400px+: show 4 blocks */
@include desktop {
  .block-thumb[data-index='3'] {
    display: flex;
  }
}

/* 1920px+: show all 5 blocks */
@include ultrawide {
  .block-thumb[data-index='4'] {
    display: flex;
  }
}
</style>
