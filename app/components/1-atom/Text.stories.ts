import type { Meta, StoryObj } from '@storybook/vue3'
import Text from './Text.vue'

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['micro-2', 'micro-1', 'caption-2', 'caption-1', 'body-2', 'body-1', 'headline-2', 'headline-1'],
    },
    is: {
      control: 'select',
      options: ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'label'],
    },
    color: {
      control: 'select',
      options: ['normal', 'dim', 'dimmer'],
    },
    indent: {
      control: 'boolean',
    },
  },
  args: {
    size: 'body-2',
    is: 'p',
    color: 'normal',
    indent: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    default: 'The quick brown fox jumps over the lazy dog.',
  },
}

export const TypeScale: Story = {
  name: 'Type Scale',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--unit-smaller, 24px);">
        <Text size="headline-1">Headline 1 — Egstad.com</Text>
        <Text size="headline-2">Headline 2 — Egstad.com</Text>
        <Text size="body-1">Body 1 — The quick brown fox jumps over the lazy dog. Designed with care.</Text>
        <Text size="body-2">Body 2 — The quick brown fox jumps over the lazy dog. Designed with care.</Text>
        <Text size="caption-1">Caption 1 — The quick brown fox jumps over the lazy dog.</Text>
        <Text size="caption-2">Caption 2 — The quick brown fox jumps over the lazy dog.</Text>
        <Text size="micro-1">Micro 1 — The quick brown fox jumps over the lazy dog.</Text>
        <Text size="micro-2">Micro 2 — The quick brown fox jumps over the lazy dog.</Text>
      </div>
    `,
  }),
}

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--unit-small, 32px);">
        <Text color="normal">Normal — default foreground color</Text>
        <Text color="dim">Dim — secondary foreground color</Text>
        <Text color="dimmer">Dimmer — tertiary foreground color</Text>
      </div>
    `,
  }),
}

export const WithIndent: Story = {
  name: 'With Indent',
  args: {
    indent: true,
    size: 'body-2',
    default:
      'This paragraph uses a text-indent on the first line—a classic editorial typesetting convention that pairs well with the serif body text.',
  },
}
