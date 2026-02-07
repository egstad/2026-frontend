import {defineStore} from 'pinia'

export const useMediaStore = defineStore('media', () => {
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
