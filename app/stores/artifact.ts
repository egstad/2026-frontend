import {defineStore} from 'pinia'

export const useArtifactStore = defineStore('artifact', () => {
  // Random seed for deterministic shuffling
  const randomSeed = ref<number>(Date.now())

  // Generate a new random seed
  function reshuffle() {
    randomSeed.value = Date.now()
  }

  return {
    randomSeed,
    reshuffle,
  }
})
