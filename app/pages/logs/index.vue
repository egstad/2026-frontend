<script setup lang="ts">
import {sanityClient} from '~/utils/sanity'
import {formatDate} from '~/utils/formatDate'
import type {Log} from '~/types/sanity'
import PageSetup from '~/composables/PageSetup'
import pageTransitionDefault from '~/assets/scripts/pages/transitionDefault'

PageSetup({
  seoMeta: {title: 'Logs'},
})

definePageMeta({
  pageTransition: pageTransitionDefault(),
})

const {data: logs} = await useAsyncData('logs', () =>
  sanityClient.fetch<Log[]>(`
    *[_type == "log"] | order(date desc) {
      _id,
      title,
      slug,
      date
    }
  `),
)
</script>

<template>
  <div class="logs-page">
    <h1>Logs</h1>

    <div class="logs-list" v-if="logs?.length">
      <NuxtLink v-for="log in logs" :key="log._id" :to="`/logs/${log.slug.current}`" class="log-card">
        <span class="log-date">{{ formatDate(log.date) }}</span>
        <span class="log-title">{{ log.title }}</span>
      </NuxtLink>
    </div>

    <p v-else class="empty">No logs yet.</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.logs-page {
  padding: var(--unit-big);
  min-height: 100vh;

  h1 {
    font-size: var(--headline-2);
    font-weight: 300;
    margin-bottom: var(--unit-big);
  }
}

.logs-list {
  display: flex;
  flex-direction: column;
}

.log-card {
  display: flex;
  gap: var(--unit-big);
  padding: var(--unit-small) 0;
  border-bottom: 1px solid var(--border-primary);
  transition: opacity var(--transition-fast);
  text-decoration: none;
  color: inherit;

  &:hover {
    opacity: 0.7;
  }
}

.log-date {
  color: var(--foreground-tertiary);
  font-size: var(--caption-1);
  font-variant-numeric: tabular-nums;
  min-width: 120px;
}

.log-title {
  font-weight: 500;
  color: var(--foreground-primary);
}

.empty {
  color: var(--foreground-tertiary);
}
</style>
