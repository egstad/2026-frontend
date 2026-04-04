import { setup } from '@storybook/vue3'
import type { Preview } from '@storybook/vue3'
import { createPinia } from 'pinia'

// Global design-system styles (CSS custom properties, typography, layout, etc.)
import '~/assets/styles/main.scss'

// ─── Atom components ──────────────────────────────────────────────────────────
import Grid from '~/components/1-atom/Grid.vue'
import Column from '~/components/1-atom/Column.vue'
import Text from '~/components/1-atom/Text.vue'
import Space from '~/components/1-atom/Space.vue'
import Iconography from '~/components/1-atom/Iconography.vue'

// ─── Molecule components ──────────────────────────────────────────────────────
import BaseButton from '~/components/2-molecule/BaseButton.vue'
import BaseInput from '~/components/2-molecule/BaseInput.vue'
import BaseTextarea from '~/components/2-molecule/BaseTextarea.vue'
import BaseSelect from '~/components/2-molecule/BaseSelect.vue'
import BaseSearch from '~/components/2-molecule/BaseSearch.vue'

// ─── Template components ──────────────────────────────────────────────────────
import GridSliceCenter from '~/components/4-template/GridSliceCenter.vue'

setup((app) => {
  // State management
  app.use(createPinia())

  // Atoms
  app.component('Grid', Grid)
  app.component('Column', Column)
  app.component('Text', Text)
  app.component('Space', Space)
  app.component('Iconography', Iconography)

  // Molecules
  app.component('BaseButton', BaseButton)
  app.component('BaseInput', BaseInput)
  app.component('BaseTextarea', BaseTextarea)
  app.component('BaseSelect', BaseSelect)
  app.component('BaseSearch', BaseSearch)

  // Templates
  app.component('GridSliceCenter', GridSliceCenter)

  // Nuxt shims — replace router-aware components with plain equivalents
  app.component('NuxtLink', {
    props: { to: { type: [String, Object], default: '#' } },
    template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
  })
})

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
