<script setup lang="ts">
import type {ArenaChannel, ArenaBlock} from '~/composables/useArena'
import PageSetup from '~/composables/PageSetup'
import pageTransitionDefault from '~/assets/scripts/pages/transitionDefault'

PageSetup({
  seoMeta: {title: 'Channels'},
})

definePageMeta({
  pageTransition: pageTransitionDefault(),
})

const config = useRuntimeConfig()
const arena = useArena({accessToken: config.public.arenaAccessToken})
const USERNAME = 'jordan-egstad'

interface ChannelWithBlocks extends ArenaChannel {
  blocks: ArenaBlock[]
}

const {
  data: channels,
  pending: loading,
  error,
} = await useAsyncData('channels', async () => {
  const data = await arena.getUserChannels(USERNAME, {page: 1, per: 5})
  const recentChannels = (data.channels || [])
    .filter((c) => c.status !== 'private')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const channelsWithBlocks = await Promise.all(
    recentChannels.map(async (channel): Promise<ChannelWithBlocks> => {
      try {
        const contents = await arena.getChannelContents(channel.slug, {
          page: 1,
          per: 5,
          sort: 'updated_at',
          direction: 'desc',
        })
        return {
          ...channel,
          blocks: contents.contents || [],
        }
      } catch {
        return {...channel, blocks: []}
      }
    }),
  )

  return channelsWithBlocks
})
</script>

<template>
  <div class="channels-page">
    <div v-if="loading" class="loading">Loading channels...</div>

    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <div v-else-if="channels?.length" class="channels-list">
      <ChannelRow v-for="channel in channels" :key="channel.id" :channel="channel" :username="USERNAME" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.channels-page {
  width: 100%;
  min-height: 100vh;
  padding: var(--unit-small);
}

.loading,
.error {
  color: var(--foreground-tertiary);
  padding: var(--unit-big);
  text-align: center;
}

.error {
  color: var(--red-500);
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: var(--unit-base);
}
</style>
