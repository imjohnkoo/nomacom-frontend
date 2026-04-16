import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NSkeleton } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Feedback/NSkeleton',
  component: NSkeleton,
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text' },
    height: { control: 'number' },
    circle: { control: 'boolean' },
    radius: { control: 'number' },
  },
  args: { width: '100%', height: 16 },
} satisfies Meta<typeof NSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Circle: Story = { args: { circle: true, width: 48, height: 48 } }

export const CardSkeleton: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <NSkeleton circle width={48} height={48} />
        <View style={{ flex: 1, gap: 8 }}>
          <NSkeleton height={16} width="60%" />
          <NSkeleton height={12} width="40%" />
        </View>
      </View>
      <NSkeleton height={14} />
      <NSkeleton height={14} />
      <NSkeleton height={14} width="80%" />
    </View>
  ),
}

export const ListSkeleton: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {Array.from({ length: 4 }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <NSkeleton circle width={40} height={40} />
          <View style={{ flex: 1, gap: 6 }}>
            <NSkeleton height={14} width="70%" />
            <NSkeleton height={10} width="50%" />
          </View>
        </View>
      ))}
    </View>
  ),
}
