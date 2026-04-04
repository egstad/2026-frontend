import type { Meta, StoryObj } from '@storybook/vue3'
import Grid from './Grid.vue'

const meta: Meta<typeof Grid> = {
  title: 'Atoms/Grid',
  component: Grid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const columnStyle = `
  style="
    background: color-mix(in srgb, currentColor 8%, transparent);
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    padding: 12px 8px;
    text-align: center;
  "
`

export const TwelveColumns: Story = {
  name: '12-Column Baseline',
  render: () => ({
    template: `
      <Grid>
        <Column v-for="n in 12" :key="n" span="1" ${columnStyle}>
          <Text size="caption-2" color="dim">{{ n }}</Text>
        </Column>
      </Grid>
    `,
  }),
}

export const ResponsiveSpans: Story = {
  name: 'Responsive Spans',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <Grid>
          <Column span="12" span-tablet="6" span-laptop="4" ${columnStyle}>
            <Text size="caption-2">span 12 → 6 → 4</Text>
          </Column>
          <Column span="12" span-tablet="6" span-laptop="4" ${columnStyle}>
            <Text size="caption-2">span 12 → 6 → 4</Text>
          </Column>
          <Column span="12" span-tablet="12" span-laptop="4" ${columnStyle}>
            <Text size="caption-2">span 12 → 12 → 4</Text>
          </Column>
        </Grid>
        <Grid>
          <Column span="12" span-laptop="8" start-laptop="3" ${columnStyle}>
            <Text size="caption-2">span 12 → laptop: span 8 start 3 (centered)</Text>
          </Column>
        </Grid>
      </div>
    `,
  }),
}

export const LabelContentPattern: Story = {
  name: 'Label + Content Pattern',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    template: `
      <Grid style="padding-top: 32px; padding-bottom: 32px;">
        <Column span="12" span-laptop="2">
          <Text size="caption-1" color="dim">Section</Text>
        </Column>
        <Column span="12" span-laptop="8" start-laptop="3">
          <Text size="body-2">
            This is the label-and-content pattern used throughout the site. The label sits in
            columns 1–2 at laptop breakpoint, and the content occupies columns 3–10. On smaller
            viewports both columns stack full-width.
          </Text>
        </Column>
      </Grid>
    `,
  }),
}

export const NestedGrids: Story = {
  name: 'Nested Grids',
  render: () => ({
    template: `
      <Grid>
        <Column span="12" span-laptop="8" start-laptop="3" ${columnStyle}>
          <Text size="caption-2" color="dim" style="margin-bottom: 8px;">Outer column (span 8, start 3)</Text>
          <Grid>
            <Column span="6" ${columnStyle}>
              <Text size="caption-2">inner span 6</Text>
            </Column>
            <Column span="6" ${columnStyle}>
              <Text size="caption-2">inner span 6</Text>
            </Column>
          </Grid>
        </Column>
      </Grid>
    `,
  }),
}
