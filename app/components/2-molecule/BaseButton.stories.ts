import type { Meta, StoryObj } from '@storybook/vue3'
import BaseButton from './BaseButton.vue'

const meta: Meta<typeof BaseButton> = {
  title: 'Molecules/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    icon: {
      control: 'select',
      options: [undefined, 'arrow', 'check', 'search', 'close', 'plus', 'edit', 'trash', 'mail', 'download'],
    },
    iconPosition: {
      control: 'radio',
      options: ['leading', 'trailing'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    iconPosition: 'leading',
    default: 'Button',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="danger">Danger</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <BaseButton size="small">Small</BaseButton>
        <BaseButton size="medium">Medium</BaseButton>
        <BaseButton size="large">Large</BaseButton>
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <BaseButton>Default</BaseButton>
        <BaseButton disabled>Disabled</BaseButton>
        <BaseButton loading>Loading</BaseButton>
      </div>
    `,
  }),
}

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <BaseButton icon="search">Search</BaseButton>
        <BaseButton icon="plus">New item</BaseButton>
        <BaseButton icon="arrow" icon-position="trailing">Continue</BaseButton>
        <BaseButton variant="secondary" icon="download">Export</BaseButton>
        <BaseButton variant="ghost" icon="close" />
      </div>
    `,
  }),
}

export const AllVariantsAllSizes: Story = {
  name: 'Matrix: Variants × Sizes',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div v-for="variant in ['primary','secondary','danger','ghost']" :key="variant" style="display: flex; gap: 12px; align-items: center;">
          <BaseButton :variant="variant" size="small">{{ variant }}</BaseButton>
          <BaseButton :variant="variant" size="medium">{{ variant }}</BaseButton>
          <BaseButton :variant="variant" size="large">{{ variant }}</BaseButton>
        </div>
      </div>
    `,
  }),
}
