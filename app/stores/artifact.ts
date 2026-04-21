import {defineStore} from 'pinia'

export const useArtifactStore = defineStore('artifact', () => {
  const randomSeed = ref<number>(Date.now())

  function reshuffle() {
    randomSeed.value = Date.now()
  }

  return {
    randomSeed,
    reshuffle,
  }
})
