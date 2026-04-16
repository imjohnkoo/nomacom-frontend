import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NAvatar } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Base/NAvatar',
  component: NAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    text: { control: 'text' },
    color: { control: 'color' },
  },
  args: { size: 'md', text: 'JK' },
} satisfies Meta<typeof NAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/150?u=nomacom' },
}

export const AllSizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <NAvatar size="sm" text="SM" />
      <NAvatar size="md" text="MD" />
      <NAvatar size="lg" text="LG" />
      <NAvatar size="xl" text="XL" />
    </View>
  ),
}
