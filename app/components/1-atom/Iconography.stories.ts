import type { Meta, StoryObj } from '@storybook/vue3'
import Iconography from './Iconography.vue'

const allNames = [
  // Original
  'arrow', 'check', 'document', 'search', 'loading', 'close', 'chevron-up-down',
  // Navigation & Actions
  'menu', 'home', 'plus', 'edit', 'trash', 'settings', 'external-link',
  // Status & Feedback
  'warning', 'error', 'info', 'eye', 'eye-slash',
  // User & Account
  'user', 'users', 'bell',
  // Content & Media
  'image', 'folder', 'calendar', 'clock', 'mail', 'heart', 'star',
  // Interface Controls
  'filter', 'refresh', 'download', 'upload', 'share', 'copy', 'more',
] as const

const meta: Meta<typeof Iconography> = {
  title: 'Atoms/Iconography',
  component: Iconography,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [...allNames],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
  args: {
    name: 'star',
    size: 'medium',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllIcons: Story = {
  name: 'All Icons',
  render: () => ({
    setup() {
      return { allNames }
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <div
          v-for="name in allNames"
          :key="name"
          style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 72px; padding: 12px 4px;"
        >
          <Iconography :name="name" size="medium" />
          <span style="font-size: 9px; text-align: center; color: var(--foreground-secondary, #888); line-height: 1.3;">{{ name }}</span>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; align-items: center;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <Iconography name="star" size="small" />
          <Text size="caption-2" color="dim">small</Text>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <Iconography name="star" size="medium" />
          <Text size="caption-2" color="dim">medium</Text>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <Iconography name="star" size="large" />
          <Text size="caption-2" color="dim">large</Text>
        </div>
      </div>
    `,
  }),
}
