import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import type { StorybookConfig } from '@storybook/vue3-vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Absolute path to the app/ source directory
const appDir = resolve(__dirname, '../app')

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(js|ts|mjs|mts)'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: 'vue-component-meta',
    },
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      plugins: [vue()],
      resolve: {
        alias: {
          // Mirror Nuxt's ~ and @ aliases → app/
          '~': appDir,
          '@': appDir,
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            // Use absolute path so Sass doesn't need to resolve the ~ alias
            additionalData: `@use "${appDir}/assets/styles/_global.scss" as *;\n`,
          },
        },
      },
    })
  },
}

export default config
