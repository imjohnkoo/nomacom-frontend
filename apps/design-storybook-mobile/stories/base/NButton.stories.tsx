import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { View } from 'react-native'
import { NButton } from '@imjohnkoo/design-mobile'

const meta = {
  title: 'Base/NButton',
  component: NButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
    children: '버튼',
  },
} satisfies Meta<typeof NButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <View style={{ gap: 8 }}>
      <NButton {...args} variant="primary">Primary</NButton>
      <NButton {...args} variant="secondary">Secondary</NButton>
      <NButton {...args} variant="outline">Outline</NButton>
      <NButton {...args} variant="ghost">Ghost</NButton>
      <NButton {...args} variant="danger">Danger</NButton>
    </View>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <View style={{ gap: 8 }}>
      <NButton {...args} size="sm">Small</NButton>
      <NButton {...args} size="md">Medium</NButton>
      <NButton {...args} size="lg">Large</NButton>
    </View>
  ),
}

export const Loading: Story = { args: { loading: true, children: '로딩 중...' } }
export const Disabled: Story = { args: { disabled: true } }
export const FullWidth: Story = { args: { fullWidth: true } }
