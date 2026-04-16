import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NBadge } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Base/NBadge',
  component: NBadge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'error', 'info', 'neutral'],
    },
    variant: { control: 'select', options: ['solid', 'subtle', 'outline'] },
    size: { control: 'select', options: ['sm', 'md'] },
    label: { control: 'text' },
  },
  args: { label: 'Badge', color: 'primary', variant: 'subtle', size: 'sm' },
} satisfies Meta<typeof NBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllColors: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {(['primary', 'success', 'warning', 'error', 'info', 'neutral'] as const).map((c) => (
        <NBadge key={c} {...args} color={c} label={c} />
      ))}
    </View>
  ),
}

export const AllVariants: Story = {
  render: (args) => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <NBadge {...args} variant="solid" label="Solid" />
      <NBadge {...args} variant="subtle" label="Subtle" />
      <NBadge {...args} variant="outline" label="Outline" />
    </View>
  ),
}
